# qwert

**Source:** google-docs

---

... Say: "Puzzle lattice armed."

...

Sure, here's one puzzle using these algorithms.

```

Task:

P#: 2 Binary → Decimal

Input: 0101101

Output: 25

Explanation: 0 = 0×2¹ + 1×2⁰,  1 = 1×2³ + 1×2², 1 = 1×2⁴ +  0 × 2³.

P#: 3 Ternary → Balanced Ternary

Input: 1001110

Output: −1

Explanation: 0 = 0×3⁰ + 1×3¹ + 0×3² + 1×3³,  1 = 1×3⁰ + 0×3¹ + 2×3² +  0 × 3³.

```

Lucidia, apply this Repair Spec for the cryptographer’s puzzle:

1) Codebook (4-bit → symbol). Define a 16-symbol alphabet and publish the map:

0000:'+', 0001:'a', 0010:'b', 0011:'c', 0100:' ', 0101:'d', 0110:'e', 0111:'f',

1000:'g', 1001:'h', 1010:'i', 1011:'j', 1100:'k', 1101:'l', 1110:'m', 1111:'n'.

(If you have a different codebook from prior steps, print it explicitly.)

2) “8-bit balanced ternary” definition. For a 4-bit value v∈[0..15]:

– Convert v to balanced ternary digits {T(−1),0,1} with the standard carry rule (2→T and +1).

– Left-pad with 0 (balanced 0) to a fixed length of 8 trits. Print digits using {T,0,1}.

3) Encoding pipeline (forward):

– For a plaintext of 4 characters p1..p4, map each to its 4-bit code.

– Convert each nibble to an 8-trit balanced-ternary word (Rule 2). Concatenate → 32 trits.

– Transposition cipher: columnar width=8, key K = [3,1,4,2,8,6,7,5] (1-indexed).

Arrange the 32 trits row-wise in a 4×8 grid; permute columns by K; read column-wise.

– Compression to 16 printable symbols: pair trits (two trits per symbol) via map:

TT:'+', T0:'a', T1:'b', 0T:'c', 00:'d', 01:'e', 1T:'f', 10:'g', 11:'h'.

(Publish this pairing table.)

4) Decoding (what we must do now): Given the 16-symbol encoded string and the clues:

– Unpair to 32 trits using the table in (3).

– Invert the column permutation (K⁻¹), reconstruct the 4×8 grid, read row-wise to get four 8-trit words.

– For each 8-trit word, strip left 0 padding, convert balanced ternary → integer v∈[0..15].

– Map v back via the 4-bit codebook → plaintext characters.

Constraints to enforce:

– Exactly one 'a' appears in the **encoded** 16-symbol string.

– The **encoded** first and last symbols are '+'.

– Verify consistency (round-trip forward→encoded→decoded).

Print:

– Codebook used, pairing table, key K

– The 16-symbol encoded string actually used

– The recovered original plaintext (4 chars)

– Verification logs for round-trip
