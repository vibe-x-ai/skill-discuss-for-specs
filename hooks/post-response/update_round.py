"""
Update round counter in meta.yaml.

This Hook increments the round counter after each discussion turn.
"""

import sys
from pathlib import Path
import yaml


def update_round(discuss_path):
    """
    Increment the round counter in meta.yaml.
    
    Args:
        discuss_path: Path to discussion directory
    """
    meta_path = Path(discuss_path) / "meta.yaml"
    
    if not meta_path.exists():
        print(f"Warning: meta.yaml not found at {meta_path}")
        return
    
    # Read current meta
    with open(meta_path) as f:
        meta = yaml.safe_load(f)
    
    # Increment round
    current_round = meta.get('current_round', 0)
    meta['current_round'] = current_round + 1
    
    # Write back
    with open(meta_path, 'w') as f:
        yaml.safe_dump(meta, f, sort_keys=False, allow_unicode=True)
    
    print(f"✓ Round updated: {current_round} → {meta['current_round']}")


def main():
    """Main entry point for the Hook."""
    if len(sys.argv) < 2:
        print("Usage: update_round.py <discuss_path>")
        sys.exit(1)
    
    discuss_path = sys.argv[1]
    update_round(discuss_path)


if __name__ == '__main__':
    main()
