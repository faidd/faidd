# FAIDD CLI Commands Layer

This directory acts as the bridge between the CLI entry point (`index.ts`) and the operational **Actions**.

## Responsibilities

- **Command Definition**: Defining CLI commands, options, and help messages using `commander`.
- **Validation**: Basic parsing of command-line arguments before passing them to the Action layer.
- **Entry Points**: Each file here should be a thin wrapper that calls a corresponding Action in `src/actions/`.

## Architecture Note

To maintain a "Mature" architecture, logic is decoupled from command definitions. If a command becomes complex, its implementation should live in `src/actions/`.
