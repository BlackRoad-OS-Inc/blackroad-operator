import asyncio
import json
import logging
import ssl
import time
from pathlib import Path
from typing import Any, Dict

import websockets
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.exceptions import InvalidSignature

from bridge_client import BridgeClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

CA_PATH = "/etc/blackroad/ca.pem"
CERT = "/etc/blackroad/client.pem"
KEY = "/etc/blackroad/client.key"
SIGNING_KEY_PATH = "/etc/blackroad/signing.key"
WS_URL = "wss://mission-control.blackroad.local/gds"

ssl_ctx = ssl.create_default_context(cafile=CA_PATH)
ssl_ctx.load_cert_chain(CERT, KEY)

# Load signing key at startup
_signing_key = None
_verification_key = None


def _load_signing_key():
    """Load the RSA private key for signing messages."""
    global _signing_key
    try:
        key_path = Path(SIGNING_KEY_PATH)
        if not key_path.exists():
            logger.warning(f"Signing key not found at {SIGNING_KEY_PATH}, generating new key")
            # Generate new key if not exists
            _signing_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048,
            )
            # Save the key
            key_path.parent.mkdir(parents=True, exist_ok=True)
            pem = _signing_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            )
            key_path.write_bytes(pem)
            logger.info(f"Generated new signing key at {SIGNING_KEY_PATH}")
        else:
            with open(key_path, 'rb') as f:
                _signing_key = serialization.load_pem_private_key(
                    f.read(),
                    password=None,
                )
            logger.info(f"Loaded signing key from {SIGNING_KEY_PATH}")
    except Exception as e:
        logger.error(f"Failed to load signing key: {e}")
        raise


def _get_public_key():
    """Get the public key for verification."""
    global _verification_key
    if _verification_key is None and _signing_key is not None:
        _verification_key = _signing_key.public_key()
    return _verification_key


def sign(msg: str) -> str:
    """
    Sign a telemetry message with RSA signature.

    Args:
        msg: The message to sign (JSON string)

    Returns:
        JSON string containing the message and signature

    Raises:
        ValueError: If message is invalid
        RuntimeError: If signing fails
    """
    if _signing_key is None:
        _load_signing_key()

    try:
        # Parse message to validate JSON
        data = json.loads(msg) if isinstance(msg, str) else msg

        # Add timestamp for replay protection
        data['timestamp'] = time.time()

        # Serialize message
        message_bytes = json.dumps(data, sort_keys=True).encode('utf-8')

        # Sign the message
        signature = _signing_key.sign(
            message_bytes,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )

        # Create signed envelope
        envelope = {
            'data': data,
            'signature': signature.hex(),
            'signature_algorithm': 'RSA-PSS-SHA256'
        }

        return json.dumps(envelope)

    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON message: {e}")
        raise ValueError(f"Invalid JSON message: {e}")
    except Exception as e:
        logger.error(f"Failed to sign message: {e}")
        raise RuntimeError(f"Failed to sign message: {e}")


def verify_and_parse(msg: str) -> Dict[str, Any]:
    """
    Verify signature and parse a command message.

    Args:
        msg: The signed message envelope (JSON string)

    Returns:
        Parsed command data

    Raises:
        ValueError: If message is invalid or signature verification fails
        RuntimeError: If verification process fails
    """
    try:
        # Parse envelope
        envelope = json.loads(msg) if isinstance(msg, str) else msg

        if not isinstance(envelope, dict):
            raise ValueError("Message must be a JSON object")

        # Extract components
        data = envelope.get('data')
        signature_hex = envelope.get('signature')
        algorithm = envelope.get('signature_algorithm')

        if not all([data, signature_hex, algorithm]):
            raise ValueError("Missing required fields: data, signature, signature_algorithm")

        if algorithm != 'RSA-PSS-SHA256':
            raise ValueError(f"Unsupported signature algorithm: {algorithm}")

        # Reconstruct message bytes
        message_bytes = json.dumps(data, sort_keys=True).encode('utf-8')
        signature = bytes.fromhex(signature_hex)

        # Verify signature
        public_key = _get_public_key()
        if public_key is None:
            raise RuntimeError("Public key not available")

        try:
            public_key.verify(
                signature,
                message_bytes,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
        except InvalidSignature:
            logger.error("Invalid signature detected")
            raise ValueError("Invalid signature")

        # Check timestamp for replay protection (5 minute window)
        timestamp = data.get('timestamp')
        if timestamp:
            age = time.time() - timestamp
            if age > 300:  # 5 minutes
                logger.warning(f"Message timestamp too old: {age} seconds")
                raise ValueError(f"Message timestamp too old: {age} seconds")
            if age < -60:  # Allow 1 minute clock skew
                logger.warning(f"Message timestamp in future: {age} seconds")
                raise ValueError(f"Message timestamp in future")

        logger.info(f"Successfully verified and parsed command")
        return data

    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON message: {e}")
        raise ValueError(f"Invalid JSON message: {e}")
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Failed to verify message: {e}")
        raise RuntimeError(f"Failed to verify message: {e}")

async def telemetry_task(ws, bridge):
    async for tlm in bridge.subscribe(["*"]):
        await ws.send(sign(tlm))

async def command_task(ws, bridge):
    async for msg in ws:
        cmd = verify_and_parse(msg)
        await bridge.submit(cmd)

async def main():
    bridge = BridgeClient("ipc:///var/run/lucidia_bridge.sock")
    async with websockets.connect(WS_URL, ssl=ssl_ctx) as ws:
        await asyncio.gather(
            telemetry_task(ws, bridge),
            command_task(ws, bridge),
        )

if __name__ == "__main__":
    asyncio.run(main())
