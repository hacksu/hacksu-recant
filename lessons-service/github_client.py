"""GitHub API client using GraphQL for efficient batch fetching."""

import logging
from typing import List, Dict, Any, Optional
import requests
import time

logger = logging.getLogger(__name__)


class GitHubClient:
    """Client for fetching lesson repositories from GitHub using GraphQL API."""

    def __init__(self, token: str, org: str = "hacksu"):
        self.token = token
        self.org = org
        self.base_url = "https://api.github.com/graphql"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    def _make_request(
        self, query: str, variables: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make a GraphQL request to GitHub API."""
        payload = {"query": query}
        if variables:
            payload["variables"] = variables

        try:
            response = requests.post(
                self.base_url,
                json=payload,
                headers=self.headers,
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()

            if "errors" in data:
                error_messages = [
                    err.get("message", "Unknown error") for err in data["errors"]
                ]
                logger.error(f"GraphQL errors: {error_messages}")
                raise Exception(f"GraphQL errors: {', '.join(error_messages)}")

            return data.get("data", {})
        except requests.exceptions.RequestException as e:
            logger.error(f"GitHub API request failed: {e}")
            raise

    def fetch_lesson_repos(self) -> List[Dict[str, Any]]:
        """
        Fetch all repositories with the 'lesson' topic from the organization.
        Uses GraphQL to efficiently batch fetch repos and topics in a single query.
        """
        logger.info(f"Fetching lesson repos from GitHub organization: {self.org}")

        all_repos = []
        cursor = None
        has_next_page = True

        while has_next_page:
            query = """
            query($org: String!, $cursor: String) {
              organization(login: $org) {
                repositories(
                  first: 100
                  after: $cursor
                  orderBy: {field: UPDATED_AT, direction: DESC}
                ) {
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                  nodes {
                    id
                    name
                    description
                    url
                    updatedAt
                    defaultBranchRef {
                      target {
                        ... on Commit {
                          committedDate
                        }
                      }
                    }
                    primaryLanguage {
                      name
                    }
                    repositoryTopics(first: 20) {
                      nodes {
                        topic {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
            """

            variables = {"org": self.org}
            if cursor:
                variables["cursor"] = cursor

            try:
                data = self._make_request(query, variables)
                org_data = data.get("organization", {})
                repos_data = org_data.get("repositories", {})
                page_info = repos_data.get("pageInfo", {})
                nodes = repos_data.get("nodes", [])

                # Filter repos that have the "lesson" topic
                for repo in nodes:
                    topics_data = repo.get("repositoryTopics", {}).get("nodes", [])
                    topics = [
                        node["topic"]["name"]
                        for node in topics_data
                        if node.get("topic")
                    ]

                    if "lesson" in topics:
                        category_topics = [
                            t for t in topics if t != "lesson" and t != "hacksu"
                        ]
                        # Get last commit date from default branch
                        default_branch = repo.get("defaultBranchRef", {})
                        commit_target = default_branch.get("target", {}) if default_branch else {}
                        last_commit_date = commit_target.get("committedDate") if commit_target else repo["updatedAt"]
                        
                        all_repos.append(
                            {
                                "id": repo["id"],
                                "name": repo["name"],
                                "description": repo.get("description"),
                                "html_url": repo["url"],
                                "updated_at": repo["updatedAt"],
                                "last_commit_date": last_commit_date,
                                "language": (
                                    repo.get("primaryLanguage", {}).get("name")
                                    if repo.get("primaryLanguage")
                                    else None
                                ),
                                "topics": category_topics,
                            }
                        )
                        logger.debug(
                            f"Added lesson repo: {repo['name']} with topics: {category_topics}"
                        )

                has_next_page = page_info.get("hasNextPage", False)
                cursor = page_info.get("endCursor")

                # Rate limiting: GitHub allows 5000 points per hour for authenticated requests
                # Each query costs 1 point, so we can be generous, but let's be safe
                if has_next_page:
                    time.sleep(0.1)  # Small delay between pages

            except Exception as e:
                logger.error(f"Error fetching repos page: {e}")
                raise

        logger.info(f"Fetched {len(all_repos)} lesson repos from {self.org}")
        return all_repos

    def fetch_readme(self, repo_name: str) -> Optional[str]:
        """
        Fetch README content for a specific repository.
        Falls back to REST API since GraphQL doesn't support file content easily.
        """
        url = f"https://api.github.com/repos/{self.org}/{repo_name}/readme"
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"Bearer {self.token}",
            "User-Agent": "HacKSU-Lessons-Service",
        }

        try:
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code == 404:
                logger.debug(f"README not found for repo: {repo_name}")
                return None
            response.raise_for_status()
            data = response.json()

            if data.get("encoding") == "base64":
                import base64

                content = base64.b64decode(data["content"]).decode("utf-8")
                logger.debug(f"Fetched README for {repo_name}, length: {len(content)}")
                return content
            else:
                logger.warn(f"Unexpected encoding for README: {data.get('encoding')}")
                return data.get("content")
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching README for {repo_name}: {e}")
            return None
