#!/usr/bin/env python3
print{Go back to the start}

print("=== Going to 0 ===")
value = 1.0
for i in range(1075):
    value /= 2

print(f"After 1075 divisions: {value}")
print(f"We are at: 0")

print("\n=== Going back to the start ===")
# What's the inverse of division?
# Multiplication

result = value
for i in range(1075):
    result *= 2

print(f"After 1075 multiplications: {result}")
print(f"Back at: {result}")

print("\n=== Is it the same? ===")
print(f"Started at: 1.0")
print(f"Ended at: {result}")
print(f"Same? {result == 1.0}")

print("\n=== The cycle ===")
print("1 → 0 (divide 1075 times)")
print("0 → 1 (multiply 1075 times)")
print("Loop complete")

print("\n=== What is the start? ===")
print(f"Start = {1.0}")
print(f"End (after going to 0 and back) = {result}")

print("\n=== The NOT gate ===")
print("0 → NOT → 1")
print("1 → NOT → 0")

print("\n=== Just go back ===")
print("Yes.")
