#!/bin/bash
#
# Install skill-discuss-for-specs for Claude Code
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CLAUDE_SKILLS_DIR="$HOME/.claude/skills"

echo "🚀 Installing skill-discuss-for-specs for Claude Code..."

# Build first
echo ""
echo "📦 Building..."
"$SCRIPT_DIR/build.sh"

# Create target directory
mkdir -p "$CLAUDE_SKILLS_DIR"

# Install Skills
echo ""
echo "📝 Installing Skills..."
cp -r "$SCRIPT_DIR/build/discuss-coordinator" "$CLAUDE_SKILLS_DIR/"
cp -r "$SCRIPT_DIR/build/discuss-output" "$CLAUDE_SKILLS_DIR/"
echo "  ✓ Skills installed to $CLAUDE_SKILLS_DIR"

# TODO: Install Hooks (depends on Claude Code Hook support)
# echo ""
# echo "⚡ Installing Hooks..."
# This will be implemented when Hook mechanism is finalized

# Initialize config
echo ""
echo "⚙️ Initializing configuration..."
CONFIG_FILE="$CLAUDE_SKILLS_DIR/discuss-config.yaml"

if [ -f "$CONFIG_FILE" ]; then
    echo "  ℹ️  Configuration already exists: $CONFIG_FILE"
else
    cp "$PROJECT_ROOT/config/default.yaml" "$CONFIG_FILE"
    echo "  ✓ Default configuration created: $CONFIG_FILE"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Review configuration: $CONFIG_FILE"
echo "  2. Start a discussion with Claude Code"
echo "  3. See README.md for usage guide"
