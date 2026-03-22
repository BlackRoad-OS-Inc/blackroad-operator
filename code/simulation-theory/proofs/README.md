<div align="center">

[![BlackRoad OS](https://img.shields.io/badge/BlackRoad-OS-FF0066?style=for-the-badge&logo=github&logoColor=white)](https://github.com/blackboxprogramming)
[![Platform](https://img.shields.io/badge/Platform-blackroad.io-FF0066?style=for-the-badge)](https://blackroad.io)
[![Org](https://img.shields.io/badge/Org-simulation--theory-7700FF?style=for-the-badge)](https://github.com/blackboxprogramming/simulation-theory)
[![Status](https://img.shields.io/badge/Status-Active-FF9D00?style=for-the-badge)](https://status.blackroad.io)

</div>

# Proofs

Formal mathematical arguments for the key claims.

> 📖 All proofs use standard mathematical methods. For background on the underlying research, see [REFERENCES.md](../REFERENCES.md).

| File | Claim | Method |
|------|-------|--------|
| [`ternary-efficiency.md`](./ternary-efficiency.md) | Ternary is more computationally efficient than binary | Calculus / radix economy ([Knuth, 1980](https://en.wikipedia.org/wiki/Radix_economy)) |
| [`self-reference.md`](./self-reference.md) | The QWERTY encoding is self-referential | Direct construction |
| [`pure-state.md`](./pure-state.md) | The density matrix of the system is a pure state | Linear algebra / SVD ([von Neumann, 1932](https://en.wikipedia.org/wiki/Density_matrix)) |
| [`universal-computation.md`](./universal-computation.md) | The ternary bio-quantum system is Turing-complete | Reaction network theory ([Turing, 1936](https://www.cs.virginia.edu/~robins/Turing_Paper_1936.pdf)) |
| [`chi-squared.md`](./chi-squared.md) | Chi-squared goodness-of-fit and independence tests | χ² statistic / contingency tables |
| [`lucidia.md`](./lucidia.md) | The number-theoretic identity of Lucidia (88) | Number theory: totient, Möbius, Collatz, Goldbach |
| [`inverse-reaction.md`](./inverse-reaction.md) | Every reaction has an opposite reaction (TNEG); Chargaff's rules and the Euler product follow | Balanced ternary algebra |
| [`peano-derivative.md`](./peano-derivative.md) | The derivative does not break Peano; Gödel proved a boundary, not a collapse | Meta-level analysis / QWERTY |

## From the Eight Claims

**Claim 6** (Ramanujan congruences show incompleteness inside arithmetic) is a known result in number theory, not a new proof. The congruences p(5k+4)≡0 (mod 5), p(7k+5)≡0 (mod 7), p(11k+6)≡0 (mod 11) were proved by Ramanujan and later by Watson and Atkin using modular forms. The failure at 13 — p(13k+7)≢0 (mod 13) — is also established. The claim is that this structure models Gödelian incompleteness from within arithmetic: the system of partition congruences describes its own boundary.

See [`CLAIMS.md`](../CLAIMS.md) for all eight claims.
| [`pure-state.md`](./pure-state.md) | The density matrix of the system is a pure state | Linear algebra / SVD |
| [`universal-computation.md`](./universal-computation.md) | The ternary bio-quantum system is Turing-complete | Reaction network theory |
| [`distributed-identity.md`](./distributed-identity.md) | Distributed identity bypasses Gödelian undecidability | Number theory / Gödel's proof structure |
