# Campus Queue & Appointment System — Frontend

This frontend is built to integrate **directly** with your provided backend (Express + MongoDB).

## What it covers (course checklist)
- Auth (JWT) + role-based UI (student/staff/admin)
- CRUD pages:
  - **Services** (admin full CRUD)
  - **Appointments** (student create/cancel; staff/admin update + notes)
- Queue logic:
  - student issues ticket
  - staff/admin calls next
  - list waiting tickets (sorted by backend)
- Analytics:
  - aggregation endpoint
  - materialized analytics endpoint + admin rebuild

## Setup
1) Install dependencies
```bash
cd frontend
npm i
```

2) Create `.env` (or copy from `.env.example`)
```bash
cp .env.example .env
# edit VITE_API_BASE_URL if your backend uses a different port
```

Example:
```
VITE_API_BASE_URL=http://localhost:5000
```

3) Run
```bash
npm run dev
```

Open: http://localhost:5173

## Backend requirements
Your backend already exposes these routes:
- `/api/auth/*` (register/login/me)
- `/api/services/*` (CRUD)
- `/api/queue/*` (issue/list/call-next)
- `/api/appointments/*` (CRUD + notes)
- `/api/analytics/*` (service-load + materialized)

If backend runs on a different URL/port, just change `VITE_API_BASE_URL`.
