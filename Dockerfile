# syntax=docker/dockerfile:1
from oven/bun:1 as builder
workdir /app

# install dependencies
copy package.json bun.lock ./
run --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

# copy source
copy . ./

run bun prod:build


from oven/bun:1
run --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update -y && apt-get install -y --no-install-recommends openssl
workdir /app
copy --from=builder /app/build build/
copy --from=builder /app/node_modules node_modules/
copy --from=builder /app/drizzle.config.ts drizzle.config.ts
copy --from=builder /app/src/lib/server/db src/lib/server/db/
copy --from=builder /app/drizzle drizzle/
copy --from=builder /app/package.json package.json

run mkdir -p static/uploads/leadership
run mkdir -p static/uploads/meetings

copy package.json .
cmd [ "bun", "prod:start" ]
