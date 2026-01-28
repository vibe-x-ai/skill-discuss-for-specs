# Verification Guide

This document provides end-to-end test scenarios to verify that `discuss-for-specs` is correctly installed and functioning.

> **Last Updated**: 2026-01-28

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
# Expected: file-edit/, stop/, common/ directories exist

# 4. Verify Logs directory
ls -la ~/.discuss-for-specs/logs/
# Expected: directory exists (may be empty)

# 5. Verify platform configuration
cat ~/.claude/settings.json | grep -A10 "hooks"
# Expected: PostToolUse and Stop hooks configured
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

> **Note (2026-01-28)**: Discussion directories are now `.discuss/` (hidden, with dot prefix).

### Steps

```bash
# 1. Create test project
mkdir -p ~/test-discuss-project
cd ~/test-discuss-project

# 2. Create discussion directory structure (new format)
mkdir -p .discuss/2026-01-27/test-topic/decisions
mkdir -p .discuss/2026-01-27/test-topic/notes

# 3. Create meta.yaml
cat > .discuss/2026-01-27/test-topic/meta.yaml << 'EOF'
# Basic info
topic: "test-topic"
created: 2026-01-27

# Round management
current_round: 1

# Configuration
config:
  stale_threshold: 3

# File tracking
decisions: []
notes: []
EOF

# 4. Create outline.md
cat > .discuss/2026-01-27/test-topic/outline.md << 'EOF'
# Discussion: Test Topic

> Status: In Progress | Round: R1 | Date: 2026-01-27

## 🔵 Current Focus
- Testing hook functionality

## ⚪ Pending
- [ ] Test question

## ✅ Confirmed
(None yet)
EOF

# 5. Verify structure
find .discuss -type f
```

### Expected Output

```
.discuss/2026-01-27/test-topic/meta.yaml
.discuss/2026-01-27/test-topic/outline.md
```

---

## Scenario 3: Test File Edit Hook

**Objective**: Verify that `track_file_edit` correctly detects discussion file edits.

### Steps

```bash
# 1. Simulate AI editing outline.md (manual hook invocation)
echo '{"file_path": "'$(pwd)'/.discuss/2026-01-27/test-topic/outline.md"}' | \
  python3 ~/.discuss-for-specs/hooks/file-edit/track_file_edit.py

# 2. Verify meta.yaml was updated
cat .discuss/2026-01-27/test-topic/meta.yaml
```

### Expected Behavior

1. Hook should detect that the edited file is in a `.discuss/` directory
2. meta.yaml should be updated (if session tracking is active)
3. Log file should contain entry:
   ```
   Hook Started: track_file_edit
   Discussion detected: .discuss/2026-01-27/test-topic
   Hook Ended: track_file_edit [SUCCESS]
   ```

### Check Logs

```bash
# View today's log
cat ~/.discuss-for-specs/logs/discuss-hooks-$(date +%Y-%m-%d).log
```

---

## Scenario 4: Test Stop Hook (Precipitation Check)

**Objective**: Verify that `check_precipitation` detects stale discussions.

### Steps

```bash
# 1. Modify meta.yaml to simulate stale state (4 rounds without decisions update)
cat > .discuss/2026-01-27/test-topic/meta.yaml << 'EOF'
# Basic info
topic: "test-topic"
created: 2026-01-27

# Round management
current_round: 5

# Configuration
config:
  stale_threshold: 3

# File tracking - simulating stale state
decisions:
  - path: "decisions/D01-test.md"
    name: "D01-test.md"
    last_modified: "2026-01-27T10:00:00Z"
    last_updated_round: 1

notes: []
EOF

# 2. Create a session file to simulate active discussion
mkdir -p .discuss/.sessions/claude-code
cat > .discuss/.sessions/claude-code/test-session.json << 'EOF'
{
  "session_id": "test-session",
  "started_at": "2026-01-27T12:00:00Z",
  "outline_updated": true,
  "outline_paths": [".discuss/2026-01-27/test-topic/outline.md"]
}
EOF

# 3. Invoke the stop hook (simulating conversation end)
echo '{"hook_event_name": "Stop", "stop_hook_active": false, "session_id": "test-session"}' | \
  python3 ~/.discuss-for-specs/hooks/stop/check_precipitation.py
```

### Expected Behavior

Since `current_round` (5) - `last_updated_round` (1) = 4 > `stale_threshold` (3), the hook should:
1. Block the stop and return a reminder message
2. Output should include: "Decision 'D01-test.md' not updated for 4 rounds"

---

## Scenario 5: Full Integration Test

**Objective**: Verify complete workflow in actual AI environment.

### Steps

1. Open project in Claude Code or Cursor
2. Start a discussion: "Let's discuss the architecture for a new feature"
3. Observe:
   - AI should create `.discuss/YYYY-MM-DD/feature-name/` directory
   - AI should create `outline.md` and update it during discussion
   - After each conversation, check that `meta.yaml` is updated
4. After several rounds without creating decisions:
   - End conversation
   - Should see a reminder about stale decisions

---

## Troubleshooting

### Hooks Not Triggering

```bash
# Check hook configuration
cat ~/.claude/settings.json | python3 -m json.tool | grep -A20 hooks

# Expected structure:
# "hooks": {
#   "PostToolUse": [...],
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
```

### Python Import Errors

```bash
# Ensure PyYAML is installed
pip3 install pyyaml

# Or with conda
conda install pyyaml
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.2.0 | 2026-01-28 | Updated for merged skill (`discuss-for-specs`), new directory structure (`.discuss/`), session-based round counting |
| 0.1.0 | 2026-01-27 | Initial verification guide |

---

**Last Updated**: 2026-01-28
