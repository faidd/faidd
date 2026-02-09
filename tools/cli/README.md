# FAIDD Command Line Interface (CLI)

The FAIDD CLI is the central orchestration engine for the Sovereign Security Framework. It provides the necessary tools to initialize, manage, and audit the development perimeter.

## Core Objective

FAIDD addresses the critical challenge of AI Agency Security. By establishing a robust barrier between autonomous agents and the host system, the CLI ensures that agent interactions remain within a defined governance scope through schema-first permissions and immutable audit trails.

## Primary Capabilities

- **Perimeter Initialization**: Automated setup of the Sovereign workspace.
- **Onboarding Journey**: Interactive configuration of developer identity and technical context.
- **Rule Enforcement**: Real-time evaluation of agent actions against governance laws.
- **Audit Logging**: Generation of cryptographic trails for post-action verification.

## Architecture

The CLI follows a modular, layer-based architecture designed for high maintainability and security:

- **UI Layer (`src/ui/`)**: Pure terminal rendering (ASCII branding, themes, table formatting).
- **Action Layer (`src/actions/`)**: Coordination of complex business flows and internal services.
- **Service Layer (`src/services/`)**: Stateless modules for configuration management and rule processing.
- **Onboarding Layer (`src/onboarding/`)**: Interactive setup rituals for new environments.
- **Types & Schemas (`src/types/`)**: Shared definitions and runtime validation rules.

## Installation and Execution

To establish Sovereign guardrails in a new project:

```bash
npx faidd init
```

For status reporting and perimeter auditing:

```bash
npx faidd status
```

## Security Model

After initialization, the project is structured into two distinct poles:
- **`_faidd/` (System Core)**: Read-Only for AI agents. Contains rules, sessions, and daemon binaries.
- **`faidd/` (Operational Brain)**: Writeable for agents to store mission registers, analysis, and implementation plans.

---

*This package is a core component of the FAIDD Sovereign Security Framework.*
