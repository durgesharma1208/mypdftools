"""Temporary file lifecycle management."""

import logging
import shutil
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from app.core.config import settings

logger = logging.getLogger(__name__)


@contextmanager
def temp_workspace(directory: Path | None = None) -> Iterator[Path]:
    """Yield a working directory that is always removed afterwards."""
    from app.utils.file_utils import request_workspace

    workspace = directory or request_workspace()
    workspace.mkdir(parents=True, exist_ok=True)
    try:
        yield workspace
    finally:
        try:
            shutil.rmtree(workspace, ignore_errors=True)
        except Exception:
            logger.debug("Could not remove workspace %s", workspace, exc_info=True)


def cleanup_old_files(older_than_seconds: int = 3600) -> int:
    """Remove stale files from temp/output directories."""
    removed = 0
    cutoff = time.time() - older_than_seconds
    for directory in (settings.temp_directory, settings.output_directory):
        if not directory.exists():
            continue
        for entry in directory.iterdir():
            try:
                if entry.is_file() and entry.stat().st_mtime < cutoff:
                    entry.unlink(missing_ok=True)
                    removed += 1
                elif entry.is_dir() and entry.stat().st_mtime < cutoff:
                    shutil.rmtree(entry, ignore_errors=True)
                    removed += 1
            except OSError:
                logger.debug("Skipping cleanup of %s", entry, exc_info=True)
    return removed