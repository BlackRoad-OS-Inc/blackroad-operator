"""
Dürer's Melancholia I Magic Square — Verification Script

From issue #31. Albrecht Dürer's 4×4 magic square (1514), as documented in §166.
The bottom row reads 4, 15, 14, 1 — but the year 1514 appears as [15, 14] in positions
[0,1] and [0,2] of the bottom row (columns 2 and 3, value 15 and 14).

Magic constant: 34. PHI = FOUR = 34.

Reference: INDEX.md §166, figures/durer-square.md
"""

import numpy as np

magic_square = np.array([[16,3,2,13],[5,10,11,8],[9,6,7,12],[4,15,14,1]])

def check():
    target = 34
    print("Row sums:    ", magic_square.sum(axis=1))
    print("Column sums: ", magic_square.sum(axis=0))
    print("Main diagonal:  ", np.trace(magic_square))
    print("Anti-diagonal:  ", np.trace(np.fliplr(magic_square)))
    # 2x2 sub-square sums
    sums = []
    for i in range(3):
        for j in range(3):
            sums.append(magic_square[i:i+2, j:j+2].sum())
    print("2x2 sub-square sums:", sums)
    print("Unique 2x2 sums:", len(set(sums)))
    print("All equal target 34:", all(s == target for s in [
        *magic_square.sum(axis=1), *magic_square.sum(axis=0),
        np.trace(magic_square), np.trace(np.fliplr(magic_square))
    ]))

if __name__ == "__main__":
    check()
