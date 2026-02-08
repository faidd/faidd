# FAIDD Operational Tools

The `tools/` directory contains the executable binaries and user-facing interfaces that comprise the FAIDD runtime environment.

## Toolset Overview

### [CLI Interface](./cli)
The primary entry point for developers. Built with Node.js and TypeScript, it orchestrates environment initialization, daemon management, and audit inspection.

### [Security Daemon](./daemon)
A high-performance background process written in Rust. It serves as the system's "iron gate," monitoring filesystem activity in real-time and enforcing the active rules manifest.

### [CUI Console](./cui)
**CLI User Interface**. A specialized terminal dashboard built with Rust. It provides real-time telemetry, violation reporting, and system health status for the active environment.
