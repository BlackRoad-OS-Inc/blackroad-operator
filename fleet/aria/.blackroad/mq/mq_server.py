#!/usr/bin/env python3
"""
BlackRoad Message Queue - RabbitMQ/Kafka-lite
Features: Exchanges, queues, routing keys, persistent messages, consumer groups
"""

import asyncio
import json
import time
import logging
import uuid
import sqlite3
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Set, Callable, Any
from pathlib import Path
from enum import Enum
from collections import defaultdict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - MQ - %(message)s')
logger = logging.getLogger(__name__)

MQ_DIR = Path.home() / '.blackroad' / 'mq'
DB_FILE = MQ_DIR / 'data' / 'mq.db'

class ExchangeType(Enum):
    DIRECT = "direct"      # Route by exact routing key
    FANOUT = "fanout"      # Broadcast to all bound queues
    TOPIC = "topic"        # Route by pattern matching (*.logs, #.error)
    HEADERS = "headers"    # Route by message headers

class DeliveryMode(Enum):
    TRANSIENT = 1
    PERSISTENT = 2

@dataclass
class Message:
    id: str
    body: Any
    routing_key: str = ""
    headers: Dict = field(default_factory=dict)
    timestamp: float = 0
    delivery_mode: int = 1
    priority: int = 0
    expiration: Optional[float] = None
    redelivered: bool = False
    delivery_count: int = 0

    def to_dict(self):
        return {
            'id': self.id,
            'body': self.body,
            'routing_key': self.routing_key,
            'headers': self.headers,
            'timestamp': self.timestamp,
            'priority': self.priority
        }

@dataclass
class Queue:
    name: str
    durable: bool = True
    exclusive: bool = False
    auto_delete: bool = False
    max_length: int = 0  # 0 = unlimited
    message_ttl: int = 0  # 0 = no expiry
    dead_letter_exchange: str = ""
    messages: List[Message] = field(default_factory=list)
    consumers: Set[str] = field(default_factory=set)
    unacked: Dict[str, Message] = field(default_factory=dict)

@dataclass
class Exchange:
    name: str
    type: ExchangeType = ExchangeType.DIRECT
    durable: bool = True
    auto_delete: bool = False
    bindings: Dict[str, Set[str]] = field(default_factory=lambda: defaultdict(set))  # routing_key -> queues

@dataclass
class Consumer:
    id: str
    queue: str
    callback: Optional[Callable] = None
    auto_ack: bool = True
    prefetch_count: int = 1
    active: bool = True

class MessageQueue:
    def __init__(self):
        self.exchanges: Dict[str, Exchange] = {}
        self.queues: Dict[str, Queue] = {}
        self.consumers: Dict[str, Consumer] = {}
        self.consumer_connections: Dict[str, asyncio.StreamWriter] = {}
        self.stats = {
            'messages_published': 0,
            'messages_delivered': 0,
            'messages_acked': 0,
            'messages_rejected': 0
        }
        self._init_db()
        self._load_state()
        self._setup_defaults()

    def _init_db(self):
        """Initialize SQLite for persistent messages"""
        DB_FILE.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(DB_FILE))
        conn.execute('''CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            queue TEXT,
            body TEXT,
            routing_key TEXT,
            headers TEXT,
            timestamp REAL,
            priority INTEGER,
            delivery_count INTEGER DEFAULT 0
        )''')
        conn.execute('''CREATE INDEX IF NOT EXISTS idx_queue ON messages(queue)''')
        conn.commit()
        conn.close()

    def _load_state(self):
        """Load persistent messages from DB"""
        conn = sqlite3.connect(str(DB_FILE))
        cursor = conn.execute('SELECT * FROM messages ORDER BY priority DESC, timestamp ASC')
        for row in cursor:
            msg = Message(
                id=row[0],
                body=json.loads(row[2]),
                routing_key=row[3],
                headers=json.loads(row[4]),
                timestamp=row[5],
                priority=row[6],
                delivery_count=row[7]
            )
            queue_name = row[1]
            if queue_name not in self.queues:
                self.queues[queue_name] = Queue(name=queue_name)
            self.queues[queue_name].messages.append(msg)
        conn.close()
        logger.info(f"Loaded {sum(len(q.messages) for q in self.queues.values())} persistent messages")

    def _persist_message(self, queue: str, msg: Message):
        """Save message to DB"""
        conn = sqlite3.connect(str(DB_FILE))
        conn.execute('''INSERT OR REPLACE INTO messages VALUES (?,?,?,?,?,?,?,?)''',
            (msg.id, queue, json.dumps(msg.body), msg.routing_key,
             json.dumps(msg.headers), msg.timestamp, msg.priority, msg.delivery_count))
        conn.commit()
        conn.close()

    def _remove_message(self, msg_id: str):
        """Remove message from DB"""
        conn = sqlite3.connect(str(DB_FILE))
        conn.execute('DELETE FROM messages WHERE id = ?', (msg_id,))
        conn.commit()
        conn.close()

    def _setup_defaults(self):
        """Setup default exchanges"""
        # Default exchanges
        self.exchanges[''] = Exchange('', ExchangeType.DIRECT)  # Default exchange
        self.exchanges['amq.direct'] = Exchange('amq.direct', ExchangeType.DIRECT)
        self.exchanges['amq.fanout'] = Exchange('amq.fanout', ExchangeType.FANOUT)
        self.exchanges['amq.topic'] = Exchange('amq.topic', ExchangeType.TOPIC)

        # BlackRoad specific exchanges
        self.exchanges['blackroad.events'] = Exchange('blackroad.events', ExchangeType.TOPIC)
        self.exchanges['blackroad.tasks'] = Exchange('blackroad.tasks', ExchangeType.DIRECT)
        self.exchanges['blackroad.logs'] = Exchange('blackroad.logs', ExchangeType.FANOUT)

    def declare_exchange(self, name: str, type: str = "direct", durable: bool = True) -> Exchange:
        """Declare an exchange"""
        if name not in self.exchanges:
            self.exchanges[name] = Exchange(
                name=name,
                type=ExchangeType(type),
                durable=durable
            )
            logger.info(f"Exchange declared: {name} ({type})")
        return self.exchanges[name]

    def declare_queue(self, name: str, durable: bool = True, **kwargs) -> Queue:
        """Declare a queue"""
        if name not in self.queues:
            self.queues[name] = Queue(name=name, durable=durable, **kwargs)
            logger.info(f"Queue declared: {name}")
        return self.queues[name]

    def bind_queue(self, queue: str, exchange: str, routing_key: str = ""):
        """Bind queue to exchange with routing key"""
        if exchange not in self.exchanges:
            raise ValueError(f"Exchange not found: {exchange}")
        if queue not in self.queues:
            raise ValueError(f"Queue not found: {queue}")

        self.exchanges[exchange].bindings[routing_key].add(queue)
        logger.info(f"Bound {queue} to {exchange} with key '{routing_key}'")

    def _match_topic(self, pattern: str, routing_key: str) -> bool:
        """Match topic routing pattern (* = one word, # = zero or more words)"""
        pattern_parts = pattern.split('.')
        key_parts = routing_key.split('.')

        i, j = 0, 0
        while i < len(pattern_parts) and j < len(key_parts):
            if pattern_parts[i] == '#':
                if i == len(pattern_parts) - 1:
                    return True
                # Try to match rest of pattern
                for k in range(j, len(key_parts) + 1):
                    if self._match_topic('.'.join(pattern_parts[i+1:]), '.'.join(key_parts[k:])):
                        return True
                return False
            elif pattern_parts[i] == '*' or pattern_parts[i] == key_parts[j]:
                i += 1
                j += 1
            else:
                return False

        return i == len(pattern_parts) and j == len(key_parts)

    def publish(self, exchange: str, routing_key: str, body: Any,
                headers: Dict = None, persistent: bool = True, priority: int = 0) -> str:
        """Publish message to exchange"""
        msg = Message(
            id=str(uuid.uuid4()),
            body=body,
            routing_key=routing_key,
            headers=headers or {},
            timestamp=time.time(),
            delivery_mode=DeliveryMode.PERSISTENT.value if persistent else DeliveryMode.TRANSIENT.value,
            priority=priority
        )

        if exchange == '':
            # Default exchange - route directly to queue named by routing_key
            target_queues = {routing_key} if routing_key in self.queues else set()
        else:
            ex = self.exchanges.get(exchange)
            if not ex:
                raise ValueError(f"Exchange not found: {exchange}")

            target_queues = set()
            if ex.type == ExchangeType.FANOUT:
                # All bound queues
                for queues in ex.bindings.values():
                    target_queues.update(queues)
            elif ex.type == ExchangeType.DIRECT:
                # Exact routing key match
                target_queues = ex.bindings.get(routing_key, set())
            elif ex.type == ExchangeType.TOPIC:
                # Pattern matching
                for pattern, queues in ex.bindings.items():
                    if self._match_topic(pattern, routing_key):
                        target_queues.update(queues)

        # Deliver to queues
        for queue_name in target_queues:
            queue = self.queues.get(queue_name)
            if queue:
                # Check queue limits
                if queue.max_length and len(queue.messages) >= queue.max_length:
                    # Drop oldest or send to DLX
                    if queue.dead_letter_exchange:
                        old_msg = queue.messages.pop(0)
                        self.publish(queue.dead_letter_exchange, old_msg.routing_key, old_msg.body)
                    else:
                        queue.messages.pop(0)

                queue.messages.append(msg)
                if persistent:
                    self._persist_message(queue_name, msg)

        self.stats['messages_published'] += 1
        logger.debug(f"Published to {exchange}/{routing_key} -> {len(target_queues)} queues")
        return msg.id

    def consume(self, queue: str, consumer_id: str = None, auto_ack: bool = True) -> Optional[Message]:
        """Consume one message from queue"""
        q = self.queues.get(queue)
        if not q or not q.messages:
            return None

        # Get highest priority message
        q.messages.sort(key=lambda m: (-m.priority, m.timestamp))
        msg = q.messages.pop(0)
        msg.delivery_count += 1

        if not auto_ack:
            # Track unacked message
            q.unacked[msg.id] = msg
        else:
            self._remove_message(msg.id)
            self.stats['messages_acked'] += 1

        self.stats['messages_delivered'] += 1
        return msg

    def ack(self, queue: str, message_id: str):
        """Acknowledge message"""
        q = self.queues.get(queue)
        if q and message_id in q.unacked:
            del q.unacked[message_id]
            self._remove_message(message_id)
            self.stats['messages_acked'] += 1

    def nack(self, queue: str, message_id: str, requeue: bool = True):
        """Negative acknowledge - reject message"""
        q = self.queues.get(queue)
        if q and message_id in q.unacked:
            msg = q.unacked.pop(message_id)
            if requeue:
                msg.redelivered = True
                q.messages.append(msg)
            else:
                self._remove_message(message_id)
            self.stats['messages_rejected'] += 1

    def get_stats(self) -> dict:
        """Get queue statistics"""
        return {
            **self.stats,
            'exchanges': len(self.exchanges),
            'queues': {
                name: {
                    'messages': len(q.messages),
                    'consumers': len(q.consumers),
                    'unacked': len(q.unacked)
                }
                for name, q in self.queues.items()
            }
        }

    async def handle_client(self, reader, writer):
        """Handle AMQP-like client connection"""
        addr = writer.get_extra_info('peername')
        logger.info(f"Client connected: {addr}")

        consumer_id = str(uuid.uuid4())[:8]

        try:
            while True:
                data = await reader.read(8192)
                if not data:
                    break

                try:
                    request = json.loads(data.decode())
                    response = await self.process_command(request, consumer_id, writer)
                    writer.write(json.dumps(response).encode() + b'\n')
                    await writer.drain()
                except json.JSONDecodeError:
                    writer.write(b'{"error": "Invalid JSON"}\n')
                    await writer.drain()

        except Exception as e:
            logger.error(f"Client error: {e}")
        finally:
            # Cleanup consumer
            for q in self.queues.values():
                q.consumers.discard(consumer_id)
            if consumer_id in self.consumer_connections:
                del self.consumer_connections[consumer_id]
            writer.close()
            logger.info(f"Client disconnected: {addr}")

    async def process_command(self, request: dict, consumer_id: str, writer) -> dict:
        """Process client command"""
        cmd = request.get('cmd', '')

        if cmd == 'declare_exchange':
            ex = self.declare_exchange(
                request['name'],
                request.get('type', 'direct'),
                request.get('durable', True)
            )
            return {'status': 'ok', 'exchange': ex.name}

        elif cmd == 'declare_queue':
            q = self.declare_queue(
                request['name'],
                request.get('durable', True),
                max_length=request.get('max_length', 0),
                message_ttl=request.get('message_ttl', 0)
            )
            return {'status': 'ok', 'queue': q.name, 'messages': len(q.messages)}

        elif cmd == 'bind':
            self.bind_queue(
                request['queue'],
                request['exchange'],
                request.get('routing_key', '')
            )
            return {'status': 'ok'}

        elif cmd == 'publish':
            msg_id = self.publish(
                request.get('exchange', ''),
                request.get('routing_key', ''),
                request['body'],
                request.get('headers'),
                request.get('persistent', True),
                request.get('priority', 0)
            )
            return {'status': 'ok', 'message_id': msg_id}

        elif cmd == 'consume':
            queue = request['queue']
            auto_ack = request.get('auto_ack', True)

            # Register as consumer
            self.queues[queue].consumers.add(consumer_id)
            self.consumer_connections[consumer_id] = writer

            msg = self.consume(queue, consumer_id, auto_ack)
            if msg:
                return {'status': 'ok', 'message': msg.to_dict()}
            return {'status': 'ok', 'message': None}

        elif cmd == 'ack':
            self.ack(request['queue'], request['message_id'])
            return {'status': 'ok'}

        elif cmd == 'nack':
            self.nack(request['queue'], request['message_id'], request.get('requeue', True))
            return {'status': 'ok'}

        elif cmd == 'stats':
            return {'status': 'ok', 'stats': self.get_stats()}

        elif cmd == 'list_queues':
            return {'status': 'ok', 'queues': list(self.queues.keys())}

        elif cmd == 'list_exchanges':
            return {'status': 'ok', 'exchanges': list(self.exchanges.keys())}

        elif cmd == 'purge':
            queue = request['queue']
            if queue in self.queues:
                count = len(self.queues[queue].messages)
                self.queues[queue].messages.clear()
                return {'status': 'ok', 'purged': count}
            return {'error': 'Queue not found'}

        elif cmd == 'delete_queue':
            queue = request['queue']
            if queue in self.queues:
                del self.queues[queue]
                return {'status': 'ok'}
            return {'error': 'Queue not found'}

        return {'error': f'Unknown command: {cmd}'}

    async def api_handler(self, reader, writer):
        """HTTP Management API"""
        data = await reader.read(4096)
        request = data.decode()

        lines = request.split('\r\n')
        method, path, _ = lines[0].split(' ', 2)

        body = {}
        if '\r\n\r\n' in request:
            body_str = request.split('\r\n\r\n', 1)[1]
            if body_str:
                try:
                    body = json.loads(body_str)
                except:
                    pass

        response_body = ''
        status = '200 OK'

        if path == '/api/overview':
            response_body = json.dumps(self.get_stats(), indent=2)

        elif path == '/api/queues':
            response_body = json.dumps({
                name: {'messages': len(q.messages), 'consumers': len(q.consumers)}
                for name, q in self.queues.items()
            }, indent=2)

        elif path == '/api/exchanges':
            response_body = json.dumps({
                name: {'type': e.type.value, 'bindings': len(e.bindings)}
                for name, e in self.exchanges.items()
            }, indent=2)

        elif path.startswith('/api/queue/') and method == 'GET':
            queue_name = path.split('/')[3]
            if queue_name in self.queues:
                q = self.queues[queue_name]
                response_body = json.dumps({
                    'name': q.name,
                    'messages': len(q.messages),
                    'consumers': len(q.consumers),
                    'unacked': len(q.unacked)
                })
            else:
                status = '404 Not Found'
                response_body = '{"error": "Queue not found"}'

        else:
            status = '404 Not Found'
            response_body = '{"error": "Not found"}'

        response = f"HTTP/1.1 {status}\r\nContent-Type: application/json\r\nContent-Length: {len(response_body)}\r\n\r\n{response_body}"
        writer.write(response.encode())
        await writer.drain()
        writer.close()

    async def run(self, port: int = 5672, api_port: int = 5673):
        """Run MQ server"""
        # AMQP-like server
        mq_server = await asyncio.start_server(
            self.handle_client, '0.0.0.0', port
        )

        # Management API
        api_server = await asyncio.start_server(
            self.api_handler, '0.0.0.0', api_port
        )

        logger.info(f"Message Queue listening on port {port}")
        logger.info(f"Management API on port {api_port}")

        async with mq_server, api_server:
            await asyncio.gather(
                mq_server.serve_forever(),
                api_server.serve_forever()
            )

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5672
    api_port = int(sys.argv[2]) if len(sys.argv) > 2 else 5673

    mq = MessageQueue()
    asyncio.run(mq.run(port, api_port))
