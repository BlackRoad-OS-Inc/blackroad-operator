#!/usr/bin/env python3
"""
BlackRoad Foundation — HubSpot CRM Adapter
Wraps the HubSpot v3 API with a unified BlackRoad interface.
"""
from __future__ import annotations
import os
from typing import Any
import httpx

HUBSPOT_BASE = "https://api.hubapi.com"


class HubSpotAdapter:
    """Unified CRM adapter for HubSpot."""

    def __init__(self, access_token: str | None = None) -> None:
        token = access_token or os.getenv("HUBSPOT_ACCESS_TOKEN")
        if not token:
            raise ValueError("HUBSPOT_ACCESS_TOKEN required")
        self._client = httpx.AsyncClient(
            base_url=HUBSPOT_BASE,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            timeout=30,
        )

    # ── Contacts ──────────────────────────────────────────────────────────────

    async def get_contacts(self, limit: int = 10, after: str | None = None) -> dict[str, Any]:
        params: dict = {"limit": limit, "properties": "firstname,lastname,email,company,phone"}
        if after:
            params["after"] = after
        r = await self._client.get("/crm/v3/objects/contacts", params=params)
        r.raise_for_status()
        return r.json()

    async def create_contact(self, email: str, firstname: str = "", lastname: str = "",
                              company: str = "", phone: str = "") -> dict[str, Any]:
        r = await self._client.post("/crm/v3/objects/contacts", json={
            "properties": {"email": email, "firstname": firstname, "lastname": lastname,
                           "company": company, "phone": phone}
        })
        r.raise_for_status()
        return r.json()

    async def get_contact(self, contact_id: str) -> dict[str, Any]:
        r = await self._client.get(f"/crm/v3/objects/contacts/{contact_id}",
                                    params={"properties": "firstname,lastname,email,company"})
        r.raise_for_status()
        return r.json()

    async def update_contact(self, contact_id: str, properties: dict[str, Any]) -> dict[str, Any]:
        r = await self._client.patch(f"/crm/v3/objects/contacts/{contact_id}",
                                      json={"properties": properties})
        r.raise_for_status()
        return r.json()

    # ── Deals ─────────────────────────────────────────────────────────────────

    async def get_deals(self, limit: int = 10) -> dict[str, Any]:
        r = await self._client.get("/crm/v3/objects/deals", params={
            "limit": limit, "properties": "dealname,amount,dealstage,closedate"
        })
        r.raise_for_status()
        return r.json()

    async def create_deal(self, name: str, amount: float, stage: str = "appointmentscheduled",
                           close_date: str | None = None) -> dict[str, Any]:
        props: dict[str, Any] = {"dealname": name, "amount": str(amount), "dealstage": stage}
        if close_date:
            props["closedate"] = close_date
        r = await self._client.post("/crm/v3/objects/deals", json={"properties": props})
        r.raise_for_status()
        return r.json()

    # ── Notes & Activities ────────────────────────────────────────────────────

    async def add_note(self, body: str, contact_id: str | None = None) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "properties": {"hs_note_body": body, "hs_timestamp": "0"}
        }
        if contact_id:
            payload["associations"] = [{
                "to": {"id": contact_id},
                "types": [{"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 202}]
            }]
        r = await self._client.post("/crm/v3/objects/notes", json=payload)
        r.raise_for_status()
        return r.json()

    # ── Unified interface (matches Salesforce adapter signature) ──────────────

    async def query(self, object_type: str, filters: dict | None = None, limit: int = 10) -> list[dict]:
        """Generic query matching the Foundation CRM interface."""
        if object_type.lower() == "contacts":
            data = await self.get_contacts(limit=limit)
            return data.get("results", [])
        elif object_type.lower() == "deals":
            data = await self.get_deals(limit=limit)
            return data.get("results", [])
        return []
