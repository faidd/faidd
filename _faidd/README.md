# FAIDD System Registry

The `_faidd/` directory is a protected environment managed by the FAIDD framework. It stores the critical runtime state and assets required for the system's autonomous operation.

## Registry Structure

### [Binaries](./bin)
Stores the architecture-specific compiled binaries of the Guard Daemon.

### [Audit Ledger](./ledger)
Contains the append-only cryptographic trail. This directory is strictly governed to prevent unauthorized modification of historical action logs.

### [Rules Manifests](./rules)
Storage for the serialized permission manifests currently enforced by the system.

> [!CAUTION]
> Manual interference with files in this directory may lead to environment desynchronization and security violations. These files should only be modified by the FAIDD framework.
