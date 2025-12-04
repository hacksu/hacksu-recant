# HacKSU Recant

Programmers.

To run this site locally, you will want Docker.

You can run it without production configuration locally, but it is generally not recommended, as the deployed build environment is Docker.


You will need a `.env` file. This file should contain all of the variables in the `.env.example` file at the root of the project correctly filled out.


To make changes on the admin side, go to the `/admin` route, and login with discord. If you have acceptable roles, this will authenticate you.


Run the containers with `docker compose -d --build`
This should setup persistent postgres volume and expose `localhost:3000` with the site
