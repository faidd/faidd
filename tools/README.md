# 🛠️ FAIDD Tools

Executables and runtime interfaces for interacting with the FAIDD system.

## 🚀 Components

### 💻 [`cli/`](./cli)
**User Entrypoint**. Built with Node.js/TypeScript. It provides the `faidd` command for initializing projects, starting the system, and querying the audit ledger.

### 🛡️ [`daemon/`](./daemon)
**The Guardian**. A high-performance Rust process that watches file system events, enforces rules manifests, and manages the IPC (Inter-Process Communication) channel.

### 📊 [`dashboard/`](./dashboard)
**Mission Control**. A Rust-based TUI (Terminal User Interface) for real-time monitoring of agent activity, rule violations, and system health.
