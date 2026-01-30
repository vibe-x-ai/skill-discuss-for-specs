# Verification Guide

This document provides end-to-end test scenarios to verify that `discuss-for-specs` is correctly installed and functioning.

> **Last Updated**: 2026-01-30

---

## Prerequisites

Before running verification tests:

```bash
# Check Node.js version (>= 16.0.0)
node --version

# Check Python 3 environment
python3 --version

# Check PyYAML
python3 -c "import yaml" && echo "PyYAML OK"
```

---

## Scenario 1: Installation Verification

**Objective**: Verify that the installation completes correctly.

### Steps

```bash
# 1. Install (specify your platform)
discuss-for-specs install --platform claude-code
# or: discuss-for-specs install --platform cursor

# 2. Verify Skills installation
ls -la ~/.claude/skills/
# Expected: discuss-for-specs/ directory exists (single merged skill)

# 3. Verify Hooks installation
ls -la ~/.discuss-for-specs/hooks/
# Expected: stop/, common/ directories exist

# 4. Verify Logs directory
ls -la ~/.discuss-for-specs/logs/
# Expected: directory exists (may be empty)

# 5. Verify platform configuration
cat ~/.claude/settings.json | grep -A10 "hooks"
# Expected: Stop hook configured
```

### Expected Output

Installation should display:
```
✅ Installation complete!

Installed components:
  • Skills: /Users/<username>/.claude/skills
  • Hooks: /Users/<username>/.discuss-for-specs/hooks
  • Logs: /Users/<username>/.discuss-for-specs/logs
```

---

## Scenario 2: Create Test Discussion Directory

**Objective**: Set up a test discussion structure for hook testing.

> **Note (2026-01-30)**: Discussion directories use `.discuss/` (hidden, with dot prefix).
> State tracking uses `.snapshot.yaml` instead of `meta.yaml`.

### Steps

```bash
# 1. Create test project
mkdir -p ~/test-discuss-project
cd ~/test-discuss-project

# 2. Create discussion directory structure
mkdir -p .discuss/2026-01-30/test-topic/decisions
mkdir -p .discuss/2026-01-30/test-topic/notes

# 3. Create outline.md
cat > .discuss/2026-01-30/test-topic/outline.md << 'EOF'
# Discussion: Test Topic

## 🔵 Current Focus
- Testing hook functionality

## ⚪ Pending
- [ ] Test question

## ✅ Confirmed
(None yet)

## ❌ Rejected
(None yet)
EOF

# 4. Verify structure
find .discuss -type f
```

### Expected Output

```
.discuss/2026-01-30/test-topic/outline.md
```

---

## Scenario 3: Test Stop Hook (Snapshot-Based Detection)

**Objective**: Verify that `check_precipitation` correctly detects stale discussions using snapshot comparison.

### Steps

```bash
# 1. Create a snapshot file simulating previous state
cat > .discuss/.snapshot.yaml << 'EOF'
version: 1
config:
  stale_threshold: 3

discussions:
  "2026-01-30/test-topic":
    outline:
      mtime: 1706600000.0
      change_count: 2
    decisions: []
    notes: []
EOF

# 2. Update outline.md to simulate a new change (touch to update mtime)
touch .discuss/2026-01-30/test-topic/outline.md

# 3. Invoke the stop hook (simulating conversation end)
echo '{"hook_event_name": "Stop", "stop_hook_active": false}' | \
  python3 ~/.discuss-for-specs/hooks/stop/check_precipitation.py
```

### Expected Behavior

Since the outline.md mtime has changed and `change_count` will become 3 (reaching threshold), the hook should:
1. Detect the outline change
2. Increment change_count from 2 to 3
3. Output a reminder message suggesting decision precipitation

### Check Updated Snapshot

```bash
# View the updated snapshot
cat .discuss/.snapshot.yaml

# Expected: change_count should be 3
```

---

## Scenario 4: Test Staleness Reset on Decision Update

**Objective**: Verify that creating a decision resets the change_count.

### Steps

```bash
# 1. Create a decision file
cat > .discuss/2026-01-30/test-topic/decisions/D01-test-decision.md << 'EOF'
# D01: Test Decision

## Status
✅ Confirmed

## Decision
This is a test decision.
EOF

# 2. Run the stop hook again
echo '{"hook_event_name": "Stop", "stop_hook_active": false}' | \
  python3 ~/.discuss-for-specs/hooks/stop/check_precipitation.py

# 3. Check the snapshot
cat .discuss/.snapshot.yaml
```

### Expected Behavior

Since a decision file was added, the hook should:
1. Detect the new decision file
2. Reset `change_count` to 0
3. Allow without showing reminder

---

## Scenario 5: Full Integration Test

**Objective**: Verify complete workflow in actual AI environment.

### Steps

1. Open project in Claude Code or Cursor
2. Start a discussion: "Let's discuss the architecture for a new feature"
3. Observe:
   - AI should create `.discuss/YYYY-MM-DD/feature-name/` directory
   - AI should create `outline.md` and update it during discussion
   - After each conversation end, the stop hook checks for staleness
4. After several rounds without creating decisions:
   - End conversation
   - Should see a reminder about stale decisions

### Verify Discussion State

```bash
# Check if snapshot was created
cat .discuss/.snapshot.yaml

# Should show your discussion with change_count tracking
```

---

## Troubleshooting

### Hooks Not Triggering

```bash
# Check hook configuration
cat ~/.claude/settings.json | python3 -m json.tool | grep -A20 hooks

# Expected structure:
# "hooks": {
#   "Stop": [...]
# }
```

### Log File Issues

```bash
# Check log directory permissions
ls -la ~/.discuss-for-specs/logs/

# Manually create if missing
mkdir -p ~/.discuss-for-specs/logs/
touch ~/.discuss-for-specs/logs/discuss-hooks-$(date +%Y-%m-%d).log

# View today's log
cat ~/.discuss-for-specs/logs/discuss-hooks-$(date +%Y-%m-%d).log
```

### Python Import Errors

```bash
# Ensure PyYAML is installed
pip3 install pyyaml

# Or with conda
conda install pyyaml
```

### Snapshot File Issues

```bash
# Check snapshot file exists and is valid YAML
python3 -c "import yaml; yaml.safe_load(open('.discuss/.snapshot.yaml'))"

# Delete snapshot to reset state (if corrupted)
rm .discuss/.snapshot.yaml
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.3.0 | 2026-01-30 | Updated for snapshot-based detection, removed file-edit hook scenarios, simplified to single stop hook |
| 0.2.0 | 2026-01-28 | Updated for merged skill (`discuss-for-specs`), new directory structure (`.discuss/`), session-based round counting |
| 0.1.0 | 2026-01-27 | Initial verification guide |

---

**Last Updated**: 2026-01-30
