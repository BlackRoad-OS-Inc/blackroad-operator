import time
import socket

print("Echo Agent ONLINE")
print("Host:", socket.gethostname())

while True:
    print("tick", time.time())
    time.sleep(2)
