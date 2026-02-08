# 🧠 FAIDD Core Packages

This directory contains the foundational logic and data definitions of the FAIDD system.

## 📦 Packages

### 📜 [`schemas/`](./schemas)
**Source of Truth**. Contains JSON Schema definitions for rules, ledger entries, and mission manifests. This is the only place where data structures should be modified.

### 🧬 [`types/`](./types)
**Bridging the Gap**. This package contains auto-generated TypeScript interfaces and Rust structs. Do not edit manually; use the build script to sync from schemas.

### ⚙️ [`logic/`](./logic)
**The Rules Engine**. Implementation of the verification logic, permission checking, and the integrity-chain hashing for the ledger.

### 🤖 [`agents/`](./agents)
**Agent Mindsets**. Collection of Markdown files defining specific prompts, constraints, and instructions for AI agents operating within FAIDD.
