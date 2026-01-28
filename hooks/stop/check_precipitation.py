#!/usr/bin/env python3
"""
Hook 2: Precipitation Check

This hook is triggered when AI conversation ends and checks if discussion
files need to be updated (precipitated).

Behavior:
- Only checks if outline was updated in current session (discussion mode detection)
- Uses round-based staleness (current_round - last_updated_round > threshold)
- Cleans up session file after processing

Trigger:
- Claude Code: Stop hook
- Cursor: stop hook

Input (stdin JSON):
- Cursor: {"status": "completed", ...}
- Claude Code: {"hook_event_name": "Stop", "stop_hook_active": false, ...}

Output (stdout JSON):
- Allow: {}
- Block (Cursor): {"followup_message": "..."}
- Block (Claude Code): {"decision": "block", "reason": "..."}

Workflow:
1. Check if stop_hook_active is true (prevent infinite loop)
2. Check if outline was updated in this session (discussion mode detection)
3. If not in discussion mode, skip all checks
4. For discussions with outline updates, check staleness of decisions/notes
5. Emit reminder if staleness threshold exceeded
6. Clean up session file
"""

import os
import sys
from pathlib import Path
from typing import List, Tuple

# Add parent directory to path for common imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from common.logging_utils import (
    log_action,
    log_debug,
    log_error,
    log_hook_end,
    log_hook_start,
    log_info,
    log_skip,
    log_stale_detection,
    log_warning,
)
from common.meta_parser import (
    load_meta,
)
from common.platform_utils import (
    Platform,
    allow_and_exit,
    block_and_exit,
    detect_platform,
    is_stop_hook_active,
    read_stdin_json,
)
from common.session_manager import (
    delete_session,
    get_session_id,
    get_updated_outline_paths,
    is_in_discussion_mode,
)


HOOK_NAME = "check_precipitation"

# Default staleness threshold (rounds without update before reminding)
DEFAULT_STALE_THRESHOLD = 3


def get_workspace_root() -> Path:
    """
    Get the workspace root directory.
    
    Uses environment variables or current working directory.
    
    Returns:
        Path to workspace root
    """
    # Try common environment variables
    for env_var in ["WORKSPACE_ROOT", "PROJECT_ROOT", "PWD"]:
        if env_var in os.environ:
            return Path(os.environ[env_var])
    
    # Fallback to current working directory
    return Path.cwd()


def find_discuss_root_from_outline(outline_path: str) -> Path:
    """
    Find discussion root from an outline path.
    
    Args:
        outline_path: Path to outline.md file
        
    Returns:
        Path to discussion root directory
    """
    return Path(outline_path).parent


def check_staleness(meta: dict, discuss_path: str) -> List[Tuple[str, str, int]]:
    """
    Check for stale files based on round difference.
    
    Args:
        meta: Meta dictionary
        discuss_path: Path to discussion directory
        
    Returns:
        List of (file_type, file_name, stale_rounds) tuples for stale items
    """
    current_round = meta.get("current_round", 0)
    config = meta.get("config", {})
    threshold = config.get("stale_threshold", DEFAULT_STALE_THRESHOLD)
    
    stale_items = []
    
    # Check decisions array (new schema)
    for decision in meta.get("decisions", []):
        last_updated = decision.get("last_updated_round", 0)
        stale_rounds = current_round - last_updated
        if stale_rounds >= threshold:
            stale_items.append(("decisions", decision.get("name", "unknown"), stale_rounds))
    
    # Check notes array (new schema)
    for note in meta.get("notes", []):
        last_updated = note.get("last_updated_round", 0)
        stale_rounds = current_round - last_updated
        if stale_rounds >= threshold:
            stale_items.append(("notes", note.get("name", "unknown"), stale_rounds))
    
    # Backward compatibility: check file_status (old schema)
    file_status = meta.get("file_status", {})
    
    # Check if we have the old schema and no entries found yet
    if not stale_items:
        for file_type in ["decisions", "notes"]:
            status = file_status.get(file_type, {})
            last_modified_run = status.get("last_modified_run", 0)
            stale_runs = current_round - last_modified_run
            
            # Only report if there was supposed to be content
            # (decisions should always exist in a proper discussion)
            if file_type == "decisions" and stale_runs >= threshold:
                stale_items.append((file_type, "directory", stale_runs))
    
    return stale_items


def format_stale_reminder(
    stale_items: List[Tuple[str, str, int]], 
    discuss_path: str,
    is_force: bool = False
) -> str:
    """
    Format a reminder message for stale items.
    
    Args:
        stale_items: List of (file_type, file_name, stale_rounds) tuples
        discuss_path: Path to discussion directory
        is_force: Whether this is a force update (exceeded force threshold)
        
    Returns:
        Formatted reminder message
    """
    if not stale_items:
        return ""
    
    if is_force:
        header = "## ⚠️ Precipitation Required\n\n"
        header += "The following discussion files have not been updated for too long:\n\n"
    else:
        header = "## 💡 Precipitation Suggestion\n\n"
        header += "The following discussion files may need updating:\n\n"
    
    items_text = ""
    for file_type, file_name, stale_rounds in stale_items:
        status = "[REQUIRED]" if is_force else "[Suggested]"
        items_text += f"- {status} `{file_type}/{file_name}` - {stale_rounds} rounds since last update\n"
    
    footer = f"\n📁 Discussion: `{discuss_path}`\n"
    
    if is_force:
        footer += "\n**Please update the discussion files before continuing.**\n"
        footer += "This ensures important decisions are properly documented.\n"
    else:
        footer += "\nWould you like me to help update these files?\n"
        footer += "This helps maintain a complete record of our discussion.\n"
    
    return header + items_text + footer


def main():
    """Main entry point for the precipitation check hook."""
    input_data = None
    platform = Platform.UNKNOWN
    session_id = None
    
    try:
        # Read input from stdin
        input_data = read_stdin_json()
        log_hook_start(HOOK_NAME, input_data)
        
        # Detect platform
        platform = detect_platform(input_data) if input_data else Platform.UNKNOWN
        log_info(f"Detected platform: {platform.value}")
        
        # Get session ID
        session_id = get_session_id(input_data, platform.value) if input_data else None
        log_debug(f"Session ID: {session_id}")
        
        # Check if this is a continuation after stop hook already triggered
        if input_data and is_stop_hook_active(input_data):
            log_skip("stop_hook_active is True, bypassing check")
            # Clean up session even when bypassing
            if session_id:
                delete_session(platform.value, session_id)
            log_hook_end(HOOK_NAME, {}, success=True)
            allow_and_exit()
        
        # NEW: Check if user is in discussion mode (outline was updated)
        if not session_id or not is_in_discussion_mode(platform.value, session_id):
            log_skip("Not in discussion mode (no outline updates)")
            # Clean up session if exists
            if session_id:
                delete_session(platform.value, session_id)
            log_hook_end(HOOK_NAME, {}, success=True)
            allow_and_exit()
        
        log_action("Discussion mode detected")
        
        # Get outline paths updated in this session
        outline_paths = get_updated_outline_paths(platform.value, session_id)
        log_debug(f"Updated outlines: {outline_paths}")
        
        if not outline_paths:
            log_skip("No outline paths recorded")
            if session_id:
                delete_session(platform.value, session_id)
            log_hook_end(HOOK_NAME, {}, success=True)
            allow_and_exit()
        
        # Check each discussion for staleness
        stale_reminders = []
        
        for outline_path in outline_paths:
            discuss_root = find_discuss_root_from_outline(outline_path)
            log_debug(f"Checking discussion: {discuss_root}")
            
            meta = load_meta(str(discuss_root))
            
            if meta is None:
                log_debug(f"No meta.yaml found in {discuss_root}, skipping")
                continue
            
            # Check for stale items
            stale_items = check_staleness(meta, str(discuss_root))
            log_stale_detection(str(discuss_root), [(t, r, False) for t, _, r in stale_items])
            
            if stale_items:
                # Check if any are force-level (exceed double threshold)
                config = meta.get("config", {})
                threshold = config.get("stale_threshold", DEFAULT_STALE_THRESHOLD)
                force_threshold = threshold * 2  # Force at 2x the suggest threshold
                
                is_force = any(rounds >= force_threshold for _, _, rounds in stale_items)
                
                reminder = format_stale_reminder(stale_items, str(discuss_root), is_force)
                stale_reminders.append((reminder, is_force))
        
        # Clean up session file
        if session_id:
            delete_session(platform.value, session_id)
            log_debug("Cleaned up session file")
        
        # Summary logging
        log_info(f"Stale reminders: {len(stale_reminders)}")
        
        # If there are stale reminders, check if any require forcing
        if stale_reminders:
            # Check if any reminder is force-level
            has_force = any(is_force for _, is_force in stale_reminders)
            
            combined_reminder = "\n\n---\n\n".join(reminder for reminder, _ in stale_reminders)
            
            if has_force:
                log_action(f"Blocking: {len(stale_reminders)} stale reminder(s) [FORCE]")
                log_hook_end(HOOK_NAME, {"action": "block", "force": True}, success=True)
                block_and_exit(combined_reminder, platform)
            else:
                # Suggest but don't block for non-force reminders
                log_action(f"Suggesting update: {len(stale_reminders)} stale item(s)")
                # For suggestions, we still allow but include the message
                # This depends on platform support - for now, we block with suggestion
                log_hook_end(HOOK_NAME, {"action": "suggest"}, success=True)
                block_and_exit(combined_reminder, platform)
        
        # No issues, allow and exit
        log_hook_end(HOOK_NAME, {}, success=True)
        allow_and_exit()
        
    except Exception as e:
        log_error(f"Unexpected error in {HOOK_NAME}", e)
        log_hook_end(HOOK_NAME, {}, success=False)
        # Clean up session even on error
        if session_id and platform:
            try:
                delete_session(platform.value, session_id)
            except Exception:
                pass
        # Still allow operation to continue even on error
        allow_and_exit()


if __name__ == "__main__":
    main()
