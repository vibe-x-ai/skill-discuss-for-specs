# Platform Integration Approach

**Decision Time**: #R4
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirements

Need to decide how to integrate CLI with platform (Claude Code, Cursor, etc.) Hook mechanisms.

### Constraints

- Need to support Windows
- Claude Code hooks support Shell scripts
- Different platforms may have different Hook mechanisms

---

## 🎯 Goals

Design platform integration approach that satisfies:
1. Cross-platform compatibility (macOS, Linux, Windows)
2. Simple and maintainable
3. Unified user experience

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| **A. Shell + CLI** | Shell scripts for simple logic, calling CLI | Shell is flexible | Windows needs dual versions (.sh + .ps1) | ❌ |
| **B. CLI only** | Platform Hook directly calls CLI command | Cross-platform, simple | Requires platform support for direct executable calls | ✅ |
| **C. Node.js scripts** | Use .js instead of .sh | Cross-platform | Increases complexity | ❌ |

---

## ✅ Final Decision

### Selected Solution

Adopt **CLI only, no shell wrapper**:

Platform Hook configuration directly calls `discuss-skills` command, without any shell script wrapper.

### Claude Code Hook Configuration Example

```json
{
  "hooks": {
    "file-edit": {
      "command": "discuss-skills track-edit --file={{file}}"
    },
    "post-response": {
      "command": "discuss-skills check-stale --path=discuss"
    },
    "stop": {
      "command": "discuss-skills check-precipitation --path=discuss"
    }
  }
}
```

### Decision Rationale

1. **Cross-platform**: CLI commands behave consistently on macOS, Linux, and Windows
2. **Simple**: No need to maintain multiple scripts
3. **Reliable**: Fewer layers of calls, less chance of errors

### Installation Flow

```bash
# User installation
npm install -g discuss-skills

# Install to platform
discuss-skills install --platform claude-code

# This will:
# 1. Copy Skills to ~/.claude/skills/
# 2. Configure Hooks to directly call CLI commands
```

### Platform Integration

| Platform | Hook Mechanism | Integration Method |
|----------|----------------|-------------------|
| Claude Code | JSON configuration | Direct CLI call |
| Cursor | Similar configuration | Direct CLI call |
| Other platforms | To be researched | TBD |

---

## 🔗 Related Decisions

- [D05-Build Method](./D05-build-method.md)
- [D04-Atomic Command List](./D04-atomic-commands.md)
