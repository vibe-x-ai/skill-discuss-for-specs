#!/bin/bash
#
# Install discuss-for-specs skill for Codex CLI (L1 platform)
#
# Codex CLI Skills Directory Structure:
#   Project: .codex/skills/     (highest priority)
#   User:    ~/.codex/skills/
#   System:  /etc/codex/skills/ (Unix only)
#
# This script installs to the user directory by default.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"

# Default to user installation
INSTALL_DIR="${CODEX_SKILLS_DIR:-$HOME/.codex/skills}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --project)
            INSTALL_DIR=".codex/skills"
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
            echo "  --project    Install to project directory (.codex/skills/)"
            echo "  --dir <dir>  Install to custom directory"
            echo ""
            echo "Default: Install to ~/.codex/skills/"
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
echo "To use: Say \"讨论一下\" or \"let's discuss\" in Codex CLI"
