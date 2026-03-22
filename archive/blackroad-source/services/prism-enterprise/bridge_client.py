"""
ZeroMQ-based client for lucidia-fprime-bridge.

This client provides async interface for subscribing to telemetry
and submitting commands to the F´ flight software bridge.
"""
import asyncio
import json
import logging
from typing import Any, AsyncIterator, Dict, List

import zmq
import zmq.asyncio

logger = logging.getLogger(__name__)


class BridgeClient:
    """
    ZeroMQ client for lucidia-fprime-bridge.

    Supports:
    - Subscribing to telemetry channels via PUB/SUB pattern
    - Submitting commands via REQ/REP pattern
    """

    def __init__(self, endpoint: str, command_endpoint: str = None):
        """
        Initialize bridge client.

        Args:
            endpoint: ZeroMQ endpoint for telemetry subscription (e.g., "ipc:///var/run/lucidia_bridge.sock")
            command_endpoint: Optional separate endpoint for commands (defaults to endpoint)
        """
        self.endpoint = endpoint
        self.command_endpoint = command_endpoint or endpoint.replace('.sock', '_cmd.sock')
        self.context = zmq.asyncio.Context()
        self.sub_socket = None
        self.cmd_socket = None
        self._running = False

        logger.info(f"Initializing BridgeClient with telemetry={endpoint}, commands={self.command_endpoint}")

    async def connect(self):
        """Establish connections to the bridge."""
        try:
            # Create subscriber socket for telemetry
            self.sub_socket = self.context.socket(zmq.SUB)
            self.sub_socket.connect(self.endpoint)
            logger.info(f"Connected telemetry subscriber to {self.endpoint}")

            # Create request socket for commands
            self.cmd_socket = self.context.socket(zmq.REQ)
            self.cmd_socket.connect(self.command_endpoint)
            logger.info(f"Connected command requester to {self.command_endpoint}")

            self._running = True

        except Exception as e:
            logger.error(f"Failed to connect to bridge: {e}")
            await self.close()
            raise

    async def close(self):
        """Close all sockets and cleanup."""
        self._running = False

        if self.sub_socket:
            self.sub_socket.close()
            self.sub_socket = None

        if self.cmd_socket:
            self.cmd_socket.close()
            self.cmd_socket = None

        if self.context:
            self.context.term()

        logger.info("Bridge client closed")

    async def subscribe(self, topics: List[str]) -> AsyncIterator[str]:
        """
        Subscribe to telemetry topics and yield messages.

        Args:
            topics: List of topics to subscribe to (use ["*"] for all)

        Yields:
            JSON-encoded telemetry messages

        Raises:
            RuntimeError: If not connected
        """
        if not self.sub_socket:
            await self.connect()

        try:
            # Subscribe to requested topics
            for topic in topics:
                if topic == "*":
                    # Subscribe to all messages
                    self.sub_socket.setsockopt(zmq.SUBSCRIBE, b"")
                    logger.info("Subscribed to all telemetry topics")
                else:
                    # Subscribe to specific topic
                    self.sub_socket.setsockopt_string(zmq.SUBSCRIBE, topic)
                    logger.info(f"Subscribed to telemetry topic: {topic}")

            # Receive messages
            while self._running:
                try:
                    # Receive multipart message (topic, data)
                    parts = await self.sub_socket.recv_multipart()

                    if len(parts) >= 2:
                        topic = parts[0].decode('utf-8')
                        data = parts[1].decode('utf-8')

                        # Validate JSON
                        try:
                            json.loads(data)  # Validate it's valid JSON
                            yield data
                        except json.JSONDecodeError as e:
                            logger.error(f"Received invalid JSON from topic {topic}: {e}")
                            continue

                    elif len(parts) == 1:
                        # Single-part message (no topic prefix)
                        data = parts[0].decode('utf-8')
                        try:
                            json.loads(data)
                            yield data
                        except json.JSONDecodeError as e:
                            logger.error(f"Received invalid JSON: {e}")
                            continue

                except zmq.Again:
                    # Non-blocking receive timeout
                    await asyncio.sleep(0.01)
                    continue

        except Exception as e:
            logger.error(f"Error in subscription loop: {e}")
            raise
        finally:
            await self.close()

    async def submit(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submit a command to the bridge.

        Args:
            command: Command dictionary to submit

        Returns:
            Response from the bridge

        Raises:
            RuntimeError: If not connected or command fails
            ValueError: If command is invalid
        """
        if not self.cmd_socket:
            await self.connect()

        try:
            # Validate command structure
            if not isinstance(command, dict):
                raise ValueError("Command must be a dictionary")

            if 'command' not in command:
                raise ValueError("Command must have 'command' field")

            # Serialize command
            cmd_json = json.dumps(command)

            # Send command
            await self.cmd_socket.send_string(cmd_json)
            logger.info(f"Submitted command: {command.get('command', 'unknown')}")

            # Wait for response with timeout
            if await self.cmd_socket.poll(timeout=5000):  # 5 second timeout
                response = await self.cmd_socket.recv_string()

                # Parse response
                try:
                    result = json.loads(response)
                    status = result.get('status', 'unknown')

                    if status == 'error':
                        error_msg = result.get('error', 'Unknown error')
                        logger.error(f"Command failed: {error_msg}")
                        raise RuntimeError(f"Command failed: {error_msg}")

                    logger.info(f"Command completed with status: {status}")
                    return result

                except json.JSONDecodeError as e:
                    logger.error(f"Invalid response from bridge: {e}")
                    raise RuntimeError(f"Invalid response from bridge: {e}")
            else:
                logger.error("Command timeout - no response from bridge")
                raise RuntimeError("Command timeout")

        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Failed to submit command: {e}")
            raise RuntimeError(f"Failed to submit command: {e}")

    async def __aenter__(self):
        """Async context manager entry."""
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()
