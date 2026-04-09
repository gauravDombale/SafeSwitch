# AI Guidance File (agents.md)

This file documents the constraints, rules, and verification protocol used to guide AI assistance while building **SafeSwitch** for the Senior SE assessment.

## Goal and Priorities

The AI was instructed to optimize strictly in this order:
1. **Correctness** — no invalid states, no silent failures
2. **Interface Safety** — validate at every boundary
3. **Simplicity** — readable and predictable over clever
4. **Observability** — failures must be visible and diagnosable

Feature count and UI polish were explicitly deprioritized.

## Stack Constraints

- **Backend:** Python 3.9, Flask 3.1, SQLAlchemy 2.0, SQLite, Pydantic 2.x, Alembic 1.14
- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS 4
- **Tooling:** pytest (backend), Vitest + ESLint + TypeScript build (frontend)

## Architecture Guidance Given to AI

### Backend Layer Rules
- `backend/routes.py` handles HTTP I/O **only** — no business logic, no DB calls.
- `backend/services.py` owns all flag business logic and DB-side operations.
- `backend/schemas.py` enforces all input validation at the boundary using Pydantic 2.x.
- `backend/exceptions.py` defines typed domain errors — never raise raw exceptions from services.
- `backend/app.py` owns global error mapping — routes never format error responses directly.
- All responses must be serialized through `FeatureFlagResponse`, never through ORM methods.

### Frontend Layer Rules
- `App.tsx` is an orchestrator — it owns global state (flags, loading, error) only.
- UI rendering is delegated to focused components (`FlagCard`, `CreateFlagForm`).
- `api.ts` isolates all HTTP calls — components never call axios directly.
- TypeScript interfaces must match the backend response schema exactly.

### Schema Rules
- Flag `name` must enforce both length (`min=1, max=100`) and format (`^[a-z0-9_-]+$`).
- Input schema (`FeatureFlagCreate`) and output schema (`FeatureFlagResponse`) are decoupled.
- Timestamps must be timezone-aware (`datetime.now(timezone.utc)`), never naive.

### Migration Rules
- `db.create_all()` is for test bootstrapping only — never the production migration path.
- All model changes must produce a versioned Alembic migration file via `--autogenerate`.
- Run `alembic check` as the final verification step after any schema change.

## Behavioral Rules for AI Changes

1. **Preserve existing behavior** unless the change is intentional and backed by a test.
2. **Add or update tests** for every bug fix and interface change — no untested changes.
3. **Avoid broad refactors** not required by the task.
4. **Keep dependencies pinned and stable** — reproducible evaluator setup is non-negotiable.
5. **Treat AI-generated code as draft code** — every output must be reviewed before acceptance.
6. **Never bypass schema boundaries** — no raw dict access where a schema should validate.
7. **Schema changes require a migration** — never modify models without a corresponding Alembic revision.

## Verification Protocol

Every change must pass the full verification matrix before commit:

### Backend
```bash
# Run all tests
backend/venv/bin/python -m pytest backend/tests -v

# Verify DB is at latest migration revision
alembic check
```

### Frontend
```bash
npm run lint      # Zero ESLint errors
npm run test      # All Vitest tests passing
npm run build     # TypeScript compile + Vite prod bundle must succeed
```

### Manual Edge-Case Testing (performed for this submission)
- POST with missing `Content-Type` → `415 Unsupported Media Type` ✅
- POST with malformed JSON body → `400 Bad Request` ✅
- POST with JSON array instead of object → `400 Bad Request` ✅
- POST with whitespace-only name → `400 Validation Error` ✅
- POST with uppercase/special char name → `400 Validation Error` ✅
- PATCH/DELETE with non-existent ID → `404 Not Found` ✅
- Duplicate flag creation → `409 Conflict` ✅

## Execution Safety Note

Python was kept on **3.9.x** for reliable local evaluator setup — `pydantic-core` requires a Rust toolchain to build from source on ARM macOS for newer Python versions, which creates an unacceptable setup burden for the reviewer.
