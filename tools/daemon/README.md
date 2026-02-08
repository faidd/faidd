# faidd-daemon

The high-performance security enforcement daemon for the FAIDD framework.

## Technical Role

The daemon is the primary enforcement authority within the FAIDD ecosystem. Written in Rust for maximum reliability and minimal overhead, it operates at the system level to monitor filesystem events and block unauthorized operations.

### Key Capabilities

*   **Real-time Event Hooking**: Utilizing the `notify` crate to watch for file system modifications.
*   **Manifest Enforcement**: Instantly validating events against the serialized rules manifest.
*   **Audit Logging**: Ensuring every validated event is cryptographically recorded in the local ledger.
*   **IPC Server**: Providing a secure communication channel for the CLI and Dashboard.

## Performance

The daemon is optimized for low-latency verification, ensuring that security enforcement does not impede the developer or agent workflow.
