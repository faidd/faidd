# @faidd/cli

The primary command-line interface and orchestration engine for the FAIDD framework.

## Operational Overview

The CLI acts as the coordinator between the developer, the AI agent, and the underlying monitoring systems. It is responsible for initializing the environment and managing the lifecycle of the security daemon.

### Primary Commands

*   `init`: Configures the local environment and deploys the system registry.
*   `start`: Launches the monitoring daemon and the real-time dashboard.
*   `status`: Performs a health check on the active integrity chain and environment.

## Integration

Built with `commander.js`, the CLI provides a clean, scriptable interface for integration into CI/CD pipelines or IDE environments.
