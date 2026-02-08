# 🔒 FAIDD System Folder

This directory is the local runtime environment for FAIDD. It is intended to be read-only for users and AI agents (governed by the Daemon).

## 📁 Subdirectories

### 📂 [`bin/`](./bin)
Storage for the compiled `faidd-daemon` binary specific to the local architecture.

### 🧾 [`ledger/`](./ledger)
Contains the `ledger.jsonl` file—an immutable, append-only cryptographic trail of every operation performed by an agent.

### 📜 [`rules/`](./rules)
Storage for serialized permissions manifests. These are the active rules enforced by the Daemon in real-time.
