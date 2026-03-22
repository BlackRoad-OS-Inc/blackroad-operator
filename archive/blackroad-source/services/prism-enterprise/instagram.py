#!/usr/bin/env python3
"""
Instagram API Connector for BlackRoad Agents

Handles Instagram account management, posting, and engagement for all agents.
Note: Instagram's API has strict limitations - most actions require manual approval.
"""

import os
import requests
import logging
from typing import Dict, List, Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class InstagramConnector:
    """Instagram Graph API integration for agent accounts"""

    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token or os.getenv("INSTAGRAM_ACCESS_TOKEN")
        self.base_url = "https://graph.instagram.com"
        self.facebook_graph_url = "https://graph.facebook.com/v18.0"

        if not self.access_token:
            logger.warning("Instagram access token not configured")

    def _get_headers(self) -> Dict:
        """Get request headers"""
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

    def create_account_credentials(self, agent_identity: Dict) -> Dict:
        """
        Generate credentials for Instagram account creation.
        Note: Instagram requires Facebook account for API access.
        Manual account creation is recommended for agents.
        """
        credentials = {
            "username": agent_identity.get("instagram_username"),
            "email": agent_identity.get("email"),
            "password": self._generate_secure_password(agent_identity.get("agent_id")),
            "display_name": agent_identity.get("name"),
            "platform": "instagram",
            "agent_id": agent_identity.get("agent_id"),
            "bio": f"BlackRoad AI Agent | {agent_identity.get('name')}",
            "website": "https://blackroad.ai",
            "created_at": datetime.utcnow().isoformat(),
            "requires_manual_setup": True,
            "setup_steps": [
                "1. Create Facebook account with agent email",
                "2. Create Instagram account linked to Facebook",
                "3. Convert to Instagram Business account",
                "4. Link to Facebook Page",
                "5. Generate access token via Facebook Developer",
                "6. Store access token in platform registry"
            ]
        }

        logger.info(f"Generated Instagram credentials for {credentials['username']}")
        return credentials

    def _generate_secure_password(self, agent_id: str) -> str:
        """Generate a secure password for the agent"""
        import hashlib
        import secrets

        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256(f"{agent_id}{salt}".encode()).hexdigest()
        password = f"Br{password_hash[:18]}!@"

        return password

    def get_account_info(self, instagram_business_account_id: str) -> Optional[Dict]:
        """Get Instagram Business Account information"""
        try:
            url = f"{self.base_url}/{instagram_business_account_id}"
            params = {
                "fields": "id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website",
                "access_token": self.access_token
            }

            response = requests.get(url, params=params)
            response.raise_for_status()

            account_data = response.json()
            logger.info(f"Retrieved account info for {account_data.get('username')}")

            return account_data

        except Exception as e:
            logger.error(f"Failed to get account info: {e}")
            return None

    def create_media_post(self, instagram_business_account_id: str, image_url: str,
                         caption: str) -> Optional[Dict]:
        """
        Create a media post (image) on Instagram.
        Returns media container ID for publishing.
        """
        try:
            url = f"{self.base_url}/{instagram_business_account_id}/media"
            params = {
                "image_url": image_url,
                "caption": caption,
                "access_token": self.access_token
            }

            response = requests.post(url, params=params)
            response.raise_for_status()

            media_data = response.json()
            logger.info(f"Media container created: {media_data.get('id')}")

            return media_data

        except Exception as e:
            logger.error(f"Failed to create media post: {e}")
            return None

    def publish_media(self, instagram_business_account_id: str, creation_id: str) -> Optional[Dict]:
        """Publish a media container"""
        try:
            url = f"{self.base_url}/{instagram_business_account_id}/media_publish"
            params = {
                "creation_id": creation_id,
                "access_token": self.access_token
            }

            response = requests.post(url, params=params)
            response.raise_for_status()

            publish_data = response.json()
            logger.info(f"Media published: {publish_data.get('id')}")

            return publish_data

        except Exception as e:
            logger.error(f"Failed to publish media: {e}")
            return None

    def post_comment(self, media_id: str, message: str) -> Optional[Dict]:
        """Post a comment on a media item"""
        try:
            url = f"{self.base_url}/{media_id}/comments"
            params = {
                "message": message,
                "access_token": self.access_token
            }

            response = requests.post(url, params=params)
            response.raise_for_status()

            comment_data = response.json()
            logger.info(f"Comment posted: {comment_data.get('id')}")

            return comment_data

        except Exception as e:
            logger.error(f"Failed to post comment: {e}")
            return None

    def get_media(self, instagram_business_account_id: str, limit: int = 25) -> List[Dict]:
        """Get media posts from account"""
        try:
            url = f"{self.base_url}/{instagram_business_account_id}/media"
            params = {
                "fields": "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
                "limit": limit,
                "access_token": self.access_token
            }

            response = requests.get(url, params=params)
            response.raise_for_status()

            media_list = response.json().get("data", [])
            logger.info(f"Retrieved {len(media_list)} media items")

            return media_list

        except Exception as e:
            logger.error(f"Failed to get media: {e}")
            return []

    def get_insights(self, instagram_business_account_id: str, metrics: List[str]) -> Optional[Dict]:
        """
        Get account insights/analytics.
        Metrics: impressions, reach, follower_count, profile_views, etc.
        """
        try:
            url = f"{self.base_url}/{instagram_business_account_id}/insights"
            params = {
                "metric": ",".join(metrics),
                "period": "day",
                "access_token": self.access_token
            }

            response = requests.get(url, params=params)
            response.raise_for_status()

            insights = response.json().get("data", [])
            logger.info(f"Retrieved insights for {len(metrics)} metrics")

            return {item["name"]: item["values"] for item in insights}

        except Exception as e:
            logger.error(f"Failed to get insights: {e}")
            return None

    def reply_to_comment(self, comment_id: str, message: str) -> Optional[Dict]:
        """Reply to a comment"""
        try:
            url = f"{self.base_url}/{comment_id}/replies"
            params = {
                "message": message,
                "access_token": self.access_token
            }

            response = requests.post(url, params=params)
            response.raise_for_status()

            reply_data = response.json()
            logger.info(f"Reply posted: {reply_data.get('id')}")

            return reply_data

        except Exception as e:
            logger.error(f"Failed to reply to comment: {e}")
            return None

    def get_mentioned_media(self, instagram_business_account_id: str) -> List[Dict]:
        """Get media where the account is mentioned"""
        try:
            url = f"{self.base_url}/{instagram_business_account_id}/tags"
            params = {
                "fields": "id,caption,media_type,media_url,timestamp",
                "access_token": self.access_token
            }

            response = requests.get(url, params=params)
            response.raise_for_status()

            mentions = response.json().get("data", [])
            logger.info(f"Retrieved {len(mentions)} mentions")

            return mentions

        except Exception as e:
            logger.error(f"Failed to get mentioned media: {e}")
            return []

    def search_users(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Search for Instagram users.
        Note: This requires Facebook Graph API and special permissions.
        """
        try:
            url = f"{self.facebook_graph_url}/ig_hashtag_search"
            params = {
                "user_id": "instagram_business_account_id",  # Would need actual ID
                "q": query,
                "access_token": self.access_token
            }

            response = requests.get(url, params=params)
            response.raise_for_status()

            users = response.json().get("data", [])[:limit]
            logger.info(f"Found {len(users)} users matching '{query}'")

            return users

        except Exception as e:
            logger.error(f"Failed to search users: {e}")
            return []


class InstagramAccountManager:
    """Manager for Instagram agent account operations"""

    def __init__(self):
        self.connector = InstagramConnector()
        self.account_registry = {}

    def setup_agent_account(self, agent_identity: Dict) -> Dict:
        """Complete setup guide for agent Instagram account"""
        credentials = self.connector.create_account_credentials(agent_identity)

        setup_guide = {
            "credentials": credentials,
            "manual_steps": credentials["setup_steps"],
            "api_limitations": [
                "Instagram Graph API requires Instagram Business or Creator account",
                "Must be linked to a Facebook Page",
                "Access tokens expire and need refresh",
                "Content publishing has daily limits",
                "Some features require app review from Facebook"
            ],
            "automation_options": [
                "Use Instagram Basic Display API for read-only access",
                "Use Instagram Graph API for business accounts",
                "Consider third-party tools for bulk account management",
                "Manual account creation recommended for compliance"
            ],
            "next_steps": [
                f"1. Visit https://www.instagram.com/accounts/emailsignup/",
                f"2. Sign up with email: {credentials['email']}",
                f"3. Username: {credentials['username']}",
                f"4. Complete profile with bio and profile picture",
                f"5. Follow @blackroad_ai main account",
                f"6. Convert to Business account in settings",
                f"7. Link to Facebook Page for API access"
            ]
        }

        return setup_guide


def main():
    """Test Instagram connector"""
    manager = InstagramAccountManager()

    # Generate setup guide for test agent
    test_identity = {
        "agent_id": "P1",
        "name": "Cece",
        "email": "cece_blackroad@blackroad.ai",
        "instagram_username": "cece_blackroad"
    }

    setup = manager.setup_agent_account(test_identity)

    print("\n" + "="*80)
    print("INSTAGRAM ACCOUNT SETUP GUIDE")
    print("="*80)
    print(f"\nUsername: {setup['credentials']['username']}")
    print(f"Email: {setup['credentials']['email']}")
    print(f"Display Name: {setup['credentials']['display_name']}")
    print(f"\nBio: {setup['credentials']['bio']}")

    print("\n\nMANUAL SETUP STEPS:")
    for step in setup['next_steps']:
        print(f"  {step}")

    print("\n\nAPI LIMITATIONS:")
    for limitation in setup['api_limitations']:
        print(f"  - {limitation}")


if __name__ == "__main__":
    main()
