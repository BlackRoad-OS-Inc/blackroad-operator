"""
BlackRoad Foundation — Salesforce CRM Adapter
Full REST API integration for Leads, Contacts, Opportunities, and Accounts.
"""

from __future__ import annotations

import os
import time
from dataclasses import dataclass, field
from typing import Any, Optional
from urllib.request import Request, urlopen
from urllib.parse import urlencode
import json


@dataclass
class SalesforceConfig:
    instance_url: str = field(default_factory=lambda: os.getenv("SALESFORCE_INSTANCE_URL", ""))
    access_token: str = field(default_factory=lambda: os.getenv("SALESFORCE_ACCESS_TOKEN", ""))
    api_version: str = "v59.0"

    def validate(self):
        if not self.instance_url or not self.access_token:
            raise ValueError(
                "Set SALESFORCE_INSTANCE_URL and SALESFORCE_ACCESS_TOKEN env vars"
            )


class SalesforceAdapter:
    """
    Lightweight Salesforce REST adapter — zero external dependencies.

    Usage::

        from adapters.salesforce import SalesforceAdapter, SalesforceConfig
        sf = SalesforceAdapter(SalesforceConfig())
        lead = sf.create_lead(first="Jane", last="Doe", email="j@blackroad.io", company="BlackRoad")
    """

    def __init__(self, cfg: Optional[SalesforceConfig] = None):
        self.cfg = cfg or SalesforceConfig()
        self.cfg.validate()
        self._base = f"{self.cfg.instance_url}/services/data/{self.cfg.api_version}"
        self._headers = {
            "Authorization": f"Bearer {self.cfg.access_token}",
            "Content-Type": "application/json",
        }

    # ── Core HTTP ─────────────────────────────────────────────────────────────

    def _req(self, method: str, path: str, body: Optional[dict] = None) -> Any:
        url = f"{self._base}{path}"
        data = json.dumps(body).encode() if body else None
        req = Request(url, data=data, headers=self._headers, method=method)
        with urlopen(req) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else {}

    def _query(self, soql: str) -> list[dict]:
        encoded = urlencode({"q": soql})
        result = self._req("GET", f"/query?{encoded}")
        return result.get("records", [])

    # ── Leads ─────────────────────────────────────────────────────────────────

    def create_lead(self, *, first: str, last: str, email: str, company: str,
                    phone: str = "", source: str = "BlackRoad CLI") -> dict:
        body = {
            "FirstName": first, "LastName": last, "Email": email,
            "Company": company, "Phone": phone, "LeadSource": source,
        }
        return self._req("POST", "/sobjects/Lead", body)

    def get_lead(self, lead_id: str) -> dict:
        return self._req("GET", f"/sobjects/Lead/{lead_id}")

    def update_lead(self, lead_id: str, **fields) -> None:
        self._req("PATCH", f"/sobjects/Lead/{lead_id}", fields)

    def convert_lead(self, lead_id: str, account_name: str) -> dict:
        return self._req("POST", f"/sobjects/Lead/{lead_id}/convert",
                         {"accountName": account_name, "convertedStatus": "Qualified"})

    def list_leads(self, limit: int = 50) -> list[dict]:
        return self._query(
            f"SELECT Id, FirstName, LastName, Email, Status, CreatedDate "
            f"FROM Lead ORDER BY CreatedDate DESC LIMIT {limit}"
        )

    # ── Contacts ──────────────────────────────────────────────────────────────

    def create_contact(self, *, first: str, last: str, email: str,
                       account_id: str = "") -> dict:
        body = {"FirstName": first, "LastName": last, "Email": email}
        if account_id:
            body["AccountId"] = account_id
        return self._req("POST", "/sobjects/Contact", body)

    def list_contacts(self, limit: int = 50) -> list[dict]:
        return self._query(
            f"SELECT Id, FirstName, LastName, Email, Account.Name "
            f"FROM Contact ORDER BY CreatedDate DESC LIMIT {limit}"
        )

    # ── Opportunities ─────────────────────────────────────────────────────────

    def create_opportunity(self, *, name: str, account_id: str, amount: float,
                            stage: str, close_date: str) -> dict:
        return self._req("POST", "/sobjects/Opportunity", {
            "Name": name, "AccountId": account_id, "Amount": amount,
            "StageName": stage, "CloseDate": close_date,
        })

    def list_opportunities(self, stage: str = "", limit: int = 50) -> list[dict]:
        where = f"WHERE StageName = '{stage}'" if stage else ""
        return self._query(
            f"SELECT Id, Name, Amount, StageName, CloseDate, Account.Name "
            f"FROM Opportunity {where} ORDER BY CloseDate ASC LIMIT {limit}"
        )

    def pipeline_value(self) -> float:
        result = self._query(
            "SELECT SUM(Amount) total FROM Opportunity WHERE IsClosed = false"
        )
        return result[0]["total"] if result else 0.0

    # ── Accounts ──────────────────────────────────────────────────────────────

    def create_account(self, *, name: str, industry: str = "", website: str = "") -> dict:
        return self._req("POST", "/sobjects/Account",
                         {"Name": name, "Industry": industry, "Website": website})

    def get_account(self, account_id: str) -> dict:
        return self._req("GET", f"/sobjects/Account/{account_id}")


# ── Mock adapter for testing ──────────────────────────────────────────────────

class MockSalesforceAdapter:
    """In-memory mock — use in tests and CI pipelines."""

    def __init__(self):
        self._leads: list[dict] = []
        self._contacts: list[dict] = []
        self._opps: list[dict] = []

    def create_lead(self, **kwargs) -> dict:
        lead = {"id": f"00Q{len(self._leads):06d}", **kwargs}
        self._leads.append(lead)
        return lead

    def list_leads(self, limit: int = 50) -> list[dict]:
        return self._leads[-limit:]

    def create_opportunity(self, **kwargs) -> dict:
        opp = {"id": f"006{len(self._opps):06d}", **kwargs}
        self._opps.append(opp)
        return opp

    def list_opportunities(self, **kwargs) -> list[dict]:
        return self._opps

    def pipeline_value(self) -> float:
        return sum(o.get("amount", 0) for o in self._opps)


def get_adapter(mock: bool = False):
    if mock or os.getenv("CRM_BACKEND") == "mock":
        return MockSalesforceAdapter()
    return SalesforceAdapter()
