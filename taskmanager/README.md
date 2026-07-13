# Task Manager — Dockerize-It-Yourself Project

A deliberately *un-dockerized* app for practicing Docker from scratch.
No Dockerfile, no docker-compose.yml, no .dockerignore — that's your job.

## Stack

- **frontend/** — static HTML/CSS/JS, calls the API at `/api/*`
- **backend/** — Node.js + Express REST API (`src/server.js`)
- **nginx/** — reverse proxy config (`default.conf`) that serves the frontend
  and proxies `/api/` to a container named `backend` on port 5000
- **mongo** — use the official `mongo` image, no custom Dockerfile needed
- **redis** — use the official `redis` image, no custom Dockerfile needed

## Architecture (what you're building toward)

```
        ┌────────┐
Client → │ nginx  │ :80  → serves frontend static files
        └───┬────┘
            │ /api/* proxied
        ┌───▼────┐
        │ backend│ :5000 (Node/Express)
        └───┬────┘
       ┌─────┴─────┐
   ┌───▼───┐   ┌───▼───┐
   │ mongo │   │ redis │
   └───────┘   └───────┘
```

## Your task

1. **Write a `Dockerfile` for `backend/`**
   - Base image: pick an appropriate `node` version (check `package.json` engines if you add one)
   - Copy `package.json` first, `npm install`, then copy source — for layer caching
   - Consider a multistage build (like you did in Vprofile) even though this one is small — good habit
   - Expose port 5000

2. **Write a `Dockerfile` for `nginx/`**
   - Base image: `nginx:alpine`
   - Copy `frontend/*` into `/usr/share/nginx/html`
   - Copy `nginx/default.conf` into `/etc/nginx/conf.d/default.conf`

3. **Write `docker-compose.yml` at the project root** with 4 services:
   - `nginx` (build from `./nginx`, expose port 80 to host)
   - `backend` (build from `./backend`, env vars for `MONGO_URI` and `REDIS_URL`)
   - `mongo` (official image, named volume for `/data/db` so data persists)
   - `redis` (official image)
   - Put them on the same custom bridge network so container DNS resolution
     works (`backend` needs to reach `mongo` and `redis` by service name;
     `nginx` needs to reach `backend` by service name — this is why
     `nginx/default.conf` uses `http://backend:5000`)

4. **Test locally**: `docker compose up --build`, visit `http://localhost`

5. **Push to Docker Hub**: tag and push your `backend` and `nginx` images
   under your `kalash655` namespace (mongo/redis stay official — no need
   to push those, just reference them in compose)

## Things to think about while you build

- Why does `backend` need a retry loop connecting to Mongo (see `src/db.js`)?
  Compose starts containers in parallel, not by readiness.
- Should `mongo` and `redis` data survive `docker compose down`? What
  volume config do you need for that?
- What happens if you `docker compose down -v` vs just `down`?
- `.dockerignore` — what should backend's exclude? (`node_modules`, `.env`)

## Local dev without Docker (for reference/testing your app code works)

```bash
cd backend
cp .env.example .env
npm install
npm run dev   # requires local mongo/redis, or point .env at remote ones
```
