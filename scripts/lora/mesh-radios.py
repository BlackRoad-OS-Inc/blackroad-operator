#!/usr/bin/env python3
"""
BlackRoad Mesh Radio Fleet
Every protocol is a radio. Every connection is a node.

Physical radios: LoRa SX1262, ESP-NOW, BLE, WiFi
Software radios: HTTP, FTP, WebSocket, NATS, DNS, ICMP, SSH, MQTT, mDNS, CoAP, gRPC
"""

import asyncio
import json
import time
import struct
import socket
import hashlib
import threading
import os
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from ftplib import FTP
from io import BytesIO
import ssl

PINK = '\033[38;5;205m'
GREEN = '\033[38;5;82m'
BLUE = '\033[38;5;69m'
AMBER = '\033[38;5;214m'
VIOLET = '\033[38;5;135m'
RESET = '\033[0m'

# Every node in the mesh
FLEET = {
    'alexandria': '192.168.4.28',
    'alice':      '192.168.4.49',
    'cecilia':    '192.168.4.96',
    'aria':       '192.168.4.98',
    'lucidia':    '192.168.4.38',
    'octavia':    '192.168.4.101',
    'gematria':   '137.184.243.40',
}


def mesh_packet(src, payload, pkt_type='data', seq=0):
    """Standard BlackRoad mesh packet — works on any transport"""
    return json.dumps({
        'magic': 'BR',
        'v': 1,
        'type': pkt_type,
        'src': src,
        'ts': int(time.time()),
        'seq': seq,
        'ttl': 5,
        'hop': 0,
        'payload': payload,
        'hash': hashlib.sha256(payload.encode() if isinstance(payload, str) else payload).hexdigest()[:16]
    }).encode()


# ═══════════════════════════════════════════
# RADIO 1: HTTP Radio
# Meshes over plain HTTP POST/GET
# Every Pi runs nginx — instant mesh
# ═══════════════════════════════════════════

class HTTPRadioHandler(BaseHTTPRequestHandler):
    mesh_inbox = []

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        try:
            pkt = json.loads(body)
            HTTPRadioHandler.mesh_inbox.append(pkt)
            print(f"{GREEN}[HTTP RX]{RESET} from={pkt.get('src','?')} "
                  f"type={pkt.get('type','?')} payload={str(pkt.get('payload',''))[:60]}")
        except:
            HTTPRadioHandler.mesh_inbox.append({'raw': body.decode(errors='replace')})
            print(f"{GREEN}[HTTP RX]{RESET} raw {len(body)}B")
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('X-BlackRoad-Node', 'alexandria')
        self.end_headers()
        self.wfile.write(b'{"status":"received","node":"alexandria"}')

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('X-BlackRoad-Node', 'alexandria')
        self.end_headers()
        resp = {
            'node': 'alexandria',
            'radio': 'http',
            'fleet': 'blackroad',
            'inbox_count': len(HTTPRadioHandler.mesh_inbox),
            'ts': int(time.time()),
            'radios_active': list(RADIOS.keys()),
        }
        self.wfile.write(json.dumps(resp).encode())

    def log_message(self, *args):
        pass  # silence default logging


class HTTPRadio:
    def __init__(self, port=7100):
        self.port = port
        self.server = None
        self.seq = 0

    def start(self):
        self.server = HTTPServer(('0.0.0.0', self.port), HTTPRadioHandler)
        t = threading.Thread(target=self.server.serve_forever, daemon=True)
        t.start()
        print(f"{PINK}[HTTP RADIO]{RESET} Listening on :{self.port}")

    def send(self, dest_ip, payload, port=7100):
        """Send mesh packet via HTTP POST"""
        import urllib.request
        self.seq += 1
        pkt = mesh_packet('alexandria', payload, seq=self.seq)
        try:
            req = urllib.request.Request(
                f'http://{dest_ip}:{port}/mesh',
                data=pkt,
                headers={'Content-Type': 'application/json', 'X-BlackRoad-Node': 'alexandria'}
            )
            resp = urllib.request.urlopen(req, timeout=3)
            print(f"{BLUE}[HTTP TX]{RESET} → {dest_ip}:{port} {len(pkt)}B")
            return True
        except Exception as e:
            print(f"{AMBER}[HTTP TX FAIL]{RESET} {dest_ip}: {e}")
            return False

    def broadcast(self, payload):
        """Broadcast to all fleet nodes"""
        for name, ip in FLEET.items():
            if ip != FLEET['alexandria']:
                self.send(ip, payload)


# ═══════════════════════════════════════════
# RADIO 2: FTP Radio
# Store-and-forward mesh over FTP
# Drop files in shared dirs = mesh messages
# ═══════════════════════════════════════════

class FTPRadio:
    def __init__(self):
        self.seq = 0
        self.mesh_dir = '/tmp/blackroad-mesh'
        os.makedirs(self.mesh_dir, exist_ok=True)

    def send(self, dest_ip, payload, user='blackroad', passwd='', port=21):
        """Drop a mesh packet as a file on remote FTP"""
        self.seq += 1
        pkt = mesh_packet('alexandria', payload, seq=self.seq)
        filename = f"mesh-{int(time.time())}-{self.seq}.json"
        try:
            ftp = FTP()
            ftp.connect(dest_ip, port, timeout=5)
            ftp.login(user, passwd)
            # Try to create mesh inbox dir
            try:
                ftp.mkd('mesh-inbox')
            except:
                pass
            ftp.cwd('mesh-inbox')
            ftp.storbinary(f'STOR {filename}', BytesIO(pkt))
            ftp.quit()
            print(f"{BLUE}[FTP TX]{RESET} → {dest_ip} {filename} {len(pkt)}B")
            return True
        except Exception as e:
            print(f"{AMBER}[FTP TX FAIL]{RESET} {dest_ip}: {e}")
            return False

    def check_inbox(self):
        """Check local FTP inbox for mesh messages"""
        inbox = os.path.join(self.mesh_dir, 'inbox')
        os.makedirs(inbox, exist_ok=True)
        messages = []
        for f in os.listdir(inbox):
            if f.startswith('mesh-') and f.endswith('.json'):
                path = os.path.join(inbox, f)
                try:
                    with open(path) as fh:
                        pkt = json.load(fh)
                        messages.append(pkt)
                        print(f"{GREEN}[FTP RX]{RESET} {f} from={pkt.get('src','?')}")
                    os.rename(path, path + '.processed')
                except:
                    pass
        return messages


# ═══════════════════════════════════════════
# RADIO 3: Raw TCP Radio
# Direct TCP socket mesh — lowest latency
# ═══════════════════════════════════════════

class TCPRadio:
    def __init__(self, port=7101):
        self.port = port
        self.seq = 0
        self.server_sock = None

    def start(self):
        self.server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_sock.bind(('0.0.0.0', self.port))
        self.server_sock.listen(10)
        t = threading.Thread(target=self._accept_loop, daemon=True)
        t.start()
        print(f"{PINK}[TCP RADIO]{RESET} Listening on :{self.port}")

    def _accept_loop(self):
        while True:
            try:
                conn, addr = self.server_sock.accept()
                t = threading.Thread(target=self._handle, args=(conn, addr), daemon=True)
                t.start()
            except:
                break

    def _handle(self, conn, addr):
        try:
            data = conn.recv(4096)
            if data:
                try:
                    pkt = json.loads(data)
                    print(f"{GREEN}[TCP RX]{RESET} {addr[0]} from={pkt.get('src','?')} "
                          f"{str(pkt.get('payload',''))[:60]}")
                except:
                    print(f"{GREEN}[TCP RX]{RESET} {addr[0]} raw {len(data)}B")
                conn.sendall(b'{"ack":"ok"}')
        finally:
            conn.close()

    def send(self, dest_ip, payload, port=7101):
        self.seq += 1
        pkt = mesh_packet('alexandria', payload, seq=self.seq)
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(3)
            s.connect((dest_ip, port))
            s.sendall(pkt)
            resp = s.recv(1024)
            s.close()
            print(f"{BLUE}[TCP TX]{RESET} → {dest_ip}:{port} {len(pkt)}B")
            return True
        except Exception as e:
            print(f"{AMBER}[TCP TX FAIL]{RESET} {dest_ip}: {e}")
            return False


# ═══════════════════════════════════════════
# RADIO 4: UDP Radio
# Fire-and-forget broadcast, multicast mesh
# ═══════════════════════════════════════════

class UDPRadio:
    def __init__(self, port=7102):
        self.port = port
        self.seq = 0
        self.sock = None

    def start(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        self.sock.bind(('0.0.0.0', self.port))
        t = threading.Thread(target=self._listen, daemon=True)
        t.start()
        print(f"{PINK}[UDP RADIO]{RESET} Listening on :{self.port}")

    def _listen(self):
        while True:
            try:
                data, addr = self.sock.recvfrom(4096)
                if data:
                    try:
                        pkt = json.loads(data)
                        if pkt.get('src') != 'alexandria':  # ignore own broadcasts
                            print(f"{GREEN}[UDP RX]{RESET} {addr[0]} from={pkt.get('src','?')} "
                                  f"{str(pkt.get('payload',''))[:60]}")
                    except:
                        print(f"{GREEN}[UDP RX]{RESET} {addr[0]} raw {len(data)}B")
            except:
                break

    def send(self, dest_ip, payload, port=7102):
        self.seq += 1
        pkt = mesh_packet('alexandria', payload, seq=self.seq)
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.sendto(pkt, (dest_ip, port))
            s.close()
            print(f"{BLUE}[UDP TX]{RESET} → {dest_ip}:{port} {len(pkt)}B")
            return True
        except Exception as e:
            print(f"{AMBER}[UDP TX FAIL]{RESET} {dest_ip}: {e}")
            return False

    def broadcast(self, payload, port=7102):
        """LAN broadcast — hits every device"""
        self.seq += 1
        pkt = mesh_packet('alexandria', payload, pkt_type='broadcast', seq=self.seq)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        s.sendto(pkt, ('192.168.4.255', port))
        s.close()
        print(f"{BLUE}[UDP BROADCAST]{RESET} 192.168.4.255:{port} {len(pkt)}B")


# ═══════════════════════════════════════════
# RADIO 5: DNS Radio
# Encode mesh data in DNS TXT queries
# Steganographic — looks like normal DNS
# ═══════════════════════════════════════════

class DNSRadio:
    def __init__(self, port=7153):
        self.port = port
        self.seq = 0

    def start(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind(('0.0.0.0', self.port))
        t = threading.Thread(target=self._listen, daemon=True)
        t.start()
        print(f"{PINK}[DNS RADIO]{RESET} Listening on :{self.port}")

    def _listen(self):
        while True:
            try:
                data, addr = self.sock.recvfrom(512)
                if len(data) > 12:
                    # Extract query name from DNS packet
                    qname = self._extract_qname(data)
                    if qname and '.mesh.blackroad.io' in qname:
                        # Decode mesh data from subdomain labels
                        parts = qname.replace('.mesh.blackroad.io', '').split('.')
                        payload = ''.join(parts)
                        print(f"{GREEN}[DNS RX]{RESET} {addr[0]} query={qname}")
                        # Send DNS response
                        resp = self._dns_response(data, qname)
                        self.sock.sendto(resp, addr)
            except:
                break

    def _extract_qname(self, data):
        """Extract domain name from DNS query"""
        try:
            pos = 12  # skip header
            labels = []
            while pos < len(data):
                length = data[pos]
                if length == 0:
                    break
                pos += 1
                labels.append(data[pos:pos+length].decode())
                pos += length
            return '.'.join(labels)
        except:
            return None

    def _dns_response(self, query, qname):
        """Build minimal DNS response with mesh data in TXT record"""
        # Copy transaction ID and set response flags
        resp = bytearray(query[:2])
        resp += b'\x81\x80'  # response, no error
        resp += query[4:6]   # questions count
        resp += b'\x00\x01'  # 1 answer
        resp += b'\x00\x00\x00\x00'  # no auth, no additional
        resp += query[12:]   # copy question section
        # Add TXT answer
        resp += b'\xc0\x0c'  # pointer to qname
        resp += b'\x00\x10'  # TXT type
        resp += b'\x00\x01'  # IN class
        resp += b'\x00\x00\x00\x3c'  # TTL 60s
        txt = f"node=alexandria fleet=blackroad ts={int(time.time())}"
        resp += struct.pack('!H', len(txt) + 1)  # rdlength
        resp += struct.pack('B', len(txt))  # txt length
        resp += txt.encode()
        return bytes(resp)

    def send(self, dest_ip, payload, port=53):
        """Encode mesh data as DNS query to destination"""
        import base64
        self.seq += 1
        encoded = base64.b32encode(payload.encode()).decode().lower().rstrip('=')
        # Split into 63-char labels (DNS limit)
        labels = [encoded[i:i+63] for i in range(0, len(encoded), 63)]
        qname = '.'.join(labels) + '.mesh.blackroad.io'
        # Build DNS query
        txn_id = struct.pack('!H', self.seq & 0xFFFF)
        flags = b'\x01\x00'  # standard query, recursion desired
        counts = b'\x00\x01\x00\x00\x00\x00\x00\x00'
        question = b''
        for label in qname.split('.'):
            question += struct.pack('B', len(label)) + label.encode()
        question += b'\x00\x00\x10\x00\x01'  # null term, TXT type, IN class

        pkt = txn_id + flags + counts + question
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.settimeout(3)
            s.sendto(pkt, (dest_ip, port))
            s.close()
            print(f"{BLUE}[DNS TX]{RESET} → {dest_ip} qname={qname[:60]}...")
            return True
        except Exception as e:
            print(f"{AMBER}[DNS TX FAIL]{RESET} {dest_ip}: {e}")
            return False


# ═══════════════════════════════════════════
# RADIO 6: ICMP Radio (Ping tunnel)
# Encode data in ICMP echo payload
# Works even when all ports are firewalled
# ═══════════════════════════════════════════

class ICMPRadio:
    def __init__(self):
        self.seq = 0

    def send(self, dest_ip, payload):
        """Send data encoded in ping payload"""
        self.seq += 1
        pkt = mesh_packet('alexandria', payload, seq=self.seq)
        # Use system ping with pattern (payload in hex)
        hex_payload = pkt[:32].hex()  # ping -p takes 16 bytes max
        try:
            os.system(f"ping -c 1 -W 1 -p {hex_payload[:32]} {dest_ip} >/dev/null 2>&1 &")
            print(f"{BLUE}[ICMP TX]{RESET} → {dest_ip} {len(hex_payload)//2}B in ping payload")
            return True
        except Exception as e:
            print(f"{AMBER}[ICMP TX FAIL]{RESET} {dest_ip}: {e}")
            return False


# ═══════════════════════════════════════════
# RADIO 7: WebSocket Radio
# Persistent bidirectional mesh connections
# ═══════════════════════════════════════════

class WebSocketRadio:
    def __init__(self, port=7103):
        self.port = port
        self.seq = 0
        self.connections = {}

    def start(self):
        try:
            import websockets
            async def handler(ws, path):
                async for msg in ws:
                    try:
                        pkt = json.loads(msg)
                        print(f"{GREEN}[WS RX]{RESET} from={pkt.get('src','?')} "
                              f"{str(pkt.get('payload',''))[:60]}")
                    except:
                        print(f"{GREEN}[WS RX]{RESET} raw {len(msg)}B")

            async def serve():
                async with websockets.serve(handler, '0.0.0.0', self.port):
                    await asyncio.Future()

            t = threading.Thread(target=lambda: asyncio.new_event_loop().run_until_complete(serve()), daemon=True)
            t.start()
            print(f"{PINK}[WS RADIO]{RESET} Listening on :{self.port}")
        except ImportError:
            print(f"{AMBER}[WS RADIO]{RESET} websockets not installed, skipping")

    def send(self, dest_ip, payload, port=7103):
        self.seq += 1
        pkt = mesh_packet('alexandria', payload, seq=self.seq)
        try:
            import websockets
            async def _send():
                async with websockets.connect(f'ws://{dest_ip}:{port}') as ws:
                    await ws.send(pkt.decode())
            asyncio.get_event_loop().run_until_complete(_send())
            print(f"{BLUE}[WS TX]{RESET} → {dest_ip}:{port}")
            return True
        except:
            return False


# ═══════════════════════════════════════════
# RADIO 8: SSH Radio
# Tunnel mesh data through SSH connections
# Already have keys on all Pis
# ═══════════════════════════════════════════

class SSHRadio:
    def __init__(self):
        self.seq = 0
        self.ssh_users = {
            'alice': 'pi',
            'cecilia': 'blackroad',
            'aria': 'blackroad',
            'lucidia': 'octavia',
            'octavia': 'pi',
        }

    def send(self, node_name, payload):
        """Send mesh data via SSH command execution"""
        self.seq += 1
        ip = FLEET.get(node_name)
        user = self.ssh_users.get(node_name, 'blackroad')
        if not ip:
            return False
        pkt = mesh_packet('alexandria', payload, seq=self.seq)
        # Write to mesh inbox on remote node
        escaped = pkt.decode().replace("'", "'\\''")
        cmd = (f"ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no "
               f"{user}@{ip} \"mkdir -p /tmp/blackroad-mesh/inbox && "
               f"echo '{escaped}' > /tmp/blackroad-mesh/inbox/msg-{self.seq}.json\" "
               f">/dev/null 2>&1 &")
        os.system(cmd)
        print(f"{BLUE}[SSH TX]{RESET} → {node_name} ({ip}) via {user}@")
        return True

    def broadcast(self, payload):
        for name in self.ssh_users:
            self.send(name, payload)


# ═══════════════════════════════════════════
# RADIO 9: mDNS Radio
# Advertise mesh presence via Bonjour/Avahi
# ═══════════════════════════════════════════

class MDNSRadio:
    def __init__(self):
        self.seq = 0

    def start(self):
        """Register BlackRoad mesh service via dns-sd"""
        os.system('dns-sd -R "BlackRoad-Alexandria" _blackroad-mesh._tcp local 7100 '
                  'node=alexandria fleet=blackroad radios=9 &')
        print(f"{PINK}[mDNS RADIO]{RESET} Advertising _blackroad-mesh._tcp")

    def discover(self):
        """Find other BlackRoad nodes on LAN"""
        print(f"{BLUE}[mDNS]{RESET} Browsing for _blackroad-mesh._tcp...")
        os.system('dns-sd -B _blackroad-mesh._tcp local &')


# ═══════════════════════════════════════════
# RADIO 10: Multicast Radio
# 239.x.x.x multicast group — all LAN nodes
# ═══════════════════════════════════════════

class MulticastRadio:
    MCAST_GROUP = '239.77.69.83'  # "MESH" in ASCII
    MCAST_PORT = 7104

    def __init__(self):
        self.seq = 0
        self.sock = None

    def start(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind(('', self.MCAST_PORT))
        # Join multicast group
        mreq = struct.pack('4sl', socket.inet_aton(self.MCAST_GROUP), socket.INADDR_ANY)
        self.sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
        t = threading.Thread(target=self._listen, daemon=True)
        t.start()
        print(f"{PINK}[MCAST RADIO]{RESET} Joined {self.MCAST_GROUP}:{self.MCAST_PORT}")

    def _listen(self):
        while True:
            try:
                data, addr = self.sock.recvfrom(4096)
                try:
                    pkt = json.loads(data)
                    if pkt.get('src') != 'alexandria':
                        print(f"{GREEN}[MCAST RX]{RESET} {addr[0]} from={pkt.get('src','?')}")
                except:
                    print(f"{GREEN}[MCAST RX]{RESET} {addr[0]} raw {len(data)}B")
            except:
                break

    def send(self, payload):
        self.seq += 1
        pkt = mesh_packet('alexandria', payload, pkt_type='multicast', seq=self.seq)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
        s.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 4)
        s.sendto(pkt, (self.MCAST_GROUP, self.MCAST_PORT))
        s.close()
        print(f"{BLUE}[MCAST TX]{RESET} → {self.MCAST_GROUP} {len(pkt)}B")


# ═══════════════════════════════════════════
# MASTER: Radio Fleet Controller
# ═══════════════════════════════════════════

RADIOS = {}

def start_all():
    """Boot every radio"""
    print(f"\n{PINK}╔══════════════════════════════════════════╗{RESET}")
    print(f"{PINK}║{RESET}  BlackRoad Mesh Radio Fleet              {PINK}║{RESET}")
    print(f"{PINK}║{RESET}  Every protocol is a radio.              {PINK}║{RESET}")
    print(f"{PINK}╚══════════════════════════════════════════╝{RESET}\n")

    RADIOS['http'] = HTTPRadio(7100)
    RADIOS['http'].start()

    RADIOS['tcp'] = TCPRadio(7101)
    RADIOS['tcp'].start()

    RADIOS['udp'] = UDPRadio(7102)
    RADIOS['udp'].start()

    RADIOS['ws'] = WebSocketRadio(7103)
    RADIOS['ws'].start()

    RADIOS['multicast'] = MulticastRadio()
    RADIOS['multicast'].start()

    RADIOS['dns'] = DNSRadio(7153)
    RADIOS['dns'].start()

    RADIOS['ftp'] = FTPRadio()
    RADIOS['ssh'] = SSHRadio()
    RADIOS['icmp'] = ICMPRadio()

    RADIOS['mdns'] = MDNSRadio()
    RADIOS['mdns'].start()

    print(f"\n{GREEN}[FLEET]{RESET} {len(RADIOS)} radios active\n")
    print("Commands:")
    print("  broadcast <msg>     — send on ALL radios to ALL nodes")
    print("  http <node> <msg>   — send via HTTP")
    print("  tcp <node> <msg>    — send via TCP")
    print("  udp <node> <msg>    — send via UDP")
    print("  ssh <node> <msg>    — send via SSH")
    print("  icmp <node> <msg>   — send via ping tunnel")
    print("  dns <node> <msg>    — send via DNS query")
    print("  mcast <msg>         — multicast to LAN")
    print("  udp-bcast <msg>     — UDP broadcast 255")
    print("  status              — show all radios")
    print("  nodes               — show fleet")
    print()


def broadcast_all(payload):
    """Send on every radio to every node"""
    print(f"\n{VIOLET}[BROADCAST ALL]{RESET} '{payload[:50]}' on {len(RADIOS)} radios\n")

    # HTTP to all nodes
    for name, ip in FLEET.items():
        if name != 'alexandria':
            RADIOS['http'].send(ip, payload)

    # UDP broadcast
    RADIOS['udp'].broadcast(payload)

    # Multicast
    RADIOS['multicast'].send(payload)

    # SSH to all Pis
    RADIOS['ssh'].broadcast(payload)

    # ICMP to all
    for name, ip in FLEET.items():
        if name != 'alexandria':
            RADIOS['icmp'].send(ip, payload)

    print(f"\n{VIOLET}[BROADCAST DONE]{RESET}\n")


def interactive():
    start_all()
    try:
        while True:
            try:
                cmd = input(f"{PINK}radio>{RESET} ").strip()
            except EOFError:
                break

            if not cmd:
                continue

            parts = cmd.split(' ', 2)
            verb = parts[0]

            if verb == 'broadcast' and len(parts) > 1:
                broadcast_all(' '.join(parts[1:]))
            elif verb == 'http' and len(parts) > 2:
                ip = FLEET.get(parts[1], parts[1])
                RADIOS['http'].send(ip, parts[2])
            elif verb == 'tcp' and len(parts) > 2:
                ip = FLEET.get(parts[1], parts[1])
                RADIOS['tcp'].send(ip, parts[2])
            elif verb == 'udp' and len(parts) > 2:
                ip = FLEET.get(parts[1], parts[1])
                RADIOS['udp'].send(ip, parts[2])
            elif verb == 'ssh' and len(parts) > 2:
                RADIOS['ssh'].send(parts[1], parts[2])
            elif verb == 'icmp' and len(parts) > 2:
                ip = FLEET.get(parts[1], parts[1])
                RADIOS['icmp'].send(ip, parts[2])
            elif verb == 'dns' and len(parts) > 2:
                ip = FLEET.get(parts[1], parts[1])
                RADIOS['dns'].send(ip, parts[2])
            elif verb == 'mcast' and len(parts) > 1:
                RADIOS['multicast'].send(' '.join(parts[1:]))
            elif verb == 'udp-bcast' and len(parts) > 1:
                RADIOS['udp'].broadcast(' '.join(parts[1:]))
            elif verb == 'status':
                print(f"\n{PINK}=== Radio Fleet ==={RESET}")
                for name, radio in RADIOS.items():
                    port = getattr(radio, 'port', '-')
                    seq = getattr(radio, 'seq', 0)
                    print(f"  {GREEN}{name:12}{RESET} port={port} seq={seq}")
                print()
            elif verb == 'nodes':
                print(f"\n{PINK}=== Fleet Nodes ==={RESET}")
                for name, ip in FLEET.items():
                    tag = ' (self)' if name == 'alexandria' else ''
                    print(f"  {GREEN}{name:12}{RESET} {ip}{tag}")
                print()
            elif verb in ('quit', 'exit', 'q'):
                break
            else:
                print(f"Unknown: {cmd}")
    except KeyboardInterrupt:
        pass
    print(f"\n{PINK}[FLEET]{RESET} All radios down.")


if __name__ == '__main__':
    interactive()
