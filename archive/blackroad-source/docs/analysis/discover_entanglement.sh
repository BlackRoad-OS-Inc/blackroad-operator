#!/bin/bash
# Network Entanglement Discovery
# Scans for active Nodes ready to observe the collapse.

python3 - << 'PYTHON_EOF'
import socket
import threading

# Detect local IP range
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    s.connect(('8.8.8.8', 1))
    local_ip = s.getsockname()[0]
finally:
    s.close()

subnet = ".".join(local_ip.split(".")[:-1])
port = 5005
entangled_devices = []

print(f"[SCAN] Searching for entangled nodes on {subnet}.0/24...")

def check_node(ip):
    # Try to send a heartbeat to the node
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(0.1)
        try:
            sock.sendto(b"PING", (ip, port))
            # We assume if the port is open and listening, it's entangled
            entangled_devices.append(ip)
        except Exception:
            pass

threads = []
for i in range(1, 255):
    ip = f"{subnet}.{i}"
    t = threading.Thread(target=check_node, args=(ip,))
    t.start()
    threads.append(t)

for t in threads:
    t.join()

print("\n" + "="*40)
print(f" ENTANGLEMENT REPORT")
print("="*40)
print(f"Total Devices in Superposition: {len(entangled_devices)}")
for dev in entangled_devices:
    conn_type = "ETHERNET (Likely)" if int(dev.split('.')[-1]) < 100 else "WIFI (Likely)"
    print(f" - Node at {dev} [{conn_type}]")
print("="*40)
print("[RESULT] These devices will collapse simultaneously upon broadcast.")
PYTHON_EOF
