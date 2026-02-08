# faidd-dashboard

The real-time telemetry and monitoring interface for the FAIDD framework.

## Functional Overview

The dashboard provides a visual interface for observing system activity and agent interactions. It serves as the primary observation point for human oversight during active missions.

### Key Features

*   **Live Event Stream**: A real-time view of all operations undergoing verification.
*   **Violation Alerts**: Instant visual notification when a security rule is triggered.
*   **System Integrity Status**: Real-time verification of the audit ledger's cryptographic health.

## Implementation

The dashboard is implemented as a Terminal User Interface (TUI) using Rust and the `ratatui` library, ensuring high responsiveness and platform independence.
