# How It Works

This document explains the internal architecture and mechanisms of the Discussion Mode system.

> For quick start and installation, see the [README](../README.md).

---

## Overview

Discussion Mode uses a **Single-Skill + Hooks** architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Platform                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                         Skill                               │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │                   discuss-mode                        │  │ │
│  │  │  • Three Roles (Socratic, Devil's Advocate, Connector)│  │ │
│  │  │  • Problem Type Differentiation                       │  │ │
│  │  │  • Discussion-First Principle                         │  │ │
│  │  │  • Problem Tracking & Consensus Recognition           │  │ │
│  │  │  • Output Strategy (No Duplication)                   │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
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

> **Note**: Previous versions used two separate Skills (`discuss-coordinator` + `discuss-output`). 
> As of 2026-01-28, these have been merged into a single `discuss-mode` Skill.
> See [Architecture Decision D7](../specs/spec-kit-evaluation/02-architecture-design.md#d7-skill-architecture-merge).

---

## Skill Architecture

### discuss-mode

**Purpose**: Facilitates in-depth discussions, tracks problems, guides decision-making, and manages structured output.

**Core Components**:

| Component | Description |
|-----------|-------------|
| **Three Roles** | Socratic Questioner, Devil's Advocate, Knowledge Connector |
| **Problem Types** | Different strategies for Factual / Design / Open-ended questions |
| **Discussion-First** | Ask before outputting; don't guess |
| **Problem Tracking** | Lifecycle: ⚪ pending → 🔵 discussing → ✅ resolved |
| **Output Strategy** | No Duplication between outline.md and responses |
| **Consensus Rules** | What IS and IS NOT consensus |

**Responsibilities**:
- Parse user intent and identify discussion topics
- Track problem lifecycle
- Analyze trends and detect consensus
- Render and update `outline.md` after each round
- Create decision documents in `decisions/` directory

---

## Hooks Architecture

Hooks automate "process work" that doesn't require AI intelligence:

### Design Principle

> **Intelligence work for Agent, process work for Hook**

| Work Type | Handler | Examples |
|-----------|---------|----------|
| Intelligence | AI Skill | Understanding problems, analyzing solutions, recognizing consensus |
| Process | Python Hooks | Counting rounds, checking staleness, file scanning |

### Hook 1: File Edit Tracking

**Trigger**: After each file edit by AI
- Claude Code: `PostToolUse` event (matcher: `Edit|Write|MultiEdit`)
- Cursor: `afterFileEdit` event

**Behavior**:
1. Detect if edited file is in a `.discuss/` directory
2. Determine file type (outline / decision / note)
3. Update `meta.yaml` with file tracking info
4. Update session file for round counting

### Hook 2: Precipitation Check

**Trigger**: When AI conversation ends
- Claude Code: `Stop` event
- Cursor: `stop` event

**Behavior**:
1. Check session file for outline updates
2. If no outline updates → skip (not in discussion mode)
3. If outline updated → check for stale decisions/notes
4. Calculate: `current_round - last_updated_round`
5. If exceeds threshold → remind user
6. Clean up session file

### Session-Based Round Counting

To ensure accurate round counting (one increment per conversation):

```
.discuss/.sessions/
├── claude-code/
│   └── {sessionID}.json
└── cursor/
    └── {sessionID}.json
```

Session file content:
```json
{
  "session_id": "abc123",
  "started_at": "2026-01-28T01:30:00Z",
  "outline_updated": true,
  "outline_paths": [".discuss/2026-01-28/topic/outline.md"]
}
```

---

## Discussion Directory Structure

Each discussion creates a structured directory:

```
.discuss/YYYY-MM-DD/topic-name/
├── outline.md          # Live progress tracking
├── meta.yaml           # Metadata (fully automated by Hooks)
├── decisions/          # Precipitated decisions
│   ├── D01-topic.md
│   ├── D02-topic.md
│   └── ...
└── notes/              # Reference materials
    └── ...
```

> **Note**: Previous versions used `discuss/` (without dot). As of 2026-01-28, 
> the standardized location is `.discuss/` (hidden directory).
> See [Architecture Decision D8](../specs/spec-kit-evaluation/02-architecture-design.md#d8-discussion-directory-structure).

### outline.md

Real-time tracking of discussion state:

```markdown
# Discussion: Topic Name

> Status: In Progress | Round: R[N] | Date: YYYY-MM-DD

## 🔵 Current Focus
- Current question being discussed

## ⚪ Pending
- [ ] Q1: Unanswered question

## ✅ Confirmed
| Decision | Description | Document |
|----------|-------------|----------|
| D1: First decision | Brief desc | [D01](./decisions/D01-xxx.md) |

## ❌ Rejected
- (Rejected options with rationale)
```

### meta.yaml

Status tracking maintained **fully by Hooks** (zero agent burden):

```yaml
# Basic info (auto-derived)
topic: "topic-name"           # From directory name
created: 2026-01-28

# Round management (auto-updated)
current_round: 5

# Configuration
config:
  stale_threshold: 3          # Remind if N rounds without update

# File tracking (auto-scanned)
decisions:
  - path: "decisions/D01-xxx.md"
    name: "D01-xxx.md"
    last_modified: "2026-01-28T01:30:00Z"
    last_updated_round: 4

notes:
  - path: "notes/analysis.md"
    name: "analysis.md"
    last_modified: "2026-01-28T00:45:00Z"
    last_updated_round: 2
```

> **Note**: Previous versions required the AI agent to maintain meta.yaml. 
> As of 2026-01-28, meta.yaml is fully automated by Hooks.
> See [Architecture Decision D9](../specs/spec-kit-evaluation/02-architecture-design.md#d9-metayaml-programmatic-automation).

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
│   └── discuss-mode/         # Single merged skill
└── settings.json             # Hooks configuration
```

**Cursor**:
```
~/.cursor/
├── skills/
│   └── discuss-mode/         # Single merged skill
└── hooks.json                # Hooks configuration
```

### Project-Level (with --target)

When using `--target /path/to/project`:
```
/path/to/project/
└── .cursor/                  # or .claude/
    └── skills/
        └── discuss-mode/
```

---

## Logging

Hooks log all operations for debugging:

**Location**: `~/.discuss-for-specs/logs/discuss-hooks-YYYY-MM-DD.log`

**Format**:
```
2026-01-21 22:31:40 | INFO     | discuss-hooks | Hook Started: track_file_edit
2026-01-21 22:31:40 | DEBUG    | discuss-hooks | Input Data: {"file_path": "..."}
2026-01-21 22:31:40 | INFO     | discuss-hooks | Discussion detected: /path/to/.discuss/topic
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

- [README](../README.md) - Quick start and installation
- [AGENTS.md](../AGENTS.md) - Guidelines for AI agents
- [Architecture Design](../specs/spec-kit-evaluation/02-architecture-design.md) - Design decisions
- [Discussion Records](./../.discuss/) - Historical discussions

---

**Last Updated**: 2026-01-28
