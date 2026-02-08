# ⚔️ FAIDD - Sovereign AI Security System

FAIDD is a sovereign security layer designed to govern and audit AI agent interactions within a development environment. It enforces project-specific rules, maintains an immutable cryptographic ledger of operations, and provides real-time monitoring through a specialized Rust daemon.

## 🏗️ Project Architecture

FAIDD is built as a **PNPM Monorepo**, separating core logic from executable tools to ensure modularity and cross-language type safety (Rust/TypeScript).

### 📂 Directory Overview

| Directory | Type | Responsibility |
| :--- | :--- | :--- |
| [`core/`](./core) | **Logique** | The "Brain" - Shared schemas, business logic, and generated types. |
| [`tools/`](./tools) | **Exécutables** | The "Muscles" - CLI, Daemon, and Dashboard binaries. |
| [`_faidd/`](./_faidd) | **Système** | The "Black Box" - Local mission control, rules manifests, and audit ledger. |

---

## 🧠 Core Packages (`core/`)

- **`core/schemas`**: Source of truth (JSON Schema) for all system entities.
- **`core/types`**: Auto-generated types (TS/Rust) derived from schemas.
- **`core/logic`**: Implementation of the Rules Engine and cryptographic hashing.
- **`core/agents`**: Specialized markdown-based mindsets for AI agents.

## 🛠️ Executable Tools (`tools/`)

- **`tools/cli`**: Node.js interface for project initialization and control.
- **`tools/daemon`**: Rust-based background process for file monitoring and enforcement.
- **`tools/dashboard`**: Rust TUI (Terminal User Interface) for real-time monitoring.

## 🔒 System Storage (`_faidd/`)

- **`_faidd/bin`**: Local storage for the compiled Rust daemon.
- **`_faidd/ledger`**: Immutable append-only log of all agent actions.
- **`_faidd/rules`**: Serialized manifests consumed by the Rules Engine.

---

## ⚙️ Development

This project uses **Turborepo** for orchestration.

```bash
pnpm install
pnpm run build
```

> [!IMPORTANT]
> **Sovereignty Rule**: Never modify files in `_faidd/` manually. These are governed by the system daemon.
