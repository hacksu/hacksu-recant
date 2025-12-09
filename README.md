# HacKSU Recant

Programmers.


This is the current main website for HacKSU. It exists at hacksu.com


## Quickstart

To run this site locally, you will want Docker.

You can run it without production configuration locally, but it is generally not recommended, as the deployed build environment is Docker.

You will need a `.env` file. This file should contain all of the variables in the `.env.example` file at the root of the project correctly filled out.

The below might not be maintained, use the `.env.example` for correct information
```env
DATABASE_URL=postgresql://hacksu:hacksu@db:5432/hacksu

SESSION_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SENDGRID_TOKEN=SG.X.X

DISCORD_ROLES=X Y Z
DISCORD_CLIENT_ID=XXXXX
DISCORD_GUILD_ID=XXXXX
DISCORD_CLIENT_SECRET=XXXXX

BODY_SIZE_LIMIT=20M

GITHUB_TOKEN=github_pat_X_X

PUBLIC_APP_URL=http://localhost:3000
```

The `REDIS_URL` is automatically configured in Docker Compose to connect to the Redis service. For local development outside Docker, you may need to set it manually.

I am configuring a couple of the variables in the compose file because they are unimportant and don't require security: `REDIS_URL`, `GITHUB_ORG` which is modifiable, but defaults to `hacksu`, `DATABASE_URL` but I also configured that on the server in case we ever need to expose it, and `NODE_ENV`, which we are not really using.

To make changes on the admin side, go to the `/admin` route, and login with Discord. If you have acceptable roles, (organizer, core, leader) this will authenticate you.

This should setup persistent postgres and redis volumes and expose `localhost:3000` with the site.

The setup includes:
- **PostgreSQL** - Main database (port 5432)
- **Redis** - Cache for lesson repositories (port 6379)
- **Lessons Service** - Python service that fetches and caches GitHub lesson repos
- **SvelteKit App** - Main web application (port 3000)

For local testing you will also want a `compose.override.yaml`

```yaml
services:
  app:
    ports:
      - 3000:3000
```

The ports are important. This will allow you to access the port internal to the container externally. Take care not to push this file to a deployment, as it will conflict and tie up an actual port from the HacKSU server.(It is in the `.gitignore`, so it would take some effort)


## Running:

Run the containers with `docker compose up -d --build`



## Development

If you make changes to the schema, be sure to run `bun db:generate` to generate migrations in the drizzle folder, that will be automatically performed on start.


The schema for our database lies within `./src/lib/server/db/schema.ts`. This is a pretty neat way to define a schema with SQL-like TS.

If you add to the schema, if necessary, update the dump and restore routes, following the established pattern so we can restore in the event of a volume failure.

I have written some helper scripts for running these dump and restore commands fully, and getting consistent output. See the `scripts` folder README for more information on that.
