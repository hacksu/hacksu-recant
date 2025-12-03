FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lock .
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lock .
RUN bun install --production
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["bun", "run", "build/index.js"]
