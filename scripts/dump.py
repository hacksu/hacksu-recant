import sys
from pathlib import Path

import requests


"""
Simple backup utility for site admins.

Usage:
    python scripts/dump.py ADMIN_SESSION_COOKIE [BASE_URL]

Example:
    python scripts/dump.py abc123 http://localhost:3000

This will:
  - Call /admin/api/dump/json and save the result as dump.json
  - Call /admin/api/dump/assets and download all listed files
    into an ./assets directory, mirroring their /uploads paths.
"""


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: dump.py ADMIN_SESSION_COOKIE [BASE_URL]", file=sys.stderr)
        return 2

    admin_cookie = sys.argv[1]
    base_url = sys.argv[2] if len(sys.argv) >= 3 else "http://localhost:3000"

    # Normalize base URL (no trailing slash)
    base_url = base_url.rstrip("/")

    session = requests.Session()
    session.cookies.set("admin_session", admin_cookie)

    here = Path(__file__).resolve().parent
    out_dir = here / "assets"
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1) Fetch full JSON dump
    json_url = f"{base_url}/admin/api/dump/json"
    print(f"Fetching JSON dump from {json_url} ...")
    resp = session.get(json_url)
    resp.raise_for_status()

    dump_path = here / "dump.json"
    dump_path.write_bytes(resp.content)
    print(f"Saved JSON dump to {dump_path}")

    # 2) Fetch assets manifest
    assets_url = f"{base_url}/admin/api/dump/assets"
    print(f"Fetching assets manifest from {assets_url} ...")
    resp_assets = session.get(assets_url)
    resp_assets.raise_for_status()
    manifest = resp_assets.json()

    public_base = manifest.get("publicBase", "/uploads").rstrip("/")
    files = manifest.get("files", [])

    print(f"Found {len(files)} asset file(s) in manifest")

    downloaded = 0
    for item in files:
        rel_path = item.get("path")
        if not rel_path:
            continue

        # Construct remote URL and local path
        remote_url = f"{base_url}{public_base}/{rel_path}"
        local_path = out_dir / rel_path  # e.g. assets/leadership/abc.png
        local_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            print(f"  -> Downloading {remote_url} -> {local_path}")
            with session.get(remote_url, stream=True) as r:
                if r.status_code == 404:
                    print(f"     Skipped (404 not found)")
                    continue
                r.raise_for_status()
                with open(local_path, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
            downloaded += 1
        except Exception as e:  # pragma: no cover - best-effort backup
            print(f"     Error downloading {remote_url}: {e}", file=sys.stderr)

    print(f"Downloaded {downloaded} asset file(s) into {out_dir}")
    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

