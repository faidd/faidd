# FAIDD: Framework for AI-Driven Development

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![GitHub stars](https://img.shields.io/github/stars/bmad-dev/faidd?style=social)](https://github.com/bmad-dev/faidd/stargazers)
[![GitHub contributors](https://img.shields.io/github/contributors/bmad-dev/faidd)](https://github.com/bmad-dev/faidd/graphs/contributors)

FAIDD (Fully Automated Integrity & Distribution Daemon) is a sovereign security framework designed to govern, audit, and secure the interactions of AI agents within high-integrity development environments. It establishes a robust barrier between the host system and autonomous agents by enforcing schema-first permissions and maintaining an immutable audit trail.

---

## Technical Architecture

FAIDD follows a modular monorepo architecture, leveraging the safety of Rust for system monitoring and the flexibility of TypeScript for orchestration mapping.

### Core Ecosystem (`core/`)
The foundational logic layer, ensuring cross-language type safety and rule evaluation.
*   **[Schemas](./core/schemas)**: The source of truth for the system contract.
*   **[Types](./core/types)**: Synchronized type definitions for Rust and TypeScript.
*   **[Logic](./core/logic)**: The engine responsible for verification and integrity chaining.

### Runtime Tools (`tools/`)
The operational interface of the framework.
*   **[CLI Interface](./tools/cli)**: Project management and agent bootstrapping.
*   **[Guard Daemon](./tools/daemon)**: Rust-based filesystem watcher and rule enforcer.
*   **[Dashboard](./tools/dashboard)**: Real-time telemetry and violation monitoring.

### System Registry (`_faidd/`)
The local runtime state, managed exclusively by the framework to maintain environment sovereignty.

---

## Strategic Significance

FAIDD addresses the critical challenge of **AI Agency Security**. In an era of autonomous coding agents, FAIDD provides the necessary guardrails to ensure that agents remain within their designated scope, preventing unauthorized data exfiltration or system pollution.

---

## Community and Contributions

### Contributors
We welcome contributions from the community. See the list of people who have already contributed:

<a href="https://github.com/bmad-dev/faidd/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=bmad-dev/faidd" />
</a>

### Activity
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/bmad-dev/faidd)
![GitHub star history](https://star-history.com/#bmad-dev/faidd&Date)

---

## Governance & Compliance

*   [Contributing Guidelines](./CONTRIBUTING.md)
*   [Security Policy](./SECURITY.md)
*   [AI Agent Interaction Rules](./AGENTS.md)
*   [Claude/Cursor Specific Guidance](./CLAUDE.md)
*   [Code of Conduct](./CODE_OF_CONDUCT.md)

---

## License

FAIDD is released under the [MIT License](./LICENSE).
