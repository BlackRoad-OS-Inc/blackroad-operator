# tools/number_theory/trig_roots.py
# Amundson VI — Power–Root Law in Log–Angle (A-PR)
# ------------------------------------------------------------
# Utilities that do powers and nth-roots using the linearity of (ln r, θ).
# Also: exact square-root on [0,1] via a single arccos call, and
# a Chebyshev-based nth "root" for values in [-1,1].
#
# Usage examples:
#   python tools/number_theory/trig_roots.py sqrt01 --x 0.36
#   python tools/number_theory/trig_roots.py cheb  --x 0.2 --n 5
#   python tools/number_theory/trig_roots.py root  --a 3 --b 4 --n 5 --k 2
#   python tools/number_theory/trig_roots.py power --a 0.5 --b -0.5 --n 8
# ------------------------------------------------------------
from __future__ import annotations
import argparse, math, cmath, json

def sqrt01(x: float) -> float:
    if x < 0.0 or x > 1.0:
        raise ValueError("sqrt01 expects 0 <= x <= 1")
    return math.cos(0.5*math.acos(2.0*x - 1.0))

def cheb_root(x: float, n: int) -> float:
    if n <= 0:
        raise ValueError("n must be positive")
    if x < -1.0 or x > 1.0:
        raise ValueError("cheb_root expects -1 <= x <= 1")
    return math.cos(math.acos(x)/n)

def polar_power(z: complex, n: int) -> complex:
    r, th = abs(z), cmath.phase(z)
    return (r**n) * cmath.exp(1j*(n*th))

def polar_root(z: complex, n: int, k: int = 0) -> complex:
    if n <= 0:
        raise ValueError("n must be positive")
    r, th = abs(z), cmath.phase(z)
    return (r**(1.0/n)) * cmath.exp(1j*((th + 2*math.pi*k)/n))

def main():
    ap = argparse.ArgumentParser(description="Amundson Power–Root tools")
    sub = ap.add_subparsers(dest="cmd", required=True)

    ap_sqrt = sub.add_parser("sqrt01", help="Exact sqrt on [0,1] via arccos split")
    ap_sqrt.add_argument("--x", type=float, required=True)

    ap_cheb = sub.add_parser("cheb", help="Chebyshev angle-split root on [-1,1]")
    ap_cheb.add_argument("--x", type=float, required=True)
    ap_cheb.add_argument("--n", type=int, required=True)

    ap_root = sub.add_parser("root", help="Nth root of complex a+ib; choose branch k")
    ap_root.add_argument("--a", type=float, required=True)
    ap_root.add_argument("--b", type=float, required=True)
    ap_root.add_argument("--n", type=int, required=True)
    ap_root.add_argument("--k", type=int, default=0)

    ap_pow = sub.add_parser("power", help="Nth power of complex a+ib")
    ap_pow.add_argument("--a", type=float, required=True)
    ap_pow.add_argument("--b", type=float, required=True)
    ap_pow.add_argument("--n", type=int, required=True)

    args = ap.parse_args()

    if args.cmd == "sqrt01":
        val = sqrt01(args.x)
        print(json.dumps({"sqrt01": val}))
    elif args.cmd == "cheb":
        val = cheb_root(args.x, args.n)
        print(json.dumps({"cheb_root": val}))
    elif args.cmd == "root":
        z = complex(args.a, args.b)
        val = polar_root(z, args.n, args.k)
        print(json.dumps({"root": [val.real, val.imag], "abs": abs(val), "arg": cmath.phase(val)}))
    elif args.cmd == "power":
        z = complex(args.a, args.b)
        val = polar_power(z, args.n)
        print(json.dumps({"power": [val.real, val.imag], "abs": abs(val), "arg": cmath.phase(val)}))

if __name__ == "__main__":
    main()
