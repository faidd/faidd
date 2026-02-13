# FAIDD CLI Services Layer

**Services** are autonomous, stateless modules that provide critical functionality to the CLI and other packages.

## Responsibilities

- **ConfigService**: Reading, writing, and validation (via Zod) of the `.faiddrc.json` file.
- **LogService**: Management of the immutable audit trail and writing to `.faidd/logs`.
- **RuleService**: Rule matching logic and validation against JSON schemas.

## Integrity

This layer ensures that all data manipulated by the CLI conforms to the governance schemas defined in `@faidd/schemas`.
