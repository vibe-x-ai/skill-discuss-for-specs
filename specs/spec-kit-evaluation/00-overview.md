# Spec-Kit Cross-Platform Distribution Architecture

> **Project**: skill-discuss-for-specs  
> **Version**: v0.2.0  
> **Created**: 2026-01-19  
> **Last Updated**: 2026-01-28  
> **Status**: Design confirmed, implementation in progress

---

## Overview

This project adopts spec-kit's cross-platform distribution architecture to provide unified cross-platform distribution capabilities for the `discuss-mode` Skill. Through standardized Skill format, centralized configuration management, and npm distribution mechanism, we achieve the goal of "one set of content, multi-platform deployment".

### Core Objectives

1. **Cross-Platform Support**: Cover Claude Code, Cursor, GitHub Copilot, Windsurf, Gemini CLI
2. **Unified Distribution Format**: Use Skill as the primary distribution format
3. **Convenient Installation Experience**: One-command installation via `npx discuss-skills install`
4. **Low Maintenance Cost**: Centralized configuration management, adding new platforms only requires adding config entries

---

## Document Index

| No. | Document | Description |
|-----|----------|-------------|
| 01 | [Technical Research](./01-technical-research.md) | Platform Skills/Rules mechanism comparison study |
| 02 | [Architecture Design](./02-architecture-design.md) | Three-tier architecture design and decision records |
| 03 | [Task List](./03-task-list.md) | Development task breakdown and progress tracking |
| 04 | [Backlog](./04-backlog.md) | Items not included in current version |

---

## Key Decision Summary

### Original Decisions (2026-01-19)

| Decision | Conclusion | Details | Status |
|----------|------------|---------|--------|
| D1: Primary Distribution Format | Skill (`SKILL.md` + YAML frontmatter) | [Architecture - D1](./02-architecture-design.md#d1-skill-as-primary-distribution-format) | ✅ Active |
| D2: Header Separation Design | Preserve `headers/<platform>.yaml` separation | [Architecture - D2](./02-architecture-design.md#d2-preserve-header-separation-design) | ✅ Active |
| D3: Centralized Configuration | Create `config/platforms.yaml` | [Architecture - D3](./02-architecture-design.md#d3-adopt-centralized-configuration-management) | ✅ Active |
| D4: Distribution Method | Distribute installation commands via npm | [Architecture - D4](./02-architecture-design.md#d4-distribute-installation-commands-via-npm) | ✅ Active |
| D5: npm Package Design | Package name `discuss-skills`, Node.js implementation | [Architecture - D5](./02-architecture-design.md#d5-npm-package-design) | ✅ Active |
| D6: Pre-built Content | npm package includes pre-built SKILL.md files | [Architecture - D6](./02-architecture-design.md#d6-pre-built-content-in-npm-package) | ✅ Active |

### New Decisions (2026-01-28)

| Decision | Conclusion | Details | Status |
|----------|------------|---------|--------|
| D7: Skill Merge | Merge coordinator + output into single `discuss-mode` Skill | [Architecture - D7](./02-architecture-design.md#d7-skill-architecture-merge) | ✅ Active |
| D8: Directory Structure | Use `.discuss/YYYY-MM-DD/[topic]/` | [Architecture - D8](./02-architecture-design.md#d8-discussion-directory-structure) | ✅ Active |
| D9: meta.yaml Automation | Fully automated by Hooks, zero agent burden | [Architecture - D9](./02-architecture-design.md#d9-metayaml-programmatic-automation) | ✅ Active |
| D10: Hook Refactoring | Session-based round counting | [Architecture - D10](./02-architecture-design.md#d10-hook-refactoring) | ✅ Active |

---

## Supported Platforms

| Platform | Skills Status | Installation Directory |
|----------|---------------|------------------------|
| Claude Code | ✅ Stable | `.claude/skills/` |
| Cursor | ⚠️ Beta | `.cursor/skills/` |
| GitHub Copilot | ✅ Stable | `.github/skills/` |
| Windsurf | ✅ Stable | `.windsurf/skills/` |
| Gemini CLI | ⚠️ Needs manual enable | `.gemini/skills/` |

---

## Expected Usage

```bash
# Install to current project (Cursor platform)
npx discuss-skills install --platform cursor

# Install to specific directory (Claude Code platform)
npx discuss-skills install --platform claude-code --target ~/my-project

# View supported platforms
npx discuss-skills platforms

# View version
npx discuss-skills --version
```

---

## References

- [Discussion Records (Original)](../.discuss/2026-01-19/spec-kit-evaluation/)
- [Discussion Records (2026-01-28 Update)](../.discuss/2026-01-28/discuss-mode-optimization/)
- [Platform Skills Mechanism Comparison](./01-technical-research.md)
- [spec-kit Project](https://github.com/spec-kit/spec-kit)

---

**Last Updated**: 2026-01-28
