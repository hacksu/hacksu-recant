# HacKSU Recant

Programmers.

To run this site locally, you will want Docker.

You can run it without production configuration locally, but it is generally not recommended, as the deployed build environment is Docker.


You will need a `.env` file. This file should contain all of the variables in the `.env.example` file at the root of the project correctly filled out.

## Environment Variables

Required environment variables:
- `GITHUB_TOKEN` - GitHub personal access token for accessing the GitHub API
- `DATABASE_URL` - PostgreSQL connection string (automatically set in Docker Compose)
- `REDIS_URL` - Redis connection string (defaults to `redis://localhost:6379`, automatically set in Docker Compose)
- `GITHUB_ORG` - GitHub organization name (defaults to `hacksu`, optional)

The `REDIS_URL` is automatically configured in Docker Compose to connect to the Redis service. For local development outside Docker, you may need to set it manually.


To make changes on the admin side, go to the `/admin` route, and login with discord. If you have acceptable roles, this will authenticate you.


Run the containers with `docker compose up -d --build`
This should setup persistent postgres and redis volumes and expose `localhost:3002` with the site.

The setup includes:
- **PostgreSQL** - Main database (port 5434)
- **Redis** - Cache for lesson repositories (port 6379)
- **Lessons Service** - Python service that fetches and caches GitHub lesson repos
- **SvelteKit App** - Main web application (port 3002)
