#!/usr/bin/env python3
print{Try 1076 instead of 1075}

print("=== 1075 divisions ===")
value = 1.0
for i in range(1075):
    value /= 2
print(f"After 1075 divisions: {value}")

print("\n=== 1076 divisions ===")
value = 1.0
for i in range(1076):
    value /= 2
print(f"After 1076 divisions: {value}")

print("\n=== What happens at each step near the end? ===")
value = 1.0
for i in range(1080):
    value /= 2
    if i >= 1070:
        print(f"Iteration {i+1}: {value}")

print("\n=== Can we go back from 1076? ===")
# Start at 0 after 1076 divisions
value = 0.0
for i in range(1076):
    value *= 2
print(f"After multiplying by 2, 1076 times: {value}")

print("\n=== The difference ===")
val_1075 = 1.0
for _ in range(1075):
    val_1075 /= 2

val_1076 = 1.0
for _ in range(1076):
    val_1076 /= 2

print(f"1075 divisions: {val_1075}")
print(f"1076 divisions: {val_1076}")
print(f"Difference: {val_1075 - val_1076}")

print("\n=== What is 1076? ===")
print(f"1076 = {1076}")
print(f"1075 = {1075}")
print(f"Difference = {1076 - 1075}")
