# Vedic Vivaha (Frontend + FastAPI Backend)

Full-stack application with:
- Public marketing site and member login
- Registration form submission
- Member dashboard after login
- Admin dashboard for viewing registrations
- FastAPI backend with PostgreSQL persistence

## Tech Stack
- Frontend: React 18, Vite 7, plain CSS
- Backend: FastAPI, SQLAlchemy, Pydantic Settings, Passlib

## Project Structure
- `index.html`: main app entry HTML
- `admin.html`: admin app entry HTML
- `src/main.jsx`: mounts `App`
- `src/admin.jsx`: mounts `AdminApp`
- `src/App.jsx`: public site, registration flow, member login, member dashboard
- `src/AdminApp.jsx`: admin registration list page
- `src/lib/api.js`: API base URL aware fetch helper
- `vite.config.js`: dev server + `/api` proxy config
- `backend/app/main.py`: FastAPI app entrypoint
- `backend/app/api/routes`: API route modules
- `backend/app/models`: SQLAlchemy ORM models
- `backend/app/repositories`: DB access layer
- `backend/app/schemas`: Pydantic schemas
- `backend/requirements.txt`: Python dependencies
- `backend/Dockerfile`: backend container setup

## Run Frontend
```bash
npm install
npm run dev
```

Vite runs on `http://localhost:5173` by default.

## Routes / Pages
- Main site: `http://localhost:5173/`
- Public `admin.html` now redirects to home.
- Private admin login page: `http://localhost:5173/secure-admin-portal-84d2.html`

## Run Backend (Local)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend defaults:
- API base path: `/api`
- DB: PostgreSQL at `postgresql+psycopg://postgres:postgres@localhost:5432/vedic_vivaha`

Configure backend via environment variables:
- `DATABASE_URL`
- `API_PREFIX`
- `CORS_ORIGINS`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN`
- `ENFORCE_CREDIT_FOR_PROFILE_ACCESS`

Frontend API selection:
- `VITE_API_BASE_URL` controls where React sends API requests
- Default: `/api` (works with Vite proxy)

In development, Vite proxies `/api` to:
- `http://localhost:3000` by default
- `VITE_BACKEND_URL` if set in frontend shell

Example:
```bash
VITE_API_BASE_URL=http://localhost:8000/api npm run dev
```

Or use Vite proxy:
```bash
VITE_BACKEND_URL=http://localhost:4000 npm run dev
```

## Install PostgreSQL

macOS (Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
```

Ubuntu/Debian:
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Windows:
- Install PostgreSQL from `https://www.postgresql.org/download/windows/`
- Keep note of host, port, username, and password.

## PostgreSQL Setup

Create database/user (works on macOS/Linux where `psql` is available):
```bash
psql postgres
```

Run inside `psql`:
```sql
ALTER USER postgres WITH PASSWORD 'postgres';
CREATE DATABASE vedic_vivaha OWNER postgres;
```

Then export DB URL before backend run:
```bash
export DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/vedic_vivaha
```

Alternative using Docker for PostgreSQL only:
```bash
cd backend
docker compose -f docker-compose.postgres.yml up -d
```

## API Contracts (as used by frontend)

### 1) Create Registration
- `POST /api/registrations`
- Request body: JSON object from registration form fields (`name`, `email`, `password`, `phone`, etc.)
- Success response:
```json
{ "id": "VV-000001" }
```
- Error response: JSON with `detail` or `error`

### 2) Member login
- `POST /api/member-login`
- Request body:
```json
{
  "memberId": "VV-123456",
  "password": "secret"
}
```
- Success response (expected shape):
```json
{
  "member": { "id": "VV-123456", "name": "Member Name" },
  "profiles": [
    {
      "sNo": 1,
      "profileId": "VV-2401",
      "name": "Profile Name",
      "height": "5'6\"",
      "starPadham": "Rohini - 2",
      "hasPhoto": true
    }
  ]
}
```
- Error response: JSON with optional `error`
- If account is disabled: `403`
- If credit enforcement is enabled and credits are 0: `403`

### 3) List registrations (admin)
- `GET /api/admin/registrations` (requires `Authorization: Bearer <token>`)
- Query params:
  - `page`, `pageSize`
  - `search` (name/member ID)
  - `memberId`, `name`
  - `isActive` (`true` / `false`)
  - `maxCredits` (users with credits `<= maxCredits`)
  - `sortBy` (`created_at`, `updated_at`, `name`, `member_id`, `credits`, `status`, `is_active`)
  - `sortOrder` (`asc`, `desc`)
- Success response: array of objects like:
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

### 4) Admin login
- `POST /api/admin/login`
- Request body:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- Success response:
```json
{
  "token": "dev-admin-token-change-me"
}
```

### 5) Admin update user
- `PATCH /api/admin/registrations/{memberId}` (requires bearer token)
- Supports: `name`, `email`, `phone`, `city`, `status`, `isActive`, `credits`, `extraData`

### 6) Admin reset password
- `POST /api/admin/registrations/{memberId}/reset-password` (requires bearer token)
- Request body:
```json
{
  "newPassword": "NewPass@123"
}
```

## Current Behavior Notes
- Member session is stored in `sessionStorage` with key `vv_member_session`.
- Contact form in `App` currently prevents submit default and does not call backend.
- Admin dashboard has no authentication gate in frontend; it directly fetches registrations.
- Passwords are hashed in backend before DB persistence.
- Seed profile rows are auto-created on first backend startup.

## Docker (Backend)
```bash
cd backend
docker build -t vedic-vivaha-api .
docker run --rm -p 8000:8000 \
  -e DATABASE_URL=postgresql+psycopg://postgres:postgres@host.docker.internal:5432/vedic_vivaha \
  vedic-vivaha-api
```

## Build
```bash
npm run build
npm run preview
```
