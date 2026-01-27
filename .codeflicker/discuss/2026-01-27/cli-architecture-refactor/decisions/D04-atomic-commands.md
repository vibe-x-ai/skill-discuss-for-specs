# Atomic Command List

**Decision Time**: #R3
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

Need to determine which atomic commands the TypeScript CLI should implement, including each command's responsibilities, inputs, and outputs.

---

## 🎯 Command List

### Core Business Commands

| Command | Function | Input | Output |
|---------|----------|-------|--------|
| `track-edit` | Track file edits, update meta.yaml | `--file=<path>` | Update result, current round |
| `update-round` | Increment round counter | `--path=<discuss-dir>` | New round number |
| `check-stale` | Detect stale unupdated discussions | `--path=<discuss-dir>` | List of stale items |
| `check-precipitation` | Detect unprecipitated decisions | `--path=<discuss-dir>` | List of unprecipitated items |
| `parse-meta` | Read and parse meta.yaml | `--file=<meta.yaml>` | Parsed data |
| `init` | Initialize discussion directory | `--path=<dir>` `--topic=<name>` | List of created files |

### Installation Management Commands

| Command | Function | Input | Output |
|---------|----------|-------|--------|
| `install` | Install Skills and Hooks | `--platform=<name>` `--target=<dir>` | Installation result |
| `uninstall` | Uninstall | `--platform=<name>` | Uninstallation result |
| `platforms` | List supported platforms | None | Platform list |

---

## 📤 Output Format

### Default Mode (Human-Readable)

```bash
$ discuss-skills track-edit --file=discuss/2026-01-27/api-cache/outline.md

[OK] Discussion detected: discuss/2026-01-27/api-cache
[OK] Meta updated: current_round 4 -> 5
[OK] Last edited: outline.md
```

### JSON Mode

```bash
$ discuss-skills track-edit --file=discuss/2026-01-27/api-cache/outline.md --json

{
  "success": true,
  "discuss_path": "discuss/2026-01-27/api-cache",
  "meta_updated": true,
  "current_round": 5,
  "last_edited": "outline.md",
  "changes": ["round: 4 -> 5"]
}
```

---

## ❌ Error Output Format

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

JSON mode error:

```json
{
  "success": false,
  "error": {
    "code": "META_NOT_FOUND",
    "message": "Meta file not found",
    "expected": "discuss/xxx/meta.yaml",
    "hints": ["Discussion directory not initialized", "File was deleted or moved"],
    "suggested_action": "Run: discuss-skills init --path=discuss/xxx"
  }
}
```

---

## 🔗 Related Decisions

- [D01-CLI Subcommand Design](./D01-cli-subcommand-design.md)
- [D02-Output Format Design](./D02-output-format.md)
- [D03-Error Message Format](./D03-error-format.md)
- [D06-Platform Integration Approach](./D06-platform-integration.md)
