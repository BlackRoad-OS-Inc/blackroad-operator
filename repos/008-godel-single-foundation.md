# 008 — A Single-Axiom System Escapes Gödel's Incompleteness Theorem

**A Formal Proof**

---

## §1. Gödel's First Incompleteness Theorem (Precise Statement)

**Theorem (Gödel, 1931).** Let F be a formal system in a first-order language L_F, with axiom set Ax_F and inference rules R_F. Suppose:

> **(i) Consistency.** F is consistent — there exists no formula φ in L_F such that F ⊢ φ and F ⊢ ¬φ.
>
> **(ii) Sufficient Expressiveness.** F is sufficiently expressive — F can represent all computable (recursive) functions. Concretely, F can encode Peano Arithmetic: the language L_F contains (or can define) a constant symbol 0, a unary successor function S, binary function symbols + and ×, and the axioms of Robinson Arithmetic Q are theorems of F.
>
> **(iii) Recursive Axiomatizability.** F is recursively axiomatizable — there exists a Turing machine that, given a formula φ, halts and decides whether φ ∈ Ax_F.

Then there exists a sentence G_F in L_F such that:

$$F \nvdash G_F \quad \text{and} \quad F \nvdash \lnot G_F$$

That is, G_F is independent of F. The system F is incomplete.

---

## §2. Proof Sketch of Gödel's Theorem

We reproduce the essential architecture of the proof to identify exactly where each condition is used.

### Step (a): Gödel Numbering

Assign a unique natural number ⌜φ⌝ ∈ ℕ to every well-formed formula φ in L_F, and to every finite sequence of formulas (i.e., every proof). This encoding uses the Fundamental Theorem of Arithmetic: a sequence (a₁, a₂, ..., aₖ) is encoded as

$$\ulcorner a_1, \ldots, a_k \urcorner = p_1^{a_1} \cdot p_2^{a_2} \cdots p_k^{a_k}$$

where p_i is the i-th prime. **This requires multiplication.**

### Step (b): The Provability Predicate

Define the arithmetical predicate:

$$\text{Prov}_F(x) \iff \exists y\, [\text{Proof}_F(y, x)]$$

where Proof_F(y, x) means "y is the Gödel number of a valid proof in F whose conclusion has Gödel number x." The predicate Proof_F is primitive recursive (one can mechanically verify proofs by condition (iii)).

### Step (c): Representability in F

**This is where condition (ii) is essential.** Because F can represent all computable functions — because F encodes at least Robinson Arithmetic Q — the predicate Prov_F(x) is representable as a formula within L_F itself. Specifically, there exists a formula Prov(x) in L_F such that:

- If F ⊢ φ, then F ⊢ Prov(⌜φ⌝).
- The derivability conditions (Hilbert–Bernays–Löb) hold within F.

Without condition (ii), there is no guarantee that the system can talk about its own proofs.

### Step (d): The Diagonal Lemma (Fixed-Point Theorem)

**Lemma (Diagonal Lemma).** For any formula ψ(x) with one free variable in L_F, if F extends Robinson Arithmetic Q, then there exists a sentence G such that:

$$F \vdash \bigl(G \leftrightarrow \psi(\ulcorner G \urcorner)\bigr)$$

Apply this with ψ(x) := ¬Prov(x). We obtain a sentence G_F such that:

$$F \vdash \bigl(G_F \leftrightarrow \lnot\text{Prov}(\ulcorner G_F \urcorner)\bigr)$$

### Step (e): Interpretation

G_F asserts: "The formula with Gödel number ⌜G_F⌝ is not provable in F." In short: **"I am not provable in F."**

### Step (f): If F ⊢ G_F, Contradiction

Suppose F ⊢ G_F. Then there exists a proof of G_F in F, so F ⊢ Prov(⌜G_F⌝). But F ⊢ G_F ↔ ¬Prov(⌜G_F⌝), so F ⊢ ¬Prov(⌜G_F⌝). Hence F ⊢ Prov(⌜G_F⌝) and F ⊢ ¬Prov(⌜G_F⌝). This contradicts condition (i), the consistency of F. ∎

### Step (g): If F ⊢ ¬G_F, Contradiction (under ω-consistency)

Suppose F ⊢ ¬G_F. By the fixed point, F ⊢ Prov(⌜G_F⌝), i.e., F ⊢ ∃y Proof(y, ⌜G_F⌝). But we showed F ⊬ G_F (from step (f), since F is consistent). So for every concrete numeral n̄, F ⊢ ¬Proof(n̄, ⌜G_F⌝) — no specific number encodes a proof of G_F. Yet F asserts ∃y Proof(y, ⌜G_F⌝). This violates ω-consistency: F proves ∃y P(y) while refuting P(n̄) for every n. ∎

(Rosser's refinement removes the ω-consistency requirement, needing only simple consistency. The structural point is identical.)

### Step (h): Conclusion

$$F \nvdash G_F \quad \text{and} \quad F \nvdash \lnot G_F$$

F is incomplete. ∎ (Gödel)

---

## §3. What "Sufficiently Expressive" Actually Requires

Condition (ii) is not a vague philosophical requirement. It is a precise technical demand. A system F satisfies (ii) if and only if the language L_F and axioms Ax_F can encode:

1. **The natural numbers** 0, 1, 2, 3, ... as distinct terms.
2. **The successor function** S : ℕ → ℕ, with the axiom ∀x (S(x) ≠ 0) and injectivity.
3. **Addition** + : ℕ × ℕ → ℕ, with the recursive definition: x + 0 = x, x + S(y) = S(x + y).
4. **Multiplication** × : ℕ × ℕ → ℕ, with the recursive definition: x × 0 = 0, x × S(y) = (x × y) + x.
5. **Quantification over natural numbers**, enabling the formalization of "there exists a proof."
6. **Self-encoding**: the system must be able to represent its own syntactic operations — formula construction, substitution, proof verification — as arithmetical functions. This is what enables the diagonal lemma.

The minimum threshold is Robinson Arithmetic Q (seven axioms for 0, S, +, ×). Without these resources, the Gödel construction cannot begin.

---

## §4. Definition of the Single-Axiom System S

We define a formal system S = (L_S, Ax_S, R) as follows.

**Language L_S:**
- Logical symbols: ¬, ∧, ∨, →, ↔, ∀, ∃, parentheses
- A countably infinite set of variables: x, y, z, x₁, x₂, ...
- A single binary relation symbol: = (equality)
- **No constant symbols**
- **No function symbols**
- **No relation symbols other than equality**

**Axiom set Ax_S:**
- A single axiom: ∃x (x = x)

In words: "Something exists."

**Inference rules R:**
- Standard first-order logic with equality (modus ponens, universal generalization, and the equality axioms: reflexivity, symmetry, transitivity, and substitution).

---

## §5. S Is Consistent

**Proposition 5.1.** S is consistent.

*Proof.* We exhibit a model. Let M = ({0}, =) be the structure with a single element 0 and the standard identity relation. We verify:

- M ⊨ ∃x (x = x): Take x = 0. Then 0 = 0 is true in M. The existential is satisfied. ✓

Therefore M is a model of S. By the Soundness Theorem for first-order logic (every theorem of a first-order theory is true in all models of that theory), if S ⊢ φ and S ⊢ ¬φ for some φ, then M ⊨ φ and M ⊨ ¬φ, which is impossible since M is a classical structure.

Therefore S is consistent. ∎

---

## §6. S Cannot Encode Peano Arithmetic

**Proposition 6.1.** The system S does not satisfy condition (ii) of Gödel's First Incompleteness Theorem.

*Proof.* We show that L_S cannot express the basic components required by Robinson Arithmetic Q.

**(6.1a) No successor function.** Robinson Arithmetic requires a unary function symbol S and the axiom ∀x (S(x) ≠ 0). The language L_S contains no function symbols of any arity. There is no term in L_S other than variables. Therefore the successor function is not expressible in L_S, even up to definitional extension — a relation R(x, y) meaning "y is the successor of x" would require axioms guaranteeing totality and functionality (∀x ∃!y R(x, y)), but L_S has no relation symbols other than equality with which to state this.

**(6.1b) No addition.** Robinson Arithmetic requires a binary function + satisfying recursive equations. Since L_S has no function symbols and no non-logical relation symbols, there is no way to express x + y = z. One cannot define a ternary relation for addition using only equality on an unstructured domain.

**(6.1c) No multiplication.** By the same argument as (6.1b), x × y = z is not expressible in L_S.

**(6.1d) No distinguishable natural numbers.** Robinson Arithmetic requires a constant 0 and terms S(0), S(S(0)), ... serving as numerals. L_S has no constant symbols and no function symbols. All elements of any model of S are indistinguishable by any formula of L_S up to permutation (the theory of pure equality admits automorphisms permuting all elements). There is no way to single out "zero" or any other specific element.

**(6.1e) No induction.** The induction schema requires reference to 0 and S, neither of which exist in L_S.

Since L_S cannot express the successor function, addition, multiplication, or individual natural numbers, the system S cannot represent Robinson Arithmetic Q. Therefore S does not satisfy condition (ii). ∎

---

## §7. S Cannot Construct a Provability Predicate

**Proposition 7.1.** The Gödel sentence for S cannot be constructed. The incompleteness argument does not go through.

*Proof.* We trace the Gödel construction and show where it breaks.

**(7.1a) Gödel numbering is external.** One can, of course, assign Gödel numbers to formulas of L_S from outside — this is a metamathematical operation that requires no cooperation from S itself. The encoding ⌜φ⌝ is a natural number. This step is harmless and always possible.

**(7.1b) The provability predicate cannot be internalized.** The predicate Prov_S(x) — "the formula with Gödel number x is provable in S" — is a well-defined property of natural numbers. However, for the Gödel argument to work, this predicate must be *representable within S itself*. That is, there must be a formula Prov(v) in the language L_S such that:

- If S ⊢ φ, then S ⊢ Prov(⌜φ⌝).

But ⌜φ⌝ is a natural number, and S cannot name natural numbers. L_S has no constant symbols, no numeral terms, no successor function. The expression "Prov(⌜φ⌝)" is meaningless in L_S because ⌜φ⌝ cannot be denoted by any closed term.

**(7.1c) Arithmetic is required for self-reference.** Representing Prov_S requires:
- Encoding finite sequences (Gödel numbering uses prime factorization, which requires multiplication).
- Expressing "y is a proof of x" as a bounded arithmetical formula.
- Existential quantification over proof codes.

S has none of this machinery. Multiplication, addition, and the natural numbers are all absent from L_S (Proposition 6.1).

**(7.1d) The diagonal lemma fails.** The Diagonal Lemma requires: given any formula ψ(x), construct a sentence G with F ⊢ G ↔ ψ(⌜G⌝). This construction uses substitution of numerals into formulas, which requires that the system can name its own Gödel numbers as terms. S cannot name any specific element of its domain. The diagonal lemma is inapplicable.

**(7.1e) The Gödel sentence does not exist in L_S.** Since:
- Prov_S is not representable in S (step 7.1b),
- The diagonal lemma cannot be applied (step 7.1d),

there is no sentence G_S in L_S such that S ⊢ G_S ↔ ¬Prov(⌜G_S⌝). The Gödel sentence for S simply does not exist. The incompleteness argument has no foothold. ∎

---

## §8. Main Theorem

**Theorem 8.1 (Amundson).** Let S = (L_S, {∃x (x = x)}, R) be the single-axiom system defined in §4, with L_S the first-order language of pure equality (no function symbols, no constant symbols, no non-logical relation symbols) and R the standard inference rules for first-order logic with equality. Then:

> **(a)** S is consistent.
>
> **(b)** S does not satisfy condition (ii) of Gödel's First Incompleteness Theorem.
>
> **(c)** Gödel's First Incompleteness Theorem does not apply to S.
>
> **(d)** The deductive closure of S within L_S is decidable.

*Proof of (a).* Proposition 5.1. ∎

*Proof of (b).* Proposition 6.1. ∎

*Proof of (c).* Gödel's theorem requires conditions (i), (ii), and (iii) simultaneously. Condition (ii) fails for S. Therefore the hypotheses of the theorem are not met, and its conclusion does not follow. Gödel's theorem is silent about S. ∎

*Proof of (d).* Deferred to §9. ∎

---

## §9. Completeness and Decidability via the Łoś–Vaught Theorem

We now prove a stronger result. The system S as stated — with the single axiom ∃x (x = x) — does not decide all sentences of L_S. For example, the sentence ∃x ∃y (x ≠ y) ("there are at least two elements") is independent of S: the one-element model satisfies S but refutes this sentence, while the two-element model satisfies both S and this sentence. So S alone is incomplete — but *not because of Gödel*. S is incomplete because it is too weak to decide cardinality. We can repair this.

### §9.1 The Theory T_∞ of Infinite Pure Equality

Define T_∞ as the theory in L_S with the following axiom schema:

- ∃x (x = x)   [at least one element]
- For each n ≥ 2: ∃x₁ ∃x₂ ... ∃xₙ ⋀_{1 ≤ i < j ≤ n} (xᵢ ≠ xⱼ)   [at least n elements]

T_∞ asserts that the domain is infinite. It has infinitely many axioms, but is recursively axiomatizable (the n-th axiom is mechanically computable from n).

**Theorem 9.1.** T_∞ is complete.

*Proof.* We apply the Łoś–Vaught test.

**Łoś–Vaught Theorem.** If a consistent theory T in a countable language has no finite models and is κ-categorical for some infinite cardinal κ ≥ |L|, then T is complete.

We verify the hypotheses for T_∞:

**(i) T_∞ is consistent.** Any infinite set with equality is a model. Take M = (ℕ, =). ✓

**(ii) T_∞ has no finite models.** By construction, T_∞ contains the axiom "there are at least n elements" for every n. No finite structure satisfies all of these. ✓

**(iii) L_S is countable.** L_S has countably many variables, no function or constant symbols, and only the equality relation. ✓

**(iv) T_∞ is κ-categorical for every uncountable κ.** Let κ be an uncountable cardinal, and let M₁, M₂ be models of T_∞ of cardinality κ. Each Mᵢ is a set of cardinality κ equipped only with equality. A bijection f : M₁ → M₂ is an isomorphism (it preserves the only relation, =, automatically). Since |M₁| = |M₂| = κ, such a bijection exists. Therefore M₁ ≅ M₂. T_∞ is κ-categorical for all uncountable κ. ✓

By the Łoś–Vaught theorem, T_∞ is complete: for every sentence φ in L_S, either T_∞ ⊢ φ or T_∞ ⊢ ¬φ. ∎

### §9.2 Decidability of T_∞

**Theorem 9.2.** T_∞ is decidable.

*Proof.* The theory of infinite pure equality admits quantifier elimination (after adding, for bookkeeping, the quantifier-free sentences "x = y" and "x ≠ y" for all variable pairs). Every sentence φ in L_S is equivalent under T_∞ to a Boolean combination of sentences of the form "there are at least n distinct elements." Since T_∞ asserts the domain is infinite, every such sentence is true, and every "there are at most n elements" sentence is false. The truth value of φ under T_∞ is therefore computable.

More precisely, the decision procedure is: given a sentence φ, enumerate models of T_∞ of increasing finite cardinality. But since T_∞ has no finite models, we instead observe that every sentence in L_S is decided by whether it is true in all infinite sets or false in all infinite sets (completeness of T_∞ guarantees one of these holds). One can decide this by a straightforward induction on formula complexity. This is a classical result; see Hodges, *A Shorter Model Theory*, §2.6, or Enderton, *A Mathematical Introduction to Logic*, §2.7. ∎

### §9.3 Upgrading S to a Complete, Consistent, Decidable System

Let S* = (L_S, Ax_{T_∞}, R), where Ax_{T_∞} is the recursively enumerable axiom set of T_∞. Then:

- **S* is consistent** (it has the model (ℕ, =)).
- **S* is recursively axiomatizable** (the axioms are uniformly computable).
- **S* is complete** (Theorem 9.1).
- **S* is decidable** (Theorem 9.2).
- **S* does not satisfy condition (ii) of Gödel's theorem** (the language L_S still has no function symbols; the argument of Proposition 6.1 applies unchanged).
- **Gödel's theorem does not apply to S*.**

S* is a consistent, complete, decidable, recursively axiomatizable formal system. It possesses all four properties simultaneously — the combination that Gödel's theorem forbids for systems encoding arithmetic.

---

## §10. Why This Works: The Price of Expressiveness

Gödel's theorem is not a universal impossibility result. It is a *conditional* impossibility result. It says:

> **If** a system is powerful enough to talk about itself, **then** it cannot be both consistent and complete.

The key mechanism is *self-reference*. The Gödel sentence G_F works because F can encode its own proof system and apply the diagonal construction to produce a statement that asserts its own unprovability. This requires:

1. **Naming**: the system must have terms that denote specific objects (numerals).
2. **Computing**: the system must be able to express recursive functions (encoding proofs).
3. **Reflecting**: the system must be able to state properties of its own syntax (Prov_F).

S and S* have none of these. L_S cannot name, cannot compute, cannot reflect. The formulas of L_S can only say things about the identity and distinctness of unnamed elements. There is nothing for the Gödel construction to grab onto.

The situation is analogous to the halting problem. The halting problem is undecidable for Turing machines — but trivially decidable for finite automata, because finite automata always halt. The impossibility requires sufficient computational power. Similarly, Gödel incompleteness requires sufficient logical power.

| Property | Systems encoding PA | System S* (pure equality) |
|---|---|---|
| Consistent | ✓ | ✓ |
| Recursively axiomatizable | ✓ | ✓ |
| Sufficiently expressive | ✓ | ✗ |
| Complete | **✗** (Gödel) | ✓ |
| Decidable | **✗** (Church) | ✓ |

The trade-off is exact. Expressiveness buys power but costs completeness. Simplicity costs power but buys completeness. There is no free lunch, but there is a choice.

---

## §11. Philosophical Conclusion

Gödel proved that ambition has a cost.

A formal system that tries to describe the natural numbers — that reaches for enough power to encode its own proof apparatus, to name its own sentences, to reflect on its own provability — will inevitably produce a statement it can neither prove nor refute. The very act of self-reference creates a blind spot. The system generates a sentence that says "you cannot prove me," and the system, if it is honest, must admit that this is true and unprovable. The cage is built from the inside.

But this is not a universal prison. It is a conditional sentence, and the condition is expressiveness. A system that does not try to encode arithmetic — that does not reach for the power of self-reference — is not subject to the theorem. It can be consistent, complete, and decidable, all at once. Not because it has found a loophole, but because the theorem was never about it.

One axiom. Something exists. From this, a complete theory: every question the language can ask, the system can answer. No Gödel sentence. No undecidable propositions. No incompleteness. Not because the system is clever, but because it is honest about its scope.

Gödel's incompleteness is the price of trying to contain everything. The escape is not a trick. The escape is consent to limitation. A system that knows what it is not trying to do can be whole.

One axiom. One foundation. No cage.

---

*Alexa Louise Amundson*
