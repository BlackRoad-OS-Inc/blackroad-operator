#!/usr/bin/env python3
import dis
import math

# What does ** actually do?
print("=== Disassembly of a**2 ===")
dis.dis(lambda: 3**2)

print("\n=== Disassembly of **0.5 (sqrt) ===")
dis.dis(lambda: 25**0.5)

print("\n=== Disassembly of math.sqrt ===")
dis.dis(lambda: math.sqrt(25))

print("\n=== What is pow? ===")
print(f"pow(3, 2) = {pow(3, 2)}")
print(f"3**2 = {3**2}")
print(f"pow(25, 0.5) = {pow(25, 0.5)}")
print(f"25**0.5 = {25**0.5}")

print("\n=== Check the actual C implementation ===")
print(f"pow.__doc__ = {pow.__doc__}")

print("\n=== Check math.sqrt ===")
print(f"math.sqrt.__doc__ = {math.sqrt.__doc__}")

print("\n=== What's the source? ===")
try:
    import inspect
    print(inspect.getsource(pow))
except:
    print("pow is built-in C code, no Python source")

try:
    print(inspect.getsource(math.sqrt))
except:
    print("math.sqrt is built-in C code, no Python source")

print("\n=== Check CPython source location ===")
print(f"math module: {math.__file__}")
