"""
LUCIDIA PROCESS MANAGER
Background task management
⬥ BlackRoad OS, Inc.
"""

import asyncio
from datetime import datetime
from typing import Callable, Coroutine, Any


class ProcessManager:
    """Manage background async tasks"""
    
    def __init__(self):
        self.processes = {}
        self.pid_counter = 1000

    def spawn(self, name: str, coro: Coroutine) -> int:
        """Spawn a background task, return PID"""
        pid = self.pid_counter
        self.pid_counter += 1
        task = asyncio.create_task(coro)
        self.processes[pid] = {
            "name": name,
            "task": task,
            "started": datetime.now()
        }
        return pid

    def kill(self, pid: int) -> bool:
        """Kill a process by PID"""
        if pid in self.processes:
            self.processes[pid]["task"].cancel()
            del self.processes[pid]
            return True
        return False

    def ps(self) -> list:
        """List running processes"""
        result = []
        for pid, proc in list(self.processes.items()):
            if proc["task"].done():
                del self.processes[pid]
            else:
                result.append({
                    "pid": pid,
                    "name": proc["name"],
                    "uptime": str(datetime.now() - proc["started"]).split('.')[0]
                })
        return result

    def killall(self, name: str = None) -> int:
        """Kill all processes, or all matching name"""
        killed = 0
        for pid, proc in list(self.processes.items()):
            if name is None or proc["name"] == name:
                proc["task"].cancel()
                del self.processes[pid]
                killed += 1
        return killed


# Test if run directly
if __name__ == "__main__":
    import asyncio
    
    async def test_task():
        while True:
            await asyncio.sleep(1)
    
    async def main():
        pm = ProcessManager()
        pid = pm.spawn("test", test_task())
        print(f"Spawned PID {pid}")
        print(f"PS: {pm.ps()}")
        await asyncio.sleep(2)
        print(f"PS after 2s: {pm.ps()}")
        pm.kill(pid)
        print(f"PS after kill: {pm.ps()}")
    
    asyncio.run(main())
