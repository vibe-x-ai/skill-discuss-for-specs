# Build Method

**Decision Time**: #R4
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirements

TypeScript CLI needs to be compiled to JavaScript to run, requiring selection of an appropriate build method.

### Constraints

- Users install via `npm install -g`
- Need to support rich error stack traces
- Agent debugging requires clear file paths and line numbers

---

## 🎯 Goals

Select a build method that satisfies:
1. Simple distribution
2. Debug-friendly
3. Low maintenance cost

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| **Direct tsc compilation** | Preserve directory structure, multi-file output | Simple, clear stack traces, no extra config | Requires node_modules | ✅ |
| **esbuild bundling** | Single-file bundle | Fast, zero runtime dependencies | Stack traces not intuitive, needs sourcemap | ❌ |
| **rollup/webpack** | Mature bundling tools | Feature-rich | Complex config, over-engineering | ❌ |

---

## ✅ Final Decision

### Selected Solution

Adopt **direct tsc compilation**:

```bash
# Build command
tsc --project tsconfig.json
```

### Output Structure

```
npm-package/
├── src/              # TypeScript source
│   ├── index.ts
│   ├── commands/
│   │   ├── track-edit.ts
│   │   ├── update-round.ts
│   │   └── ...
│   └── utils/
├── dist/             # Compiled output (tsc generated)
│   ├── index.js
│   ├── commands/
│   │   ├── track-edit.js
│   │   └── ...
│   └── utils/
└── bin/
    └── cli.js        # Entry script
```

### Decision Rationale

1. **Debug-friendly**: Error stack traces directly correspond to source structure, clear file names and line numbers
2. **Simple and reliable**: No extra build tools, tsc is the standard TypeScript compiler
3. **npm support**: npm already supports dependency management, no need to bundle into single file

### Key tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🔗 Related Decisions

- [D06-Platform Integration Approach](./D06-platform-integration.md)
