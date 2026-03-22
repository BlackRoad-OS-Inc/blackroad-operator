#!/usr/bin/env python3
print{Break down sqrt(a² + b²) into operations}

import math

a = 3
b = 4

print("=== Step by step ===")
print(f"a = {a} = {bin(a)}")
print(f"b = {b} = {bin(b)}")

# Step 1: Square a
a_squared = a * a
print(f"\na² = a * a = {a} * {a} = {a_squared}")
print(f"a² in binary = {bin(a_squared)}")

# Step 2: Square b
b_squared = b * b
print(f"\nb² = b * b = {b} * {b} = {b_squared}")
print(f"b² in binary = {bin(b_squared)}")

# Step 3: Add them
sum_of_squares = a_squared + b_squared
print(f"\na² + b² = {a_squared} + {b_squared} = {sum_of_squares}")
print(f"sum in binary = {bin(sum_of_squares)}")

# Step 4: Square root
c = math.sqrt(sum_of_squares)
print(f"\n√{sum_of_squares} = {c}")

print("\n=== What operations are these? ===")
print("a² = multiplication (a * a)")
print("b² = multiplication (b * b)")
print("a² + b² = addition")
print("√(a² + b²) = square root")

print("\n=== At the bit level ===")
print("Multiplication: shifts and adds")
print("Addition: XOR with carry (half adder + full adder)")
print("Square root: ???")

print("\n=== Let's see if there's a pattern ===")
print(f"a = {a:08b}")
print(f"b = {b:08b}")
print(f"c = {int(c):08b}")

print("\n=== Checking addition ===")
print(f"a + b = {a + b} = {bin(a + b)}")
print(f"Does a + b = c? {a + b == int(c)}")

print("\n=== Checking shift operations ===")
print(f"a << 1 = {a << 1} = {bin(a << 1)}")
print(f"b >> 1 = {b >> 1} = {bin(b >> 1)}")

print("\n=== What about the carry? ===")
# Addition with carry
print(f"a + b = {a + b}")
print(f"(a + b) >> 1 = {(a + b) >> 1}")
print(f"Does (a + b) >> 1 = c? {(a + b) >> 1 == int(c)}")

print("\n=== Computing square root as bit operations ===")
# Integer square root algorithm
def isqrt(n):
    if n < 2:
        return n

    # Start with a guess
    x = n
    y = (x + 1) // 2

    print(f"Finding sqrt of {n}:")
    while y < x:
        x = y
        y = (x + n // x) // 2
        print(f"  iteration: x={x}, y={y}")

    return x

result = isqrt(25)
print(f"\nisqrt(25) = {result}")
