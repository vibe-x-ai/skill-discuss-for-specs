# CLI Subcommand Design

**Decision Time**: #R2
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirements

Current Hooks use Python scripts, which has the following issues:
1. Users need to install Python 3 + PyYAML separately
2. Inconsistent tech stack (the main project is TS/JS)
3. Maintaining two codebases increases complexity

### Constraints

- Users already have Node.js environment (prerequisite for using Claude Code/Cursor)
- Claude Code hooks support Shell script calls
- Agent cannot see the encapsulated source code, needs rich output information

---

## 🎯 Goals

1. Unify tech stack to TypeScript
2. Reduce user dependencies
3. Maintain Agent debuggability (rich output and error messages)

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| A. Single entry + action | `discuss-skills hook --action=xxx` | Simple entry point | Long command, not intuitive | ❌ |
| B. Multiple subcommands | `discuss-skills track-edit` | Intuitive, easy to use, extensible | Requires more code | ✅ |

---

## ✅ Final Decision

### Selected Solution

Adopt **multi-subcommand form** CLI design:

```bash
# Subcommand list
discuss-skills track-edit     # Track file edits
discuss-skills update-round   # Increment round
discuss-skills check-stale    # Detect stale discussions
discuss-skills check-precipitation  # Detect unprecipitated decisions
discuss-skills parse-meta     # Read meta.yaml
discuss-skills init           # Initialize discussion directory

# Utility commands
discuss-skills install        # Install to platform
discuss-skills uninstall      # Uninstall
discuss-skills platforms      # List supported platforms
```

### Decision Rationale

1. **Intuitive and easy to use**: Each command has a clear function, easy to understand at a glance
2. **Easy to extend**: Adding new features only requires adding new subcommands
3. **Follows Unix philosophy**: Each command does one thing well
4. **Agent-friendly**: Output can be optimized for different commands

### Expected Outcome

- User installation: `npm install -g discuss-skills`
- CLI call: `discuss-skills track-edit --file=xxx`
- Agent can parse structured output for decision making

---

## 🔗 Related Decisions

- [D02-Output Format Design](./D02-output-format.md)
- [D03-Error Message Format](./D03-error-format.md)
- [D04-Atomic Command List](./D04-atomic-commands.md)
- [D05-Build Method](./D05-build-method.md)
- [D06-Platform Integration Approach](./D06-platform-integration.md)
