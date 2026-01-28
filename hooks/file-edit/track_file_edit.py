#!/usr/bin/env python3
"""
Hook 1: File Edit Tracking

This hook is triggered after each file edit and tracks which discussion
files have been modified during the current AI conversation session.

Behavior:
- When outline is edited: Check session file, increment round if first update
- When decision/note is edited: Update corresponding entry in meta.yaml
- Uses session-based round counting for accurate "per-conversation" tracking

Trigger:
- Claude Code: PostToolUse with matcher "Edit|Write|MultiEdit"
- Cursor: afterFileEdit

Input (stdin JSON):
- Cursor: {"file_path": "/path/to/file.md", ...}
- Claude Code: {"tool_input": {"file_path": "/path/to/file.md", ...}, ...}

Output (stdout JSON):
- Always outputs {} to allow the operation to continue

Side Effect:
- Updates meta.yaml with file tracking info
- Manages session files for round counting
"""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Add parent directory to path for common imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from common.file_utils import find_discuss_root
from common.logging_utils import (
    log_action,
    log_debug,
    log_discuss_detection,
    log_error,
    log_file_operation,
    log_hook_end,
    log_hook_start,
    log_info,
    log_meta_update,
    log_skip,
)
from common.meta_parser import (
    create_initial_meta,
    ensure_meta_structure,
    load_meta,
    save_meta,
)
from common.platform_utils import (
    Platform,
    allow_and_exit,
    detect_platform,
    get_file_path_from_input,
    read_stdin_json,
)
from common.session_manager import (
    get_session_id,
    mark_outline_updated,
)


HOOK_NAME = "track_file_edit"


def determine_file_type(file_path: Path, discuss_root: Path) -> Optional[str]:
    """
    Determine which file type category a file belongs to.
    
    Args:
        file_path: Absolute path to the edited file
        discuss_root: Path to the discussion root directory
        
    Returns:
        One of "outline", "decisions", "notes", or None if not a tracked type
    """
    try:
        relative_path = file_path.relative_to(discuss_root)
    except ValueError:
        return None
    
    parts = relative_path.parts
    
    if not parts:
        return None
    
    # Check for outline.md
    if relative_path.name == "outline.md":
        return "outline"
    
    # Check for decisions/ directory
    if parts[0] == "decisions":
        return "decisions"
    
    # Check for notes/ directory
    if parts[0] == "notes":
        return "notes"
    
    return None


def update_file_entry(
    meta: dict, 
    file_type: str, 
    file_path: Path, 
    discuss_root: Path,
    current_round: int
) -> dict:
    """
    Update or create a file entry in meta.yaml.
    
    For decisions and notes, we track individual files.
    
    Args:
        meta: Meta dictionary
        file_type: "decisions" or "notes"
        file_path: Path to the file
        discuss_root: Discussion root directory
        current_round: Current round number
        
    Returns:
        Updated meta dictionary
    """
    try:
        relative_path = str(file_path.relative_to(discuss_root))
    except ValueError:
        relative_path = file_path.name
    
    # Ensure the array exists
    if file_type not in meta:
        meta[file_type] = []
    
    # Find existing entry or create new
    found = False
    for entry in meta[file_type]:
        if entry.get("path") == relative_path or entry.get("name") == file_path.name:
            entry["path"] = relative_path
            entry["name"] = file_path.name
            entry["last_modified"] = datetime.now(timezone.utc).isoformat()
            entry["last_updated_round"] = current_round
            found = True
            break
    
    if not found:
        meta[file_type].append({
            "path": relative_path,
            "name": file_path.name,
            "last_modified": datetime.now(timezone.utc).isoformat(),
            "last_updated_round": current_round,
        })
    
    return meta


def main():
    """Main entry point for the file edit tracking hook."""
    input_data = None
    
    try:
        # Read input from stdin
        input_data = read_stdin_json()
        log_hook_start(HOOK_NAME, input_data)
        
        if input_data is None:
            log_debug("No input data received, allowing operation")
            log_hook_end(HOOK_NAME, {}, success=True)
            allow_and_exit()
        
        # Extract file path
        file_path_str = get_file_path_from_input(input_data)
        
        if not file_path_str:
            log_debug("No file path found in input, allowing operation")
            log_hook_end(HOOK_NAME, {}, success=True)
            allow_and_exit()
        
        log_file_operation("EDIT", file_path_str, "File edit detected")
        
        file_path = Path(file_path_str).resolve()
        
        # Find discussion root directory
        discuss_root = find_discuss_root(str(file_path))
        
        if discuss_root is None:
            log_skip(f"Not a discussion file")
            log_hook_end(HOOK_NAME, {}, success=True)
            allow_and_exit()
        
        # Determine file type
        file_type = determine_file_type(file_path, discuss_root)
        
        if file_type is None:
            log_skip(f"Not a tracked file type")
            log_hook_end(HOOK_NAME, {}, success=True)
            allow_and_exit()
        
        log_discuss_detection(str(discuss_root), file_type)
        
        # Detect platform for session management
        platform = detect_platform(input_data)
        session_id = get_session_id(input_data, platform.value)
        
        log_debug(f"Platform: {platform.value}, Session: {session_id}")
        
        # Load or create meta.yaml
        meta = load_meta(str(discuss_root))
        
        if meta is None:
            log_debug("No meta.yaml found, creating initial meta")
            meta = create_initial_meta()
            # Set topic from directory name
            meta["topic"] = discuss_root.name
        else:
            meta = ensure_meta_structure(meta)
        
        current_round = meta.get("current_round", 0)
        
        # Handle based on file type
        if file_type == "outline":
            # Check if this is the first outline update in this session
            is_first_update = mark_outline_updated(
                platform.value, 
                session_id, 
                str(file_path)
            )
            
            if is_first_update:
                # Increment round counter
                old_round = current_round
                current_round += 1
                meta["current_round"] = current_round
                log_action(f"Round: {old_round} -> {current_round} (first update in session)")
            else:
                log_skip("Additional outline update in same session")
        
        elif file_type in ["decisions", "notes"]:
            # Update file entry with last_updated_round
            meta = update_file_entry(meta, file_type, file_path, discuss_root, current_round)
            log_action(f"Updated {file_type}: {file_path.name} (round {current_round})")
        
        # Save updated meta
        save_meta(str(discuss_root), meta)
        log_meta_update(str(discuss_root), {
            "file_type": file_type,
            "current_round": current_round,
        })
        
        log_hook_end(HOOK_NAME, {}, success=True)
        allow_and_exit()
        
    except Exception as e:
        log_error(f"Unexpected error in {HOOK_NAME}", e)
        log_hook_end(HOOK_NAME, {}, success=False)
        # Still allow operation to continue even on error
        allow_and_exit()


if __name__ == "__main__":
    main()
