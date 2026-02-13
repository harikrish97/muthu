# Local Developer Setup

This guide is for first-time local setup of the full project (React frontend + FastAPI backend + PostgreSQL).

## 1) Prerequisites

- Node.js + npm
- Python 3.9+
- PostgreSQL 16

Check installed versions:

```bash
node -v
npm -v
python3 --version
psql --version
```

## 2) Install dependencies

From project root:

```bash
npm install
```

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

## 3) Setup PostgreSQL

Start PostgreSQL service (macOS/Homebrew):

```bash
brew services start postgresql@16
```

Create DB user and DB:

```bash
psql -d postgres
```

Run in `psql`:

```sql
CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';
CREATE DATABASE vedic_vivaha OWNER postgres;
```

If role `postgres` already exists, only run:

```sql
ALTER ROLE postgres WITH PASSWORD 'postgres';
```

## 4) Environment files

Backend env file (`backend/.env`) should contain:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/vedic_vivaha
API_PREFIX=/api
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=dev-admin-token-change-me
ENFORCE_CREDIT_FOR_PROFILE_ACCESS=false
```

Optional frontend env file (`.env`) for local overrides:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_VENDOR_KEY=default
```

## 5) Run the project

Recommended (starts frontend + backend together):

```bash
./run.sh
```

URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Health check: `http://localhost:8000/api/health`
- Private admin login page: `http://localhost:5173/secure-admin-portal-84d2.html`

## 6) Manual run (optional)

Backend:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend (new terminal):

```bash
npm run dev
```

## Troubleshooting

- `psql: command not found`: add PostgreSQL bin path to shell `PATH`.
- `role "postgres" does not exist`: connect using your OS user (`psql -d postgres`) and create role `postgres`.
- Passlib/bcrypt error: reinstall backend deps from `backend/requirements.txt` in fresh venv.
