# AGENTS.md - AI Agent Guidelines

This document provides guidance for AI agents working on this project.

## 📋 Project Overview

**skill-discuss-for-specs** is a cross-platform AI discussion facilitation system that helps structure deep discussions, track decisions, and automatically precipitate knowledge into documents.

### Core Philosophy

> **Intelligence work for Agent, process work for Hook**

- **Agent** (AI) focuses on: Understanding problems, analyzing solutions, guiding discussions, recognizing consensus
- **Hook** (Scripts) handles: Round counting, state checking, reminders, file operations

## 🏗️ Architecture

### Single-Skill Architecture

| Skill | Responsibility |
|-------|---------------|
| `discuss-for-specs` | Discussion facilitation, problem tracking, consensus recognition, decision precipitation, file management |

### Directory Structure (Mechanism-Based)

```
skill-discuss-for-specs/
├── skills/              # 📝 Markdown instructions for AI
│   └── discuss-for-specs/          # Unified discussion skill
├── hooks/               # ⚡ Python automation scripts
│   ├── file-edit/           # File edit tracking
│   ├── stop/                # Precipitation checks
│   └── common/              # Shared utilities
├── platforms/           # 🔌 Platform-specific adaptations
├── config/              # ⚙️ Configuration files
├── templates/           # 📄 File templates
└── .discuss/            # 💬 Active discussions (dot-prefixed)
```

## 🎯 Key Conventions

### 1. Skill-Based Architecture

This project provides discussion facilitation capabilities through a single unified Skill:
- `discuss-for-specs`: Handles all discussion logic (in `skills/discuss-for-specs/SKILL.md`)

**To use discussion capabilities**: Load and follow the Skill. All usage details are documented in the SKILL.md file.

### 2. Data Structures

**Discussion directory**:
```
.discuss/YYYY-MM-DD/[topic]/
├── outline.md          # Discussion outline
├── meta.yaml           # Metadata (see schema below)
├── decisions/          # Decision documents
└── notes/              # Reference materials
```

**File naming conventions**:
- Decisions: `DXX-decision-title.md` (D01, D02, D03...)
- Notes: `topic-name.md` (no prefix)

### 3. Templates

Templates for new discussions are in `templates/`:
- `outline.md` - Outline template
- `meta.yaml` - Metadata template

## 📁 Important Files

| File | Purpose |
|------|---------|
| `skills/discuss-for-specs/SKILL.md` | Unified discussion skill instructions |
| `config/default.yaml` | Default configuration |
| `hooks/stop/check_precipitation.py` | Decision precipitation detection |
| `hooks/file-edit/track_file_edit.py` | File edit tracking |
| `hooks/common/session_manager.py` | Session state management |
| `.discuss/*/outline.md` | Active discussion outlines |
| `.discuss/*/meta.yaml` | Discussion metadata |

## 🔧 Development Guidelines

### Building for Platforms

```bash
# Build for all platforms
./scripts/build.sh

# Install for Claude Code
./platforms/claude-code/install.sh
```

### Testing Changes

```bash
# Run Python tests
python -m pytest tests/
```

## 📊 meta.yaml Schema

Reference for understanding/parsing discussion metadata:

```yaml
# Discussion metadata
topic: "Topic Name"
created: YYYY-MM-DD
current_round: N

# Staleness configuration
max_stale_rounds: 3

# Decision tracking
decisions:
  - id: D1
    title: "Decision Title"
    status: confirmed | rejected
    confirmed_at: N
    doc_path: null | "decisions/DXX-xxx.md"
```

## 🔨 Development Workflows

### Adding New Features

1. **AI behavior changes**: Update `skills/*/SKILL.md`
2. **Process automation**: Add Python scripts in `hooks/`
3. **Platform support**: Add directory in `platforms/` with build/install scripts
4. **Configuration**: Update `config/default.yaml`

### Modifying Skills

Skills are pure Markdown instructions. To modify behavior:
1. Edit the SKILL.md file
2. Test with discussion scenarios
3. Update version number and last updated date

### Hooks Development

Hooks are Python scripts that run at specific lifecycle events:
- `file-edit/`: Triggered when files are edited
- `stop/`: Triggered when AI response completes
- `common/`: Shared utilities

**Key modules in `common/`**:
- `session_manager.py`: Session state management
- `meta_parser.py`: Parse and manipulate meta.yaml
- `file_utils.py`: File operations helpers
- `logging_utils.py`: Centralized logging utilities
- `platform_utils.py`: Platform detection and adaptation

## ⚠️ Development Pitfalls

1. **Don't put usage instructions in AGENTS.md** - That belongs in SKILL.md
2. **Don't forget to update meta.yaml schema** - When adding new fields
3. **Don't modify Skills without testing** - Test with actual discussions first
4. **Don't break cross-platform compatibility** - Test build scripts for all platforms
5. **Keep hooks simple** - Complex logic should be in dedicated modules

## 🔗 Related Resources

- [Architecture Design Discussion](.discuss/2026-01-17/skill-discuss-architecture-design/outline.md)
- [Decision Documents](.discuss/2026-01-17/skill-discuss-architecture-design/decisions/)
- [How It Works](docs/HOW-IT-WORKS.md)
- [Project README](README.md)

---

**Version**: 0.1.0
**Last Updated**: 2026-01-28
