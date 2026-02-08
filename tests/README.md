# FAIDD Test Suite

This directory contains the comprehensive test suite for the FAIDD framework, ensuring the integrity of the security daemon, the accuracy of the rules engine, and the reliability of the cryptographic ledger.

## Test Architecture

FAIDD employs a multi-layered testing strategy to validate both logic and system-level enforcement.

### 1. Unit Tests
*   **Core Logic**: Located within `core/logic`, testing the rules evaluation algorithms and hashing functions in isolation.
*   **Schemas**: Validation of JSON Schema structures and generated types.

### 2. Integration Tests
*   **Daemon Watcher**: Testing the Rust daemon's ability to capture filesystem events accurately.
*   **CLI Orchestration**: Validating the interaction between the Node.js CLI and the background daemon process.

### 3. E2E Security Simulations
*   **Agent Breach Scenarios**: Simulating unauthorized file operations by AI agents to verify daemon enforcement and ledger recording.
*   **Integrity Chain Attacks**: Attempting to modify historical ledger entries to ensure the verification logic detects tampering.

## Running Tests

### Root Orchestration
```bash
# Run all tests across the monorepo
pnpm test
```

### Targeted Testing
```bash
# Test the Core Logic package
pnpm --filter @faidd/logic test

# Test the Rust Daemon
cargo test -p faidd-daemon
```

## Maintenance Standards

- **Coverage Requirement**: All architectural logic must maintain >90% code coverage.
- **Fail-Fast**: Security-related tests are designed to fail immediately upon any breach of sovereignty.
- **Audit Logging**: Tests themselves are designed to be recorded in a dedicated test ledger for transparency.
