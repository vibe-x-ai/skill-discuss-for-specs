"""
File system utilities for Hook scripts.
"""

from pathlib import Path
from typing import Optional


def ensure_directory(path: str) -> Path:
    """
    Ensure directory exists, create if necessary.
    
    Args:
        path: Directory path
        
    Returns:
        Path object
    """
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


def find_discuss_root(current_path: str) -> Optional[Path]:
    """
    Find discussion root directory by looking for meta.yaml.
    
    Args:
        current_path: Starting path to search from
        
    Returns:
        Path to discussion root, or None if not found
    """
    p = Path(current_path).resolve()
    
    # Search upward for meta.yaml
    for parent in [p] + list(p.parents):
        meta_file = parent / "meta.yaml"
        if meta_file.exists():
            return parent
    
    return None


def get_decision_path(discuss_root: Path, decision_id: str, title: str) -> Path:
    """
    Generate path for a decision document.
    
    Args:
        discuss_root: Discussion root directory
        decision_id: Decision ID (e.g., "D1")
        title: Decision title
        
    Returns:
        Path for the decision document
    """
    # Extract number from ID (D1 -> 01)
    num = decision_id[1:].zfill(2)
    
    # Slugify title
    slug = title.lower().replace(' ', '-')
    
    filename = f"{num}-{slug}.md"
    return discuss_root / "decisions" / filename
