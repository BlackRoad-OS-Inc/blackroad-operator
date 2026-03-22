"""
Unit tests for JWT authentication flows

Tests JWT token generation, validation, and refresh logic
"""
import pytest
import jwt
import time
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock


class TestJWTTokenGeneration:
    """Test JWT token creation and encoding"""

    @pytest.fixture
    def jwt_config(self):
        """Fixture providing JWT configuration"""
        return {
            "secret_key": "test-secret-key-do-not-use-in-production",
            "algorithm": "HS256",
            "access_token_expire_minutes": 30,
            "refresh_token_expire_days": 7,
        }

    @pytest.fixture
    def user_payload(self):
        """Fixture providing sample user data"""
        return {
            "user_id": "user-123",
            "email": "test@blackroad.io",
            "roles": ["user", "admin"],
            "agent_id": "CECILIA-7C3E-SPECTRUM-9B4F",
        }

    def test_generate_access_token_success(self, jwt_config, user_payload):
        """Test successful access token generation"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        expire_minutes = jwt_config["access_token_expire_minutes"]

        # Act
        payload = user_payload.copy()
        expire = datetime.utcnow() + timedelta(minutes=expire_minutes)
        payload["exp"] = expire
        payload["type"] = "access"

        token = jwt.encode(payload, secret, algorithm=algorithm)

        # Assert
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

        # Verify token can be decoded
        decoded = jwt.decode(token, secret, algorithms=[algorithm])
        assert decoded["user_id"] == user_payload["user_id"]
        assert decoded["email"] == user_payload["email"]
        assert decoded["type"] == "access"

    def test_generate_refresh_token_success(self, jwt_config, user_payload):
        """Test successful refresh token generation"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        expire_days = jwt_config["refresh_token_expire_days"]

        # Act
        payload = {"user_id": user_payload["user_id"], "type": "refresh"}
        expire = datetime.utcnow() + timedelta(days=expire_days)
        payload["exp"] = expire

        token = jwt.encode(payload, secret, algorithm=algorithm)

        # Assert
        assert token is not None
        decoded = jwt.decode(token, secret, algorithms=[algorithm])
        assert decoded["user_id"] == user_payload["user_id"]
        assert decoded["type"] == "refresh"

    def test_token_includes_expiration(self, jwt_config, user_payload):
        """Test that tokens include proper expiration timestamp"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        expire_minutes = 30

        # Act
        payload = user_payload.copy()
        expire_time = datetime.utcnow() + timedelta(minutes=expire_minutes)
        payload["exp"] = expire_time
        payload["type"] = "access"

        token = jwt.encode(payload, secret, algorithm=algorithm)
        decoded = jwt.decode(token, secret, algorithms=[algorithm])

        # Assert
        assert "exp" in decoded
        exp_datetime = datetime.fromtimestamp(decoded["exp"])
        time_diff = (exp_datetime - datetime.utcnow()).total_seconds()
        assert 1700 < time_diff < 1900  # Should be ~30 minutes (1800 seconds)

    def test_token_includes_issued_at(self, jwt_config, user_payload):
        """Test that tokens include issued-at timestamp"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]

        # Act
        payload = user_payload.copy()
        payload["iat"] = datetime.utcnow()
        payload["exp"] = datetime.utcnow() + timedelta(minutes=30)
        payload["type"] = "access"

        token = jwt.encode(payload, secret, algorithm=algorithm)
        decoded = jwt.decode(token, secret, algorithms=[algorithm])

        # Assert
        assert "iat" in decoded

    def test_token_with_custom_claims(self, jwt_config):
        """Test token generation with custom claims"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        custom_payload = {
            "user_id": "custom-user",
            "permissions": ["read:agents", "write:tasks"],
            "tenant_id": "org-456",
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }

        # Act
        token = jwt.encode(custom_payload, secret, algorithm=algorithm)
        decoded = jwt.decode(token, secret, algorithms=[algorithm])

        # Assert
        assert decoded["permissions"] == ["read:agents", "write:tasks"]
        assert decoded["tenant_id"] == "org-456"


class TestJWTTokenValidation:
    """Test JWT token validation and verification"""

    @pytest.fixture
    def jwt_config(self):
        return {
            "secret_key": "test-secret-key",
            "algorithm": "HS256",
        }

    def test_validate_token_success(self, jwt_config):
        """Test successful token validation"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        payload = {
            "user_id": "user-123",
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }
        token = jwt.encode(payload, secret, algorithm=algorithm)

        # Act
        decoded = jwt.decode(token, secret, algorithms=[algorithm])

        # Assert
        assert decoded["user_id"] == "user-123"

    def test_validate_token_expired(self, jwt_config):
        """Test validation fails for expired token"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        payload = {
            "user_id": "user-123",
            "exp": datetime.utcnow() - timedelta(minutes=5),  # Expired 5 minutes ago
        }
        token = jwt.encode(payload, secret, algorithm=algorithm)

        # Act & Assert
        with pytest.raises(jwt.ExpiredSignatureError):
            jwt.decode(token, secret, algorithms=[algorithm])

    def test_validate_token_invalid_signature(self, jwt_config):
        """Test validation fails for invalid signature"""
        # Arrange
        correct_secret = jwt_config["secret_key"]
        wrong_secret = "wrong-secret"
        algorithm = jwt_config["algorithm"]
        payload = {
            "user_id": "user-123",
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }
        token = jwt.encode(payload, wrong_secret, algorithm=algorithm)

        # Act & Assert
        with pytest.raises(jwt.InvalidSignatureError):
            jwt.decode(token, correct_secret, algorithms=[algorithm])

    def test_validate_token_missing_required_claims(self, jwt_config):
        """Test validation with missing required claims"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        payload = {
            "exp": datetime.utcnow() + timedelta(minutes=30),
            # Missing user_id
        }
        token = jwt.encode(payload, secret, algorithm=algorithm)

        # Act
        decoded = jwt.decode(token, secret, algorithms=[algorithm])

        # Assert
        assert "user_id" not in decoded  # Should decode but missing claim

    def test_validate_token_malformed(self, jwt_config):
        """Test validation fails for malformed token"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        malformed_token = "this.is.not.a.valid.jwt.token"

        # Act & Assert
        with pytest.raises(jwt.DecodeError):
            jwt.decode(malformed_token, secret, algorithms=[algorithm])

    def test_validate_token_algorithm_mismatch(self, jwt_config):
        """Test validation fails when algorithm doesn't match"""
        # Arrange
        secret = jwt_config["secret_key"]
        payload = {
            "user_id": "user-123",
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }
        token = jwt.encode(payload, secret, algorithm="HS256")

        # Act & Assert
        with pytest.raises(jwt.InvalidAlgorithmError):
            jwt.decode(token, secret, algorithms=["HS512"])


class TestJWTTokenRefresh:
    """Test JWT token refresh flows"""

    @pytest.fixture
    def jwt_config(self):
        return {
            "secret_key": "test-secret-key",
            "algorithm": "HS256",
            "access_token_expire_minutes": 30,
            "refresh_token_expire_days": 7,
        }

    def test_refresh_token_generates_new_access_token(self, jwt_config):
        """Test refresh token can generate new access token"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]

        refresh_payload = {
            "user_id": "user-123",
            "type": "refresh",
            "exp": datetime.utcnow() + timedelta(days=7),
        }
        refresh_token = jwt.encode(refresh_payload, secret, algorithm=algorithm)

        # Act - Simulate refresh flow
        decoded_refresh = jwt.decode(refresh_token, secret, algorithms=[algorithm])
        assert decoded_refresh["type"] == "refresh"

        # Generate new access token from refresh
        new_access_payload = {
            "user_id": decoded_refresh["user_id"],
            "type": "access",
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }
        new_access_token = jwt.encode(new_access_payload, secret, algorithm=algorithm)

        # Assert
        decoded_access = jwt.decode(new_access_token, secret, algorithms=[algorithm])
        assert decoded_access["user_id"] == "user-123"
        assert decoded_access["type"] == "access"

    def test_refresh_token_cannot_be_used_as_access_token(self, jwt_config):
        """Test refresh tokens are properly typed and distinguishable"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]

        refresh_payload = {
            "user_id": "user-123",
            "type": "refresh",
            "exp": datetime.utcnow() + timedelta(days=7),
        }
        refresh_token = jwt.encode(refresh_payload, secret, algorithm=algorithm)

        # Act
        decoded = jwt.decode(refresh_token, secret, algorithms=[algorithm])

        # Assert - Application logic should reject if type != 'access'
        assert decoded["type"] == "refresh"
        assert decoded["type"] != "access"

    def test_expired_refresh_token_cannot_generate_access_token(self, jwt_config):
        """Test expired refresh token cannot be used"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]

        refresh_payload = {
            "user_id": "user-123",
            "type": "refresh",
            "exp": datetime.utcnow() - timedelta(days=1),  # Expired
        }
        refresh_token = jwt.encode(refresh_payload, secret, algorithm=algorithm)

        # Act & Assert
        with pytest.raises(jwt.ExpiredSignatureError):
            jwt.decode(refresh_token, secret, algorithms=[algorithm])


class TestJWTSecurityScenarios:
    """Test security scenarios and edge cases"""

    @pytest.fixture
    def jwt_config(self):
        return {
            "secret_key": "test-secret-key",
            "algorithm": "HS256",
        }

    def test_token_with_nbf_not_yet_valid(self, jwt_config):
        """Test token with 'not before' claim in future"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        payload = {
            "user_id": "user-123",
            "nbf": datetime.utcnow() + timedelta(minutes=10),  # Valid in 10 minutes
            "exp": datetime.utcnow() + timedelta(hours=1),
        }
        token = jwt.encode(payload, secret, algorithm=algorithm)

        # Act & Assert
        with pytest.raises(jwt.ImmatureSignatureError):
            jwt.decode(token, secret, algorithms=[algorithm])

    def test_token_audience_claim_validation(self, jwt_config):
        """Test audience claim validation"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        payload = {
            "user_id": "user-123",
            "aud": "blackroad-api",
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }
        token = jwt.encode(payload, secret, algorithm=algorithm)

        # Act - Decode with correct audience
        decoded = jwt.decode(
            token, secret, algorithms=[algorithm], audience="blackroad-api"
        )

        # Assert
        assert decoded["aud"] == "blackroad-api"

        # Act & Assert - Decode with wrong audience should fail
        with pytest.raises(jwt.InvalidAudienceError):
            jwt.decode(
                token, secret, algorithms=[algorithm], audience="wrong-audience"
            )

    def test_token_issuer_claim_validation(self, jwt_config):
        """Test issuer claim validation"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        payload = {
            "user_id": "user-123",
            "iss": "blackroad.io",
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }
        token = jwt.encode(payload, secret, algorithm=algorithm)

        # Act - Decode with correct issuer
        decoded = jwt.decode(
            token, secret, algorithms=[algorithm], issuer="blackroad.io"
        )

        # Assert
        assert decoded["iss"] == "blackroad.io"

        # Act & Assert - Wrong issuer should fail
        with pytest.raises(jwt.InvalidIssuerError):
            jwt.decode(token, secret, algorithms=[algorithm], issuer="wrong-issuer")

    def test_none_algorithm_attack_prevention(self, jwt_config):
        """Test prevention of 'none' algorithm attack"""
        # Arrange
        secret = jwt_config["secret_key"]
        payload = {
            "user_id": "user-123",
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }

        # Attacker tries to use 'none' algorithm
        malicious_token = jwt.encode(payload, None, algorithm="none")

        # Act & Assert - Should reject 'none' algorithm
        with pytest.raises(jwt.DecodeError):
            jwt.decode(malicious_token, secret, algorithms=["HS256"])

    def test_token_tampering_detection(self, jwt_config):
        """Test that tampered tokens are detected"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        payload = {
            "user_id": "user-123",
            "roles": ["user"],
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }
        token = jwt.encode(payload, secret, algorithm=algorithm)

        # Act - Tamper with token (modify payload portion)
        parts = token.split(".")
        # Decode payload, modify it, re-encode
        import base64
        import json

        tampered_payload = base64.urlsafe_b64decode(parts[1] + "==")
        tampered_data = json.loads(tampered_payload)
        tampered_data["roles"] = ["admin"]  # Escalate privileges

        tampered_payload_encoded = base64.urlsafe_b64encode(
            json.dumps(tampered_data).encode()
        ).decode().rstrip("=")

        tampered_token = f"{parts[0]}.{tampered_payload_encoded}.{parts[2]}"

        # Assert - Tampered token should fail signature verification
        with pytest.raises(jwt.InvalidSignatureError):
            jwt.decode(tampered_token, secret, algorithms=[algorithm])


class TestJWTRoleBasedAccess:
    """Test role-based access control with JWT"""

    @pytest.fixture
    def jwt_config(self):
        return {
            "secret_key": "test-secret-key",
            "algorithm": "HS256",
        }

    def test_token_with_single_role(self, jwt_config):
        """Test token with single role"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        payload = {
            "user_id": "user-123",
            "roles": ["user"],
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }

        # Act
        token = jwt.encode(payload, secret, algorithm=algorithm)
        decoded = jwt.decode(token, secret, algorithms=[algorithm])

        # Assert
        assert "user" in decoded["roles"]
        assert len(decoded["roles"]) == 1

    def test_token_with_multiple_roles(self, jwt_config):
        """Test token with multiple roles"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        payload = {
            "user_id": "user-123",
            "roles": ["user", "admin", "agent_operator"],
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }

        # Act
        token = jwt.encode(payload, secret, algorithm=algorithm)
        decoded = jwt.decode(token, secret, algorithms=[algorithm])

        # Assert
        assert "user" in decoded["roles"]
        assert "admin" in decoded["roles"]
        assert "agent_operator" in decoded["roles"]

    def test_token_with_permissions(self, jwt_config):
        """Test token with granular permissions"""
        # Arrange
        secret = jwt_config["secret_key"]
        algorithm = jwt_config["algorithm"]
        payload = {
            "user_id": "user-123",
            "permissions": [
                "read:agents",
                "write:agents",
                "spawn:agents",
                "read:tasks",
                "write:tasks",
            ],
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }

        # Act
        token = jwt.encode(payload, secret, algorithm=algorithm)
        decoded = jwt.decode(token, secret, algorithms=[algorithm])

        # Assert
        assert "spawn:agents" in decoded["permissions"]
        assert "write:tasks" in decoded["permissions"]
