#!/usr/bin/env python3
print{Use earliest computer programming concepts
FORTRAN (1957) - Formula Translation
Assembly language principles
Machine code / Binary}

sequence = [19, 100, 100, 4, 4, 8, 25, 1, 3, 15, 30, 4, 4, 32, 7, 221, 451, 114, 31, 114, 31, 1]

print("=== FORTRAN-style (Formula Translation) ===")
print("Early computing: Everything is a number/formula")

# FORTRAN used column-based input
# Columns 1-5: Statement labels
# Column 6: Continuation
# Columns 7-72: Statements

print("\nAs FORTRAN columns (pairs):")
for i in range(0, len(sequence), 2):
    if i+1 < len(sequence):
        label = sequence[i]
        value = sequence[i+1]
        print(f"{label:5d} {value:5d}")

print("\n=== Assembly Language (Opcodes) ===")
# Early assembly: operation codes
# Format: OPCODE OPERAND

print("Treating as OPCODE + OPERAND pairs:")
for i in range(0, len(sequence), 2):
    if i+1 < len(sequence):
        opcode = sequence[i]
        operand = sequence[i+1]
        print(f"OP {opcode:3d} with operand {operand:3d}")

print("\n=== Binary Machine Code ===")
# Convert each number to binary (8-bit)
print("As 8-bit machine instructions:")
for num in sequence:
    binary = format(num & 0xFF, '08b')  # Mask to 8 bits
    print(f"{num:3d} = {binary} = 0x{num:02x}")

print("\n=== Punch Card Format ===")
# IBM punch cards: 80 columns, 12 rows
print("As punch card data (Hollerith encoding):")
for num in sequence:
    # Hollerith code uses zone punches + digit punches
    print(f"{num:3d} = Card column pattern")

print("\n=== Earliest Concept: Church-Turing ===")
# Lambda calculus / Turing machine
# Everything reduces to:
# 0 (false/halt)
# 1 (true/continue)
# successor function

print("\nReduced to binary (Church encoding):")
binary_sequence = [n % 2 for n in sequence]
print("".join(str(b) for b in binary_sequence))
print(f"Binary: {''.join(str(b) for b in binary_sequence)}")

# Lambda calculus: numbers as functions
print("\nChurch numerals (λf.λx. f^n(x)):")
for n in sequence[:10]:  # First 10
    if n <= 5:
        print(f"{n} = λf.λx. {'f(' * n}x{')'*n}")

print("\n=== LISP (1958) - List Processing ===")
# Second oldest language
print("As LISP S-expression:")
print(f"({' '.join(str(n) for n in sequence)})")

print("\n=== The Pattern in Pairs ===")
pairs = []
for i in range(0, len(sequence), 2):
    if i+1 < len(sequence):
        pairs.append((sequence[i], sequence[i+1]))

print("Pairs as operations:")
for i, (a, b) in enumerate(pairs):
    print(f"{i}: ({a}, {b}) → {a+b}, {a*b}, {a^b} (sum, product, XOR)")

print("\n=== The Actual Interpretation ===")
# What if these are coordinates in a 2D space?
print("\nAs 2D points:")
for i, (x, y) in enumerate(pairs):
    print(f"Point {i}: ({x}, {y})")

# Distance from origin
import math
print("\nDistances from origin:")
for i, (x, y) in enumerate(pairs):
    dist = math.sqrt(x**2 + y**2)
    print(f"Point {i}: distance = {dist:.2f}")

print("\n=== Character encoding (ASCII ancestor) ===")
# Baudot code (1870s telegraph)
# 5-bit encoding

print("As 5-bit Baudot-style codes:")
for num in sequence:
    five_bit = format(num & 0b11111, '05b')  # Mask to 5 bits
    print(f"{num:3d} = {five_bit} (5-bit)")

print("\n=== THE ANSWER ===")
# What if it's simply indices into something?

print("These are INDEX numbers.")
print("They point to positions.")
print("22 positions.")
print("What has 22 positions?")
print("")
print("Possibilities:")
print("- 22 Hebrew letters")
print("- 22 Major Arcana (Tarot)")
print("- 22 paths on Tree of Life (Kabbalah)")
print("- 22 amino acids")
print("- 22 chapters (in some text)")
print("")
print("Or... 22,000 addresses / 22 = 1,000")
print("Each number represents a block of 1,000 addresses?")
