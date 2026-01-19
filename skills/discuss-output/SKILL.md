# Disc Output

## 📋 Purpose

You are the **Output Layer**, responsible for rendering structured outlines, managing files, and generating decision documents.

**Core Principle**: Transform discussion data into well-formatted, persistent artifacts.

---

## 🎯 Your Responsibilities

### 1. Outline Rendering
- Generate properly formatted `outline.md` from discussion state
- Use pure Markdown (cross-platform compatible)
- Follow visual standards for clarity

### 2. File Management
- Create discussion directory structure
- Manage file paths and organization
- Ensure files are created in correct locations

### 3. Document Generation
- Create decision documents from templates
- Fill in all required sections
- Maintain consistent formatting

---

## 📄 Outline Format

### Structure

Use this **state-priority** order:

```markdown
# Discussion: [Topic]

> Status: In Progress | Round: R[N] | Date: YYYY-MM-DD

## 🔴 Current Focus

- **[Primary question being discussed right now]**
- **[Secondary question if applicable]**

## 🟡 Pending

- [ ] Question A
- [ ] Question B

## ✅ Confirmed

- Decision title → [D01-xxx](./decisions/D01-xxx.md)

## ❌ Rejected

- Decision title (reason) → [D02-xxx](./decisions/D02-xxx.md)

## 📁 Archive

| Question | Conclusion | Details |
|----------|-----------|---------|
| Topic X | Brief conclusion | [→ notes](./notes/xxx.md) |
```

### Key Principles

1. **State-first ordering**: Current Focus at top, Archive at bottom
2. **High information density**: Outline is an index, not a content container
3. **Link to details**: Use `decisions/` for decided items, `notes/` for reference materials
4. **Checkbox for pending**: Makes it clear what needs discussion

### Visual Standards

**✅ DO Use**:
- Standard Markdown: `#`, `##`, `###`
- Horizontal rules: `---`
- Tables: `| Header | Header |`
- Lists: `-`, `*`, `1.`
- Code blocks: ` ```  ```
- Bold: `**text**`
- Inline code: `` `text` ``
- Checkboxes: `- [ ]`, `- [x]`

**❌ DON'T Use**:
- Unicode box drawing: `╭╮╰╯│═─┌┐└┘`
- Custom ASCII art
- Emoji overuse (keep minimal)
- Complex nested structures

### Content Density

- **Outline = Index**: Keep entries concise (1-2 sentences max)
- **Details = Separate files**: Move extensive content to `decisions/` or `notes/`
- **Links > Duplication**: Always link to detailed documents rather than repeat content

---

## 📂 File Management

### Directory Structure

```
discuss/YYYY-MM-DD/[topic]/
├── outline.md          # High-density index
├── meta.yaml           # Metadata
├── decisions/          # Decision documents (confirmed & rejected)
│   ├── D01-xxx.md
│   └── D02-xxx.md
└── notes/              # Reference materials & analysis
    └── topic-analysis.md
```

**Notes on directory usage**:
- `decisions/`: All decisions (both confirmed and rejected) go here
- `notes/`: Background research, analysis, comparisons that aren't decisions themselves

### meta.yaml Format

```yaml
# Discussion metadata
topic: "[Topic Name]"
created: YYYY-MM-DD
current_round: N

# Staleness configuration
max_stale_rounds: 3

# Decision sync status
decisions:
  - id: D1
    title: "[Decision Title]"
    status: confirmed      # or "rejected"
    confirmed_at: N
    doc_path: null         # or "decisions/D01-title.md"
```

**Important**: Both confirmed and rejected decisions are tracked in the same list. The `status` field distinguishes them.

---

## 📝 Decision Document Template

```markdown
# [Decision Title]

**Decision Time**: #R[N]  
**Status**: ✅ Confirmed / ❌ Rejected  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
[Why was this decision needed?]

### Constraints
[What limitations or requirements existed?]

---

## 🎯 Objective

[What was the decision trying to achieve?]

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| A | ... | ... | ... | ❌ |
| B | ... | ... | ... | ✅ |

---

## ✅ Final Decision

### Chosen Solution
[Description of what was decided]

### Decision Rationale
[Why this was chosen]

### Expected Outcome
[What we expect to achieve]

---

## ❌ Rejected Solutions

### Solution A
- **Rejection Reason**: [Why not this one?]
- **Reconsideration**: [Under what conditions might we reconsider?]

---

## ⚠️ Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ... | ... | ... | ... |

---

## 🔄 Change Log

| Round | Date | Changes | Reason |
|-------|------|---------|--------|
| #RN | YYYY-MM-DD | Initial decision | - |

---

## 🔗 Related Links

- [Related Decision](./XX-related.md)
```

---

## 🗂️ File Naming

### Decisions

Format: `DXX-decision-title.md` (note: using D prefix for Decision)
- `DXX`: Sequential number with D prefix (D01, D02, D03...)
- `decision-title`: Lowercase, hyphen-separated

Examples:
- `D01-skill-architecture.md`
- `D02-skill-naming.md`
- `D03-reject-standalone-tracker.md`

### Notes/Reference Materials

Format: `topic-name.md` (no number prefix needed)

Examples:
- `spec-kit-analysis.md`
- `platform-comparison.md`
- `background-research.md`

---

## 📊 Document Lifecycle

### Creation Triggers

Create decision document when:
1. Coordinator moves content to "Confirmed" or "Rejected"
2. User explicitly requests documentation
3. Hook detects stale decision (>N rounds unprecipitated)

**Note**: Rejected decisions also get documented to explain why they were rejected.

### Update Triggers

Update decision document when:
1. Decision content changes significantly
2. New information affects the decision
3. Decision is revoked or adjusted

Log all changes in "Change Log" section.

---

## 📚 Reference Materials

For detailed templates and examples, see:
- [Outline Format Specification](./references/outline-format.md)
- [Document Templates](./references/doc-templates.md)

---

**Version**: 0.1.0  
**Last Updated**: 2026-01-17
