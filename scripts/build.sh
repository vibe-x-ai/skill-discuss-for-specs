#!/bin/bash
#
# Build script for all platforms
#

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔨 Building skill-discuss-for-specs for all platforms..."

# Build for Claude Code
echo ""
echo "📦 Building for Claude Code..."
"$PROJECT_ROOT/platforms/claude-code/build.sh"

# TODO: Add more platforms
# echo ""
# echo "📦 Building for Cursor..."
# "$PROJECT_ROOT/platforms/cursor/build.sh"

echo ""
echo "✅ Build complete!"
