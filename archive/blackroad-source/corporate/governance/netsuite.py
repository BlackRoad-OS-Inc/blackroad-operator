#!/usr/bin/env python3
"""
BlackRoad Foundation — Oracle NetSuite SuiteQL REST Adapter
Connects via NetSuite's TBA (Token-Based Authentication) + SuiteQL.
"""
from __future__ import annotations
import os, time, hmac, hashlib, base64, random, string, urllib.parse
from typing import Any
import httpx

NS_ACCOUNT = os.getenv("NETSUITE_ACCOUNT_ID", "")
NS_CONSUMER_KEY = os.getenv("NETSUITE_CONSUMER_KEY", "")
NS_CONSUMER_SECRET = os.getenv("NETSUITE_CONSUMER_SECRET", "")
NS_TOKEN = os.getenv("NETSUITE_TOKEN", "")
NS_TOKEN_SECRET = os.getenv("NETSUITE_TOKEN_SECRET", "")


class NetSuiteAdapter:
    """Oracle NetSuite REST adapter using SuiteQL + TBA OAuth 1.0a."""

    def __init__(self):
        self._account = NS_ACCOUNT.replace("-", "_").upper()
        self._base = f"https://{NS_ACCOUNT}.suitetalk.api.netsuite.com/services/rest"

    def _oauth_header(self, method: str, url: str) -> str:
        nonce = "".join(random.choices(string.ascii_letters + string.digits, k=32))
        ts = str(int(time.time()))
        params = {
            "oauth_consumer_key": NS_CONSUMER_KEY,
            "oauth_nonce": nonce,
            "oauth_signature_method": "HMAC-SHA256",
            "oauth_timestamp": ts,
            "oauth_token": NS_TOKEN,
            "oauth_version": "1.0",
        }
        param_str = "&".join(f"{k}={urllib.parse.quote(v, safe='')}" for k, v in sorted(params.items()))
        base_str = f"{method}&{urllib.parse.quote(url, safe='')}&{urllib.parse.quote(param_str, safe='')}"
        signing_key = f"{urllib.parse.quote(NS_CONSUMER_SECRET, safe='')}&{urllib.parse.quote(NS_TOKEN_SECRET, safe='')}"
        sig = base64.b64encode(hmac.new(signing_key.encode(), base_str.encode(), hashlib.sha256).digest()).decode()
        params["oauth_signature"] = sig
        return "OAuth " + ", ".join(f'{k}="{urllib.parse.quote(v, safe="")}"' for k, v in params.items())

    async def query(self, suiteql: str) -> list[dict[str, Any]]:
        url = f"{self._base}/query/v1/suiteql"
        headers = {
            "Authorization": self._oauth_header("POST", url),
            "Content-Type": "application/json",
            "Prefer": "transient",
        }
        async with httpx.AsyncClient() as client:
            r = await client.post(url, json={"q": suiteql}, headers=headers)
            r.raise_for_status()
            return r.json().get("items", [])

    async def get_customers(self, limit: int = 10) -> list[dict]:
        return await self.query(f"SELECT id, companyName, email, phone FROM Customer WHERE isInactive = 'F' LIMIT {limit}")

    async def get_invoices(self, status: str = "Open", limit: int = 10) -> list[dict]:
        return await self.query(
            f"SELECT id, tranId, entity, amount, status FROM Transaction WHERE type = 'CustInvc' AND status = '{status}' LIMIT {limit}"
        )

    async def get_items(self, limit: int = 10) -> list[dict]:
        return await self.query(f"SELECT id, itemId, displayName, basePrice FROM Item WHERE isInactive = 'F' LIMIT {limit}")
