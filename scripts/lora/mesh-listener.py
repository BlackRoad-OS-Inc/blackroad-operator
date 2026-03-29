#!/usr/bin/env python3
"""
BlackRoad Mesh Listener — runs on each Pi
Receives mesh packets on HTTP, TCP, UDP, Multicast
Writes to /tmp/blackroad-mesh/inbox/
"""

import json
import socket
import struct
import threading
import os
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

NODE_NAME = os.popen('hostname').read().strip()
MESH_DIR = '/tmp/blackroad-mesh'
INBOX = os.path.join(MESH_DIR, 'inbox')
os.makedirs(INBOX, exist_ok=True)

rx_count = 0

def save_msg(pkt, radio):
    global rx_count
    rx_count += 1
    ts = int(time.time())
    fname = f"{radio}-{ts}-{rx_count}.json"
    path = os.path.join(INBOX, fname)
    with open(path, 'w') as f:
        if isinstance(pkt, dict):
            pkt['_received_by'] = NODE_NAME
            pkt['_radio'] = radio
            pkt['_rx_ts'] = ts
            json.dump(pkt, f)
        else:
            json.dump({'raw': str(pkt), '_received_by': NODE_NAME, '_radio': radio, '_rx_ts': ts}, f)
    print(f"[{radio.upper()} RX] #{rx_count} saved {fname}")


class HTTPHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        try:
            pkt = json.loads(body)
            save_msg(pkt, 'http')
        except:
            save_msg(body.decode(errors='replace'), 'http')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'ok', 'node': NODE_NAME}).encode())

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        files = os.listdir(INBOX) if os.path.exists(INBOX) else []
        self.wfile.write(json.dumps({
            'node': NODE_NAME, 'inbox': len(files), 'rx_total': rx_count
        }).encode())

    def log_message(self, *args):
        pass


def http_radio():
    server = HTTPServer(('0.0.0.0', 7100), HTTPHandler)
    print(f"[HTTP] :{7100}")
    server.serve_forever()


def tcp_radio():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(('0.0.0.0', 7101))
    s.listen(10)
    print(f"[TCP] :{7101}")
    while True:
        conn, addr = s.accept()
        try:
            data = conn.recv(4096)
            if data:
                try:
                    pkt = json.loads(data)
                    save_msg(pkt, 'tcp')
                except:
                    save_msg(data.decode(errors='replace'), 'tcp')
                conn.sendall(b'{"ack":"ok"}')
        finally:
            conn.close()


def udp_radio():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    s.bind(('0.0.0.0', 7102))
    print(f"[UDP] :{7102}")
    while True:
        data, addr = s.recvfrom(4096)
        if data:
            try:
                pkt = json.loads(data)
                save_msg(pkt, 'udp')
            except:
                save_msg(data.decode(errors='replace'), 'udp')


def multicast_radio():
    MCAST_GROUP = '239.77.69.83'
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(('', 7104))
    mreq = struct.pack('4sl', socket.inet_aton(MCAST_GROUP), socket.INADDR_ANY)
    s.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
    print(f"[MCAST] {MCAST_GROUP}:{7104}")
    while True:
        data, addr = s.recvfrom(4096)
        if data:
            try:
                pkt = json.loads(data)
                save_msg(pkt, 'multicast')
            except:
                save_msg(data.decode(errors='replace'), 'multicast')


if __name__ == '__main__':
    print(f"\n=== BlackRoad Mesh Listener: {NODE_NAME} ===\n")
    for fn in [http_radio, tcp_radio, udp_radio, multicast_radio]:
        t = threading.Thread(target=fn, daemon=True)
        t.start()
    print(f"\n4 radios listening. Inbox: {INBOX}\n")
    try:
        while True:
            time.sleep(60)
            files = os.listdir(INBOX) if os.path.exists(INBOX) else []
            print(f"[STATUS] rx={rx_count} inbox={len(files)}")
    except KeyboardInterrupt:
        print("\nShutdown.")
