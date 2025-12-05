from oven/bun:latest as builder
workdir /app

# install dependencies
copy package.json bun.lock ./
run bun install

# copy source
copy . ./

run bun prod:build


from oven/bun:latest
run apt-get update -y && apt-get install -y openssl
workdir /app
copy --from=builder /app/build build/
copy --from=builder /app/node_modules node_modules/
copy --from=builder /app/drizzle.config.ts drizzle.config.ts
copy --from=builder /app/src/lib/server/db src/lib/server/db/
copy --from=builder /app/drizzle drizzle/
copy --from=builder /app/package.json package.json

# Create static/uploads directory for file uploads
run mkdir -p static/uploads/leadership
run mkdir -p static/uploads/meetings

copy package.json .
expose 3002
cmd [ "bun", "prod:start" ]
