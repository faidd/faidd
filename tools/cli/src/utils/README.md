# FAIDD CLI Utils Layer

Generic utility functions and helpers that are shared across the CLI layers.

## Responsibilities

- **Filesystem Helpers**: Abstractions for common file operations (wrapped `fs-extra`).
- **String Manipulation**: Formatting and sanitizing terminal outputs.
- **Path Resolution**: Tools for handling workspace and project-relative paths.

## Design Rule

Utilities must remain stateless and purely functional. If a utility starts managing state, it should be promoted to a **Service** in `src/services/`.
