#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
VENV_DIR="${BACKEND_DIR}/.venv"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

require_cmd python3
require_cmd npm

if [ ! -d "${VENV_DIR}" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv "${VENV_DIR}"
fi

echo "Installing backend dependencies..."
"${VENV_DIR}/bin/pip" install -r "${BACKEND_DIR}/requirements.txt"

if [ ! -d "${ROOT_DIR}/node_modules" ]; then
  echo "Installing frontend dependencies..."
  (cd "${ROOT_DIR}" && npm install)
fi

cleanup() {
  echo
  echo "Stopping services..."
  kill "${BACKEND_PID:-}" "${FRONTEND_PID:-}" 2>/dev/null || true
  wait "${BACKEND_PID:-}" "${FRONTEND_PID:-}" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

echo "Starting backend on http://localhost:8000 ..."
(
  cd "${BACKEND_DIR}"
  DATABASE_URL="${DATABASE_URL:-sqlite:///./vedic_vivaha.db}" \
    "${VENV_DIR}/bin/uvicorn" app.main:app --reload --reload-dir app --reload-exclude '.venv/*' --host 0.0.0.0 --port 8000
) &
BACKEND_PID=$!

echo "Starting frontend on http://localhost:5173 ..."
(
  cd "${ROOT_DIR}"
  VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://localhost:8000/api}" npm run dev
) &
FRONTEND_PID=$!

echo
echo "Project is running:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "Press Ctrl+C to stop."

wait "${BACKEND_PID}" "${FRONTEND_PID}"
