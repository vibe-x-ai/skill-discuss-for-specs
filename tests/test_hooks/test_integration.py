"""
Integration tests for hook scripts.

These tests simulate the full hook workflow by invoking the scripts
with mock input and checking the output and side effects.
"""

import json
import os
import subprocess
import sys
import uuid
from pathlib import Path

import pytest
import yaml


# Paths to hook scripts
HOOKS_DIR = Path(__file__).parent.parent.parent / "hooks"
TRACK_FILE_EDIT = HOOKS_DIR / "file-edit" / "track_file_edit.py"
CHECK_PRECIPITATION = HOOKS_DIR / "stop" / "check_precipitation.py"

# Global sessions directory
SESSIONS_DIR = Path.home() / ".discuss-for-specs" / "sessions"


def cleanup_session(session_id: str) -> None:
    """Clean up session files for a given session ID."""
    if not SESSIONS_DIR.exists():
        return
    for platform_dir in SESSIONS_DIR.iterdir():
        if platform_dir.is_dir():
            session_file = platform_dir / f"{session_id}.json"
            if session_file.exists():
                session_file.unlink()


def generate_unique_session_id() -> str:
    """Generate a unique session ID for testing."""
    return f"test-{uuid.uuid4().hex[:12]}"


def run_hook(script_path: Path, input_data: dict, cwd: Path = None) -> tuple:
    """
    Run a hook script with given input.
    
    Returns:
        tuple: (return_code, stdout, stderr)
    """
    env = os.environ.copy()
    if cwd:
        # Override PWD to ensure hook uses the test directory
        env["PWD"] = str(cwd)
        env["WORKSPACE_ROOT"] = str(cwd)
    
    result = subprocess.run(
        [sys.executable, str(script_path)],
        input=json.dumps(input_data),
        capture_output=True,
        text=True,
        cwd=str(cwd) if cwd else None,
        env=env,
    )
    return result.returncode, result.stdout, result.stderr


class TestTrackFileEditHook:
    """Integration tests for track_file_edit.py."""
    
    def test_non_discuss_file(self, tmp_path):
        """Test with file not in discussion directory."""
        random_file = tmp_path / "random.md"
        random_file.write_text("# Random")
        
        input_data = {"file_path": str(random_file)}
        
        code, stdout, stderr = run_hook(TRACK_FILE_EDIT, input_data)
        
        assert code == 0
        assert stdout.strip() == "{}"
    
    def test_outline_file_update(self, tmp_path):
        """Test tracking outline.md update."""
        # Generate unique session ID to avoid pollution
        session_id = generate_unique_session_id()
        
        try:
            # Create .discuss structure (new naming)
            discuss_dir = tmp_path / ".discuss" / "2026-01-28" / "topic"
            discuss_dir.mkdir(parents=True)
            
            # Create initial meta.yaml with new schema
            meta = {
                "topic": "topic",
                "created": "2026-01-28",
                "current_round": 5,
                "config": {"stale_threshold": 3},
                "decisions": [],
                "notes": [],
            }
            (discuss_dir / "meta.yaml").write_text(yaml.dump(meta))
            
            # Create outline
            outline = discuss_dir / "outline.md"
            outline.write_text("# Outline")
            
            # Run hook with unique session_id
            input_data = {
                "file_path": str(outline),
                "session_id": session_id
            }
            code, stdout, stderr = run_hook(TRACK_FILE_EDIT, input_data, cwd=tmp_path)
            
            assert code == 0
            assert stdout.strip() == "{}"
            
            # Check meta.yaml was updated - current_round should be 6 now
            updated_meta = yaml.safe_load((discuss_dir / "meta.yaml").read_text())
            assert updated_meta["current_round"] == 6
        finally:
            # Clean up session to avoid pollution
            cleanup_session(session_id)
    
    def test_decision_file_update(self, tmp_path):
        """Test tracking decision file update."""
        # Generate unique session ID to avoid pollution
        session_id = generate_unique_session_id()
        
        try:
            # Create .discuss structure
            discuss_dir = tmp_path / ".discuss" / "2026-01-28" / "topic"
            decisions_dir = discuss_dir / "decisions"
            decisions_dir.mkdir(parents=True)
            
            # Create initial meta.yaml with new schema
            meta = {
                "topic": "topic",
                "created": "2026-01-28",
                "current_round": 5,
                "config": {"stale_threshold": 3},
                "decisions": [],
                "notes": [],
            }
            (discuss_dir / "meta.yaml").write_text(yaml.dump(meta))
            
            # Create decision file
            decision = decisions_dir / "D01-test.md"
            decision.write_text("# Decision")
            
            # Run hook with Claude Code format
            input_data = {
                "tool_name": "Edit",
                "tool_input": {
                    "file_path": str(decision),
                    "old_string": "a",
                    "new_string": "b"
                },
                "session_id": session_id
            }
            code, stdout, stderr = run_hook(TRACK_FILE_EDIT, input_data, cwd=tmp_path)
            
            assert code == 0
            
            # Check meta.yaml has the decision entry
            updated_meta = yaml.safe_load((discuss_dir / "meta.yaml").read_text())
            assert len(updated_meta["decisions"]) == 1
            assert updated_meta["decisions"][0]["name"] == "D01-test.md"
        finally:
            # Clean up session to avoid pollution
            cleanup_session(session_id)


class TestCheckPrecipitationHook:
    """Integration tests for check_precipitation.py."""
    
    def test_no_discuss_dirs(self, tmp_path):
        """Test with no discussion directories."""
        input_data = {"status": "completed"}
        
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        assert code == 0
        assert stdout.strip() == "{}"
    
    def test_stop_hook_active_bypass(self, tmp_path):
        """Test that stop_hook_active=True bypasses check."""
        # Create discussion with stale content
        discuss_dir = tmp_path / ".discuss" / "2026-01-28" / "topic"
        discuss_dir.mkdir(parents=True)
        
        meta = {
            "topic": "topic",
            "created": "2026-01-28",
            "current_round": 15,
            "config": {"stale_threshold": 3},
            "decisions": [
                {"name": "D01.md", "last_updated_round": 0}
            ],
            "notes": [],
        }
        (discuss_dir / "meta.yaml").write_text(yaml.dump(meta))
        
        # Run with stop_hook_active=True
        input_data = {
            "hook_event_name": "Stop",
            "stop_hook_active": True
        }
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        assert code == 0
        assert stdout.strip() == "{}"
    
    def test_no_action_without_session(self, tmp_path):
        """Test that hook does nothing if no session (not in discussion mode)."""
        discuss_dir = tmp_path / ".discuss" / "2026-01-28" / "topic"
        discuss_dir.mkdir(parents=True)
        
        meta = {
            "topic": "topic",
            "created": "2026-01-28",
            "current_round": 5,
            "config": {"stale_threshold": 3},
            "decisions": [
                {"name": "D01.md", "last_updated_round": 0}  # Stale
            ],
            "notes": [],
        }
        (discuss_dir / "meta.yaml").write_text(yaml.dump(meta))
        
        # No session means not in discussion mode
        input_data = {"status": "completed"}
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        # Should allow without blocking since no session = not in discussion mode
        assert code == 0
        assert stdout.strip() == "{}"
