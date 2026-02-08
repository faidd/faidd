# Contributing to FAIDD

Thank you for your interest in contributing to FAIDD. As a security framework for AI-driven development, we maintain high standards for code quality, architectural integrity, and security.

## 🚀 Getting Started

### Prerequisites
- **Node.js**: >= 18.x
- **pnpm**: >= 8.x
- **Rust**: Latest stable (via rustup)
- **Turborepo**: Global installation recommended (`npm install -g turbo`)

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/faidd/faidd.git
cd faidd

# Install dependencies
pnpm install

# Perform a full build
pnpm build
```

---

## 🛠️ Development Standards

### 🧬 Schema-First Paradigm (CRITICAL)
FAIDD is a schema-first project. 
1.  **Never** modify types in `core/types` manually.
2.  All data structure changes must be made in `core/schemas/*.json`.
3.  Run `pnpm build` or the schema-specific build to regenerate types.
PRs that modify generated types will be automatically rejected.

### 📝 Commit Message Guidelines
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` for new features.
- `fix:` for bug fixes.
- `docs:` for documentation changes.
- `refactor:` for code changes that neither fix a bug nor add a feature.
- `chore:` for maintenance tasks and dependency updates.

### 🦀 Rust Standards
- Run `cargo fmt` before committing.
- Ensure your code passes `cargo clippy`.
- Use `anyhow` for application-level error handling.

### 🟦 TypeScript Standards
- Maintain 100% type coverage.
- Avoid `any` at all costs. Use `unknown` or specific interfaces.
- Prefer `zod` for runtime validation within `core/logic`.

---

## 🤝 Pull Request Process

1.  **Branching**: Create a branch with a descriptive name (`feat/rule-engine-refactor` or `fix/ledger-hashing`).
2.  **Documentation**: Update the relevant `README.md` if you add or modify functionality.
3.  **Testing**: Ensure all existing tests pass and add new tests for your changes.
4.  **Implementation Plan**: For major architectural changes, include or link to an implementation plan.
5.  **Review**: Every PR requires at least one approval from a core maintainer.

---

## 🛡️ Security
If you find a security vulnerability, please follow our [Security Policy](./SECURITY.md). **Do not open a public issue.**
