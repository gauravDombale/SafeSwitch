# FlagGuard - Senior SE Assessment

A highly resilient, schema-driven Feature Toggle API built entirely targeting structure, simplicity, and interface safety.

## Key Technical Decisions

1. **Python version downgrade for "Zero-Setup" evaluation**
   While Python 3.12/3.14 are modern LTS branches, `pydantic-core` (written natively in Rust) lacks ARM OS-X pre-compiled wheels for newer Python releases without forcing the reviewer to install a Rust toolchain to compile it via `maturin`. To guarantee a working repository out of the box, we fallback accurately onto Python 3.9 stable.

2. **Data-Transport Layer decoupling**
   By putting the core toggling constraint logic isolated in `services.py`, the Transport Layer (`routes.py`) remains extremely thin. This satisfies the **Change Resilience** criteria directly - if we changed to GraphQL tomorrow, the application logic does not care.

3. **Interface Safety with Pydantic 2.x**
   A major criteria was interface safety. To avoid implicit "KeyErrors" when decoding JSON, Pydantic validates boundaries precisely. Bad JSON yields a perfect `400 Bad Request` citing correct field boundaries. 

4. **React + Tailwind UI (Vite)**
   For simplicity, raw CSS was discarded for Tailwind setup, preventing UI-drift. Axios abstractions strongly type outputs on the frontend mimicking the Backend's schema interface guaranteeing cross-boundary adherence.

## How to Run Locally

### 1. Start the Backend API
```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
flask --app backend/app run --port 8000
```

### 2. Run the Test Suite
```bash
# In another terminal instance:
source backend/venv/bin/activate
PYTHONPATH=. pytest backend/tests -v
```

### 3. Run the Frontend Dashboard
```bash
# In a new terminal instance:
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to safely toggle states!
