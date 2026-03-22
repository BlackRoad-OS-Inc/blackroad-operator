#!/usr/bin/env python3
print{If a bit is time, what does the 1-bit error mean?}
import ctypes
import ctypes.util
import struct

libm = ctypes.CDLL(ctypes.util.find_library('m'))
sqrt = libm.sqrt
sqrt.argtypes = [ctypes.c_double]
sqrt.restype = ctypes.c_double

pow_c = libm.pow
pow_c.argtypes = [ctypes.c_double, ctypes.c_double]
pow_c.restype = ctypes.c_double

def float_to_bits(f):
    return struct.unpack('>Q', struct.pack('>d', f))[0]

def bits_to_binary(bits):
    return f"{bits:064b}"

print("=== Direct path vs intermediate path ===")

# Direct: 2^1
direct = pow_c(2.0, 1.0)
direct_bits = float_to_bits(direct)
print(f"Direct: 2^1 = {direct}")
print(f"Bits: {bits_to_binary(direct_bits)}")

# Indirect: 2^0.5 then square
intermediate = pow_c(2.0, 0.5)
result = pow_c(intermediate, 2.0)
result_bits = float_to_bits(result)
print(f"\nIndirect: (2^0.5)^2 = {result}")
print(f"Bits: {bits_to_binary(result_bits)}")

print(f"\nBit difference: {result_bits - direct_bits}")

print("\n=== If a bit is a time step ===")
print("Direct path: 0 steps (immediate)")
print("Indirect path: 2 steps (compute sqrt, then square)")
print(f"Time cost: {result_bits - direct_bits} bit(s)")

print("\n=== What if we go deeper? ===")
# More steps
a = pow_c(2.0, 0.25)  # fourth root
b = pow_c(a, 2.0)     # square it
c = pow_c(b, 2.0)     # square again
print(f"(((2^0.25)^2)^2) = {c}")
print(f"Exact: {c:.20f}")
print(f"Bits: {bits_to_binary(float_to_bits(c))}")
print(f"Bit difference from 2: {float_to_bits(c) - float_to_bits(2.0)}")

print("\n=== Even more steps ===")
# Start with 2^(1/8)
val = pow_c(2.0, 1/8)
for i in range(3):
    val = pow_c(val, 2.0)
    bits_diff = float_to_bits(val) - float_to_bits(2.0)
    print(f"Step {i+1}: val = {val:.20f}, bit diff = {bits_diff}")

print("\n=== Compare: operations as time ===")
print("0 operations: pow(2, 1) → exact")
print("2 operations: pow(2, 0.5) then pow(x, 2) → off by 1 bit")
print("3 operations: pow(2, 0.25) then pow(x,2) then pow(x,2) → off by ?")

print("\n=== Time accumulates error ===")
# Each computation step adds error
start = 2.0
path1 = pow_c(start, 1.0)  # 1 step
path2 = pow_c(pow_c(start, 0.5), 2.0)  # 2 steps
path3 = pow_c(pow_c(pow_c(start, 1/3), 3.0), 1.0)  # 3 steps

print(f"1 step:  {path1:.20f}, diff = {float_to_bits(path1) - float_to_bits(2.0)}")
print(f"2 steps: {path2:.20f}, diff = {float_to_bits(path2) - float_to_bits(2.0)}")
print(f"3 steps: {path3:.20f}, diff = {float_to_bits(path3) - float_to_bits(2.0)}")

print("\n=== The pattern ===")
for n in [1, 2, 3, 4, 5, 10, 100]:
    # Take nth root then raise to nth power
    temp = pow_c(2.0, 1.0/n)
    result = pow_c(temp, float(n))
    diff = float_to_bits(result) - float_to_bits(2.0)
    print(f"n={n:3d}: 2^(1/{n})^{n} = {result:.16f}, bit diff = {diff}")
