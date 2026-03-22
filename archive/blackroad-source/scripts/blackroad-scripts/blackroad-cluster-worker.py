#!/usr/bin/env python3
"""
BlackRoad Cluster Worker Node
Runs on each Pi to execute distributed tasks
"""

import socket
import time
import json
import sys
import subprocess
import platform
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Thread
import hashlib

# Node configuration
NODE_NAME = socket.gethostname()
NODE_PORT = 8888
NODE_ARCH = platform.machine()

# Task execution results
task_results = {}
task_history = []

class WorkerHandler(BaseHTTPRequestHandler):
    """HTTP handler for receiving and executing tasks"""

    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

    def do_GET(self):
        """Handle status requests"""
        if self.path == '/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            status = {
                'node': NODE_NAME,
                'arch': NODE_ARCH,
                'port': NODE_PORT,
                'uptime': time.time(),
                'tasks_completed': len(task_history),
                'cpu_count': subprocess.getoutput('nproc'),
                'load': subprocess.getoutput('uptime | grep -oP "load average: \K.*"'),
                'memory': subprocess.getoutput('free -h | grep Mem'),
                'temp': subprocess.getoutput('vcgencmd measure_temp 2>/dev/null || echo "N/A"'),
            }

            self.wfile.write(json.dumps(status).encode())

        elif self.path.startswith('/result/'):
            task_id = self.path.split('/')[-1]
            if task_id in task_results:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(task_results[task_id]).encode())
            else:
                self.send_response(404)
                self.end_headers()

        elif self.path == '/history':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(task_history).encode())

        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        """Handle task execution requests"""
        if self.path == '/execute':
            content_length = int(self.headers['Content-Length'])
            task_data = json.loads(self.rfile.read(content_length).decode())

            task_id = task_data.get('task_id', hashlib.md5(str(time.time()).encode()).hexdigest())
            task_type = task_data.get('type', 'python')
            task_code = task_data.get('code', '')

            print(f"[{NODE_NAME}] Executing task {task_id} (type: {task_type})")

            start_time = time.time()

            try:
                if task_type == 'python':
                    # Execute Python code
                    result = subprocess.run(
                        ['python3', '-c', task_code],
                        capture_output=True,
                        text=True,
                        timeout=300
                    )
                    output = result.stdout
                    error = result.stderr
                    success = result.returncode == 0

                elif task_type == 'bash':
                    # Execute bash command
                    result = subprocess.run(
                        task_code,
                        shell=True,
                        capture_output=True,
                        text=True,
                        timeout=300
                    )
                    output = result.stdout
                    error = result.stderr
                    success = result.returncode == 0

                elif task_type == 'numpy':
                    # Special numpy task
                    numpy_code = f"""
import numpy as np
import time
{task_code}
"""
                    result = subprocess.run(
                        ['python3', '-c', numpy_code],
                        capture_output=True,
                        text=True,
                        timeout=300
                    )
                    output = result.stdout
                    error = result.stderr
                    success = result.returncode == 0

                else:
                    output = ""
                    error = f"Unknown task type: {task_type}"
                    success = False

                elapsed = time.time() - start_time

                task_result = {
                    'task_id': task_id,
                    'node': NODE_NAME,
                    'success': success,
                    'output': output,
                    'error': error,
                    'elapsed': elapsed,
                    'timestamp': time.time()
                }

                task_results[task_id] = task_result
                task_history.append({
                    'task_id': task_id,
                    'type': task_type,
                    'elapsed': elapsed,
                    'success': success,
                    'timestamp': time.time()
                })

                # Keep only last 100 results
                if len(task_history) > 100:
                    task_history.pop(0)

                print(f"[{NODE_NAME}] Task {task_id} completed in {elapsed:.2f}s (success={success})")

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(task_result).encode())

            except Exception as e:
                error_result = {
                    'task_id': task_id,
                    'node': NODE_NAME,
                    'success': False,
                    'output': '',
                    'error': str(e),
                    'elapsed': time.time() - start_time,
                    'timestamp': time.time()
                }

                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(error_result).encode())

        else:
            self.send_response(404)
            self.end_headers()

def main():
    """Start worker node"""
    print(f"🖤🛣️ BlackRoad Cluster Worker: {NODE_NAME}")
    print(f"Architecture: {NODE_ARCH}")
    print(f"Listening on port {NODE_PORT}")
    print(f"=" * 50)

    server = HTTPServer(('0.0.0.0', NODE_PORT), WorkerHandler)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print(f"\n[{NODE_NAME}] Shutting down...")
        server.shutdown()

if __name__ == '__main__':
    main()
