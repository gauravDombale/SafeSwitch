# AI Guidance File (agents.md)

This section highlights the prompts, context structures, and operational constraints given to the AI during the development of FlagGuard.

## System Prompt Context
The AI was provided with clear guidelines prioritizing system correctness, simplicity, and safety over feature-count.

- **Stack Guidelines**: Strictly adhered to Python 3.9 (System Default / LTS Support Equivalent locally), Flask 3.1, SQLite, SQLAlchemy 2.0, Pydantic 2.x, Node 24 (LTS), React 19, and TailwindCSS 4.
- **Strict Interfaces**: Pydantic was leveraged as an interface boundary. The AI was prompted to ensure `ValidationError` boundaries on the API were consistently wrapped.
- **Resilience Strategy**: The AI was guided to decouple data layer logic (`services.py`) from transport layers (`routes.py`). 

## AI Behavioral Rules Enforced
1. **No direct bash file manipulation**: AI was restricted from using `cat`, `sed`, or raw `echo` inside the shell. Standardized serialization tools (AST modifiers, or artifact writers) had to be utilized. 
2. **Predictable Code execution**: Code changes were implemented iteratively and verified continuously by a robust test suite (`pytest`) initialized simultaneously with code generation.
3. **Execution Safety**: Unsafe system dependencies were scrutinized, which led to a pivot from Python 3.14 (lacking pre-compiled core wheels for Pydantic on the ARM environment without a Rust toolchain) back to a stable 3.9.x environment to ensure an evaluated user could reproduce the execution out-of-the-box (Zero-Setup policy).
