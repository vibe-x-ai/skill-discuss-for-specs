"""
Common utilities for meta.yaml parsing and manipulation.
"""

from pathlib import Path
from typing import Dict, Any, Optional
import yaml


def load_meta(discuss_path: str) -> Optional[Dict[str, Any]]:
    """
    Load meta.yaml from discussion directory.
    
    Args:
        discuss_path: Path to discussion directory
        
    Returns:
        Dictionary containing meta data, or None if file doesn't exist
    """
    meta_path = Path(discuss_path) / "meta.yaml"
    
    if not meta_path.exists():
        return None
    
    with open(meta_path) as f:
        return yaml.safe_load(f)


def save_meta(discuss_path: str, meta: Dict[str, Any]) -> None:
    """
    Save meta.yaml to discussion directory.
    
    Args:
        discuss_path: Path to discussion directory
        meta: Dictionary containing meta data
    """
    meta_path = Path(discuss_path) / "meta.yaml"
    
    with open(meta_path, 'w') as f:
        yaml.safe_dump(meta, f, sort_keys=False, allow_unicode=True)


def get_unprecipitated_decisions(meta: Dict[str, Any]) -> list:
    """
    Get list of decisions without doc_path.
    
    Args:
        meta: Meta dictionary
        
    Returns:
        List of decision dictionaries that have doc_path == null
    """
    decisions = meta.get('decisions', [])
    return [d for d in decisions if d.get('doc_path') is None]


def get_current_round(meta: Dict[str, Any]) -> int:
    """
    Get current round number from meta.
    
    Args:
        meta: Meta dictionary
        
    Returns:
        Current round number (default 0)
    """
    return meta.get('current_round', 0)
