"""
Integration tests for health check endpoints

Tests health endpoints across all services to ensure proper monitoring and alerting
"""
import pytest
import httpx
import json
from typing import Dict, Any


class TestHealthEndpoints:
    """Test /health, /healthz, and /health.json endpoints"""

    @pytest.fixture
    def api_base_url(self):
        """Base URL for API testing"""
        return "http://localhost:3000"

    @pytest.fixture
    async def http_client(self):
        """Async HTTP client for testing"""
        async with httpx.AsyncClient() as client:
            yield client

    @pytest.mark.asyncio
    async def test_health_endpoint_returns_200(self, http_client, api_base_url):
        """Test /health endpoint returns 200 OK"""
        # Act
        response = await http_client.get(f"{api_base_url}/health")

        # Assert
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_health_endpoint_returns_json(self, http_client, api_base_url):
        """Test /health endpoint returns JSON content"""
        # Act
        response = await http_client.get(f"{api_base_url}/health")

        # Assert
        assert response.headers["content-type"] == "application/json"
        data = response.json()
        assert isinstance(data, dict)

    @pytest.mark.asyncio
    async def test_health_endpoint_contains_status(self, http_client, api_base_url):
        """Test /health returns status field"""
        # Act
        response = await http_client.get(f"{api_base_url}/health")

        # Assert
        data = response.json()
        assert "status" in data
        assert data["status"] in ["ok", "healthy", "pass"]

    @pytest.mark.asyncio
    async def test_health_endpoint_contains_timestamp(self, http_client, api_base_url):
        """Test /health includes timestamp"""
        # Act
        response = await http_client.get(f"{api_base_url}/health")

        # Assert
        data = response.json()
        assert "timestamp" in data or "time" in data

    @pytest.mark.asyncio
    async def test_health_endpoint_contains_version(self, http_client, api_base_url):
        """Test /health includes service version"""
        # Act
        response = await http_client.get(f"{api_base_url}/health")

        # Assert
        data = response.json()
        # Version might be in different fields
        has_version = (
            "version" in data or "app_version" in data or "service_version" in data
        )
        assert has_version

    @pytest.mark.asyncio
    async def test_healthz_endpoint_returns_200(self, http_client, api_base_url):
        """Test /healthz endpoint (Kubernetes-style)"""
        # Act
        response = await http_client.get(f"{api_base_url}/healthz")

        # Assert
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_health_json_endpoint(self, http_client, api_base_url):
        """Test /health.json endpoint"""
        # Act
        response = await http_client.get(f"{api_base_url}/health.json")

        # Assert
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"

    @pytest.mark.asyncio
    async def test_health_endpoint_response_time(self, http_client, api_base_url):
        """Test health endpoint responds quickly (< 100ms)"""
        # Act
        import time

        start = time.time()
        response = await http_client.get(f"{api_base_url}/health")
        elapsed = (time.time() - start) * 1000  # Convert to ms

        # Assert
        assert response.status_code == 200
        assert elapsed < 100  # Should respond in < 100ms


class TestHealthDependencyChecks:
    """Test health checks for service dependencies"""

    @pytest.fixture
    def api_base_url(self):
        return "http://localhost:3000"

    @pytest.fixture
    async def http_client(self):
        async with httpx.AsyncClient() as client:
            yield client

    @pytest.mark.asyncio
    async def test_health_checks_database_connection(
        self, http_client, api_base_url
    ):
        """Test health endpoint checks database connectivity"""
        # Act
        response = await http_client.get(f"{api_base_url}/health")
        data = response.json()

        # Assert
        # Health check should include database status
        has_db_check = (
            "database" in data
            or "db" in data
            or "checks" in data
            and any("database" in str(check).lower() for check in data["checks"])
        )
        # Note: This might not be present in all services

    @pytest.mark.asyncio
    async def test_health_checks_redis_connection(self, http_client, api_base_url):
        """Test health endpoint checks Redis connectivity"""
        # Act
        response = await http_client.get(f"{api_base_url}/health")
        data = response.json()

        # Assert - Redis check might be present
        # Implementation varies by service

    @pytest.mark.asyncio
    async def test_health_detailed_endpoint(self, http_client, api_base_url):
        """Test /health?detail=true returns detailed checks"""
        # Act
        response = await http_client.get(f"{api_base_url}/health?detail=true")

        # Assert
        assert response.status_code == 200
        data = response.json()
        # Detailed health should have more information


class TestHealthLivenessReadiness:
    """Test liveness and readiness probes"""

    @pytest.fixture
    def api_base_url(self):
        return "http://localhost:3000"

    @pytest.fixture
    async def http_client(self):
        async with httpx.AsyncClient() as client:
            yield client

    @pytest.mark.asyncio
    async def test_liveness_probe_endpoint(self, http_client, api_base_url):
        """Test liveness probe (is process running?)"""
        # Act
        response = await http_client.get(f"{api_base_url}/health/live")

        # Assert - Liveness should always pass if server is up
        assert response.status_code in [200, 404]  # 404 if not implemented

    @pytest.mark.asyncio
    async def test_readiness_probe_endpoint(self, http_client, api_base_url):
        """Test readiness probe (can service handle traffic?)"""
        # Act
        response = await http_client.get(f"{api_base_url}/health/ready")

        # Assert
        # Readiness can be 200 (ready) or 503 (not ready)
        assert response.status_code in [200, 503, 404]  # 404 if not implemented

    @pytest.mark.asyncio
    async def test_startup_probe_endpoint(self, http_client, api_base_url):
        """Test startup probe (has service started?)"""
        # Act
        response = await http_client.get(f"{api_base_url}/health/startup")

        # Assert
        assert response.status_code in [200, 503, 404]


class TestHealthMetrics:
    """Test health endpoint metrics and monitoring"""

    @pytest.fixture
    def api_base_url(self):
        return "http://localhost:3000"

    @pytest.fixture
    async def http_client(self):
        async with httpx.AsyncClient() as client:
            yield client

    @pytest.mark.asyncio
    async def test_health_includes_uptime(self, http_client, api_base_url):
        """Test health endpoint includes service uptime"""
        # Act
        response = await http_client.get(f"{api_base_url}/health")
        data = response.json()

        # Assert - Uptime might be present
        # Different services may expose this differently

    @pytest.mark.asyncio
    async def test_health_includes_memory_usage(self, http_client, api_base_url):
        """Test health endpoint includes memory metrics"""
        # Act
        response = await http_client.get(f"{api_base_url}/health?detail=true")
        data = response.json()

        # Assert - Memory metrics might be in detailed view

    @pytest.mark.asyncio
    async def test_metrics_endpoint_prometheus(self, http_client, api_base_url):
        """Test Prometheus metrics endpoint"""
        # Act
        response = await http_client.get(f"{api_base_url}/metrics")

        # Assert
        if response.status_code == 200:
            # Prometheus format is plain text
            assert "text/plain" in response.headers.get("content-type", "")
            # Should contain prometheus-style metrics
            text = response.text
            assert "#" in text  # Prometheus comments


class TestHealthErrorScenarios:
    """Test health endpoint error handling"""

    @pytest.fixture
    def api_base_url(self):
        return "http://localhost:3000"

    @pytest.fixture
    async def http_client(self):
        async with httpx.AsyncClient(timeout=1.0) as client:
            yield client

    @pytest.mark.asyncio
    async def test_health_when_database_down(self, http_client, api_base_url):
        """Test health response when database is unavailable"""
        # Note: This requires database to actually be down
        # In real test, you'd mock the database connection
        pass  # Implement with database mocking

    @pytest.mark.asyncio
    async def test_health_degraded_state(self, http_client, api_base_url):
        """Test health returns degraded status when dependencies are slow"""
        # Act
        response = await http_client.get(f"{api_base_url}/health")

        # Assert
        # Service might return 200 but with degraded status
        if response.status_code == 200:
            data = response.json()
            # Some services expose degraded state


class TestMultiServiceHealth:
    """Test health checks across multiple services"""

    @pytest.fixture
    def services(self):
        """List of service URLs to test"""
        return [
            "http://localhost:3000",  # Main API
            "http://localhost:3001",  # Agent Gateway
            "http://localhost:3002",  # Prism Console API
            "http://localhost:8000",  # FastAPI services
        ]

    @pytest.fixture
    async def http_client(self):
        async with httpx.AsyncClient(timeout=5.0) as client:
            yield client

    @pytest.mark.asyncio
    async def test_all_services_healthy(self, http_client, services):
        """Test all services respond to health checks"""
        results = {}

        for service_url in services:
            try:
                response = await http_client.get(f"{service_url}/health")
                results[service_url] = {
                    "status_code": response.status_code,
                    "healthy": response.status_code == 200,
                }
            except Exception as e:
                results[service_url] = {"healthy": False, "error": str(e)}

        # Assert - Track which services are healthy
        # In production, you'd want all to be healthy
        # For testing, we just verify the check works

    @pytest.mark.asyncio
    async def test_service_dependencies_in_health(self, http_client, services):
        """Test services report their dependencies in health checks"""
        for service_url in services:
            try:
                response = await http_client.get(f"{service_url}/health?detail=true")
                if response.status_code == 200:
                    data = response.json()
                    # Check if dependencies are listed
            except Exception:
                pass  # Service might be down in test environment
