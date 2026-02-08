# @faidd/schemas

This package serves as the **Single Source of Truth** for the entire FAIDD ecosystem.

## 🎯 Purpose
By defining data structures in JSON Schema, we ensure that:
1. **Consistency**: TypeScript and Rust always use the same data definitions.
2. **Validation**: Runtime data can be validated against the schema.
3. **Evolution**: Changes to the system contract are tracked and synchronized.

## 📂 Contents
- `rules.json`: Schema for permission rules.
- `ledger.json`: Schema for audit log entries.
