# Task Manager — Dockerized Multi-Container App

A full-stack Task Manager application containerized from scratch with Docker and Docker Compose, deployed on AWS EC2. Built as a hands-on practice project to reinforce multi-container orchestration, service networking, and image publishing.

## Architecture

```
                    ┌─────────────┐
   Browser  ───────▶│    Nginx    │  :80
                    │  (reverse   │  serves static frontend
                    │   proxy)    │  proxies /api/* → backend
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Backend   │  :5000
                    │ Node.js/    │
                    │  Express    │
                    └──┬───────┬──┘
                       │       │
              ┌────────▼─┐   ┌─▼────────┐
              │  MongoDB │   │  Redis   │
              │  :27017  │   │  :6379   │
              │ (data)   │   │ (cache)  │
              └──────────┘   └──────────┘
```

All four services run in separate containers on a shared Docker Compose network, communicating via **service-name DNS resolution** (e.g. the backend connects to `mongo:27017` and `redis:6379`, nginx proxies to `backend:5000`).

## Tech Stack

| Layer | Technology |
|---|---|
| Reverse proxy / static hosting | Nginx (Alpine) |
| Backend API | Node.js, Express |
| Database | MongoDB |
| Cache | Redis |
| Containerization | Docker, Docker Compose |
| Deployment | AWS EC2 |
| Image registry | Docker Hub |

## Features

- REST API for creating, listing, completing, and deleting tasks
- Redis-backed response caching on task list reads (30s TTL, invalidated on any write) — the UI shows whether each response came from `cache` or `db`
- MongoDB persistence via a named Docker volume, so task data survives container restarts
- Nginx reverse proxy in front of the API, serving the frontend as static files and proxying `/api/*` requests to the backend
- Retry-on-connect logic for MongoDB, since Compose starts containers in parallel rather than waiting for readiness

## Project Structure

```
taskmanager/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── db.js
│       ├── redisClient.js
│       ├── models/Task.js
│       └── routes/tasks.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── nginx/
│   ├── Dockerfile
│   └── default.conf
├── compose.yaml
└── .gitignore
```

## Running Locally / on a Server

**Prerequisites:** Docker Engine and Docker Compose installed.

```bash
git clone https://github.com/Kalash0098/taskmanager-docker.git
cd taskmanager-docker/taskmanager
docker compose up -d --build
```

Then visit `http://localhost` (or your server's public IP) in a browser.

**Useful commands:**

```bash
docker compose ps               # check container status
docker compose logs -f          # follow logs for all services
docker compose logs -f backend  # follow logs for one service
docker compose down             # stop and remove containers (keeps data)
docker compose down -v          # also wipe the mongo-data volume
```

## Environment Variables

The backend reads its Mongo and Redis connection strings from the environment, defaulting to `localhost` for non-Docker local runs. In `compose.yaml`, these are overridden to use container service names:

```
MONGO_URI=mongodb://mongo:27017/taskmanager
REDIS_URL=redis://redis:6379
```

## Docker Hub Images

Custom-built images are published under:

- [`kalash655/taskmanager-backend`](https://hub.docker.com/r/kalash655/taskmanager-backend)
- [`kalash655/taskmanager-nginx`](https://hub.docker.com/r/kalash655/taskmanager-nginx)

(MongoDB and Redis use the official upstream images directly — no customization needed, so no custom image is published for them.)

## What I Practiced Here

- Writing Dockerfiles from scratch for a Node.js API and a custom Nginx image
- Multi-stage build context management (building the Nginx image from the project root so it could reach both `frontend/` and its own config)
- Docker Compose service networking and DNS resolution between containers
- Named volumes for data persistence vs. ephemeral cache storage
- Debugging real build/runtime errors: incorrect `COPY` paths relative to build context, missing environment variables causing `localhost` fallback failures, and Docker permission issues on EC2 (`docker.sock` access via the `docker` group)
- Deploying a multi-container app to an EC2 instance and running it detached in the background
- Tagging and pushing custom images to Docker Hub

## Related Projects

This project follows on from [`vprofile-docker`](https://github.com/Kalash0098/vprofile-docker), a multi-service Java application containerized with Docker Compose — this one intentionally uses a different stack (Node.js instead of Java/Tomcat) to practice Dockerfile writing for a new runtime environment.