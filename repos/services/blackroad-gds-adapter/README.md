# BlackRoad Ground Station Adapter

Production-grade ground station adapter for the Lucidia F´ flight software bridge. Provides secure, authenticated communication between ground control and satellite systems.

## Features

- **Secure Message Signing**: RSA-PSS-SHA256 signatures for all telemetry
- **Signature Verification**: Validates incoming commands with replay protection
- **ZeroMQ Integration**: High-performance IPC communication with F´ bridge
- **TLS/SSL Support**: Encrypted WebSocket connections to mission control
- **Async Architecture**: Concurrent telemetry subscription and command processing
- **Production Ready**: Comprehensive error handling, logging, and retry logic

## Architecture

```
┌─────────────────┐         WebSocket/TLS         ┌──────────────┐
│  Mission Control│◄─────────────────────────────►│ GDS Adapter  │
│   (Cloud)       │  Signed telemetry & commands  │              │
└─────────────────┘                                └──────┬───────┘
                                                          │ ZeroMQ/IPC
                                                          │
                                                   ┌──────▼───────┐
                                                   │ F´ Bridge    │
                                                   │ (lucidia)    │
                                                   └──────────────┘
```

## Installation

```bash
cd services/blackroad-gds-adapter
pip install -r requirements.txt
```

## Configuration

### Environment Variables

- `WS_URL`: WebSocket URL for mission control (default: `wss://mission-control.blackroad.local/gds`)
- `BRIDGE_ENDPOINT`: ZeroMQ endpoint for F´ bridge (default: `ipc:///var/run/lucidia_bridge.sock`)

### Certificate Paths

Configure TLS certificates in `/etc/blackroad/`:

- `ca.pem`: Certificate authority for mission control
- `client.pem`: Client certificate for authentication
- `client.key`: Client private key
- `signing.key`: RSA private key for message signing (auto-generated if missing)

## Usage

### Running the Adapter

```bash
python main.py
```

The adapter will:
1. Load or generate signing keys
2. Connect to the F´ bridge via ZeroMQ
3. Establish authenticated WebSocket connection to mission control
4. Concurrently handle bidirectional message flow

### Telemetry Flow

1. Adapter subscribes to all telemetry topics from F´ bridge
2. Each telemetry message is signed with RSA-PSS-SHA256
3. Signed envelope is sent over WebSocket to mission control
4. Timestamp added for replay attack prevention

### Command Flow

1. Mission control sends signed command over WebSocket
2. Adapter verifies signature and timestamp
3. Validated command is submitted to F´ bridge
4. Bridge executes command sequence

## Security

### Message Signing

All outgoing telemetry messages are signed using RSA-PSS with SHA256:

```python
envelope = {
    'data': {...},  # Original telemetry
    'signature': '...',  # Hex-encoded RSA signature
    'signature_algorithm': 'RSA-PSS-SHA256',
    'timestamp': 1234567890.0  # Unix timestamp
}
```

### Signature Verification

Incoming commands are verified:
- Signature must match message content
- Timestamp must be within 5-minute window
- Protects against replay attacks and tampering

### Key Management

- RSA keys are 2048-bit minimum
- Private keys stored in PEM format
- Auto-generation on first run if keys missing
- Keys should be backed up and secured

## API Reference

### `sign(msg: str) -> str`

Signs a telemetry message and returns a JSON envelope.

**Parameters:**
- `msg`: JSON string containing telemetry data

**Returns:**
- JSON string with signed envelope

**Raises:**
- `ValueError`: Invalid JSON message
- `RuntimeError`: Signing failed

### `verify_and_parse(msg: str) -> Dict[str, Any]`

Verifies signature and extracts command data.

**Parameters:**
- `msg`: JSON string containing signed envelope

**Returns:**
- Parsed command data dictionary

**Raises:**
- `ValueError`: Invalid signature or expired timestamp
- `RuntimeError`: Verification failed

### `BridgeClient`

ZeroMQ client for F´ bridge communication.

**Methods:**
- `connect()`: Establish connections
- `subscribe(topics: List[str]) -> AsyncIterator[str]`: Subscribe to telemetry
- `submit(command: Dict[str, Any]) -> Dict[str, Any]`: Send command
- `close()`: Cleanup connections

## Development

### Running Tests

```bash
pytest tests/ -v
```

### Code Quality

```bash
# Type checking
mypy main.py bridge_client.py

# Linting
pylint main.py bridge_client.py

# Format
black main.py bridge_client.py
```

## Troubleshooting

### Connection Issues

**Problem**: `Failed to connect to bridge`

**Solutions:**
- Verify F´ bridge is running
- Check ZeroMQ endpoint path
- Ensure proper file permissions on IPC socket

### Signing Errors

**Problem**: `Failed to load signing key`

**Solutions:**
- Check `/etc/blackroad/` directory permissions
- Verify PEM file format
- Regenerate keys if corrupted

### Verification Failures

**Problem**: `Invalid signature`

**Solutions:**
- Ensure both sides use same signing key
- Check for clock skew (NTP synchronization)
- Verify message wasn't modified in transit

## Production Deployment

### Systemd Service

Create `/etc/systemd/system/blackroad-gds-adapter.service`:

```ini
[Unit]
Description=BlackRoad Ground Station Adapter
After=network.target lucidia-bridge.service
Requires=lucidia-bridge.service

[Service]
Type=simple
User=blackroad
Group=blackroad
WorkingDirectory=/opt/blackroad/gds-adapter
ExecStart=/usr/bin/python3 main.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable blackroad-gds-adapter
sudo systemctl start blackroad-gds-adapter
sudo systemctl status blackroad-gds-adapter
```

### Monitoring

View logs:

```bash
journalctl -u blackroad-gds-adapter -f
```

Check metrics (if Prometheus client enabled):

```bash
curl http://localhost:8000/metrics
```

## License

Copyright 2025 BlackRoad. All rights reserved.

## Support

For issues and questions:
- File issues: https://github.com/blackboxprogramming/blackroad-prism-console/issues
- Documentation: https://docs.blackroad.dev/gds-adapter
- Security: security@blackroad.dev
