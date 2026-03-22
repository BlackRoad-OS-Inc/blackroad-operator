# tools/projective/depth_solver.py
# Perspective Depth Solver (A-PD)
# ------------------------------------------------------------
# Given two reference depths Z_A, Z_B along a single receding rail
# and the page positions of A, B, C, compute the scene depth Z_C.
#
# Theory (cross-ratio with the point at infinity):
#   alpha = (s(A) - s(C)) / (s(B) - s(C))
#   Z_C   = (alpha * Z_B - Z_A) / (alpha - 1)
#
# Here s(P) is the signed coordinate of P along the screen line AB.
# We let s(A) = 0 by construction; s is measured in on-page units.
#
# You may also pass 1-D scalars directly (sA,sB,sC); in that case
# the solver skips the 2-D projection step.
#
# Usage examples:
#   python tools/projective/depth_solver.py --ZA 0 --ZB 1 \
#      --A 100,400 --B 350,220 --C 270,260
#
#   python tools/projective/depth_solver.py --ZA 0 --ZB 1 --s 0,5.0,8.25
#
# Output is JSON with keys: alpha, ZC, sA,sB,sC and diagnostics.
# ------------------------------------------------------------
from __future__ import annotations
import argparse, json, math

def _parse_xy(s: str):
    x_str, y_str = s.split(",")
    return float(x_str), float(y_str)

def _unit(vx, vy):
    n = math.hypot(vx, vy)
    if n == 0.0:
        raise ValueError("A and B cannot coincide.")
    return vx/n, vy/n

def _signed_coord_along(P, A, B):
    ax, ay = A; bx, by = B; px, py = P
    ux, uy = _unit(bx-ax, by-ay)
    # signed scalar along AB with s(A)=0
    return (px-ax)*ux + (py-ay)*uy

def _dist_point_line(P, A, B):
    # perpendicular distance from P to line AB (screen units)
    ax, ay = A; bx, by = B; px, py = P
    vx, vy = bx-ax, by-ay
    num = abs( vx*(ay-py) - vy*(ax-px) )
    den = math.hypot(vx, vy)
    return num/den if den else float("inf")

def depth_from_scalars(ZA, ZB, sA, sB, sC):
    num = (sA - sC)
    den = (sB - sC)
    if den == 0.0:
        raise ZeroDivisionError("sB equals sC; alpha undefined.")
    alpha = num/den
    if abs(alpha - 1.0) < 1e-12:
        raise ZeroDivisionError("alpha == 1; depth goes to infinity (C at vanishing point).")
    ZC = (alpha*ZB - ZA) / (alpha - 1.0)
    return alpha, ZC

def solve(ZA, ZB, A=None, B=None, C=None, s=None):
    diag = {}
    if s is not None:
        sA, sB, sC = s
        diag.update({"mode":"scalar","sA":sA,"sB":sB,"sC":sC})
    else:
        if (A is None) or (B is None) or (C is None):
            raise ValueError("Provide either s=(sA,sB,sC) or A,B,C screen points.")
        sA = _signed_coord_along(A, A, B)  # 0 by design
        sB = _signed_coord_along(B, A, B)
        sC = _signed_coord_along(C, A, B)
        off = _dist_point_line(C, A, B)
        diag.update({"mode":"screen","sA":sA,"sB":sB,"sC":sC,"perp_offset_px":off})
        if off > 2.0:
            diag["warning"] = "C not perfectly on line AB; using nearest projection scalar."
    alpha, ZC = depth_from_scalars(ZA, ZB, sA, sB, sC)
    return {"alpha":alpha, "ZC":ZC, **diag}

def main():
    ap = argparse.ArgumentParser(description="Perspective Depth Solver (Amundson A-PD).")
    ap.add_argument("--ZA", type=float, required=True, help="Depth at A (scene units).")
    ap.add_argument("--ZB", type=float, required=True, help="Depth at B (scene units).")
    ap.add_argument("--A", type=str, help="Screen coords 'x,y' for A.")
    ap.add_argument("--B", type=str, help="Screen coords 'x,y' for B.")
    ap.add_argument("--C", type=str, help="Screen coords 'x,y' for C.")
    ap.add_argument("--s", type=str, help="Scalar coords 'sA,sB,sC' along AB.")
    ap.add_argument("--pretty", action="store_true", help="Pretty-print JSON.")
    args = ap.parse_args()

    if args.s:
        parts = [float(t) for t in args.s.split(",")]
        if len(parts) != 3:
            raise SystemExit("--s expects 'sA,sB,sC'")
        res = solve(args.ZA, args.ZB, s=parts)
    else:
        if not (args.A and args.B and args.C):
            raise SystemExit("Provide either --s or all of --A --B --C.")
        A = _parse_xy(args.A); B = _parse_xy(args.B); C = _parse_xy(args.C)
        res = solve(args.ZA, args.ZB, A=A, B=B, C=C)
    print(json.dumps(res, indent=2 if args.pretty else None))

if __name__ == "__main__":
    main()
