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

    # 1) Restore JSON dump
    print(f"Loading JSON dump from {dump_path} ...")
    with dump_path.open("rb") as f:
        dump_bytes = f.read()

    json_url = f"{base_url}/admin/api/dump/json"
    print(f"Posting JSON dump to {json_url} ...")
    resp = session.post(json_url, data=dump_bytes, headers={"Content-Type": "application/json"})

    # If we got redirected (e.g. auth failure), stop immediately
    if resp.is_redirect or resp.history:
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

    # 2) Restore assets, if any
    if assets_dir.is_dir():
        assets_url = f"{base_url}/admin/api/dump/assets"
        print(f"Restoring assets from {assets_dir} to {assets_url} ...")

        # Walk all files under assets_dir
        files_restored = 0
        for path in assets_dir.rglob("*"):
            if not path.is_file():
                continue

            rel_path = path.relative_to(assets_dir).as_posix()  # e.g. leadership/abc.png
            print(f"  -> Uploading {rel_path} ...")

            with path.open("rb") as f:
                files = {"file": (path.name, f)}
                data = {"path": rel_path}
                r = session.post(assets_url, data=data, files=files)

            # If we get redirected here, likely lost auth – stop rather than continuing silently
            if r.is_redirect or r.history:
                print(
                    f"     Error uploading {rel_path}: got redirected (auth failure?). "
                    f"Final URL: {r.url}, status: {r.status_code}",
                    file=sys.stderr,
                )
                return 1

            if r.status_code != 200:
                print(f"     Error uploading {rel_path}: {r.status_code} {r.text}", file=sys.stderr)
                continue

            files_restored += 1

        print(f"Restored {files_restored} asset file(s) from {assets_dir}")

    print("Restore completed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
