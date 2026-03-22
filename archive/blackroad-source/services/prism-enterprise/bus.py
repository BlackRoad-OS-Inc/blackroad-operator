from typing import Callable, List
from .proto import Msg


class Bus:
    def __init__(self):
        self.subs: List[Callable[[Msg], None]] = []
        self.log: List[Msg] = []

    def publish(self, m: Msg):
        self.log.append(m)
        for s in self.subs:
            s(m)

    def subscribe(self, fn: Callable[[Msg], None]):
        self.subs.append(fn)

    def history(self) -> List[Msg]:
        return list(self.log)
