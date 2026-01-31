#!/bin/bash
#
# Build for OpenCode platform (L1 - Skills only)
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"

echo "Building for OpenCode..."

# Clean build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/discuss-for-specs"
mkdir -p "$BUILD_DIR/discuss-for-specs/references"

# Build discuss-for-specs SKILL.md
echo "  - Building discuss-for-specs/SKILL.md"
cat "$PROJECT_ROOT/skills/discuss-for-specs/headers/opencode.yaml" \
    "$PROJECT_ROOT/skills/discuss-for-specs/SKILL.md" \
    > "$BUILD_DIR/discuss-for-specs/SKILL.md"

# Append L1 guidance (no hooks, user must self-check)
echo "" >> "$BUILD_DIR/discuss-for-specs/SKILL.md"
echo "---" >> "$BUILD_DIR/discuss-for-specs/SKILL.md"
echo "" >> "$BUILD_DIR/discuss-for-specs/SKILL.md"
cat "$PROJECT_ROOT/skills/discuss-for-specs/references/l1-guidance.md" \
    >> "$BUILD_DIR/discuss-for-specs/SKILL.md"

# Copy references
cp "$PROJECT_ROOT/skills/discuss-for-specs/references/decision-template.md" \
   "$BUILD_DIR/discuss-for-specs/references/"
cp "$PROJECT_ROOT/skills/discuss-for-specs/references/outline-template.md" \
   "$BUILD_DIR/discuss-for-specs/references/"

echo "✓ OpenCode build complete: $BUILD_DIR"
