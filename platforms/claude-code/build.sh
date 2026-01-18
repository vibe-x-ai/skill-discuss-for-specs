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
mkdir -p "$BUILD_DIR/disc-coordinator"
mkdir -p "$BUILD_DIR/disc-output"

# Build disc-coordinator SKILL.md
echo "  - Building disc-coordinator/SKILL.md"
cat "$PROJECT_ROOT/skills/disc-coordinator/headers/claude-code.yaml" \
    "$PROJECT_ROOT/skills/disc-coordinator/SKILL.md" \
    > "$BUILD_DIR/disc-coordinator/SKILL.md"

# Copy references
if [ -d "$PROJECT_ROOT/skills/disc-coordinator/references" ]; then
    cp -r "$PROJECT_ROOT/skills/disc-coordinator/references" "$BUILD_DIR/disc-coordinator/"
fi

# Build disc-output SKILL.md
echo "  - Building disc-output/SKILL.md"
cat "$PROJECT_ROOT/skills/disc-output/headers/claude-code.yaml" \
    "$PROJECT_ROOT/skills/disc-output/SKILL.md" \
    > "$BUILD_DIR/disc-output/SKILL.md"

# Copy references
if [ -d "$PROJECT_ROOT/skills/disc-output/references" ]; then
    cp -r "$PROJECT_ROOT/skills/disc-output/references" "$BUILD_DIR/disc-output/"
fi

echo "✓ Claude Code build complete: $BUILD_DIR"
