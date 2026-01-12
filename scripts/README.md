# Helper Scripts


## Dump and Restore

These guys are here to create a json dump of our existing database before performing major structural changes (like switching out databases or volumes)

I really really really recommend running these with `uv` as it makes life so much easier.

### `dump.py`
`uv run scripts/dump.py [ACTIVE_ADMIN_SESSION_COOKIE] [LOCATION_OF_ENDPOINT_BASE_URL|https://localhost:3000]`

This will:
- Call /admin/api/dump/json and save the result as dump.json
- Call /admin/api/dump/assets and download all listed files
    into an ./assets directory, mirroring their /uploads paths.


### `restore.py`
`uv run scripts/restore.py [ACTIVE_ADMIN_SESSION_COOKIE] [LOCATION_OF_ENDPOINT_BASE_URL|https://localhost:3000]`

This expects that you have previously run `dump.py` so that:
- `scripts/dump.json` exists (full JSON dump)
- `scripts/assets/` exists with files mirroring `/uploads/**` paths

It will:
- POST dump.json to /admin/api/dump/json to restore DB contents
- Walk `assets/` and POST each file to /admin/api/dump/assets

