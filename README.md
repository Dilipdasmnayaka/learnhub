## Course Enrollment Monorepo

Full-stack demo for a course enrollment platform. It includes:
- **Backend:** Express + MongoDB (Mongoose), JWT auth, pino logging.
- **Frontend:** React 19 + Vite + TypeScript with shared API types/clients.
- **Packages:** Shared API spec (`lib/api-spec`), Zod schemas (`lib/api-zod`), and React client (`lib/api-client-react`).

### Prerequisites
- Node.js 18+ and pnpm 10+.
- MongoDB URI (optional; falls back to in-memory MongoDB for local dev).

### Install & Run (Dev)
```bash
pnpm install          # fetch deps after a clean repo
pnpm run dev          # runs API on port 3001 and Vite app on port 5173
```

### Environment Variables
- **Backend (artifacts/api-server)**  
  - `PORT` (required, root script sets 3001)  
  - `MONGODB_URI` (optional; if absent, an in-memory MongoDB starts and seeds sample courses)  
  - `JWT_SECRET` (optional; defaults to `course_enrollment_jwt_secret_2024`)
- **Frontend (artifacts/course-enrollment/.env)**  
  - `PORT=5173` (Vite dev server)  
  - `BASE_PATH=/` (API base path prefix)

### API Surface (mounted under `/api`)
- `GET /health` – health check
- `/auth` – register, login, me (JWT bearer)
- `/courses` – list/get/create/update/delete (admin for mutations)
- `/enrollments` – enrollments for a user
- `/users` – basic user admin
- `/chatbot` – rule-based helper replies backed by course data

### Notes
- Images in `artifacts/course-enrollment/public/images` are lightweight placeholders to keep references working; replace with real assets if desired.
- If you remove `node_modules` to save space, reinstall with `pnpm install` before running.

### Useful scripts
- `pnpm --filter @workspace/api-server dev` – start API only
- `pnpm --filter @workspace/course-enrollment dev` – start frontend only
- `pnpm run typecheck` – TypeScript checks across workspace
- `pnpm -r --filter ./artifacts/** --filter ./scripts --if-present run typecheck` – typecheck apps/scripts

### Project structure (trimmed)
```
artifacts/
  api-server/            # Express + Mongoose API
  course-enrollment/     # React/Vite frontend
lib/
  api-spec/              # OpenAPI source
  api-zod/               # Generated Zod schemas
  api-client-react/      # Generated React client
```
