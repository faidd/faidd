# FAIDD: Framework for AI-Driven Development

> **The primary Command Line Interface and orchestration engine for the FAIDD framework.**

FAIDD is a sovereign security framework designed to govern, audit, and secure the interactions of AI agents within high-integrity development environments. It establishes a robust barrier between the host system and autonomous agents by enforcing schema-first permissions and maintaining an immutable audit trail.

---

## 🚀 Quick Start (CLI)

To initialize a new FAIDD-secured environment:

```bash
npx faidd init
```

To start the monitoring daemon:

```bash
npx faidd start
```

---

## 🎯 Strategic Significance

FAIDD addresses the critical challenge of **AI Agency Security**. In an era of autonomous coding agents, FAIDD provides the necessary guardrails to ensure that agents remain within their designated scope, preventing unauthorized data exfiltration or system pollution.

## 🧱 Architecture Overview

This package is part of the FAIDD monorepo:
- **`faidd` (CLI)**: Orchestration and project management.
- **`@faidd/logic`**: Rule evaluation and verification engine.
- **`@faidd/types`**: Foundation for cross-language type safety.
- **`@faidd/schemas`**: Governance standards for agent interaction.

---

## 🛡️ License

Released under the [Apache 2.0 License](https://github.com/faidd/faidd/blob/main/LICENSE).
