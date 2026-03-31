# HacKSU Recant

Programmers.


This is the current main website for HacKSU. It exists at hacksu.com


## Quickstart

To run this site locally, you will want Docker.

You can run it without production configuration locally, but it is generally not recommended, as the deployed build environment is Docker.

You will need a `.env` file. This file should contain all of the variables in the `.env.example` file at the root of the project correctly filled out.

Use `.env.example` as a template, copy it to `.env` and fill in real values. Generate passwords for `POSTGRES_PASSWORD` and `REDIS_PASSWORD` with `openssl rand -hex 32`, and make sure `DATABASE_URL` uses the same password as `POSTGRES_PASSWORD`.

`REDIS_URL` and `NODE_ENV` are set automatically in `compose.yaml` and do not need to be in `.env`.

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
      - "127.0.0.1:3000:3000"
```

The ports are important. This will allow you to access the port internal to the container externally. Take care not to push this file to a deployment, as it will conflict and tie up an actual port from the HacKSU server.(It is in the `.gitignore`, so it would take some effort)


## Running:

Run the containers with `docker compose up -d --build`



## Development

If you make changes to the schema, be sure to run `bun db:generate` to generate migrations in the drizzle folder, that will be automatically performed on start.


The schema for our database lies within `./src/lib/server/db/schema.ts`. This is a pretty neat way to define a schema with SQL-like TS.

If you add to the schema, if necessary, update the dump and restore routes, following the established pattern so we can restore in the event of a volume failure.

I have written some helper scripts for running these dump and restore commands fully, and getting consistent output. See the `scripts` folder README for more information on that.
