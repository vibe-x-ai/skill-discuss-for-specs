# How It Works

This document explains the internal architecture and mechanisms of the Discussion Mode system.

> For quick start and installation, see the [README](README.md).

---

## Overview

Discussion Mode uses a **2-Skill + Hooks** architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Platform                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                         Skills                              │ │
│  │  ┌─────────────────────┐  ┌─────────────────────────────┐  │ │
│  │  │ discuss-coordinator │  │      discuss-output         │  │ │
│  │  │  • Problem tracking │  │  • Outline rendering        │  │ │
│  │  │  • Trend analysis   │  │  • Decision documents       │  │ │
│  │  │  • Consensus detect │  │  • File management          │  │ │
│  │  └─────────────────────┘  └─────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                         Hooks                               │ │
│  │  ┌─────────────────────┐  ┌─────────────────────────────┐  │ │
│  │  │  track_file_edit    │  │   check_precipitation       │  │ │
│  │  │  (on file edit)     │  │   (on conversation end)     │  │ │
│  │  └─────────────────────┘  └─────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Skills Architecture

### discuss-coordinator

**Purpose**: Facilitates discussion flow, tracks problems, and guides decision-making.

**Responsibilities**:
- Parse user intent and identify discussion topics
- Track problem lifecycle (🔵 Current Focus → ⚪ Pending → ✅ Confirmed)
- Analyze trends and detect consensus
- Determine when decisions are ready to precipitate

### discuss-output

**Purpose**: Manages structured output and documentation.

**Responsibilities**:
- Render and update `outline.md` after each round
- Create decision documents in `decisions/` directory
- Manage `meta.yaml` status tracking
- Archive discussions and notes

---

## Hooks Architecture

Hooks automate "process work" that doesn't require AI intelligence:

### Design Principle

> **Intelligence work for Agent, process work for Hook**

| Work Type | Handler | Examples |
|-----------|---------|----------|
| Intelligence | AI Skills | Understanding problems, analyzing solutions, recognizing consensus |
| Process | Python Hooks | Counting rounds, checking staleness, file operations |

### Hook 1: File Edit Tracking

**Trigger**: After each file edit by AI
- Claude Code: `PostToolUse` event (matcher: `Edit|Write|MultiEdit`)
- Cursor: `afterFileEdit` event

**Behavior**:
1. Detect if edited file is in a discussion directory
2. Set `pending_update: true` in `meta.yaml`
3. Always allow the operation to continue

### Hook 2: Precipitation Check

**Trigger**: When AI conversation ends
- Claude Code: `Stop` event
- Cursor: `stop` event

**Behavior**:
1. Scan for discussions with `pending_update: true`
2. Update `last_modified_run` and clear `pending_update`
3. Increment `current_run` counter
4. Check for stale files (not updated for N runs)
5. If stale, remind user to update outline/decisions

### Two-Stage Reminder Logic

| Stage | Threshold | Behavior |
|-------|-----------|----------|
| Suggest | `suggest_update_runs` (default: 3) | Gentle reminder |
| Force | `force_update_runs` (default: 10) | Strong reminder, may block |

---

## Discussion Directory Structure

Each discussion creates a structured directory:

```
discuss/YYYY-MM-DD/topic-name/
├── outline.md          # Live progress tracking
├── meta.yaml           # Metadata and run counters
├── decisions/          # Precipitated decisions
│   ├── D01-topic.md
│   ├── D02-topic.md
│   └── ...
└── notes/              # Reference materials
    └── ...
```

### outline.md

Real-time tracking of discussion state:

```markdown
# Discussion: Topic Name

## 🔵 Current Focus
- Current question being discussed

## ⚪ Pending
- [ ] Q1: Unanswered question
- [x] ~~Q2: Answered question~~ → See decisions

## ✅ Confirmed
- D1: First decision → [Document](decisions/D01-xxx.md)
- D2: Second decision → [Document](decisions/D02-xxx.md)

## ❌ Rejected
- (Rejected options with rationale)
```

### meta.yaml

Status tracking maintained by hooks:

```yaml
# Hook-maintained fields
created_at: "2026-01-20T10:00:00+08:00"
current_run: 5

# Configuration
config:
  suggest_update_runs: 3
  force_update_runs: 10

# File status tracking
file_status:
  outline:
    last_modified_run: 4
    pending_update: false
  decisions:
    last_modified_run: 2
    pending_update: false
```

---

## Installed Components

After installation, components are distributed as follows:

### Global (User-Level)

```
~/.discuss-for-specs/
├── hooks/                    # Python hook scripts
│   ├── common/               # Shared utilities
│   ├── file-edit/            # File edit tracking hook
│   └── stop/                 # Precipitation check hook
└── logs/                     # Hook execution logs
    └── discuss-hooks-YYYY-MM-DD.log
```

### Platform-Specific

**Claude Code**:
```
~/.claude/
├── skills/
│   ├── discuss-coordinator/  # Coordinator skill
│   └── discuss-output/       # Output skill
└── settings.json             # Hooks configuration
```

**Cursor**:
```
~/.cursor/
├── skills/
│   ├── discuss-coordinator/  # Coordinator skill
│   └── discuss-output/       # Output skill
└── hooks.json                # Hooks configuration
```

### Project-Level (with --target)

When using `--target /path/to/project`:
```
/path/to/project/
└── .cursor/                  # or .claude/
    └── skills/
        ├── discuss-coordinator/
        └── discuss-output/
```

---

## Logging

Hooks log all operations for debugging:

**Location**: `~/.discuss-for-specs/logs/discuss-hooks-YYYY-MM-DD.log`

**Format**:
```
2026-01-21 22:31:40 | INFO     | discuss-hooks | Hook Started: track_file_edit
2026-01-21 22:31:40 | DEBUG    | discuss-hooks | Input Data: {"file_path": "..."}
2026-01-21 22:31:40 | INFO     | discuss-hooks | Discussion detected: /path/to/discuss/topic
2026-01-21 22:31:40 | INFO     | discuss-hooks | Hook Ended: track_file_edit [SUCCESS]
```

---

## Platform Support

| Platform | Skills | Hooks | Status |
|----------|--------|-------|--------|
| Claude Code | ✅ | ✅ | Ready |
| Cursor | ✅ | ✅ | Ready |
| VS Code Copilot | ⏳ | ⏳ | Planned |
| Windsurf | ⏳ | ⏳ | Planned |

---

## Related

- [README](README.md) - Quick start and installation
- [AGENTS.md](AGENTS.md) - Guidelines for AI agents
- [Architecture Discussion](discuss/2026-01-17/skill-discuss-architecture-design/outline.md) - Design decisions

---

**Last Updated**: 2026-01-22
