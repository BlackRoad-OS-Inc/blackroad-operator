import socket, threading
def proxy(src, dst):
    try:
        while True:
            data = src.recv(65536)
            if not data: break
            dst.sendall(data)
    except: pass
    finally: src.close(); dst.close()

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(('0.0.0.0', 11435))
s.listen(5)
while True:
    c, _ = s.accept()
    r = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    r.connect(('127.0.0.1', 11434))
    threading.Thread(target=proxy, args=(c,r), daemon=True).start()
    threading.Thread(target=proxy, args=(r,c), daemon=True).start()
