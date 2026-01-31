#!/bin/bash
#
# Universal installer for discuss-for-specs skill
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/vibe-x-ai/skill-discuss-for-specs/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/vibe-x-ai/skill-discuss-for-specs/main/install.sh | bash -s -- --platform cursor
#
# Supported platforms:
#   L2 (with hooks):  claude-code, cursor
#   L1 (skills only): kilocode, opencode, codex
#

set -e

SKILL_NAME="discuss-for-specs"
REPO_URL="https://raw.githubusercontent.com/vibe-x-ai/skill-discuss-for-specs/main"

# Platform configurations
# Format: PLATFORM_NAME|CONFIG_DIR|SKILLS_DIR|ENV_VAR|LEVEL
PLATFORMS=(
    "claude-code|.claude|skills|CLAUDE_SKILLS_DIR|L2"
    "cursor|.cursor|skills|CURSOR_SKILLS_DIR|L2"
    "kilocode|.kilocode|skills|KILOCODE_SKILLS_DIR|L1"
    "opencode|.opencode|skill|OPENCODE_SKILLS_DIR|L1"
    "codex|.codex|skills|CODEX_SKILLS_DIR|L1"
)

# Parse platform config
get_platform_config() {
    local platform="$1"
    for entry in "${PLATFORMS[@]}"; do
        IFS='|' read -r name config_dir skills_dir env_var level <<< "$entry"
        if [[ "$name" == "$platform" ]]; then
            echo "$config_dir|$skills_dir|$env_var|$level"
            return 0
        fi
    done
    return 1
}

# List supported platforms
list_platforms() {
    echo "Supported platforms:"
    echo ""
    echo "  L2 (Skills + Hooks - auto-reminder):"
    for entry in "${PLATFORMS[@]}"; do
        IFS='|' read -r name config_dir skills_dir env_var level <<< "$entry"
        if [[ "$level" == "L2" ]]; then
            echo "    - $name"
        fi
    done
    echo ""
    echo "  L1 (Skills only - manual precipitation):"
    for entry in "${PLATFORMS[@]}"; do
        IFS='|' read -r name config_dir skills_dir env_var level <<< "$entry"
        if [[ "$level" == "L1" ]]; then
            echo "    - $name"
        fi
    done
}

# Auto-detect platform
detect_platform() {
    for entry in "${PLATFORMS[@]}"; do
        IFS='|' read -r name config_dir skills_dir env_var level <<< "$entry"
        if [[ -d "$HOME/$config_dir" ]]; then
            echo "$name"
            return 0
        fi
    done
    return 1
}

# Download function with error handling
download_file() {
    local url="$1"
    local dest="$2"
    local name="$3"
    
    echo "   - $name"
    if ! curl -fsSL "$url" -o "$dest" 2>/dev/null; then
        echo ""
        echo "❌ Failed to download: $name"
        echo "   URL: $url"
        echo ""
        echo "   Possible causes:"
        echo "   - No internet connection"
        echo "   - GitHub is unreachable"
        echo "   - File does not exist (check if the version is correct)"
        echo ""
        # Cleanup incomplete installation
        rm -rf "$SKILL_DIR"
        exit 1
    fi
}

# Default values
PLATFORM=""
PROJECT_MODE=false
CUSTOM_DIR=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        --project)
            PROJECT_MODE=true
            shift
            ;;
        --dir)
            CUSTOM_DIR="$2"
            shift 2
            ;;
        --list)
            list_platforms
            exit 0
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -p, --platform <name>  Specify platform (claude-code, cursor, kilocode, opencode, codex)"
            echo "  --project              Install to project directory instead of global"
            echo "  --dir <path>           Install to custom directory"
            echo "  --list                 List supported platforms"
            echo "  -h, --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  curl ... | bash                              # Auto-detect platform"
            echo "  curl ... | bash -s -- -p cursor              # Install for Cursor"
            echo "  curl ... | bash -s -- -p claude-code --project  # Project-level install"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Auto-detect platform if not specified
if [[ -z "$PLATFORM" ]]; then
    if PLATFORM=$(detect_platform); then
        echo "🔍 Auto-detected platform: $PLATFORM"
    else
        echo "❌ No supported platform detected"
        echo ""
        list_platforms
        echo ""
        echo "Use --platform to specify manually:"
        echo "  curl ... | bash -s -- --platform <name>"
        exit 1
    fi
fi

# Get platform configuration
if ! CONFIG=$(get_platform_config "$PLATFORM"); then
    echo "❌ Unknown platform: $PLATFORM"
    echo ""
    list_platforms
    exit 1
fi

IFS='|' read -r CONFIG_DIR SKILLS_DIR ENV_VAR LEVEL <<< "$CONFIG"

# Determine install directory
if [[ -n "$CUSTOM_DIR" ]]; then
    INSTALL_DIR="$CUSTOM_DIR"
elif [[ "$PROJECT_MODE" == true ]]; then
    INSTALL_DIR=".$CONFIG_DIR/$SKILLS_DIR"
else
    # Check environment variable, fallback to default
    INSTALL_DIR="${!ENV_VAR:-$HOME/$CONFIG_DIR/$SKILLS_DIR}"
fi

SKILL_DIR="$INSTALL_DIR/$SKILL_NAME"
DIST_URL="$REPO_URL/npm-package/dist/$PLATFORM/$SKILL_NAME"

# Display installation info
echo ""
echo "🚀 Installing $SKILL_NAME for $PLATFORM..."
echo ""
echo "   Platform: $PLATFORM ($LEVEL)"
echo "   Target:   $SKILL_DIR/"
echo ""

# Create install directory
mkdir -p "$SKILL_DIR/references"

# Download skill files
echo "📥 Downloading skill files..."
download_file "$DIST_URL/SKILL.md" "$SKILL_DIR/SKILL.md" "SKILL.md"
download_file "$DIST_URL/references/decision-template.md" "$SKILL_DIR/references/decision-template.md" "decision-template.md"
download_file "$DIST_URL/references/outline-template.md" "$SKILL_DIR/references/outline-template.md" "outline-template.md"

echo ""
echo "✅ Installation complete!"
echo ""
echo "📍 Installed to: $SKILL_DIR/"
echo ""
echo "📚 Usage:"
echo "   Say \"讨论一下\" or \"let's discuss\" in $PLATFORM"
echo ""

# Platform-specific notes
if [[ "$LEVEL" == "L2" ]]; then
    echo "💡 For hooks support (auto-reminder), use npm package instead:"
    echo "   npx @vibe-x/discuss-for-specs install --platform $PLATFORM"
else
    echo "⚠️  Note: $PLATFORM is L1 platform (no hooks support)"
    echo "   Remember to manually check discussion progress"
fi
