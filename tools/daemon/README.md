# faidd-daemon

The high-performance security enforcement process for FAIDD.

## 💂️ Responsibility
- **Real-time Monitoring**: Uses `notify` to watch file system events.
- **Rule Enforcement**: Blocking unauthorized file modifications.
- **Ledger Persistence**: Securely writing agent activity to the cryptographic ledger.
- **IPC Server**: Communicating with the CLI via Unix Sockets or Named Pipes.

## 🦀 Implementation
Written in **Rust** for safety and performance.
