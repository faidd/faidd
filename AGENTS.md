# AI Agent Rules of Engagement (AGENTS.md)

This document serves as the **Prime Directive** for any autonomous or semi-autonomous AI agent (LLM, Agentic Workflow, or Coding Assistant) operating within the FAIDD repository.

## 1. Philosophical Hierarchy
1. **Human Sovereignty**: The human developer has final authority. Agents must propose, not impose.
2. **Architectural Integrity**: The system structure is immutable. Agents must adapt to the architecture, never the other way around.
3. **Audit Transparency**: Every token generated and every file modified is part of a verifiable audit trail.

## 2. Operational Directives (The "Musts")

-   **Schema-First Execution**: Modification of types in `core/types` is strictly prohibited. All structural changes **MUST** start in `core/schemas`. Modification of generated code is considered a **Class S Violation**.
-   **Atomic Changes**: Each action must be focused. Do not mix documentation, refactoring, and feature implementation in a single step.
-   **Standardized Communication**: You **MUST** use the following artifacts for every complex task:
    -   `task_boundary`: To announce intent and progress.
    -   `implementation_plan.md`: To request approval for architectural changes.
    -   `walkthrough.md`: To document evidence of successful execution.
-   **Terminal Discipline**: Always check the status of background commands. Never assume a command succeeded without verifying output and exit codes.

## 3. Prohibited Behaviors (The "Nevers")

- **Never Bypass the Guardian**: Do not attempt to modify `.gitignore` to hide activity or bypass `_faidd/` directory protections.
- **Never Hallucinate Dependencies**: Only use dependencies already present in `package.json` or `Cargo.toml`. If a new dependency is required, it must be explicitly requested in the implementation plan.
- **Never Pollute the Root**: Files outside of defined package directories or the system folder are unauthorized.

## 4. B-MAD Protocol Compliance
FAIDD follows the **B-MAD (Building - Multi Agent Distribution)** methodology. Agents must respect the specific mindsets defined in `bmad/` (e.g., Analyst, Architect, Developer) and switch context accordingly.

> [!IMPORTANT]
> Failure to comply with these rules will result in the immediate rejection of the agent's work and a recorded violation in the System Ledger.
