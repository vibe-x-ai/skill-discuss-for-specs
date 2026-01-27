"""
Logging utilities for discuss-for-specs hooks.

All data is stored under ~/.discuss-for-specs/
- ~/.discuss-for-specs/hooks/  - Hook scripts
- ~/.discuss-for-specs/logs/   - Log files
"""

import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Optional


# Directory paths
def get_base_dir() -> Path:
    """Get base directory path for discuss-for-specs."""
    return Path.home() / ".discuss-for-specs"


def get_config_dir() -> Path:
    """Get configuration directory path (alias for get_base_dir)."""
    return get_base_dir()


def get_data_dir() -> Path:
    """Get data directory path (alias for get_base_dir)."""
    return get_base_dir()


def get_log_dir() -> Path:
    """Get log directory path."""
    return get_data_dir() / "logs"


def ensure_directories() -> None:
    """Ensure all required directories exist."""
    get_config_dir().mkdir(parents=True, exist_ok=True)
    get_log_dir().mkdir(parents=True, exist_ok=True)


# Logger configuration
_logger: Optional[logging.Logger] = None


def get_logger(name: str = "discuss-hooks") -> logging.Logger:
    """
    Get or create a logger instance.
    
    Args:
        name: Logger name (used as log file prefix)
        
    Returns:
        Configured logger instance
    """
    global _logger
    
    if _logger is not None:
        return _logger
    
    # Ensure directories exist
    ensure_directories()
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    # Avoid adding handlers multiple times
    if logger.handlers:
        _logger = logger
        return logger
    
    # Create log file path with date
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = get_log_dir() / f"{name}-{today}.log"
    
    # File handler - detailed logging
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_format = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    file_handler.setFormatter(file_format)
    logger.addHandler(file_handler)
    
    # Don't add stream handler - hooks should not output to stderr
    # as it may interfere with the hook protocol
    
    _logger = logger
    return logger


def log_hook_start(hook_name: str, input_data: dict = None) -> None:
    """
    Log hook start with input data.
    
    Args:
        hook_name: Name of the hook (e.g., "track_file_edit", "check_precipitation")
        input_data: Input JSON data received from stdin
    """
    logger = get_logger()
    logger.info(f"{'='*60}")
    logger.info(f"Hook Started: {hook_name}")
    logger.info(f"Working Directory: {os.getcwd()}")
    
    if input_data:
        # Log input data, truncate if too long
        import json
        input_str = json.dumps(input_data, ensure_ascii=False)
        if len(input_str) > 500:
            input_str = input_str[:500] + "...(truncated)"
        logger.debug(f"Input Data: {input_str}")


def log_hook_end(hook_name: str, output_data: dict = None, success: bool = True) -> None:
    """
    Log hook end with output data.
    
    Args:
        hook_name: Name of the hook
        output_data: Output JSON data to be written to stdout
        success: Whether the hook completed successfully
    """
    logger = get_logger()
    
    status = "SUCCESS" if success else "FAILED"
    logger.info(f"Hook Ended: {hook_name} [{status}]")
    
    if output_data:
        import json
        output_str = json.dumps(output_data, ensure_ascii=False)
        if len(output_str) > 500:
            output_str = output_str[:500] + "...(truncated)"
        logger.debug(f"Output Data: {output_str}")
    
    logger.info(f"{'='*60}\n")


def log_file_operation(operation: str, file_path: str, details: str = None) -> None:
    """
    Log file operation.
    
    Args:
        operation: Type of operation (e.g., "READ", "WRITE", "DETECT")
        file_path: Path to the file
        details: Additional details
    """
    logger = get_logger()
    msg = f"[{operation}] {file_path}"
    if details:
        msg += f" - {details}"
    logger.debug(msg)


def log_discuss_detection(discuss_path: str, file_type: str = None) -> None:
    """
    Log discussion directory detection.
    
    Args:
        discuss_path: Path to the discussion directory
        file_type: Type of file detected (outline/decisions/notes)
    """
    logger = get_logger()
    if file_type:
        logger.info(f"Discussion detected: {discuss_path} (file_type: {file_type})")
    else:
        logger.info(f"Discussion detected: {discuss_path}")


def log_meta_update(discuss_path: str, changes: dict) -> None:
    """
    Log meta.yaml update.
    
    Args:
        discuss_path: Path to the discussion directory
        changes: Dictionary of changes made
    """
    logger = get_logger()
    logger.info(f"Meta updated: {discuss_path}")
    for key, value in changes.items():
        logger.debug(f"  {key}: {value}")


def log_stale_detection(discuss_path: str, stale_items: list) -> None:
    """
    Log stale file detection.
    
    Args:
        discuss_path: Path to the discussion directory
        stale_items: List of stale items detected
    """
    logger = get_logger()
    if stale_items:
        logger.warning(f"Stale items found in {discuss_path}:")
        for item in stale_items:
            file_type, stale_runs, is_force = item
            level = "FORCE" if is_force else "SUGGEST"
            logger.warning(f"  [{level}] {file_type}: {stale_runs} runs stale")
    else:
        logger.debug(f"No stale items in {discuss_path}")


def log_error(message: str, exc: Exception = None) -> None:
    """
    Log error message.
    
    Args:
        message: Error message
        exc: Exception object if available
    """
    logger = get_logger()
    if exc:
        logger.error(f"{message}: {type(exc).__name__}: {exc}")
    else:
        logger.error(message)


def log_warning(message: str) -> None:
    """Log warning message."""
    get_logger().warning(message)


def log_info(message: str) -> None:
    """Log info message."""
    get_logger().info(message)


def log_debug(message: str) -> None:
    """Log debug message."""
    get_logger().debug(message)
