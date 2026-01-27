# Error Message Format

**Decision Time**: #R3
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirements

Previously Python scripts had rich native error messages. After encapsulating into CLI, Agent cannot see the source code directly, and needs to understand through output and error messages:
1. What problem occurred
2. The severity of the problem
3. How to fix it

### Constraints

- Agent cannot see the encapsulated source code
- Need to make judgments and corrections through output messages
- Information needs to be structured for Agent understanding

---

## 🎯 Goals

Design error message format that enables Agent to:
1. Understand the specific cause of the error
2. Get possible solutions
3. Know what to do next

---

## ✅ Final Decision

### Tiered Error Message Structure

```
[ERROR] Error title
  - Expected: Expected situation
  - Actual: Actual situation

[HINT] Possible causes:
  1. Possible cause 1
  2. Possible cause 2

[ACTION] Suggested fix:
  Suggested fix command or action
```

### Human-Readable Mode Example

```bash
$ discuss-skills track-edit --file=discuss/xxx/outline.md

[ERROR] Meta file not found
  - Expected: discuss/xxx/meta.yaml
  - Actual: File does not exist

[HINT] Possible causes:
  1. Discussion directory not initialized
  2. File was deleted or moved

[ACTION] Suggested fix:
  Run: discuss-skills init --path=discuss/xxx
```

### JSON Mode Example

```json
{
  "success": false,
  "error": {
    "code": "META_NOT_FOUND",
    "message": "Meta file not found",
    "details": {
      "expected": "discuss/xxx/meta.yaml",
      "actual": "File does not exist"
    },
    "hints": [
      "Discussion directory not initialized",
      "File was deleted or moved"
    ],
    "suggested_action": "Run: discuss-skills init --path=discuss/xxx"
  }
}
```

### Error Code Specifications

| Error Code | Meaning |
|------------|---------|
| `META_NOT_FOUND` | meta.yaml file does not exist |
| `META_PARSE_ERROR` | meta.yaml parsing failed |
| `DISCUSS_NOT_FOUND` | Discussion directory does not exist |
| `INVALID_PATH` | Invalid path |
| `PERMISSION_DENIED` | Insufficient permissions |
| `ALREADY_EXISTS` | Directory/file already exists |

---

## 🔗 Related Decisions

- [D02-Output Format Design](./D02-output-format.md)
