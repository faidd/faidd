# FAIDD: Framework for AI-Driven Development

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![GitHub stars](https://img.shields.io/github/stars/faidd/faidd?style=social)](https://github.com/faidd/faidd/stargazers)
[![GitHub contributors](https://img.shields.io/github/contributors/faidd/faidd)](https://github.com/faidd/faidd/graphs/contributors)
[![NPM Downloads](https://img.shields.io/npm/dw/faidd?style=flat-square&logo=npm&color=cb3837)](https://www.npmjs.com/package/faidd)
[![Logic Downloads](https://img.shields.io/npm/dw/@faidd/logic?label=logic%20downloads)](https://www.npmjs.com/package/@faidd/logic)

FAIDD is a sovereign security framework designed to govern, audit, and secure the interactions of AI agents within high-integrity development environments. It establishes a robust barrier between the host system and autonomous agents by enforcing schema-first permissions and maintaining an immutable audit trail.

---

## Technical Architecture

FAIDD follows a modular monorepo architecture, leveraging the safety of Rust for system monitoring and the flexibility of TypeScript for orchestration mapping.

### Core Ecosystem (`core/`)

The foundational logic layer, ensuring cross-language type safety and rule evaluation.

* **[Schemas](./core/schemas)**: The source of truth for the system contract.
* **[Types](./core/types)**: Synchronized type definitions for Rust and TypeScript.
* **[Logic](./core/logic)**: The engine responsible for verification and integrity chaining.
* **[Agents](./core/agents)**: Standardized behavioral mindsets for LLMs.

### Operational Tools (`tools/`)

The operational interface of the framework.

* **[CLI Interface](./tools/cli)**: Project management and agent bootstrapping.
* **[Guard Daemon](./tools/daemon)**: Rust-based filesystem watcher and rule enforcer.
* **[CUI Console](./tools/cui)**: CLI User Interface for real-time telemetry and monitoring.

### System Verification (`tests/`)

* **[Test Suite](./tests)**: Comprehensive unit, integration, and E2E security tests.

### System Registry (`_faidd/`)

The local runtime state, managed exclusively by the framework to maintain environment sovereignty.

---

## Strategic Significance

FAIDD addresses the critical challenge of **AI Agency Security**. In an era of autonomous coding agents, FAIDD provides the necessary guardrails to ensure that agents remain within their designated scope, preventing unauthorized data exfiltration or system pollution.

---

## Community and Contributions

### Contributors

We welcome contributions from the community. See the list of people who have already contributed:

<a href="https://github.com/faidd/faidd/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=faidd/faidd" />
</a>

<br>
<br>

### Support us by starring the repo!

<a href="https://star-history.com/#faidd/faidd&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=faidd/faidd&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=faidd/faidd&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=faidd/faidd&type=Date" />
 </picture>
</a>

### Global Metrics
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/faidd/faidd)
![GitHub star history](https://star-history.com/#faidd/faidd&Date)

---

## Governance & Compliance

* [Contributing Guidelines](./CONTRIBUTING.md)
* [Security Policy](./SECURITY.md)
* [AI Agent Interaction Rules](./AGENTS.md)
* [Claude/Cursor Specific Guidance](./CLAUDE.md)
* [Code of Conduct](./CODE_OF_CONDUCT.md)

---

## 🧠 AI Intelligence Layer

FAIDD is designed to be self-governing. The following resources define the behavioral logic and operational "mindset" of AI agents working within this repository:

*   **[Agent Directives](./AGENTS.md)**: The Prime Directive and Class S Violations.
*   **[Claude Alignment](./CLAUDE.md)**: Deep technical context for Anthropic/Cursor agents.
*   **[Intelligence Tools](./.agents)**: Specialized sub-agent skills and workflows.

---

## 📜 Release History

Track the evolution of the framework through our versioned logs:

*   **[Latest Release](./versions)**: view historical milestones and codenames.
    *   [v0.1.0 - Sovereign Foundation](./versions/v0.1.0.md)

---

## License

FAIDD is released under the [Apache 2.0 License](./LICENSE).
