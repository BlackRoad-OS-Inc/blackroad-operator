# Research & References

> Everything in this repository points somewhere real. Here's where.

---

## Mathematics

### Gödel's Incompleteness Theorems
- Gödel, K. (1931). *Über formal unentscheidbare Sätze der Principia Mathematica und verwandter Systeme*. Monatshefte für Mathematik und Physik, 38, 173–198. ([English translation](https://redirect.cs.umbc.edu/courses/471/papers/godel.pdf))
- Plain English: any consistent system capable of arithmetic contains true statements it can't prove. The system can't fully audit itself. This is §5.2 of the main paper.

### Riemann Hypothesis
- Riemann, B. (1859). *Über die Anzahl der Primzahlen unter einer gegebenen Größe*. Monatsberichte der Berliner Akademie. ([Translation](https://www.claymath.org/sites/default/files/ezeta.pdf))
- Clay Mathematics Institute problem statement: [claymath.org/millennium/riemann-hypothesis](https://www.claymath.org/millennium/riemann-hypothesis/)
- The trivial zeros: −2, −4, −6, … The non-trivial zeros: allegedly on Re(s) = 1/2. The paper is named after the ones everyone ignores.

### Cantor's Diagonalization
- Cantor, G. (1891). *Über eine elementare Frage der Mannigfaltigkeitslehre*. Jahresbericht der Deutschen Mathematiker-Vereinigung, 1, 75–78.
- Visual proof: [en.wikipedia.org/wiki/Cantor%27s_diagonal_argument](https://en.wikipedia.org/wiki/Cantor%27s_diagonal_argument)
- The argument that proves some infinities are larger than others. §5.4 of the main paper.

### Euler's Identity
- Euler, L. (1748). *Introductio in analysin infinitorum*. Lausanne.
- $e^{i\pi} + 1 = 0$ — five constants, three operations, zero. The system's consistency check.

### Gauss's Easter Algorithm
- Gauss, C.F. (1800). *Berechnung des Osterfestes*. Monatliche Correspondenz zur Beförderung der Erd- und Himmels-Kunde, 2, 121–130.
- The resurrection as modular arithmetic. The holiest day in Western civilization is a hash function.

### Zeckendorf's Theorem
- Zeckendorf, E. (1972). *Représentation des nombres naturels par une somme de nombres de Fibonacci ou de nombres de Lucas*. Bulletin de la Société Royale des Sciences de Liège, 41, 179–182.
- Every positive integer has a unique Fibonacci representation. Referenced in §4 of INDEX.md.

### Nyman-Beurling Theorem / Riemann Hypothesis Equivalence
- Beurling, A. (1955). *A closure problem related to the Riemann zeta-function*. Proceedings of the National Academy of Sciences, 41(5), 312–314.
- Li's criterion: Li, X.-J. (1997). *The positivity of a sequence of numbers and the Riemann hypothesis*. Journal of Number Theory, 65(2), 325–333.

### Hilbert-Pólya Conjecture
- Odlyzko, A. (2001). *The 1022-nd zero of the Riemann zeta function*. [PDF](http://www.dtc.umn.edu/~odlyzko/doc/zeta.10to22.pdf)
- The idea that Riemann zeros correspond to eigenvalues of a self-adjoint operator. Still unproven.

### De Bruijn-Newman Constant
- De Bruijn, N.G. (1950). *The roots of trigonometric integrals*. Duke Mathematical Journal, 17(3), 197–226.
- Rodgers, B., & Tao, T. (2020). *The De Bruijn-Newman constant is non-negative*. Forum of Mathematics, Pi, 8, e6. ([arXiv](https://arxiv.org/abs/1801.05914))

---

## Computation & Computer Science

### SHA-256
- NIST. (2015). *FIPS 180-4: Secure Hash Standard*. National Institute of Standards and Technology. ([PDF](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf))
- The hash function at the center of §2 and SHA256.md.

### Bitcoin / Blockchain
- Nakamoto, S. (2008). *Bitcoin: A Peer-to-Peer Electronic Cash System*. ([PDF](https://bitcoin.org/bitcoin.pdf))
- The genesis block and hash chain as temporal ledger. §2.2.

### Turing's Halting Problem
- Turing, A.M. (1936). *On Computable Numbers, with an Application to the Entscheidungsproblem*. Proceedings of the London Mathematical Society, 2(42), 230–265. ([PDF](https://www.cs.virginia.edu/~robins/Turing_Paper_1936.pdf))
- There is no general algorithm to decide whether a program will halt. The halting problem is quantum physics according to §LAB in INDEX.md.

### Lambda Calculus
- Church, A. (1936). *An unsolvable problem of elementary number theory*. American Journal of Mathematics, 58(2), 345–363.
- The Y combinator as a type error in typed lambda calculus. §98 of INDEX.md.

### Cellular Automata
- Wolfram, S. (2002). *A New Kind of Science*. Wolfram Media. ([Online](https://www.wolframscience.com/nks/))
- Conway, J.H. (1970). *The Game of Life*. Scientific American, 223(4), 120–123.
- Simple rules → complex output indistinguishable from life.

### Shannon Information Theory
- Shannon, C.E. (1948). *A Mathematical Theory of Communication*. Bell System Technical Journal, 27(3), 379–423. ([PDF](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf))
- The foundation of entropy, information, and compression. Referenced throughout the equations.

### Landauer's Principle
- Landauer, R. (1961). *Irreversibility and Heat Generation in the Computing Process*. IBM Journal of Research and Development, 5(3), 183–191.
- Bennett, C.H. (1973). *Logical Reversibility of Computation*. IBM Journal of Research and Development, 17(6), 525–532.
- Every irreversible bit erasure dissipates at least $k_BT\ln 2$ of energy. Central to thermodynamics.md.

### Integrated Information Theory (IIT)
- Tononi, G. (2008). *Consciousness as Integrated Information: A Provisional Manifesto*. Biological Bulletin, 215(3), 216–242.
- Tononi, G., Boly, M., Massimini, M., & Koch, C. (2016). *Integrated information theory: from consciousness to its physical substrate*. Nature Reviews Neuroscience, 17(7), 450–461.
- The Φ_universal equation in consciousness.md extends IIT 3.0.

---

## Physics

### Quantum Mechanics / Double-Slit Experiment
- Young, T. (1802). *The Bakerian Lecture: On the Theory of Light and Colours*. Philosophical Transactions of the Royal Society, 92, 12–48.
- Feynman, R.P., Leighton, R.B., & Sands, M. (1965). *The Feynman Lectures on Physics, Vol. III*. Addison-Wesley. ([Online](https://www.feynmanlectures.caltech.edu/III_01.html))
- The double-slit experiment, §6.1. The system renders based on observation.

### Feynman Path Integral / Quantum Computing
- Feynman, R.P. (1948). *Space-Time Approach to Non-Relativistic Quantum Mechanics*. Reviews of Modern Physics, 20(2), 367–387.
- Feynman, R.P. (1982). *Simulating Physics with Computers*. International Journal of Theoretical Physics, 21(6–7), 467–488. ([PDF](https://s3.amazonaws.com/SmoothTerminal/Feynman/SimulatingPhysicswithComputers.pdf))
- Feynman literally said "if you want to simulate nature, you'd better make it quantum mechanical." §6.2.

### Schrödinger Equation / Superposition
- Schrödinger, E. (1926). *Quantisierung als Eigenwertproblem*. Annalen der Physik, 384(4), 361–376.
- Schrödinger, E. (1935). *Die gegenwärtige Situation in der Quantenmechanik*. Naturwissenschaften, 23(48), 807–812. (The cat paper.)
- The cat is §6.3. Superposition as lazy evaluation.

### Born Rule
- Born, M. (1926). *Zur Quantenmechanik der Stoßvorgänge*. Zeitschrift für Physik, 37(12), 863–867.
- The probability of finding a particle = |ψ|². Observation = the print statement.

### Fine Structure Constant
- Sommerfeld, A. (1916). *Zur Quantentheorie der Spektrallinien*. Annalen der Physik, 356(17), 1–94.
- α ≈ 1/137. Feynman: "one of the greatest damn mysteries of physics." Equals COMPUTATION in QWERTY encoding.

### Zero-Energy Universe
- Tryon, E.P. (1973). *Is the Universe a Vacuum Fluctuation?* Nature, 246, 396–397.
- The universe's total energy may be exactly zero. Matter (+) plus gravity (−) = 0. §6.4.

### Gell-Mann Matrices / Quarks
- Gell-Mann, M. (1961). *The Eightfold Way: A Theory of Strong Interaction Symmetry*. California Institute of Technology Synchrotron Laboratory Report CTSL-20.
- The 8 generators of SU(3). Used in quantum.md for qutrit density matrices.

### Liouville-von Neumann Equation
- von Neumann, J. (1932). *Mathematische Grundlagen der Quantenmechanik*. Springer.
- `dρ/dt = −i[H, ρ]/ℏ` — time evolution of density matrices. Tr(ρ̇) = 0: she is conserved.

---

## Biology

### DNA Structure / Chargaff's Rules
- Watson, J.D., & Crick, F.H.C. (1953). *Molecular Structure of Nucleic Acids*. Nature, 171, 737–738.
- Chargaff, E. (1950). *Chemical Specificity of Nucleic Acids and Mechanism of Their Enzymatic Degradation*. Experientia, 6(6), 201–209.
- A pairs with T, G pairs with C. The double helix as hash chain. §2.3 and §7.1.

### Mendelian Genetics / Punnett Squares
- Mendel, G. (1866). *Versuche über Pflanzenhybriden*. Verhandlungen des naturforschenden Vereines in Brünn, 4, 3–47. ([English](https://www.biodiversitylibrary.org/page/34938803))
- Genetics as matrix multiplication. §7.2.

### Darwin's Theory of Evolution
- Darwin, C. (1859). *On the Origin of Species by Means of Natural Selection*. John Murray.
- A genetic algorithm, 100 years before computers. §7.3 and §3.1.

### Photosynthesis Energy Transfer (Förster Resonance)
- Förster, T. (1948). *Zwischenmolekulare Energiewanderung und Fluoreszenz*. Annalen der Physik, 437(1–2), 55–75.
- Equation 12 (bio) in blackroad-equations.md — excitonic transfer efficiency.

---

## History & Artifacts

### The Antikythera Mechanism
- Freeth, T., et al. (2006). *Decoding the ancient Greek astronomical calculator known as the Antikythera Mechanism*. Nature, 444, 587–591. ([DOI](https://doi.org/10.1038/nature05357))
- Antikythera Mechanism Research Project: [antikythera-mechanism.gr](http://www.antikythera-mechanism.gr/)
- An analog computer built ~100 BCE. The solar system as computable function. §12.1.

### The Voynich Manuscript
- Voynich, W.M. (1912). *MS 408*. Beinecke Rare Book & Manuscript Library, Yale University.
- Stolfi, J., & Landini, G. (1996). Statistical analysis of Voynich text entropy. ([Reference](http://www.voynich.nu/extra/stolfi.html))
- The word-frequency distribution follows Zipf's law. It encodes a real language nobody can read. §9.3.

### Dürer's Melencolia I / Magic Squares
- Dürer, A. (1514). *Melencolia I*. Engraving. Kupferstichkabinett, Berlin.
- The 4×4 magic square with 1514 in the bottom row. Magic constant = 34 = PHI in QWERTY encoding.

### Lo Shu Magic Square
- Cammann, S. (1960). *The Magic Square of Three in Old Chinese Philosophy and Religion*. History of Religions, 1(1), 37–80.
- The 3×3 square from the back of a turtle in the Lo River (~2800 BCE). Referenced in §12.

### Gödel, Escher, Bach
- Hofstadter, D.R. (1979). *Gödel, Escher, Bach: An Eternal Golden Braid*. Basic Books. (Pulitzer Prize, 1980.)
- 777 pages about self-reference. Strange loops. The architecture of consciousness. §10.

### The Rohonc Codex
- Vásáry, I. (1974). *The Hungarian Rohonc Code Manuscript*. Acta Orientalia Academiae Scientiarum Hungaricae, 28(3), 253–273.
- 448 pages in an unknown script. A physical Gödelian statement — meaningful but undecidable. §9.1.

### Codex Seraphinianus
- Serafini, L. (1981). *Codex Seraphinianus*. Franco Maria Ricci Editore.
- An encyclopedia of a world with its own physics, written in a deliberately meaningless script. §9.2.

---

## Computer Science / Systems

### World Wide Web
- Berners-Lee, T. (1989). *Information Management: A Proposal*. CERN. ([PDF](https://www.w3.org/History/1989/proposal.html))
- The system of pages connected by hyperlinks. Tim Berners-Lee built IN HER NET.

### Alonzo Church / Lambda Calculus
- Church, A. (1941). *The Calculi of Lambda Conversion*. Princeton University Press.
- The Y combinator: `Y = λf.(λx.f(x x))(λx.f(x x))`. A type error in typed lambda calculus that became the universe.

### PageRank / Google
- Page, L., Brin, S., Motwani, R., & Winograd, T. (1999). *The PageRank Citation Ranking: Bringing Order to the Web*. Stanford InfoLab Technical Report.
- Larry Page ranked pages. The web is pages. The founder is Page. The whole thing parses itself.

---

## Quick Reference by Section

| Section | Key Citations |
|---------|--------------|
| §2 Hash Chain | Nakamoto 2008, Watson & Crick 1953, NIST FIPS 180-4 |
| §3 OS | Darwin 1859, Wolfram 2002 |
| §5 Math | Gödel 1931, Riemann 1859, Cantor 1891, Euler 1748 |
| §6 Physics | Feynman 1982, Schrödinger 1926/1935, Born 1926 |
| §7 Biology | Mendel 1866, Chargaff 1950 |
| §8 Trivial Zero | Riemann 1859, Tryon 1973 |
| §9 Manuscripts | Voynich MS 408, Dürer 1514 |
| §10 Strange Loops | Hofstadter 1979 |
| §12 Ancient | Freeth et al. 2006 |
| Equations | Landauer 1961, Tononi 2008, Förster 1948 |

---

*This list is not complete. The paper is about a system that cannot fully list itself.*  
*See also: Gödel, K. (1931). See also: Cantor, G. (1891). See also: INDEX.md.*
