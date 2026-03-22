#!/usr/bin/env python3
"""
BlackRoad Foundation — SAP OData Adapter
Connects to SAP S/4HANA via OData v4 API.
"""
from __future__ import annotations
import os
from typing import Any
import httpx

SAP_BASE = os.getenv("SAP_INSTANCE_URL", "https://your-sap-instance.ondemand.com")


class SAPAdapter:
    def __init__(self, base_url: str | None = None, username: str | None = None,
                 password: str | None = None) -> None:
        self._base = (base_url or SAP_BASE).rstrip("/")
        user = username or os.getenv("SAP_USERNAME", "")
        pwd = password or os.getenv("SAP_PASSWORD", "")
        self._client = httpx.AsyncClient(
            base_url=self._base,
            auth=(user, pwd),
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            timeout=30,
        )

    async def _get(self, path: str, params: dict | None = None) -> Any:
        r = await self._client.get(f"/sap/opu/odata/sap/{path}", params=params)
        r.raise_for_status()
        data = r.json()
        return data.get("d", {}).get("results", data.get("d", data))

    async def get_sales_orders(self, top: int = 10, select: str | None = None) -> list[dict]:
        params: dict = {"$top": top, "$format": "json"}
        if select:
            params["$select"] = select
        return await self._get("API_SALES_ORDER_SRV/A_SalesOrder", params)

    async def get_materials(self, top: int = 10) -> list[dict]:
        return await self._get(
            "API_PRODUCT_SRV/A_Product",
            {"$top": top, "$format": "json", "$select": "Material,MaterialName,BaseUnit"}
        )

    async def get_customers(self, top: int = 10) -> list[dict]:
        return await self._get(
            "API_BUSINESS_PARTNER/A_BusinessPartner",
            {"$top": top, "$format": "json", "$filter": "BusinessPartnerCategory eq '1'"}
        )

    async def query(self, object_type: str, filters: dict | None = None, limit: int = 10) -> list[dict]:
        """Unified CRM interface."""
        mapping = {
            "sales_orders": self.get_sales_orders,
            "materials": self.get_materials,
            "customers": self.get_customers,
        }
        fn = mapping.get(object_type.lower())
        if fn:
            return await fn(top=limit)
        return []
