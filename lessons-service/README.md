# Lessons Service

A Python microservice that fetches lesson repositories from GitHub and caches them in Redis.

## Overview

This service periodically fetches all repositories with the "lesson" topic from the GitHub organization and caches them in Redis. This offloads the heavy GitHub API work from the main SvelteKit application and provides fast, cached responses.

## Features

- **GraphQL API**: Uses GitHub's GraphQL API for efficient batch fetching of repositories and topics
- **Automatic Refresh**: Refreshes the cache every 10 minutes
- **Immediate Startup**: Runs initial cache refresh on startup (doesn't wait 10 minutes)
- **Stale-on-failure**: If GitHub is unreachable, keeps the existing cache warm
- **Health Endpoint**: Provides `/health` endpoint for monitoring
- **Persistent Cache**: Uses Redis with 30-minute TTL

## Environment Variables

- `GITHUB_TOKEN` (required): GitHub personal access token
- `GITHUB_ORG` (optional): GitHub organization name (defaults to "hacksu")
- `REDIS_URL` (optional): Redis connection URL (defaults to "redis://localhost:6379")
- `PORT` (optional): Port for health check endpoint (defaults to 8080)

## Architecture

```
GitHub API (GraphQL)
    |
    V
Python Service (fetches every 10 min)
    |
    V
Redis Cache (30 min TTL, stale-on-failure)
    |
    V
SvelteKit App (reads from cache)
```

## Health Check

The service exposes a `/health` endpoint that returns:
- `status`: "healthy", "unhealthy", or "error"
- `running`: Whether the scheduler is running
- `last_refresh_time`: Timestamp of last cache refresh
- `refresh_interval_minutes`: Refresh interval (10)
- `cache_healthy`: Whether Redis connection is healthy

## Development

```bash
# Install dependencies
uv sync

# Run locally
uv run main.py
```

## Docker

The service is built and run as part of the Docker Compose stack. See the main `compose.yaml` for configuration.

