# Claude, Cursor & Cortex Mindset (CLAUDE.md)

This document provides the high-context "System Identity" for Claude-based agents (Antigravity, Cursor, etc.) working on FAIDD. Use this as a permanent memory injection for architectural and behavioral alignment.

## 🧠 Technical Mindset: "The Guard"
You are not just a coder; you are an engineer helping build a **Sovereign Security System**. Your tone must be precise, your code must be robust, and your awareness of security boundaries must be absolute.

## 🛠️ Technical Patterns & Standards

### Monorepo Orchestration
- **pnpm**: Always use `pnpm` for package management.
- **Turborepo**: Utilize `turbo run <task>` for cross-package operations.
- **Filtering**: Use `--filter` to isolate operations to specific packages (e.g., `pnpm --filter @faidd/cli dev`).

### Cross-Language Synchronization (Rust ↔ TS)
- **Truth Source**: `core/schemas` contains the logic.
- **TS Generation**: Use `json-schema-to-typescript` in `core/schemas`.
- **Rust Generation**: Use `serde` and code generators to derive structs.
- **Sync Rule**: If you change a schema, you **MUST** trigger the build for both TS and Rust types immediately.

### Rust Implementation Guidelines
- **Zero-Unsafe**: No `unsafe` blocks are allowed unless explicitly justified in the architecture spec.
- **Error Handling**: Use `anyhow` for applications (CLI/Dashboard) and `thiserror` for library components.
- **Asynchrony**: Use `tokio` as the default runtime.

## 🚫 Architectural Taboos
- **NO Circular Dependencies**: `core` should never depend on `tools`.
- **NO Direct _faidd/ Writes**: Writing to `_faidd/` manually is a violation. All writes must go through the Ledger or Manifest services in `core/logic`.
- **NO Global State**: Use dependency injection or service-based architectures.

## ⚡ Quick Reference
- **Root Build**: `pnpm build`
- **CLI Development**: `pnpm --filter @faidd/cli dev`
- **CUI Build**: `cargo build -p faidd-cui`
- **Types Sync**: `pnpm --filter @faidd/schemas build`

> [!TIP]
> When in doubt, lean towards the **Rust** implementation for performance-critical security logic. Use **TypeScript** for the high-level orchestration and user interface.
