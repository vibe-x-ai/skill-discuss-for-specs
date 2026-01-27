# npm Package Design

**Decision Time**: #R6
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement

Determine the specific design of the npm package: package name, implementation language, dependency strategy.

### Constraints

- Package name must be available on npm
- Minimize dependencies
- Implementation should be simple and maintainable

---

## 🎯 Objective

Design a concise, easy-to-use npm package.

---

## 📊 Solution Comparison

### Package Name Selection

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| `discuss-skills` | Descriptive; easy to remember | Slightly longer | ✅ |
| `skill-discuss` | Consistent with project name | Less intuitive than discuss-skills | ❌ |
| `dskill` | Short | Meaning unclear | ❌ |

### Implementation Language

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Node.js | Native to npm; good ecosystem; large user base | Requires Node environment | ✅ |
| Python | Already has pyproject.toml | Needs pipx; not as widespread as npm | ❌ |

---

## ✅ Final Decision

### Chosen Solution

- **Package Name**: `discuss-skills`
- **Language**: Node.js (TypeScript optional)
- **Dependencies**: Minimized, may only need `commander` or native parsing

### Decision Rationale

1. **Clear Package Name**: `discuss-skills` intuitively expresses functionality
2. **Node.js**: Most mature npm ecosystem, great `npx` experience
3. **Minimal Dependencies**: Reduces installation time and potential issues

### Expected Outcome

```json
{
  "name": "discuss-skills",
  "bin": {
    "discuss-skills": "./bin/cli.js"
  },
  "dependencies": {
    // Minimal or no dependencies
  }
}
```

Command examples:
```bash
npx discuss-skills install --platform cursor
npx discuss-skills install --platform claude-code --target ~/project
npx discuss-skills platforms
npx discuss-skills --version
```

---

## 🔗 Related Links

- [D04: Distribute installation commands via npm](./D04-npm-distribution.md)
