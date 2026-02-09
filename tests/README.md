# FAIDD Test Suite

This directory contains the global test suite for the FAIDD framework. Following our "Reinforced Concrete" quality standard, no code is deployed without rigorous validation.

## Test Structure

- **`cli/`**: End-to-End (E2E) behavior tests for the CLI. We simulate user interactions and verify terminal outputs as well as disk modifications.
- **`integration/`**: Consistency tests between the different packages in the monorepo (`@faidd/logic`, `@faidd/types`, etc.).

## Test Commands

To run the complete test suite:

```bash
pnpm test
```

To run only CLI tests:

```bash
pnpm test tests/cli
```

## Philosophy

We use **Vitest** for its speed and native TypeScript support, combined with **Execa** to drive CLI processes in an isolated and reproducible manner.
