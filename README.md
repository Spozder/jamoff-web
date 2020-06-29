# jamoff-web

Hi folks :) This is the repository for the API and Website for JamOff!
JamOff is a collaborative playlist building competition - each round (usually a week), users add songs based around a certain theme for that round, chosen by the winner of the last round. Users add songs to the end of a Spotify playlist, and at the end of each round everyone votes for the songs they liked best or that best fit the theme (but not their own)!

This specific repo is for the website and API. The stack looks like:

- Vue.js Frontend
  - setup using vue-cli
  - Based on the [Vue Argon Design System](https://www.creative-tim.com/product/vue-argon-design-system)
- Node.js Backend
  - Express.js for API stuff (`/api/...` routes)
  - Statically serves the Frontend (`/...` routes)
- PostgreSQL Databse
  - Automatically managed by Heroku

I thought it would be fun and useful to learn Vue during this, as well as practicing Event Sourcing! So the frontend uses Vue entirely (this will hopefully be useful for the [App](https://github.com/spozder/jamoff-app) as well, which uses NativeScript-Vue and should hopefully share some component code). And the backend state is entirely built using events stored in the `events` table of the database! Then, any time the state is needed, it is built from the ground up using every event in the table.

## Backend

### Project Setup

```
npm install
export PGUSER={postgres user}
export PGPASSWORD={postgres user-password}
export PGHOST={postgres host}
export PGDATABASE={postgres jamoff db name}
export PGPORT={postres port}
```

If you are running this locally, the easist setup for your postgres db should look like:

```
PGUSER=$USER
PGPASSWORD={set this up locally}
PGHOST=localhost
PGDATABASE=jamoff
PGPORT=5432
```

These are all the defaults except for `PGPASSWORD` and `PGDATABASE`, so you don't need to set them explicitly.

To migrate your database (leaves you with an empty `events` table):

```
node srv/db/migrate.js
```

To migrate and seed your database (adds some starter data to the `events` table):

```
node srv/db/seed.js
```

### Running the server

```
node srv/server.js
```

Then you can access at: `localhost:3000/`

If you access it with a browser it will send you to the frontend (must be built first, see below)

The API is available at: `localhost:3000/api/...`

### Running unit tests

```
npm run test:srv:unit
```

## FrontEnd

### Project Setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

To watch for changes:

```
npm run build:watch
```

### Run front-end unit tests

```
npm run test:src:unit
```

### Lints and fixes files

```
npm run lint
```
