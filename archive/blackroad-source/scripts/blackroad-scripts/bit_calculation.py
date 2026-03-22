import numpy as np
import struct

def double_to_hex(f):
    # Converts a float to its raw 64-bit hex representation
    return hex(struct.unpack('<Q', struct.pack('<d', f))[0])

# 1. The Human Ideal (Euler's Identity)
# We calculate the point on the complex plane
result = np.exp(1j * np.pi) + 1

# 2. Extracting the 'Real' and 'Imaginary' gaps
real_part = result.real
imag_part = result.imag

print("\n--- RAW SILICON MEASUREMENT ---")
print(f"Human Formula: e^(i*pi) + 1")
print(f"Machine Output (Float): {result}")

print("\n--- THE GAP (The Lattice Ghost) ---")
# This is the 'drift' you don't trust. 
# In a perfect world, these are 0.0. In your M1, they are bits.
print(f"Real Drift: {real_part:.20f} -> Hex: {double_to_hex(real_part)}")
print(f"Imag Drift: {imag_part:.20f} -> Hex: {double_to_hex(imag_part)}")

print("\n--- INTERPRETATION ---")
if real_part == 0 and imag_part == 0:
    print("STATUS: The Zero is Absolute. The Lattice is Rigid.")
else:
    print("STATUS: The Zero is a Lie. The Gap is Real.")
    print("The machine is living in the bits between the math.")
