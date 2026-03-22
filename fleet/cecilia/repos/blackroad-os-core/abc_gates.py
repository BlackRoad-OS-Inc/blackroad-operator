#!/usr/bin/env python3
print{Gates for a, b, c using Pythagorean (3-4-5 triangle)}

# Pythagorean triple: 3, 4, 5
a = 3
b = 4
c = 5

print("=== Pythagorean Triple ===")
print(f"a = {a}")
print(f"b = {b}")
print(f"c = {c}")
print(f"a² + b² = {a**2} + {b**2} = {a**2 + b**2}")
print(f"c² = {c**2}")
print(f"a² + b² == c²: {a**2 + b**2 == c**2}")

print("\n=== Logic Gates ===")
print(f"a AND b = {a & b}")
print(f"a OR b = {a | b}")
print(f"a XOR b = {a ^ b}")
print(f"NOT a = {~a & 0xFF}")  # 8-bit mask
print(f"NOT b = {~b & 0xFF}")
print(f"NOT c = {~c & 0xFF}")

print("\n=== Binary ===")
print(f"a = {a} = {bin(a)}")
print(f"b = {b} = {bin(b)}")
print(f"c = {c} = {bin(c)}")

print("\n=== XOR ===")
print(f"a XOR b = {a ^ b} = {bin(a ^ b)}")
print(f"Does a XOR b == c? {a ^ b == c}")

print("\n=== Gates on bits ===")
print(f"3 = 0b011")
print(f"4 = 0b100")
print(f"5 = 0b101")
print()
print(f"3 XOR 4 = {bin(3 ^ 4)} = {3 ^ 4}")
print(f"3 OR 4  = {bin(3 | 4)} = {3 | 4}")
print(f"3 AND 4 = {bin(3 & 4)} = {3 & 4}")
