# AI Guidance File (agents.md)

This file documents the guidance used while building **SafeSwitch** for the assessment.

## Goal and Priorities
The AI was instructed to optimize for correctness, simplicity, and safe interfaces over feature count or visual polish.

## Stack Constraints
- Backend: Python 3.9, Flask 3.1, SQLAlchemy 2.0, SQLite, Pydantic 2.x.
- Frontend: React 19 + TypeScript + Vite + TailwindCSS 4.
- Tooling: pytest (backend), Vitest + ESLint + TypeScript build (frontend).

## Architecture Guidance Given to AI
- Keep transport and business logic separated:
  - `backend/routes.py` handles HTTP I/O only.
  - `backend/services.py` contains flag business logic and DB-side operations.
- Use schema-first request validation at boundaries (`backend/schemas.py` with Pydantic).
- Keep errors explicit and centralized:
  - Domain errors in `backend/exceptions.py`.
  - Global error mapping in `backend/app.py` (Pydantic/domain/HTTP/unhandled exceptions).
- Prefer simple data flow over abstractions that hide behavior.

## Behavioral Rules for AI Changes
1. Preserve existing behavior unless changing it is intentional and test-backed.
2. Add or update tests for every bug fix and interface change.
3. Avoid broad refactors not required by the task.
4. Keep dependencies stable and reproducible for evaluator setup.
5. Treat AI-generated code as draft code that must be reviewed before acceptance.

## Verification Protocol Applied
- Backend checks:
  - `backend/venv/bin/python -m pytest backend/tests -v`
- Frontend checks:
  - `npm run lint`
  - `npm run test`
  - `npm run build`
- Manual API edge-case verification was performed for malformed/missing JSON request bodies to confirm non-500 responses.

## Execution Safety Note
Python was kept on **3.9.x** for reliable local setup and compatibility in this environment.
