# Discussion: CLI Architecture Refactor - From Python to TypeScript

> Status: Completed | Round: R5 | Date: 2026-01-27

---

## 📋 Discussion Background

### Problem Origin

The current discuss-skills project uses Python scripts for Hooks implementation, which has the following issues:
1. Users need to install Python 3 + PyYAML separately
2. Inconsistent tech stack (the main project is TS/JS)
3. Maintaining two codebases increases complexity

### User's Idea

> "I'm thinking whether Hook-related functionality could be implemented with Shell scripts? Complex logic could be implemented in TypeScript and packaged as our command for distribution."

After discussion, we decided to adopt a **pure CLI approach** without Shell script wrappers.

---

## ✅ Confirmed Decisions

### Architecture Level

| ID | Decision | Content | Confirmed At | Doc |
|----|----------|---------|--------------|-----|
| D01 | CLI Command Form | Adopt multi-subcommand form: `discuss-skills <subcommand>` | R2 | [→ D01](./decisions/D01-cli-subcommand-design.md) |
| D04 | Atomic Command List | 6 core business commands + 3 installation management commands | R3 | [→ D04](./decisions/D04-atomic-commands.md) |

### Output & Debugging

| ID | Decision | Content | Confirmed At | Doc |
|----|----------|---------|--------------|-----|
| D02 | Output Format | Hybrid mode: human-readable by default + `--json` flag for JSON output | R3 | [→ D02](./decisions/D02-output-format.md) |
| D03 | Error Messages | Tiered output: ERROR → HINT → ACTION | R3 | [→ D03](./decisions/D03-error-format.md) |

### Technology Choices

| ID | Decision | Content | Confirmed At | Doc |
|----|----------|---------|--------------|-----|
| D05 | Build Method | Direct tsc compilation (preserve directory structure, no bundling) | R4 | [→ D05](./decisions/D05-build-method.md) |
| D06 | Platform Integration | CLI only, no shell wrapper (cross-platform compatible) | R4 | [→ D06](./decisions/D06-platform-integration.md) |

### Project Management

| ID | Decision | Content | Confirmed At | Doc |
|----|----------|---------|--------------|-----|
| D07 | Iteration Plan | One-time refactor, develop after discussion is complete | R4 | - |

---

## ❌ Rejected Solutions

| Solution | Rejection Reason | Round |
|----------|------------------|-------|
| Continue using Python | Increases user dependency burden, inconsistent tech stack | R1 |
| Use npx for installation | Changed to `npm install -g` for stability and speed | R1 |
| Keep Python as fallback | Simplify architecture, assume users have Node.js | R2 |
| Shell + CLI hybrid approach | Increases complexity, not Windows-friendly | R4 |
| esbuild bundling | tsc is simpler, clearer stack traces | R4 |

---

## 📊 Final Architecture Plan

### Overall Architecture Diagram

```
User Installation
    ↓
npm install -g discuss-skills
    ↓
Globally available command: discuss-skills <subcommand>
    ↓
Platform Hook directly calls CLI (no shell wrapper)
    ↓
CLI outputs structured info → Agent parses and makes decisions
```

### Technology Choices Summary

| Dimension | Decision |
|-----------|----------|
| **Language** | TypeScript |
| **Build** | Direct tsc compilation (preserve directory structure) |
| **Installation** | `npm install -g discuss-skills` |
| **Platform Integration** | Hook directly calls CLI (cross-platform compatible) |
| **Output Format** | Human-readable by default + `--json` flag |
| **Error Messages** | Tiered output (ERROR → HINT → ACTION) |
| **Logging** | File logs + stderr output |

### Command List

```bash
# Core Business Commands
discuss-skills track-edit           # Track file edits, update meta.yaml
discuss-skills update-round         # Increment round counter
discuss-skills check-stale          # Detect stale unupdated discussions
discuss-skills check-precipitation  # Detect unprecipitated decisions
discuss-skills parse-meta           # Read and parse meta.yaml
discuss-skills init                 # Initialize discussion directory

# Installation Management Commands
discuss-skills install              # Install Skills and Hooks to platform
discuss-skills uninstall            # Uninstall
discuss-skills platforms            # List supported platforms
```

---

## 📁 Discussion History

| Round | Focus | Key Decisions |
|-------|-------|---------------|
| R1 | Architecture refactor feasibility | Confirmed migration from Python to TS, use npm install -g |
| R2 | CLI command design | Confirmed multi-subcommand form |
| R3 | Output format and command list | Confirmed hybrid output, error tiering, 6+3 commands |
| R4 | Build and platform integration | Confirmed tsc compilation, CLI only without shell |
| R5 | Document precipitation | Organized all decision documents |

---

## 🔗 Related Files

- [D01 - CLI Subcommand Design](./decisions/D01-cli-subcommand-design.md)
- [D02 - Output Format Design](./decisions/D02-output-format.md)
- [D03 - Error Message Format](./decisions/D03-error-format.md)
- [D04 - Atomic Command List](./decisions/D04-atomic-commands.md)
- [D05 - Build Method](./decisions/D05-build-method.md)
- [D06 - Platform Integration Approach](./decisions/D06-platform-integration.md)
