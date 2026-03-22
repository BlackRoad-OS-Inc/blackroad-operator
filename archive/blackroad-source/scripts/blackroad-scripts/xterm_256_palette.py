#!/usr/bin/env python3
# xterm_256_palette.py
# Canonical 256-color reference for BlackRoad (BR)

RESET = "\x1b[0m"

def cell(i):
    fg = f"\x1b[38;5;{i}m"
    bg = f"\x1b[48;5;{i}m"
    return f"{bg}{fg} {i:>3} {RESET}"

# 0–15: system colors
print("\nSYSTEM COLORS (0–15)")
for i in range(0, 16):
    print(cell(i), end=" ")
print("\n")

# 16–231: 6×6×6 color cube
print("COLOR CUBE (16–231)")
for row in range(16, 232):
    print(cell(row), end=" ")
    if (row - 15) % 6 == 0:
        print()
print()

# 232–255: grayscale ramp
print("GRAYSCALE (232–255)")
for i in range(232, 256):
    print(cell(i), end=" ")
print("\n")

print("\n" + "="*50)
print("LEGEND")
print("="*50)
print("0–15:    System colors (8 base + 8 bright)")
print("16–231:  6×6×6 RGB cube (216 colors)")
print("232–255: 24-step grayscale ramp")
print("="*50 + "\n")
