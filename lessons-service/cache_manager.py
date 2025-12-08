"""Redis cache manager for lesson repositories and READMEs."""

import os
import json
import logging
import redis
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class CacheManager:
    """Manages Redis caching for lesson repositories and READMEs."""

    def __init__(self, redis_url: str = None):
        redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.repos_key = "lessons:repos"
        self.readme_prefix = "lessons:readme:"
        # Use a 30-minute TTL to ride out short upstream outages
        self.ttl = 30 * 60

    def cache_repos(self, repos: List[Dict[str, Any]]) -> bool:
        """Cache the list of lesson repositories."""
        try:
            data = json.dumps(repos)
            self.redis_client.setex(self.repos_key, self.ttl, data)
            logger.info(f"Cached {len(repos)} lesson repos with TTL {self.ttl}s")
            return True
        except Exception as e:
            logger.error(f"Error caching repos: {e}")
            return False

    def get_repos(self) -> Optional[List[Dict[str, Any]]]:
        """Retrieve cached lesson repositories."""
        try:
            data = self.redis_client.get(self.repos_key)
            if data:
                repos = json.loads(data)
                logger.debug(f"Retrieved {len(repos)} repos from cache")
                return repos
            return None
        except Exception as e:
            logger.error(f"Error retrieving repos from cache: {e}")
            return None

    def cache_readme(self, repo_name: str, content: str) -> bool:
        """Cache README content for a repository."""
        try:
            key = f"{self.readme_prefix}{repo_name}"
            self.redis_client.setex(key, self.ttl, content)
            logger.debug(f"Cached README for {repo_name}")
            return True
        except Exception as e:
            logger.error(f"Error caching README for {repo_name}: {e}")
            return False

    def get_readme(self, repo_name: str) -> Optional[str]:
        """Retrieve cached README content for a repository."""
        try:
            key = f"{self.readme_prefix}{repo_name}"
            content = self.redis_client.get(key)
            if content:
                logger.debug(f"Retrieved README for {repo_name} from cache")
                return content
            return None
        except Exception as e:
            logger.error(f"Error retrieving README for {repo_name} from cache: {e}")
            return None

    def health_check(self) -> bool:
        """Check if Redis connection is healthy."""
        try:
            return self.redis_client.ping()
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return False
