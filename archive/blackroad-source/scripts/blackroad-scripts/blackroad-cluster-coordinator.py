#!/usr/bin/env python3
"""
BlackRoad Cluster Coordinator
Distributes tasks across all worker nodes
"""

import requests
import json
import time
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# Cluster node configurations
NODES = [
    {'name': 'octavia', 'host': '192.168.4.74', 'port': 8888, 'power': 10, 'arch': 'aarch64'},
    {'name': 'aria', 'host': '192.168.4.64', 'port': 8888, 'power': 5, 'arch': 'aarch64'},
    {'name': 'lucidia', 'host': '192.168.4.38', 'port': 8888, 'power': 5, 'arch': 'aarch64'},
]

class BlackRoadCluster:
    """Distributed cluster coordinator"""

    def __init__(self):
        self.nodes = NODES
        self.available_nodes = []
        self.discover_nodes()

    def discover_nodes(self):
        """Check which nodes are online"""
        print("🔍 Discovering cluster nodes...")
        self.available_nodes = []

        for node in self.nodes:
            try:
                url = f"http://{node['host']}:{node['port']}/status"
                response = requests.get(url, timeout=2)
                if response.status_code == 200:
                    status = response.json()
                    node['status'] = status
                    self.available_nodes.append(node)
                    print(f"  ✅ {node['name']} ({node['host']}) - ONLINE")
            except Exception as e:
                print(f"  ❌ {node['name']} ({node['host']}) - OFFLINE")

        print(f"\n📊 Cluster: {len(self.available_nodes)}/{len(self.nodes)} nodes online\n")
        return self.available_nodes

    def execute_task(self, node, task):
        """Execute a task on a specific node"""
        try:
            url = f"http://{node['host']}:{node['port']}/execute"
            response = requests.post(url, json=task, timeout=300)
            if response.status_code == 200:
                return response.json()
            else:
                return {'success': False, 'error': f"HTTP {response.status_code}", 'node': node['name']}
        except Exception as e:
            return {'success': False, 'error': str(e), 'node': node['name']}

    def distribute_parallel(self, tasks):
        """Distribute tasks across all available nodes in parallel"""
        print(f"🚀 Distributing {len(tasks)} tasks across {len(self.available_nodes)} nodes...")

        results = []
        start_time = time.time()

        with ThreadPoolExecutor(max_workers=len(self.available_nodes)) as executor:
            # Map tasks to nodes (round-robin)
            futures = []
            for i, task in enumerate(tasks):
                node = self.available_nodes[i % len(self.available_nodes)]
                task['task_id'] = f"task_{i}_{int(time.time())}"
                future = executor.submit(self.execute_task, node, task)
                futures.append((future, node['name'], task['task_id']))

            # Collect results
            for future, node_name, task_id in futures:
                try:
                    result = future.result()
                    results.append(result)
                    status = "✅" if result.get('success') else "❌"
                    elapsed = result.get('elapsed', 0)
                    print(f"  {status} {node_name}: {task_id} ({elapsed:.2f}s)")
                except Exception as e:
                    print(f"  ❌ {node_name}: {task_id} - {str(e)}")
                    results.append({'success': False, 'error': str(e), 'node': node_name})

        total_time = time.time() - start_time
        successful = sum(1 for r in results if r.get('success'))

        print(f"\n📈 Summary:")
        print(f"  Total tasks: {len(tasks)}")
        print(f"  Successful: {successful}/{len(tasks)}")
        print(f"  Total time: {total_time:.2f}s")
        print(f"  Avg per task: {total_time/len(tasks):.2f}s")
        print()

        return results

    def map_reduce(self, data_chunks, map_code, reduce_code=None):
        """Map/Reduce operation across cluster"""
        print(f"🗺️  Map/Reduce: {len(data_chunks)} chunks across {len(self.available_nodes)} nodes")

        # Map phase
        map_tasks = []
        for i, chunk in enumerate(data_chunks):
            task = {
                'type': 'python',
                'code': f"""
data = {chunk}
{map_code}
"""
            }
            map_tasks.append(task)

        map_results = self.distribute_parallel(map_tasks)

        # Reduce phase (if provided)
        if reduce_code:
            # Collect all map outputs
            outputs = [r['output'] for r in map_results if r.get('success')]

            reduce_task = {
                'type': 'python',
                'code': f"""
results = {outputs}
{reduce_code}
"""
            }

            # Run reduce on most powerful node
            reduce_result = self.execute_task(self.available_nodes[0], reduce_task)
            return reduce_result

        return map_results

    def cluster_status(self):
        """Get status from all nodes"""
        print("📊 Cluster Status")
        print("=" * 70)

        for node in self.available_nodes:
            try:
                url = f"http://{node['host']}:{node['port']}/status"
                response = requests.get(url, timeout=2)
                status = response.json()

                print(f"\n🖥️  {node['name'].upper()} ({node['host']})")
                print(f"   Architecture: {status.get('arch')}")
                print(f"   CPUs: {status.get('cpu_count')}")
                print(f"   Load: {status.get('load')}")
                print(f"   Temperature: {status.get('temp')}")
                print(f"   Tasks completed: {status.get('tasks_completed')}")
            except Exception as e:
                print(f"\n❌ {node['name']}: {str(e)}")

        print()

def demo_distributed_compute():
    """Demo: Distributed matrix multiplication"""
    cluster = BlackRoadCluster()

    if not cluster.available_nodes:
        print("❌ No nodes available!")
        return

    print("🧮 Demo: Distributed Matrix Operations")
    print("=" * 50)

    # Create multiple matrix multiplication tasks
    matrix_tasks = []
    sizes = [500, 500, 500, 500, 500, 500, 500, 500]  # 8 tasks

    for size in sizes:
        task = {
            'type': 'numpy',
            'code': f"""
a = np.random.rand({size}, {size})
b = np.random.rand({size}, {size})
start = time.time()
c = np.dot(a, b)
elapsed = time.time() - start
print(f"Matrix {size}x{size}: {{elapsed:.4f}}s")
"""
        }
        matrix_tasks.append(task)

    results = cluster.distribute_parallel(matrix_tasks)

    return results

def demo_map_reduce():
    """Demo: Map/Reduce sum across cluster"""
    cluster = BlackRoadCluster()

    if not cluster.available_nodes:
        print("❌ No nodes available!")
        return

    print("🗺️  Demo: Map/Reduce Sum")
    print("=" * 50)

    # Split data into chunks
    chunks = [
        list(range(0, 250000)),
        list(range(250000, 500000)),
        list(range(500000, 750000)),
        list(range(750000, 1000000)),
    ]

    map_code = "result = sum(data); print(result)"
    reduce_code = "total = sum(int(r.strip()) for r in results if r.strip()); print(f'Total sum: {total}')"

    result = cluster.map_reduce(chunks, map_code, reduce_code)
    print(f"\n📊 Final result: {result.get('output') if result else 'Failed'}")

if __name__ == '__main__':
    import sys

    cluster = BlackRoadCluster()

    if len(sys.argv) > 1:
        if sys.argv[1] == 'status':
            cluster.cluster_status()
        elif sys.argv[1] == 'demo':
            demo_distributed_compute()
        elif sys.argv[1] == 'mapreduce':
            demo_map_reduce()
    else:
        print("BlackRoad Cluster Coordinator")
        print("\nUsage:")
        print("  python3 blackroad-cluster-coordinator.py status     - Show cluster status")
        print("  python3 blackroad-cluster-coordinator.py demo       - Run distributed compute demo")
        print("  python3 blackroad-cluster-coordinator.py mapreduce  - Run map/reduce demo")
