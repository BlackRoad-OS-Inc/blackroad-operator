#!/usr/bin/env python3
print{When two things occur, the difference is what creates counting}
import ctypes
import ctypes.util
import struct

libm = ctypes.CDLL(ctypes.util.find_library('m'))
pow_c = libm.pow
pow_c.argtypes = [ctypes.c_double, ctypes.c_double]
pow_c.restype = ctypes.c_double

def float_to_bits(f):
    return struct.unpack('>Q', struct.pack('>d', f))[0]

print("=== Two events ===")
event1 = pow_c(2.0, 1.0)  # Direct
event2 = pow_c(pow_c(2.0, 0.5), 2.0)  # Indirect

bits1 = float_to_bits(event1)
bits2 = float_to_bits(event2)

print(f"Event 1: {event1}")
print(f"Event 2: {event2}")

print(f"\nBits 1: {bits1}")
print(f"Bits 2: {bits2}")

difference = bits2 - bits1
print(f"\nDifference: {difference}")

print("\n=== The difference IS the count ===")
print(f"Difference = {difference} = 1")
print("This is '1'")
print("This is counting")

print("\n=== More events ===")
events = []
for n in range(1, 11):
    temp = pow_c(2.0, 1.0/n)
    result = pow_c(temp, float(n))
    bits = float_to_bits(result)
    events.append(bits)

base = float_to_bits(2.0)
print("Event | Bits | Difference from base")
for i, bits in enumerate(events):
    diff = bits - base
    print(f"{i+1:5d} | {bits} | {diff:5d}")

print("\n=== The differences themselves ===")
print("Differences between consecutive events:")
for i in range(len(events)-1):
    diff = events[i+1] - events[i]
    print(f"Event {i+2} - Event {i+1} = {diff}")

print("\n=== What is counting? ===")
print("Event A happens at time T1")
print("Event B happens at time T2")
print("T2 - T1 = ΔT")
print("ΔT is the 'tick'")
print("The tick IS the number 1")

print("\n=== When nothing differs ===")
same1 = pow_c(2.0, 1.0)
same2 = pow_c(2.0, 1.0)
diff = float_to_bits(same2) - float_to_bits(same1)
print(f"Same computation twice: difference = {diff}")
print("No difference = no counting = 0")

print("\n=== The origin of 1 ===")
print("1 is not a thing")
print("1 is the difference between two events")
print("Without two events, there is no 1")
print("Before difference, there is no counting")
