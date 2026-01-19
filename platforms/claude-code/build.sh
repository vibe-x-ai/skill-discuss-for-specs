#!/bin/bash
#
# Build for Claude Code platform
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"

echo "Building for Claude Code..."

# Clean build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/discuss-coordinator"
mkdir -p "$BUILD_DIR/discuss-output"

# Build discuss-coordinator SKILL.md
echo "  - Building discuss-coordinator/SKILL.md"
cat "$PROJECT_ROOT/skills/discuss-coordinator/headers/claude-code.yaml" \
    "$PROJECT_ROOT/skills/discuss-coordinator/SKILL.md" \
    > "$BUILD_DIR/discuss-coordinator/SKILL.md"

# Copy references
if [ -d "$PROJECT_ROOT/skills/discuss-coordinator/references" ]; then
    cp -r "$PROJECT_ROOT/skills/discuss-coordinator/references" "$BUILD_DIR/discuss-coordinator/"
fi

# Build discuss-output SKILL.md
echo "  - Building discuss-output/SKILL.md"
cat "$PROJECT_ROOT/skills/discuss-output/headers/claude-code.yaml" \
    "$PROJECT_ROOT/skills/discuss-output/SKILL.md" \
    > "$BUILD_DIR/discuss-output/SKILL.md"

# Copy references
if [ -d "$PROJECT_ROOT/skills/discuss-output/references" ]; then
    cp -r "$PROJECT_ROOT/skills/discuss-output/references" "$BUILD_DIR/discuss-output/"
fi

echo "✓ Claude Code build complete: $BUILD_DIR"
