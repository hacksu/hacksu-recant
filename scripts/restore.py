import json
import sys
from pathlib import Path

import requests

"""
Restore utility for site admins.

Usage:
    python scripts/restore.py ADMIN_SESSION_COOKIE [BASE_URL]

Example:
    python scripts/restore.py abc123 http://localhost:3000

This expects that you have previously run `dump.py` so that:
  - `scripts/dump.json` exists (full JSON dump)
  - `scripts/assets/` exists with files mirroring `/uploads/**` paths

It will:
  - POST dump.json to /admin/api/dump/json to restore DB contents
  - Walk `assets/` and POST each file to /admin/api/dump/assets
"""


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: restore.py ADMIN_SESSION_COOKIE [BASE_URL]", file=sys.stderr)
        return 2

    admin_cookie = sys.argv[1]
    base_url = sys.argv[2] if len(sys.argv) >= 3 else "http://localhost:3000"

    # Add scheme if missing
    if not base_url.startswith(("http://", "https://")):
        base_url = f"https://{base_url}"

    # Normalize base URL (no trailing slash)
    base_url = base_url.rstrip("/")

    session = requests.Session()
    session.cookies.set("admin_session", admin_cookie)

    here = Path(__file__).resolve().parent
    dump_path = here / "dump.json"
    assets_dir = here / "assets"

    if not dump_path.is_file():
        print(f"Error: dump.json not found at {dump_path}", file=sys.stderr)
        return 1

    if not assets_dir.is_dir():
        print(f"Warning: assets directory not found at {assets_dir} (continuing without assets)", file=sys.stderr)

    # IMPORTANT: Upload assets FIRST, then restore JSON dump
    # This is because the JSON restore wipes admin sessions, which would invalidate our cookie
    
    # 1) Restore assets FIRST (before JSON dump wipes admin sessions)
    if assets_dir.is_dir():
        assets_url = f"{base_url}/admin/api/dump/assets"
        print(f"Restoring assets from {assets_dir} to {assets_url} ...")

        # Open log file for tracking uploaded files
        log_file = here / "restore.log"
        log_fp = log_file.open("a", encoding="utf-8")

        # Walk all files under assets_dir
        files_restored = 0
        for path in assets_dir.rglob("*"):
            if not path.is_file():
                continue

            rel_path = path.relative_to(assets_dir).as_posix()  # e.g. leadership/abc.png
            print(f"  -> Uploading {rel_path} ...")

            try:
                with path.open("rb") as f:
                    files = {"file": (path.name, f)}
                    data = {"path": rel_path}
                    r = session.post(assets_url, data=data, files=files, timeout=30)

                # If we get redirected here, likely lost auth – stop rather than continuing silently
                if r.is_redirect:
                    print(
                        f"     Error uploading {rel_path}: got redirected (auth failure?). "
                        f"Final URL: {r.url}, status: {r.status_code}",
                        file=sys.stderr,
                    )
                    log_fp.close()
                    return 1

                if r.status_code == 200:
                    # Success - log it
                    log_fp.write(f"{rel_path}\n")
                    log_fp.flush()
                    files_restored += 1
                else:
                    print(f"     Error uploading {rel_path}: {r.status_code} {r.text}", file=sys.stderr)
            except requests.exceptions.RequestException as e:
                print(f"     Error uploading {rel_path}: {e}", file=sys.stderr)
                # Continue with next file even if this one failed

        log_fp.close()
        print(f"Restored {files_restored} asset file(s) from {assets_dir}")
        print(f"Log saved to {log_file} (use restore_resume.py to continue if interrupted)")

    # 2) Restore JSON dump LAST (this wipes admin sessions, so do it after assets)
    print(f"\nLoading JSON dump from {dump_path} ...")
    with dump_path.open("rb") as f:
        dump_bytes = f.read()

    json_url = f"{base_url}/admin/api/dump/json"
    print(f"Posting JSON dump to {json_url} ...")
    print("  (Note: This will wipe admin sessions, so assets must be uploaded first)")
    resp = session.post(json_url, data=dump_bytes, headers={"Content-Type": "application/json"})

    # Check if final response is a redirect (3xx) - this indicates an error
    if resp.is_redirect:
        print(
            f"Error: got redirected while restoring JSON dump (auth failure?). "
            f"Final URL: {resp.url}, status: {resp.status_code}",
            file=sys.stderr,
        )
        return 1
    
    try:
        resp.raise_for_status()
    except Exception as e:  # pragma: no cover
        print(f"Error restoring JSON dump: {e}", file=sys.stderr)
        print(f"Response status: {resp.status_code}", file=sys.stderr)
        print(f"Response body: {resp.text}", file=sys.stderr)
        return 1

    try:
        result = resp.json()
        print("DB restore response:", json.dumps(result, indent=2))
    except Exception:
        print("DB restore completed (non-JSON response)")

    print("\nRestore completed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
