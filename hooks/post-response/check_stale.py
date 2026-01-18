"""
Check for stale (unprecipitated) decisions.

This Hook checks meta.yaml for decisions that have been confirmed
but not yet documented (doc_path is null) for more than the threshold rounds.
"""

import sys
from pathlib import Path
import yaml


def load_config(config_path=None):
    """Load configuration, with fallback to defaults."""
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return yaml.safe_load(f)
    
    # Default configuration
    return {
        'stale_detection': {
            'enabled': True,
            'max_stale_rounds': 3
        }
    }


def check_stale_decisions(discuss_path, config):
    """
    Check for stale decisions in a discussion directory.
    
    Returns:
        list: List of stale decisions with details
    """
    meta_path = Path(discuss_path) / "meta.yaml"
    
    if not meta_path.exists():
        return []
    
    with open(meta_path) as f:
        meta = yaml.safe_load(f)
    
    current_round = meta.get('current_round', 0)
    max_stale = config['stale_detection']['max_stale_rounds']
    
    stale = []
    
    for decision in meta.get('decisions', []):
        if decision.get('doc_path') is None:
            confirmed_at = decision.get('confirmed_at', 0)
            stale_rounds = current_round - confirmed_at
            
            if stale_rounds >= max_stale:
                stale.append({
                    'id': decision['id'],
                    'title': decision['title'],
                    'confirmed_at': confirmed_at,
                    'stale_rounds': stale_rounds
                })
    
    return stale


def format_reminder(stale_decisions, current_round):
    """Format a reminder message for stale decisions."""
    if not stale_decisions:
        return None
    
    msg = "⚠️ Precipitation Reminder\n\n"
    msg += "The following decisions have been confirmed but not yet documented:\n\n"
    
    for decision in stale_decisions:
        msg += f"□ {decision['id']}: {decision['title']} "
        msg += f"(confirmed at #R{decision['confirmed_at']}, "
        msg += f"now #R{current_round} - {decision['stale_rounds']} rounds ago)\n"
    
    msg += "\nRecommendation:\n"
    msg += "- If ready to document: Create decision documents now\n"
    msg += "- If needs more discussion: Reconsider status\n"
    msg += "- If postponing: Acknowledge and set expectation\n"
    
    return msg


def main():
    """Main entry point for the Hook."""
    if len(sys.argv) < 2:
        print("Usage: check_stale.py <discuss_path> [config_path]")
        sys.exit(1)
    
    discuss_path = sys.argv[1]
    config_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    config = load_config(config_path)
    
    if not config['stale_detection']['enabled']:
        sys.exit(0)
    
    stale = check_stale_decisions(discuss_path, config)
    
    if stale:
        meta_path = Path(discuss_path) / "meta.yaml"
        with open(meta_path) as f:
            meta = yaml.safe_load(f)
        
        reminder = format_reminder(stale, meta['current_round'])
        print(reminder)
        sys.exit(1)  # Exit with error to signal reminder needed
    
    sys.exit(0)


if __name__ == '__main__':
    main()
