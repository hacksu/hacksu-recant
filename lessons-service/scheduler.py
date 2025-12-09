"""Scheduler for refreshing lesson repository cache."""

import os
import logging
import schedule
import time
import threading
from github_client import GitHubClient
from cache_manager import CacheManager

logger = logging.getLogger(__name__)


class LessonCacheScheduler:
    """Schedules periodic refresh of lesson repository cache."""

    def __init__(self):
        github_token = os.getenv("GITHUB_TOKEN")
        github_org = os.getenv("GITHUB_ORG", "hacksu")

        if not github_token:
            raise ValueError("GITHUB_TOKEN environment variable is required")

        self.github_client = GitHubClient(github_token, github_org)
        self.cache_manager = CacheManager()
        self.last_refresh_time = None
        self.refresh_interval = 10
        self._running = False
        self._thread = None

    def refresh_cache(self):
        """Fetch repos from GitHub and update cache."""
        try:
            logger.info("Starting cache refresh...")
            repos = self.github_client.fetch_lesson_repos()
            success = self.cache_manager.cache_repos(repos)
            if success:
                self.last_refresh_time = time.time()
                logger.info(
                    f"Cache refresh completed successfully. Cached {len(repos)} repos."
                )
            else:
                logger.error("Cache refresh failed: could not write to cache")
        except Exception as e:
            logger.error(f"Cache refresh failed: {e}", exc_info=True)
            # Serve stale: if existing cache is present, extend its TTL so we don't go empty
            stale = self.cache_manager.get_repos()
            if stale:
                self.cache_manager.cache_repos(stale)
                logger.warning(
                    "GitHub fetch failed; serving stale lesson cache and extended its TTL",
                    exc_info=False,
                )
            else:
                logger.warning("GitHub fetch failed and no stale cache is available")

    def start(self):
        """Start the scheduler in a background thread."""
        if self._running:
            logger.warn("Scheduler is already running")
            return

        # Run immediately on startup
        logger.info("Running initial cache refresh...")
        self.refresh_cache()

        # Schedule periodic refreshes
        schedule.every(self.refresh_interval).minutes.do(
            self.refresh_cache
        )  # I love this syntax
        logger.info(f"Scheduled cache refresh every {self.refresh_interval} minutes")

        self._running = True

        def run_scheduler():
            while self._running:
                schedule.run_pending()
                time.sleep(1)

        self._thread = threading.Thread(target=run_scheduler, daemon=True)
        self._thread.start()
        logger.info("Scheduler started")

    def stop(self):
        """Stop the scheduler."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=5)
        logger.info("Scheduler stopped")

    def get_status(self) -> dict:
        """Get scheduler status."""
        return {
            "running": self._running,
            "last_refresh_time": self.last_refresh_time,
            "refresh_interval_minutes": self.refresh_interval,
            "cache_healthy": self.cache_manager.health_check(),
        }
