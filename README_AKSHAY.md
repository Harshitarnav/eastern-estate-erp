# Dev Setup Guide (Akshay)

This is a safe, minimal setup so you can work on the frontend and backend locally. Databases and storage (Postgres/Redis/MinIO) run in Docker and should not be changed.

## Prereqs
- Node.js 20, npm
- Docker Desktop running
- Git

## 1) Clone the repo
```bash
git clone https://github.com/Harshitarnav/eastern-estate-erp.git
cd eastern-estate-erp
```

## 2) Start supporting services (DB/Redis/MinIO) in Docker
```bash
docker compose -f docker-compose.prod.yml up -d postgres redis minio
```
> Do not edit DB/Redis/MinIO configs.

## 3) Run backend locally (NestJS, port 3001)
```bash
cd backend
npm install      # first time
export CORS_ORIGINS=http://localhost:3000
export PORT=3001
npm run start:dev
```
- Ensure port 3001 is free. If a backend container is running, stop it:
  ```bash
  docker compose -f ../docker-compose.prod.yml stop backend
  ```

## 4) Run frontend locally (Next.js, port 3000)
```bash
cd ../frontend
npm install      # first time
export NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
npm run dev      # http://localhost:3000
```

## 5) Workflow
- Frontend edits: save -> browser auto-reloads.
- Backend edits: save -> Nest dev server auto-restarts.
- If you change env vars, restart the relevant dev server.

## 6) Port conflicts
- Free 3001 if in use: `lsof -i :3001` then kill PID or stop container.
- Or run backend on another port: `PORT=3002` and set `NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1`.

## 7) What not to touch
- Do not edit `docker-compose.prod.yml`.
- Do not change Postgres/Redis/MinIO passwords/ports.
- Do not drop/reset volumes.

## 8) Useful commands
- Stop all containers:
  ```bash
  docker compose -f docker-compose.prod.yml down
  ```
- View service logs (examples):
  ```bash
  docker compose -f docker-compose.prod.yml logs postgres --tail 50
  docker compose -f docker-compose.prod.yml logs redis --tail 50
  ```
- Restart backend container (if ever needed):
  ```bash
  docker compose -f docker-compose.prod.yml up -d --force-recreate backend
  ```

With this, you can safely develop frontend/backend locally while leaving DB/Redis/MinIO as-is.
