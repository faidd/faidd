# @faidd/types

This package provides the generated type definitions required for cross-language synchronization within the FAIDD monorepo.

## Automated Synchronization

To ensure absolute consistency between the TypeScript and Rust layers, type definitions are automatically derived from the JSON Schemas located in `core/schemas`.

### Warning: Manual Modification Prohibited

Files within this package are artifacts of the build process. Manual modifications will be overwritten and should never be proposed in pull requests. Changes to the system types must be implemented by modifying the source schemas.

### Generation Stack

*   **TypeScript**: Derived using `json-schema-to-typescript`.
*   **Rust**: Target structs utilizing `serde` for seamless serialization.
