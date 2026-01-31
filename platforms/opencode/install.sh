#!/bin/bash
#
# Install discuss-for-specs skill for OpenCode (L1 platform)
#
# OpenCode Skills Directory Structure:
#   Global:  ~/.opencode/skill/ or ~/.opencode/skills/
#   Project: .opencode/skill/ or .opencode/skills/
#
# This script installs to the global directory by default.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"

# Default to global installation (use 'skill' singular as primary)
INSTALL_DIR="${OPENCODE_SKILLS_DIR:-$HOME/.opencode/skill}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --project)
            INSTALL_DIR=".opencode/skill"
            shift
            ;;
        --dir)
            INSTALL_DIR="$2"
            shift 2
            ;;
        *)
            echo "Usage: $0 [--project] [--dir <directory>]"
            echo ""
            echo "Options:"
            echo "  --project    Install to project directory (.opencode/skill/)"
            echo "  --dir <dir>  Install to custom directory"
            echo ""
            echo "Default: Install to ~/.opencode/skill/"
            exit 1
            ;;
    esac
done

# Check if build exists
if [ ! -d "$BUILD_DIR/discuss-for-specs" ]; then
    echo "Error: Build not found. Run build.sh first."
    exit 1
fi

# Create install directory
mkdir -p "$INSTALL_DIR"

# Copy skill
echo "Installing discuss-for-specs to $INSTALL_DIR..."
cp -r "$BUILD_DIR/discuss-for-specs" "$INSTALL_DIR/"

echo "✓ Installation complete!"
echo ""
echo "Installed to: $INSTALL_DIR/discuss-for-specs/"
echo ""
echo "To use: Say \"讨论一下\" or \"let's discuss\" in OpenCode"
