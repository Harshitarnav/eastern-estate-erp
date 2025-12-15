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


(base) arnav@Arnav-2 eastern-estate-erp % ssh -i ../../../Downloads/ERP.pem ubuntu@3.238.49.77
The authenticity of host '3.238.49.77 (3.238.49.77)' can't be established.
ED25519 key fingerprint is SHA256:h45R18+ExLNTwEc7UE1MecMnjPjCY+NHU8pdefOEVc0.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? 

<!-- 
ssh -i ../../../Downloads/Eastern-Estate-ERP.pem ubuntu@51.21.219.220

JWT_SECRET=6da8009d14f4138fb04cce03ee401217b2f00fcbfe093c4c8118e1519d3b9de9 -->

<!-- ssh -i ~/Downloads/ERP.pem ubuntu@3.238.49.77
cd ~/eastern-estate-erp
PULL CHANGES FROM GIT
docker compose -f docker-compose.prod.yml build backend frontend
docker compose -f docker-compose.prod.yml up -d --force-recreate backend frontend -->

<!-- docker compose -f docker-compose.prod.yml logs backend --tail 200 --since=5m -->
<!-- 
admin@eastern-estate.com
Admin@123 -->

<!-- Here’s a simple local dev loop so you can edit and see changes live:

Set envs (one-time per shell):
export NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
export CORS_ORIGINS=http://localhost:3000
Start the dependencies (DB/Redis/MinIO) via Docker:
docker compose -f docker-compose.prod.yml up -d postgres redis minio
Run the backend in watch mode (hot reload):
cd backend
npm install        # first time only
npm run start:dev  # NestJS auto-reloads on save
Run the frontend in dev mode (hot reload):
cd ../frontend
npm install        # first time only
npm run dev        # Next.js auto-reloads on save
Then open http://localhost:3000.

Change code, hit Save, and refresh the browser; both backend and frontend will rebuild automatically.

If you need a clean DB locally, stop services and reset volumes (destructive):

docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d postgres redis minio
Use npm run dev + npm run start:dev for rapid feedback; only use docker compose build when you need a production image. -->


Here’s a simple way to pipe your React booking form into the leads API:

Use the public leads endpoint (no auth cookie) with a secret token header:

URL: https://<your-domain>/api/v1/leads/public
Headers: Content-Type: application/json and x-public-token: <YOUR_PUBLIC_LEAD_TOKEN> (set this token in your backend config; keep it secret).
Send the minimal payload your API needs:

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "9999999999",
  "source": "WEBSITE",
  "propertyId": "<optional-property-uuid>",
  "notes": "Came from booking form on site"
}
React example (inside your form submit handler):
async function submitLead(form) {
  const payload = {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    source: 'WEBSITE',
    notes: form.notes || 'From booking form',
    propertyId: form.propertyId || undefined,
  };

  const res = await fetch('https://<your-domain>/api/v1/leads/public', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-public-token': '<YOUR_PUBLIC_LEAD_TOKEN>',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Lead submit failed');
  }
  return res.json();
}
Security notes:

Do not expose admin JWTs. Use the one-purpose x-public-token.
Consider basic spam protection (honeypot field, minimal rate limit, optional reCAPTCHA).
Validate email/phone client-side before sending.
Test quickly with curl:

curl -X POST https://<your-domain>/api/v1/leads/public \
  -H "Content-Type: application/json" \
  -H "x-public-token: <YOUR_PUBLIC_LEAD_TOKEN>" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"9999999999","source":"WEBSITE"}'
Once this is wired, submissions from your React booking form will create leads in the system.