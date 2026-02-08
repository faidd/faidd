# @faidd/schemas

This package serves as the centralized source of truth for the FAIDD framework's data contracts.

## Technical Scope

By utilizing JSON Schema, this package defines the structure and validation rules for all critical system entities. This approach guarantees that both the TypeScript orchestration and the Rust-based system monitoring remain aligned on the same data protocols.

### Key Definitions

*   **Rules Manifest**: Defines the permission sets and file system constraints.
*   **Ledger Entries**: Specifies the structure of the cryptographic audit trail.
*   **Mission Protocol**: Defines the objectives and constraints for active AI agent missions.

## Usage

Any architectural change affecting the system's data model must originate within this package. Modifying these schemas triggers the synchronization process across the monorepo.
