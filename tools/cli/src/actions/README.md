# FAIDD CLI Actions Layer

The **Actions** layer is the operational brain of the CLI. Each file here corresponds to the execution logic of a specific command.

## Responsibilities

- **Orchestration**: Coordination between services (services) and the user interface (ui).
- **Command Handlers**: Implementation of business logic for `init`, `status`, `rule`, and `audit`.
- **Flow Management**: Use of `ora` for loading indicators and `listr2` for task sequences.

## Workflow

A typical action follows this pattern:
1. Argument parsing from `index.ts`.
2. Calls to required services (e.g., `ConfigService`).
3. Result display via the `ui` layer.
