# FAIDD Core Architecture

The `core/` directory contains the foundational packages that define the logic and data contracts of the FAIDD system. This layer is designed to be language-agnostic in its definitions while providing optimized implementations for each target environment.

## Principal Components

### [Schemas](./schemas)
The source of truth for the entire ecosystem. It utilizes JSON Schema to define strict contracts for permissions, audit logs, and mission parameters.

### [Types](./types)
This package holds the generated type definitions. By deriving types directly from schemas, FAIDD ensures that the TypeScript orchestration layer and the Rust monitoring layer remain perfectly synchronized.

### [Logic](./logic)
The implementation of the system's core algorithms, including:
*   **Rules Evaluation**: High-performance verification of filesystem events.
*   **Cryptographic Ledger**: Logic for integrity chaining and hash verification.
*   **Protocol Enforcement**: Implementation of the B-MAD security protocols.

### [Agents](./agents)
A collection of standardized agent mindsets and specialized prompts that define the behavioral constraints and objectives for AI agents within the system.
