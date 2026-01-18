# AGENTS.md - AI Agent Guidelines

This document provides guidance for AI agents working on this project.

## 📋 Project Overview

**skill-discuss-for-specs** is a cross-platform AI discussion facilitation system that helps structure deep discussions, track decisions, and automatically precipitate knowledge into documents.

### Core Philosophy

> **Intelligence work for Agent, process work for Hook**

- **Agent** (AI) focuses on: Understanding problems, analyzing solutions, guiding discussions, recognizing consensus
- **Hook** (Scripts) handles: Round counting, state checking, reminders, file operations

## 🏗️ Architecture

### 2-Skill Design

| Skill | Responsibility |
|-------|---------------|
| `disc-coordinator` | Discussion coordination, problem tracking, trend analysis, precipitation rules |
| `disc-output` | Outline rendering, file management, document generation |

### Directory Structure (Mechanism-Based)

```
skill-discuss-for-specs/
├── skills/              # 📝 Markdown instructions for AI
│   ├── disc-coordinator/
│   └── disc-output/
├── hooks/               # ⚡ Python automation scripts
│   ├── post-response/
│   └── common/
├── platforms/           # 🔌 Platform-specific adaptations
│   ├── claude-code/
│   └── cursor/
├── config/              # ⚙️ Configuration files
├── templates/           # 📄 File templates
└── discuss/             # 💬 Active discussions
```

## 🎯 Key Conventions

### 1. Discussion Mode

When user requests "discussion mode" or similar:
1. Create discussion directory: `discuss/YYYY-MM-DD/[topic]-discussion/`
2. Initialize `outline.md` and `meta.yaml`
3. Track questions, decisions, and trends
4. Precipitate confirmed decisions into documents

### 2. Decision Precipitation

When a decision is confirmed:
1. Move content to "Confirmed" section in outline
2. Add decision record to `meta.yaml` with `doc_path: null`
3. Create decision document in `decisions/` directory
4. Update `doc_path` in `meta.yaml`

### 3. Output Strategy

> **Never duplicate content between files and responses**

| Content | Location | Format |
|---------|----------|--------|
| Full outline | `outline.md` file | Complete structure |
| Response | Chat message | Summary + Δchanges + Analysis |

### 4. File Naming

- Decisions: `XX-decision-title.md` (e.g., `01-skill-architecture.md`)
- Use lowercase, hyphen-separated names
- Sequential numbering (01, 02, 03...)

## 📁 Important Files

| File | Purpose |
|------|---------|
| `skills/disc-coordinator/SKILL.md` | Coordinator skill instructions |
| `skills/disc-output/SKILL.md` | Output skill instructions |
| `config/default.yaml` | Default configuration |
| `hooks/post-response/check_stale.py` | Stale decision detection |
| `discuss/*/outline.md` | Active discussion outlines |
| `discuss/*/meta.yaml` | Discussion metadata |

## 🔧 Development Guidelines

### Adding New Features

1. **For AI behavior changes**: Update SKILL.md files in `skills/`
2. **For automation**: Add Python scripts in `hooks/`
3. **For new platforms**: Add directory in `platforms/` with build/install scripts

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

```yaml
# Discussion metadata
topic: "Topic Name"
created: YYYY-MM-DD
current_round: N

# Staleness configuration
max_stale_rounds: 3

# Decision sync status
decisions:
  - id: D1
    title: "Decision Title"
    status: confirmed | rejected
    confirmed_at: N           # Round when confirmed
    doc_path: null | "path"   # null = not yet documented
```

## ⚠️ Common Pitfalls

1. **Don't repeat outline content in responses** - Only show deltas and summaries
2. **Don't forget to update meta.yaml** - When confirming decisions, add records
3. **Don't create documents without updating doc_path** - Keep meta.yaml in sync
4. **Don't mix languages** - Use English for code comments, logs, and documentation

## 🔗 Related Resources

- [Architecture Design Discussion](discuss/2026-01-17/skill-discuss-architecture-design/outline.md)
- [Decision Documents](discuss/2026-01-17/skill-discuss-architecture-design/decisions/)
- [Project README](README.md)

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-18
