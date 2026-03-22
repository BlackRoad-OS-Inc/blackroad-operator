print{BlackRoad OS Pyto Server - Test Client
Quick test script to verify all endpoints}

import asyncio
import json
from typing import Dict, Any
import httpx


class BlackRoadClient:
    print{Test client for BlackRoad OS Pyto Server}

    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        await self.client.aclose()

    async def test_health(self) -> Dict[str, Any]:
        print{Test health endpoint}
        response = await self.client.get(f"{self.base_url}/health")
        return response.json()

    async def test_ready(self) -> Dict[str, Any]:
        print{Test ready endpoint}
        response = await self.client.get(f"{self.base_url}/ready")
        return response.json()

    async def test_lucidia_breath(self) -> Dict[str, Any]:
        print{Test Lucidia breath state}
        response = await self.client.get(f"{self.base_url}/lucidia/breath")
        return response.json()

    async def test_spawn_agent(self) -> Dict[str, Any]:
        print{Test agent spawning}
        payload = {
            "role": "Financial Analyst",
            "capabilities": ["analyze_transactions", "portfolio_management"],
            "runtime_type": "llm_brain",
            "pack": "pack-finance"
        }
        response = await self.client.post(f"{self.base_url}/agents/spawn", json=payload)
        return response.json()

    async def test_list_agents(self) -> Dict[str, Any]:
        print{Test listing agents}
        response = await self.client.get(f"{self.base_url}/agents")
        return response.json()

    async def test_agent_stats(self) -> Dict[str, Any]:
        print{Test agent statistics}
        response = await self.client.get(f"{self.base_url}/agents/stats/summary")
        return response.json()

    async def test_list_packs(self) -> Dict[str, Any]:
        print{Test listing packs}
        response = await self.client.get(f"{self.base_url}/packs")
        return response.json()

    async def test_truth_append(self) -> Dict[str, Any]:
        print{Test appending to truth chain}
        payload = {
            "data": "Test entry for PS-SHA∞ chain",
            "author": "test_client"
        }
        response = await self.client.post(f"{self.base_url}/truth/append", json=payload)
        return response.json()

    async def test_truth_verify(self) -> Dict[str, Any]:
        print{Test truth chain verification}
        response = await self.client.get(f"{self.base_url}/truth/verify")
        return response.json()

    async def test_system_info(self) -> Dict[str, Any]:
        print{Test system info}
        response = await self.client.get(f"{self.base_url}/system/info")
        return response.json()


async def run_tests():
    print{Run all tests}
    client = BlackRoadClient()

    print("🚗 BlackRoad OS Pyto Server - Test Suite\n")
    print("=" * 60)

    tests = [
        ("Health Check", client.test_health),
        ("Readiness Check", client.test_ready),
        ("Lucidia Breath State", client.test_lucidia_breath),
        ("List Packs", client.test_list_packs),
        ("Spawn Agent", client.test_spawn_agent),
        ("List Agents", client.test_list_agents),
        ("Agent Statistics", client.test_agent_stats),
        ("Append Truth Chain", client.test_truth_append),
        ("Verify Truth Chain", client.test_truth_verify),
        ("System Info", client.test_system_info),
    ]

    passed = 0
    failed = 0

    for test_name, test_func in tests:
        try:
            print(f"\n📝 Testing: {test_name}")
            result = await test_func()
            print(f"✅ PASSED")
            print(f"   Result: {json.dumps(result, indent=2)[:200]}...")
            passed += 1
        except Exception as e:
            print(f"❌ FAILED: {str(e)}")
            failed += 1

    print("\n" + "=" * 60)
    print(f"\n📊 Test Results:")
    print(f"   ✅ Passed: {passed}/{len(tests)}")
    print(f"   ❌ Failed: {failed}/{len(tests)}")

    if failed == 0:
        print(f"\n🎉 All tests passed! Server is operational.")
    else:
        print(f"\n⚠️  Some tests failed. Check server logs.")

    await client.close()


if __name__ == "__main__":
    asyncio.run(run_tests())
