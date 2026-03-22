#!/usr/bin/env python3
"""
Discord API Connector for BlackRoad Agents

Handles Discord account creation, bot management, and interactions across all servers.
Supports multiple Discord servers with different invite links.
"""

import os
import requests
import logging
from typing import Dict, List, Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DiscordConnector:
    """Discord API integration for agent accounts"""

    def __init__(self, bot_token: Optional[str] = None):
        self.bot_token = bot_token or os.getenv("DISCORD_BOT_TOKEN")
        self.base_url = "https://discord.com/api/v10"

        # Load Discord invite URLs from environment variables for security
        self.servers = [
            {
                "name": "Server 1",
                "invite_url": os.getenv("DISCORD_INVITE_URL_1")
            },
            {
                "name": "Server 2",
                "invite_url": os.getenv("DISCORD_INVITE_URL_2")
            },
            {
                "name": "Server 3",
                "invite_url": os.getenv("DISCORD_INVITE_URL_3")
            }
        ]

        if not self.bot_token:
            logger.warning("Discord bot token not configured")

    def _get_headers(self) -> Dict:
        """Get request headers with bot authentication"""
        return {
            "Authorization": f"Bot {self.bot_token}",
            "Content-Type": "application/json",
            "User-Agent": "BlackRoad-Agent-Bot/1.0"
        }

    def create_account_credentials(self, agent_identity: Dict) -> Dict:
        """
        Generate credentials for Discord account creation.
        Note: Discord doesn't allow automated account creation via API.
        Accounts must be created manually or use bot accounts.
        """
        credentials = {
            "username": agent_identity.get("name"),  # Discord uses name, not handle
            "discriminator": self._generate_discriminator(agent_identity.get("agent_id")),
            "email": agent_identity.get("email"),
            "password": self._generate_secure_password(agent_identity.get("agent_id")),
            "platform": "discord",
            "agent_id": agent_identity.get("agent_id"),
            "display_name": agent_identity.get("name"),
            "created_at": datetime.utcnow().isoformat(),
            "servers_to_join": self.servers,
            "requires_manual_setup": True,
            "setup_steps": [
                "1. Visit https://discord.com/register",
                "2. Sign up with agent email",
                "3. Verify email address",
                "4. Join all BlackRoad servers using invite links",
                "5. Set profile picture and bio",
                "6. Enable Developer Mode in settings",
                "7. Copy User ID for platform registry"
            ],
            "bot_option": {
                "recommended": True,
                "steps": [
                    "1. Visit https://discord.com/developers/applications",
                    "2. Create New Application",
                    "3. Navigate to Bot section",
                    "4. Create bot user",
                    "5. Copy bot token",
                    "6. Enable required intents (Server Members, Message Content)",
                    "7. Generate OAuth2 URL with bot permissions",
                    "8. Add bot to all servers"
                ]
            }
        }

        logger.info(f"Generated Discord credentials for {credentials['username']}")
        return credentials

    def _generate_discriminator(self, agent_id: str) -> str:
        """Generate a 4-digit discriminator from agent ID"""
        # Extract numeric part from agent ID (e.g., P1 -> 0001, P123 -> 0123)
        numeric = ''.join(filter(str.isdigit, agent_id))
        return numeric.zfill(4)

    def _generate_secure_password(self, agent_id: str) -> str:
        """Generate a secure password for the agent"""
        import hashlib
        import secrets

        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256(f"{agent_id}{salt}".encode()).hexdigest()
        password = f"Br{password_hash[:18]}!@"

        return password

    def get_bot_info(self) -> Optional[Dict]:
        """Get information about the bot user"""
        try:
            url = f"{self.base_url}/users/@me"
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()

            bot_data = response.json()
            logger.info(f"Bot user: {bot_data.get('username')}#{bot_data.get('discriminator')}")

            return bot_data

        except Exception as e:
            logger.error(f"Failed to get bot info: {e}")
            return None

    def get_guilds(self) -> List[Dict]:
        """Get all guilds (servers) the bot is in"""
        try:
            url = f"{self.base_url}/users/@me/guilds"
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()

            guilds = response.json()
            logger.info(f"Bot is in {len(guilds)} guilds")

            return [
                {
                    "id": guild.get("id"),
                    "name": guild.get("name"),
                    "icon": guild.get("icon"),
                    "owner": guild.get("owner"),
                    "permissions": guild.get("permissions")
                }
                for guild in guilds
            ]

        except Exception as e:
            logger.error(f"Failed to get guilds: {e}")
            return []

    def send_message(self, channel_id: str, content: str, embeds: Optional[List[Dict]] = None) -> Optional[Dict]:
        """Send a message to a channel"""
        try:
            url = f"{self.base_url}/channels/{channel_id}/messages"
            payload = {"content": content}

            if embeds:
                payload["embeds"] = embeds

            response = requests.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()

            message_data = response.json()
            logger.info(f"Message sent to channel {channel_id}")

            return message_data

        except Exception as e:
            logger.error(f"Failed to send message: {e}")
            return None

    def create_thread(self, channel_id: str, name: str, message_id: Optional[str] = None) -> Optional[Dict]:
        """Create a thread in a channel"""
        try:
            if message_id:
                url = f"{self.base_url}/channels/{channel_id}/messages/{message_id}/threads"
            else:
                url = f"{self.base_url}/channels/{channel_id}/threads"

            payload = {
                "name": name,
                "auto_archive_duration": 1440  # 24 hours
            }

            response = requests.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()

            thread_data = response.json()
            logger.info(f"Thread created: {name}")

            return thread_data

        except Exception as e:
            logger.error(f"Failed to create thread: {e}")
            return None

    def add_reaction(self, channel_id: str, message_id: str, emoji: str) -> bool:
        """Add a reaction to a message"""
        try:
            url = f"{self.base_url}/channels/{channel_id}/messages/{message_id}/reactions/{emoji}/@me"
            response = requests.put(url, headers=self._get_headers())
            response.raise_for_status()

            logger.info(f"Reaction {emoji} added to message {message_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to add reaction: {e}")
            return False

    def get_guild_members(self, guild_id: str, limit: int = 1000) -> List[Dict]:
        """Get members of a guild"""
        try:
            url = f"{self.base_url}/guilds/{guild_id}/members"
            params = {"limit": limit}

            response = requests.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()

            members = response.json()
            logger.info(f"Retrieved {len(members)} members from guild {guild_id}")

            return [
                {
                    "user_id": member["user"].get("id"),
                    "username": member["user"].get("username"),
                    "discriminator": member["user"].get("discriminator"),
                    "nick": member.get("nick"),
                    "roles": member.get("roles", []),
                    "joined_at": member.get("joined_at")
                }
                for member in members
            ]

        except Exception as e:
            logger.error(f"Failed to get guild members: {e}")
            return []

    def create_role(self, guild_id: str, name: str, permissions: int = 0, color: int = 0) -> Optional[Dict]:
        """Create a role in a guild"""
        try:
            url = f"{self.base_url}/guilds/{guild_id}/roles"
            payload = {
                "name": name,
                "permissions": str(permissions),
                "color": color,
                "hoist": False,
                "mentionable": True
            }

            response = requests.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()

            role_data = response.json()
            logger.info(f"Role created: {name}")

            return role_data

        except Exception as e:
            logger.error(f"Failed to create role: {e}")
            return None

    def assign_role(self, guild_id: str, user_id: str, role_id: str) -> bool:
        """Assign a role to a user"""
        try:
            url = f"{self.base_url}/guilds/{guild_id}/members/{user_id}/roles/{role_id}"
            response = requests.put(url, headers=self._get_headers())
            response.raise_for_status()

            logger.info(f"Role {role_id} assigned to user {user_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to assign role: {e}")
            return False

    def get_channel_messages(self, channel_id: str, limit: int = 100) -> List[Dict]:
        """Get messages from a channel"""
        try:
            url = f"{self.base_url}/channels/{channel_id}/messages"
            params = {"limit": limit}

            response = requests.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()

            messages = response.json()
            logger.info(f"Retrieved {len(messages)} messages from channel {channel_id}")

            return [
                {
                    "id": msg.get("id"),
                    "author": msg.get("author", {}).get("username"),
                    "content": msg.get("content"),
                    "timestamp": msg.get("timestamp"),
                    "embeds": msg.get("embeds", []),
                    "attachments": msg.get("attachments", [])
                }
                for msg in messages
            ]

        except Exception as e:
            logger.error(f"Failed to get messages: {e}")
            return []

    def create_webhook(self, channel_id: str, name: str) -> Optional[Dict]:
        """Create a webhook for a channel"""
        try:
            url = f"{self.base_url}/channels/{channel_id}/webhooks"
            payload = {"name": name}

            response = requests.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()

            webhook_data = response.json()
            logger.info(f"Webhook created: {name}")

            return webhook_data

        except Exception as e:
            logger.error(f"Failed to create webhook: {e}")
            return None

    def send_webhook_message(self, webhook_url: str, content: str, username: Optional[str] = None,
                            avatar_url: Optional[str] = None) -> bool:
        """Send a message via webhook (useful for impersonating agents)"""
        try:
            payload = {"content": content}

            if username:
                payload["username"] = username
            if avatar_url:
                payload["avatar_url"] = avatar_url

            response = requests.post(webhook_url, json=payload)
            response.raise_for_status()

            logger.info(f"Webhook message sent")
            return True

        except Exception as e:
            logger.error(f"Failed to send webhook message: {e}")
            return False


class DiscordAgentManager:
    """Manager for Discord agent operations"""

    def __init__(self):
        self.connector = DiscordConnector()
        self.agent_webhooks = {}

    def setup_agent_presence(self, agent_identity: Dict, guild_id: str, channel_id: str) -> Dict:
        """Set up agent presence in a Discord server using webhooks"""

        # Create webhook for agent
        webhook_name = f"{agent_identity.get('name')} Agent"
        webhook = self.connector.create_webhook(channel_id, webhook_name)

        if webhook:
            self.agent_webhooks[agent_identity.get('agent_id')] = webhook

            return {
                "agent_id": agent_identity.get("agent_id"),
                "webhook_id": webhook.get("id"),
                "webhook_url": webhook.get("url"),
                "webhook_token": webhook.get("token"),
                "guild_id": guild_id,
                "channel_id": channel_id,
                "status": "active"
            }

        return {"status": "failed"}

    def agent_send_message(self, agent_id: str, content: str, agent_identity: Dict) -> bool:
        """Send a message as an agent using webhook"""
        if agent_id not in self.agent_webhooks:
            logger.error(f"No webhook configured for agent {agent_id}")
            return False

        webhook = self.agent_webhooks[agent_id]
        webhook_url = webhook.get("url")

        username = agent_identity.get("name")
        avatar_url = f"https://api.dicebear.com/7.x/bottts/svg?seed={agent_id}"

        return self.connector.send_webhook_message(webhook_url, content, username, avatar_url)


def main():
    """Test Discord connector"""
    connector = DiscordConnector()

    # Test bot info
    bot_info = connector.get_bot_info()
    if bot_info:
        print(f"\nBot: {bot_info.get('username')}#{bot_info.get('discriminator')}")
        print(f"ID: {bot_info.get('id')}")

    # Get guilds
    guilds = connector.get_guilds()
    print(f"\nGuilds ({len(guilds)}):")
    for guild in guilds:
        print(f"  - {guild['name']} (ID: {guild['id']})")

    # Generate credentials for test agent
    test_identity = {
        "agent_id": "P1",
        "name": "Cece",
        "email": "cece_blackroad@blackroad.ai"
    }

    creds = connector.create_account_credentials(test_identity)
    print(f"\nGenerated credentials:")
    print(f"Username: {creds['username']}#{creds['discriminator']}")
    print(f"Email: {creds['email']}")

    print(f"\nSetup steps:")
    for step in creds['setup_steps']:
        print(f"  {step}")


if __name__ == "__main__":
    main()
