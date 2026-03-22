#!/usr/bin/env python3
"""BlackRoad MQ Client Library"""

import socket
import json
from typing import Any, Optional, Callable
import time

class MQClient:
    def __init__(self, host: str = 'localhost', port: int = 5672):
        self.host = host
        self.port = port
        self.sock = None

    def connect(self):
        """Connect to MQ server"""
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((self.host, self.port))

    def close(self):
        """Close connection"""
        if self.sock:
            self.sock.close()

    def _send(self, cmd: dict) -> dict:
        """Send command and get response"""
        self.sock.send(json.dumps(cmd).encode())
        response = self.sock.recv(8192)
        return json.loads(response.decode().strip())

    def declare_exchange(self, name: str, type: str = 'direct', durable: bool = True):
        return self._send({'cmd': 'declare_exchange', 'name': name, 'type': type, 'durable': durable})

    def declare_queue(self, name: str, durable: bool = True, **kwargs):
        return self._send({'cmd': 'declare_queue', 'name': name, 'durable': durable, **kwargs})

    def bind(self, queue: str, exchange: str, routing_key: str = ''):
        return self._send({'cmd': 'bind', 'queue': queue, 'exchange': exchange, 'routing_key': routing_key})

    def publish(self, body: Any, exchange: str = '', routing_key: str = '',
                headers: dict = None, persistent: bool = True, priority: int = 0):
        return self._send({
            'cmd': 'publish',
            'exchange': exchange,
            'routing_key': routing_key,
            'body': body,
            'headers': headers,
            'persistent': persistent,
            'priority': priority
        })

    def consume(self, queue: str, auto_ack: bool = True) -> Optional[dict]:
        result = self._send({'cmd': 'consume', 'queue': queue, 'auto_ack': auto_ack})
        return result.get('message')

    def ack(self, queue: str, message_id: str):
        return self._send({'cmd': 'ack', 'queue': queue, 'message_id': message_id})

    def nack(self, queue: str, message_id: str, requeue: bool = True):
        return self._send({'cmd': 'nack', 'queue': queue, 'message_id': message_id, 'requeue': requeue})

    def stats(self):
        return self._send({'cmd': 'stats'})

    def list_queues(self):
        return self._send({'cmd': 'list_queues'})

    def purge(self, queue: str):
        return self._send({'cmd': 'purge', 'queue': queue})


def basic_consume(host: str, queue: str, callback: Callable, auto_ack: bool = True):
    """Simple blocking consumer"""
    client = MQClient(host)
    client.connect()
    client.declare_queue(queue)

    print(f"Waiting for messages on {queue}...")
    while True:
        msg = client.consume(queue, auto_ack)
        if msg:
            callback(msg)
        else:
            time.sleep(0.1)


if __name__ == '__main__':
    # Test
    client = MQClient()
    client.connect()

    # Declare queue
    print(client.declare_queue('test-queue'))

    # Publish
    print(client.publish({'hello': 'world'}, routing_key='test-queue'))

    # Consume
    msg = client.consume('test-queue')
    print(f"Received: {msg}")

    print(client.stats())
    client.close()
