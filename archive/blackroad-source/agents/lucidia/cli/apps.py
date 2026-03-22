"""
LUCIDIA APPS
Mini applications for the terminal OS
⬥ BlackRoad OS, Inc.
"""

import json
import random
import urllib.request
from datetime import datetime


class Calculator:
    """Safe calculator"""
    
    ALLOWED = {
        'abs': abs, 'round': round, 'min': min, 'max': max,
        'sum': sum, 'pow': pow, 'int': int, 'float': float
    }
    
    @staticmethod
    def eval(expr):
        try:
            return eval(expr, {"__builtins__": {}}, Calculator.ALLOWED)
        except Exception as e:
            return f"Error: {e}"


class CryptoTicker:
    """Cryptocurrency price fetcher"""
    
    @staticmethod
    def btc():
        try:
            url = "https://api.coindesk.com/v1/bpi/currentprice.json"
            with urllib.request.urlopen(url, timeout=5) as r:
                data = json.loads(r.read().decode())
                return data["bpi"]["USD"]["rate"]
        except Exception as e:
            return f"Error: {e}"

    @staticmethod
    def eth():
        try:
            url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
            with urllib.request.urlopen(url, timeout=5) as r:
                data = json.loads(r.read().decode())
                return f"${data['ethereum']['usd']:,.2f}"
        except Exception as e:
            return f"Error: {e}"


class Fortune:
    """Random fortunes"""
    
    FORTUNES = [
        "The pattern reveals itself to those who wait.",
        "Your code will compile on the first try today.",
        "A deployment approaches. Prepare your rollback.",
        "The bug you seek is in the code you trust most.",
        "Today's commit becomes tomorrow's legacy.",
        "The road is black, but the way is clear.",
        "Trust the process. Question the output.",
        "Recursion is the path. Base case is the destination.",
        "Your container will not OOM today.",
        "The answer is in the logs you haven't checked.",
    ]
    
    @staticmethod
    def get():
        return random.choice(Fortune.FORTUNES)


class Weather:
    """Weather fetcher using wttr.in"""
    
    @staticmethod
    def get(city="Minneapolis"):
        try:
            url = f"https://wttr.in/{city}?format=3"
            req = urllib.request.Request(url, headers={'User-Agent': 'Lucidia/0.2'})
            with urllib.request.urlopen(req, timeout=5) as r:
                return r.read().decode().strip()
        except Exception as e:
            return f"Error: {e}"


class Clock:
    """Time utilities"""
    
    @staticmethod
    def now():
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    @staticmethod
    def date():
        return datetime.now().strftime("%Y-%m-%d")
    
    @staticmethod
    def time():
        return datetime.now().strftime("%H:%M:%S")
    
    @staticmethod
    def unix():
        return int(datetime.now().timestamp())


class SystemInfo:
    """System information"""
    
    @staticmethod
    def whoami():
        return {
            "os": "Lucidia CLI v0.2",
            "user": "cecilia",
            "host": "lucidia.local",
            "org": "BlackRoad OS, Inc.",
            "agents": 5
        }
    
    @staticmethod
    def neofetch():
        return """[magenta]
       ⬥⬥⬥       [bold]lucidia[/]@blackroad
      ⬥⬥⬥⬥⬥      ─────────────────
     ⬥⬥⬥⬥⬥⬥⬥     [cyan]OS:[/] Lucidia CLI v0.2
    ⬥⬥⬥⬥⬥⬥⬥⬥⬥    [cyan]Host:[/] Terminal
   ⬥⬥⬥   ⬥⬥⬥   [cyan]Shell:[/] lucidia-sh
  ⬥⬥⬥     ⬥⬥⬥  [cyan]Theme:[/] BlackRoad Dark
 ⬥⬥⬥       ⬥⬥⬥ [cyan]Agents:[/] 5 loaded
[/]"""


# Convenience registry
APPS = {
    "calc": Calculator.eval,
    "btc": CryptoTicker.btc,
    "eth": CryptoTicker.eth,
    "fortune": Fortune.get,
    "weather": Weather.get,
    "time": Clock.now,
    "date": Clock.date,
    "unix": Clock.unix,
    "whoami": lambda: SystemInfo.whoami(),
    "neofetch": SystemInfo.neofetch,
}


# Test if run directly
if __name__ == "__main__":
    print(f"BTC: ${CryptoTicker.btc()}")
    print(f"Fortune: {Fortune.get()}")
    print(f"Time: {Clock.now()}")
    print(f"Weather: {Weather.get()}")
