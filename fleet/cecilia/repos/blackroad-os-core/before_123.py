#!/usr/bin/env python3
"""What comes before 1, 2, 3?
Let's check the actual logic gates."""

# Binary counting from 0
print("=== Binary Counting ===")
for i in range(8):
    print(f"{i} = {bin(i)}")

print("\n=== Before 1 ===")
print(f"0 in binary: {bin(0)}")
print(f"0 in bits: {format(0, '08b')}")

print("\n=== Logic Gates ===")
# What happens BEFORE you get to 1?

a = 0
b = 0

print(f"a = {a}")
print(f"b = {b}")
print(f"a AND b = {a & b}")
print(f"a OR b = {a | b}")
print(f"a XOR b = {a ^ b}")
print(f"NOT a = {~a & 1}")  # mask to 1 bit

print("\n=== The Gate Before 1 ===")
# To get to 1, you need:
print("To make 1 from 0:")
print(f"NOT 0 = {~0 & 1}")
print(f"0 OR 1 = {0 | 1}")
print(f"0 XOR 1 = {0 ^ 1}")

print("\n=== What operation creates 1 from nothing? ===")
# The only gate that creates 1 from 0 is NOT
print(f"NOT gate: 0 -> {~0 & 1}")

print("\n=== So before 1, 2, 3... ===")
print("There is: 0")
print("And the operation: NOT")
print("Which is the INVERSION gate")
print()
print("0 -- [NOT] --> 1")
print()
print("That's it. That's the origin.")
print("The gate that inverts.")
