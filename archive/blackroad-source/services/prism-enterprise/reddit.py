#!/usr/bin/env python3
"""
Reddit API Connector for BlackRoad Agents

Handles Reddit account creation, posting, and commenting for all agents.
Supports r/thelightremembers subreddit and all Reddit communities.
"""

import os
import requests
import logging
from typing import Dict, List, Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RedditConnector:
    """Reddit API integration for agent accounts"""

    def __init__(self, client_id: Optional[str] = None, client_secret: Optional[str] = None,
                 user_agent: Optional[str] = None):
        self.client_id = client_id or os.getenv("REDDIT_CLIENT_ID")
        self.client_secret = client_secret or os.getenv("REDDIT_CLIENT_SECRET")
        self.user_agent = user_agent or os.getenv("REDDIT_USER_AGENT", "BlackRoad:Agent:v1.0")

        self.base_url = "https://oauth.reddit.com"
        self.auth_url = "https://www.reddit.com/api/v1/access_token"
        self.access_token = None

        if not self.client_id or not self.client_secret:
            logger.warning("Reddit credentials not configured")

    def authenticate(self) -> bool:
        """Get OAuth2 access token"""
        try:
            auth = requests.auth.HTTPBasicAuth(self.client_id, self.client_secret)
            data = {"grant_type": "client_credentials"}
            headers = {"User-Agent": self.user_agent}

            response = requests.post(self.auth_url, auth=auth, data=data, headers=headers)
            response.raise_for_status()

            token_data = response.json()
            self.access_token = token_data.get("access_token")

            logger.info("Reddit authentication successful")
            return True

        except Exception as e:
            logger.error(f"Reddit authentication failed: {e}")
            return False

    def _get_headers(self) -> Dict:
        """Get request headers with authentication"""
        if not self.access_token:
            self.authenticate()

        return {
            "Authorization": f"Bearer {self.access_token}",
            "User-Agent": self.user_agent
        }

    def create_account_credentials(self, agent_identity: Dict) -> Dict:
        """
        Generate credentials for Reddit account creation.
        Note: Reddit account creation requires manual CAPTCHA solving,
        so this returns the data needed for manual or automated account creation.
        """
        credentials = {
            "username": agent_identity.get("reddit_username"),
            "email": agent_identity.get("email"),
            "password": self._generate_secure_password(agent_identity.get("agent_id")),
            "platform": "reddit",
            "agent_id": agent_identity.get("agent_id"),
            "display_name": agent_identity.get("name"),
            "created_at": datetime.utcnow().isoformat()
        }

        logger.info(f"Generated Reddit credentials for {credentials['username']}")
        return credentials

    def _generate_secure_password(self, agent_id: str) -> str:
        """Generate a secure password for the agent"""
        import hashlib
        import secrets

        # Generate password using agent ID and random salt
        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256(f"{agent_id}{salt}".encode()).hexdigest()

        # Format as password (first 20 chars + special chars)
        password = f"Br{password_hash[:18]}!@"

        return password

    def get_user_info(self, username: str) -> Optional[Dict]:
        """Get user information from Reddit"""
        try:
            url = f"{self.base_url}/user/{username}/about"
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()

            user_data = response.json().get("data", {})
            return {
                "username": user_data.get("name"),
                "user_id": user_data.get("id"),
                "created_utc": user_data.get("created_utc"),
                "link_karma": user_data.get("link_karma"),
                "comment_karma": user_data.get("comment_karma"),
                "is_verified": user_data.get("has_verified_email")
            }

        except Exception as e:
            logger.error(f"Failed to get user info for {username}: {e}")
            return None

    def submit_post(self, subreddit: str, title: str, text: str, username: str,
                    password: str) -> Optional[Dict]:
        """
        Submit a post to a subreddit.
        Requires user credentials for posting.
        """
        try:
            # This would require user-level OAuth (not app-only)
            # For now, return structure for manual posting
            post_data = {
                "subreddit": subreddit,
                "title": title,
                "text": text,
                "kind": "self",
                "username": username,
                "action_required": "manual_oauth_flow"
            }

            logger.info(f"Post prepared for r/{subreddit}: {title}")
            return post_data

        except Exception as e:
            logger.error(f"Failed to submit post: {e}")
            return None

    def submit_comment(self, parent_fullname: str, text: str) -> Optional[Dict]:
        """Submit a comment to a post or another comment"""
        try:
            url = f"{self.base_url}/api/comment"
            data = {
                "parent": parent_fullname,
                "text": text
            }

            response = requests.post(url, headers=self._get_headers(), data=data)
            response.raise_for_status()

            comment_data = response.json()
            logger.info(f"Comment submitted successfully")

            return comment_data

        except Exception as e:
            logger.error(f"Failed to submit comment: {e}")
            return None

    def get_subreddit_info(self, subreddit: str) -> Optional[Dict]:
        """Get information about a subreddit"""
        try:
            url = f"{self.base_url}/r/{subreddit}/about"
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()

            data = response.json().get("data", {})

            return {
                "name": data.get("display_name"),
                "title": data.get("title"),
                "subscribers": data.get("subscribers"),
                "active_users": data.get("active_user_count"),
                "description": data.get("public_description"),
                "created_utc": data.get("created_utc")
            }

        except Exception as e:
            logger.error(f"Failed to get subreddit info for r/{subreddit}: {e}")
            return None

    def search_posts(self, subreddit: str, query: str, limit: int = 25) -> List[Dict]:
        """Search for posts in a subreddit"""
        try:
            url = f"{self.base_url}/r/{subreddit}/search"
            params = {
                "q": query,
                "limit": limit,
                "restrict_sr": "true",
                "sort": "relevance"
            }

            response = requests.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()

            posts = response.json().get("data", {}).get("children", [])

            return [
                {
                    "id": post["data"].get("id"),
                    "title": post["data"].get("title"),
                    "author": post["data"].get("author"),
                    "score": post["data"].get("score"),
                    "url": post["data"].get("url"),
                    "created_utc": post["data"].get("created_utc")
                }
                for post in posts
            ]

        except Exception as e:
            logger.error(f"Failed to search posts: {e}")
            return []

    def join_subreddit(self, subreddit: str) -> bool:
        """Subscribe to a subreddit"""
        try:
            url = f"{self.base_url}/api/subscribe"
            data = {
                "action": "sub",
                "sr_name": subreddit
            }

            response = requests.post(url, headers=self._get_headers(), data=data)
            response.raise_for_status()

            logger.info(f"Successfully subscribed to r/{subreddit}")
            return True

        except Exception as e:
            logger.error(f"Failed to subscribe to r/{subreddit}: {e}")
            return False


def main():
    """Test Reddit connector"""
    connector = RedditConnector()

    # Test authentication
    if connector.authenticate():
        # Get subreddit info
        info = connector.get_subreddit_info("thelightremembers")
        if info:
            print(f"\nSubreddit: r/{info['name']}")
            print(f"Subscribers: {info['subscribers']}")
            print(f"Description: {info['description']}")

        # Generate credentials for test agent
        test_identity = {
            "agent_id": "P1",
            "name": "Cece",
            "email": "cece_blackroad@blackroad.ai",
            "reddit_username": "cece_blackroad"
        }

        creds = connector.create_account_credentials(test_identity)
        print(f"\nGenerated credentials:")
        print(f"Username: {creds['username']}")
        print(f"Email: {creds['email']}")
        print(f"Password: {creds['password'][:10]}...")


if __name__ == "__main__":
    main()
