"""Logging bootstrap.

Single Responsibility: build the console (and optional file) logging
handlers for the process. Logs are printed to stdout/stderr so the hosting
platform (e.g. Render) collects them.
"""

import logging
import sys

from .config import Settings

LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%dT%H:%M:%S"


class LoggingConfigurator:
    def __init__(self, settings: Settings):
        self._settings = settings
        self._root = logging.getLogger()
        self._formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)

    def configure(self) -> None:
        level = self._settings.log_level.upper()

        self._root.setLevel(level)
        self._root.handlers.clear()

        console = logging.StreamHandler(sys.stdout)
        console.setFormatter(self._formatter)
        self._root.addHandler(console)

        if self._settings.log_file:
            file_handler = logging.FileHandler(self._settings.log_file)
            file_handler.setFormatter(self._formatter)
            self._root.addHandler(file_handler)

        self._root.info(
            "Logging initialized (level=%s, file=%s)",
            level,
            self._settings.log_file or "stdout",
        )
