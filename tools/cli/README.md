# @faidd/cli

The command-line interface for FAIDD.

## 💻 Usage
```bash
# Initialize a new FAIDD environment
npx faidd init

# Start the monitoring systems
npx faidd start

# View the audit ledger
npx faidd history
```

## 🛠️ Architecture
Built with `commander` and `inquirer`. It acts as the orchestrator for starting the Rust daemon and displaying the dashboard.
