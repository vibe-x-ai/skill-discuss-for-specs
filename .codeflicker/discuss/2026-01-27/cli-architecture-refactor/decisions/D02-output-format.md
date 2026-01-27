# Output Format Design

**Decision Time**: #R3
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirements

CLI command output needs to satisfy two scenarios:
1. **Human reading**: Developers need readability when debugging in terminal
2. **Agent parsing**: AI Agents like Claude Code need structured data for decision making

### Constraints

- Agent cannot see the encapsulated source code
- Need to make judgments and corrections through output/error messages
- Output information needs to be rich enough

---

## 🎯 Goals

Design an output format that can:
1. Be human-readable by default
2. Output structured JSON when needed
3. Provide enough information for Agent decision making

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| A. Pure JSON | Always output JSON | Easy to parse | Poor human readability | ❌ |
| B. Pure human-readable | Always output text | Good readability | Difficult for Agent to parse | ❌ |
| C. Hybrid mode | Default text + `--json` flag | Best of both worlds | Need to maintain two formats | ✅ |

---

## ✅ Final Decision

### Selected Solution

Adopt **hybrid mode**:
- Default output in human-readable format
- Output JSON format when `--json` flag is added

### Default Mode Example

```bash
$ discuss-skills track-edit --file=discuss/2026-01-27/api-cache/outline.md

[OK] Discussion detected: discuss/2026-01-27/api-cache
[OK] Meta updated: current_round 4 -> 5
[OK] Last edited: outline.md
```

### JSON Mode Example

```bash
$ discuss-skills track-edit --file=discuss/2026-01-27/api-cache/outline.md --json

{
  "success": true,
  "discuss_path": "discuss/2026-01-27/api-cache",
  "meta_updated": true,
  "current_round": 5,
  "previous_round": 4,
  "last_edited": "outline.md",
  "changes": ["round: 4 -> 5"]
}
```

### Output Tag Specifications

Human-readable mode uses the following tags:
- `[OK]` - Operation successful
- `[INFO]` - Information notice
- `[WARN]` - Warning message
- `[ERROR]` - Error message
- `[HINT]` - Problem hint
- `[ACTION]` - Suggested action

---

## 🔗 Related Decisions

- [D03-Error Message Format](./D03-error-format.md)
- [D04-Atomic Command List](./D04-atomic-commands.md)
