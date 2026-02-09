# FAIDD CLI Types & Schemas

This layer defines the data structures and validation rules used across the FAIDD CLI.

## Responsibilities

- **TypeScript Interfaces**: Strong typing for configurations, logs, and internal states.
- **Zod Schemas**: Runtime validation of external data (e.g., `.faiddrc.json`).
- **Shared Types**: Centralized definitions to avoid duplication between packages.

## Integrity

Every piece of data entering the system must be validated against a Zod schema defined here to ensure the "Sovereign" integrity of the framework.
