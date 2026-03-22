#!/usr/bin/env python3
"""BlackRoad Cache Client - Connect to distributed cache"""

import socket
import json
import sys

class CacheClient:
    def __init__(self, host: str = "localhost", port: int = 6379):
        self.host = host
        self.port = port
        self.sock = None

    def connect(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((self.host, self.port))
        self.sock.settimeout(5)

    def close(self):
        if self.sock:
            self.sock.close()

    def send_command(self, *args) -> str:
        cmd = " ".join(str(a) for a in args)
        self.sock.send(f"{cmd}\n".encode())
        response = self.sock.recv(65536).decode().strip()
        return response

    def get(self, key: str):
        return self.send_command("GET", key)

    def set(self, key: str, value: str, ttl: int = None):
        if ttl:
            return self.send_command("SET", key, value, "EX", ttl)
        return self.send_command("SET", key, value)

    def delete(self, *keys):
        return self.send_command("DEL", *keys)

    def keys(self, pattern: str = "*"):
        return self.send_command("KEYS", pattern)

    def incr(self, key: str):
        return self.send_command("INCR", key)

    def info(self):
        return self.send_command("INFO")

def main():
    if len(sys.argv) < 2:
        print("Usage: cache_client.py <host> <command> [args...]")
        sys.exit(1)

    host = sys.argv[1]
    cmd = sys.argv[2] if len(sys.argv) > 2 else "PING"
    args = sys.argv[3:]

    client = CacheClient(host)
    client.connect()

    response = client.send_command(cmd, *args)
    print(response)

    client.close()

if __name__ == "__main__":
    main()
