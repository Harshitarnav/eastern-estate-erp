# Production Deployment (Docker)

This project can be hosted on a single Linux box (Ubuntu 22.04/24.04 recommended) using the provided `docker-compose.prod.yml`. It brings up PostgreSQL, Redis, MinIO, the NestJS backend, and the Next.js frontend.

## 1) Install prerequisites on the server
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
```

## 2) Get the code onto the server
- Copy this repo to the server (git clone, scp, or rsync).
- From the project root: `cd eastern-estate-erp`

## 3) Set environment variables
Edit `backend/.env` (create it if missing) with production values:
```
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1
APP_URL=http://<SERVER_IP>:3001
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=eastern_estate
DB_PASSWORD=change_me
DB_DATABASE=eastern_estate_erp
DB_LOGGING=false
DB_SSL=false
JWT_SECRET=replace_with_32_char_secret
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=replace_with_refresh_secret_32_chars
JWT_REFRESH_EXPIRATION=7d
REDIS_HOST=redis
REDIS_PORT=6379
MAX_FILE_SIZE=10485760
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
CORS_ORIGINS=http://<SERVER_IP>:3000,https://<FRONTEND_DOMAIN>
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BUCKET=eastern-estate-files
# Optional email SMTP settings
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
ADMIN_EMAIL=
```

Set the API URL the browser should call (use your server IP or domain):
```
export NEXT_PUBLIC_API_URL=http://<SERVER_IP>:3001/api/v1
```

## 4) Build and start everything
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

What you get:
- Frontend: port 3000
- Backend API: port 3001
- PostgreSQL: port 5432 (with schema auto-loaded from `database-schema.sql`)
- Redis: port 6379
- MinIO: ports 9000 (S3 endpoint) and 9001 (console)

Check status: `docker compose -f docker-compose.prod.yml ps`

## 5) Create the first admin user
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eastern-estate.com","username":"admin","password":"Admin@123","firstName":"System","lastName":"Administrator"}'

# Assign super_admin role
docker compose -f docker-compose.prod.yml exec postgres psql -U eastern_estate -d eastern_estate_erp -c \
  "INSERT INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u, roles r WHERE u.email='admin@eastern-estate.com' AND r.name='super_admin' ON CONFLICT DO NOTHING;"
```

## 6) Access
- Web app: `http://<SERVER_IP>:3000`
- API: `http://<SERVER_IP>:3001/api/v1`
- MinIO console (optional): `http://<SERVER_IP>:9001` (user: `minioadmin`, pass: `minioadmin`)
- If uploads complain about missing bucket, create `eastern-estate-files` inside the MinIO console.

## 7) (Optional) Add HTTPS
- Point a domain at the server.
- Put Caddy/NGINX/Traefik in front of ports 3000/3001 to terminate TLS.
- Update `NEXT_PUBLIC_API_URL` and `CORS_ORIGINS` to use `https://<your-domain>`, then rerun the compose command with `--build`.
