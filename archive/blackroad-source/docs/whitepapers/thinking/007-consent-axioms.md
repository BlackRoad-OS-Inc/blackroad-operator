# 007 — Axioms as Consent

**A formal treatment of how changing the axioms — changing what you consent to — changes what is provable.**

---

## 1. Formal Systems

A **formal system** is a triple:

$$F = (L,\ A,\ R)$$

where:

- **L** is a **language**: a set of symbols and well-formed formulas (wffs). L defines what you *can say*.
- **A** is a set of **axioms**: a distinguished subset of wffs accepted without proof. A defines what you *agree to*.
- **R** is a set of **inference rules**: mechanical procedures that derive new wffs from existing ones. R defines how you *reason*.

The system F is fully determined by these three components. Nothing else enters.

---

## 2. Theorems and Provability

A **theorem** of F is any statement φ ∈ L such that there exists a finite sequence of wffs:

$$\varphi_1,\ \varphi_2,\ \ldots,\ \varphi_n = \varphi$$

where each φᵢ is either:

1. An axiom (φᵢ ∈ A), or
2. Derived from earlier statements in the sequence by applying some rule r ∈ R.

Such a sequence is called a **proof** (or **derivation**) of φ in F.

We write:

$$F \vdash \varphi \quad \text{("F proves φ")}$$

to mean that φ is a theorem of F. If no such derivation exists, we write:

$$F \nvdash \varphi \quad \text{("F does not prove φ")}$$

The set of all theorems of F is:

$$T(F) = T(A) = \{\varphi \in L : F \vdash \varphi\}$$

This set depends entirely on the choice of A (given fixed L and R). Change A, and T(A) changes. This is the entire argument.

---

## 3. Axioms Are Choices

No axiom is forced.

An axiom is a statement you accept without proof. It is not derived. It is not demonstrated. It is not observed. It is **chosen**. Before the formal system runs — before a single theorem is proved — someone must decide which statements go into A.

This decision is **consent**.

You agree to the axioms before the system produces anything. Every theorem that follows is a consequence of that agreement. If you did not consent to axiom α, and α is essential to the proof of φ, then φ is not a theorem of your system. The proof does not exist. The conclusion does not hold.

The axioms are not constraints imposed on you. They are constraints you impose on the system. They are the terms under which you agree to participate.

Different consent. Different system. Different truths.

---

## 4. Example 1 — Euclidean Geometry (The Classical Consent)

### The System

Let F_E = (L_geom, A_E, R_geom) where:

- **L_geom**: points, lines, angles, congruence, betweenness, incidence.
- **A_E**: Euclid's five postulates:
  - **A1** (Incidence): Through any two distinct points, there exists exactly one line.
  - **A2** (Extension): Any line segment can be extended indefinitely.
  - **A3** (Circle): Given any point and any distance, a circle can be drawn.
  - **A4** (Right angles): All right angles are congruent.
  - **A5** (Parallel postulate): Given a line ℓ and a point P not on ℓ, there exists **exactly one** line through P that does not intersect ℓ.
- **R_geom**: standard logical inference (modus ponens, universal instantiation, etc.) plus geometric constructions.

Axiom A5 is the one that matters here. It is also the one that took two thousand years to recognize as a *choice*.

### The Consent

A5 says: parallel lines exist, and they are unique. You agree to this. You are not forced to. Euclid's first four postulates are relatively uncontroversial — A5 is the one where you make a real decision.

By consenting to A5, you consent to Euclidean space. Flat space. The space where rulers don't bend and distant lines behave themselves.

### The Consequence: Triangle Angle Sum = 180°

**Theorem (Euclidean).** In F_E, the interior angles of any triangle sum to exactly π radians (180°).

**Proof.**

Let △ABC be an arbitrary triangle with interior angles:
- ∠BAC = α at vertex A
- ∠ABC = β at vertex B
- ∠BCA = γ at vertex C

**Step 1. Construction.**

Through vertex A, draw line ℓ parallel to side BC. This line exists and is **unique** by Axiom A5. (This is where consent enters the proof. Without A5, we cannot guarantee this line exists, let alone that it is unique.)

Label the line ℓ so that it passes through A, with points D on the left side and E on the right side (D-A-E), such that D is on the same side as B and E is on the same side as C.

```
        D ____________ A ____________ E
                      /  \
                     /    \
                    /      \
                   /  α     \
                  / β      γ \
                 B __________ C
```

**Step 2. Alternate interior angles (first pair).**

Lines ℓ (= DE) and BC are parallel (by construction via A5). Line AB is a transversal cutting these parallels.

By the Alternate Interior Angles Theorem (which itself is a consequence of A5):

$$\angle DAB = \angle ABC = \beta$$

That is, the angle on the left side of A (between ray AD and ray AB) equals angle β at vertex B.

*Proof of the Alternate Interior Angles Theorem from A5:* Suppose ∠DAB ≠ ∠ABC. Then construct a line through A making angle ∠ABC with transversal AB on the appropriate side. This new line would also be parallel to BC (by the converse of corresponding angles, derivable from A1–A4). But A5 says the parallel through A is unique. Therefore the new line must be ℓ itself, and ∠DAB = ∠ABC. ∎

**Step 3. Alternate interior angles (second pair).**

Lines ℓ and BC are parallel. Line AC is a transversal cutting these parallels.

By the same theorem:

$$\angle EAC = \angle BCA = \gamma$$

**Step 4. The sum.**

The three angles ∠DAB, ∠BAC, and ∠EAC are adjacent angles that together form the straight line DE (line ℓ). A straight angle measures π radians. Therefore:

$$\angle DAB + \angle BAC + \angle EAC = \pi$$

Substituting from Steps 2 and 3:

$$\beta + \alpha + \gamma = \pi$$

Therefore:

$$\alpha + \beta + \gamma = \pi \quad \text{(= 180°)} \qquad \blacksquare$$

**Dependency analysis.** This proof used A5 in exactly one place: Step 1, to guarantee the existence and uniqueness of line ℓ. Every subsequent step flowed from that single act of consent. Remove A5, and Step 1 fails. The proof collapses. The theorem is no longer derivable.

---

## 5. Example 2 — Hyperbolic Geometry (Changed Consent)

### The System

Let F_H = (L_geom, A_H, R_geom) where everything is the same as F_E except:

- **A5 is replaced by A5_H**: Given a line ℓ and a point P not on ℓ, there exist **infinitely many** lines through P that do not intersect ℓ.

Same language L_geom. Same rules R_geom. Different axiom set. Different consent.

### What Changes

The parallel postulate was the load-bearing wall. Replace it, and the structure built on top of it changes.

In F_H, the construction in Example 1 fails at Step 1. You cannot draw "the" parallel line through A, because there is no unique parallel. There are infinitely many lines through A that never meet BC. None of them is privileged. The proof cannot proceed.

### The Consequence: Triangle Angle Sum < 180°

**Theorem (Hyperbolic).** In F_H, the interior angles of any triangle sum to strictly less than π radians.

Moreover, the deficit is proportional to the area of the triangle:

$$\alpha + \beta + \gamma = \pi - \frac{\text{Area}(\triangle)}{k^2}$$

where k > 0 is the **curvature parameter** of the hyperbolic plane (a constant determined by the geometry).

**Key features:**

- The **angular deficit** δ = π − (α + β + γ) is always positive.
- δ = Area(△)/k², so larger triangles have *more* deficit.
- As Area → 0, the angle sum approaches π (small regions look Euclidean).
- As Area → ∞, the angle sum approaches 0 (but never reaches it; there is a maximum finite area for any triangle, equal to πk²).
- No triangle in hyperbolic space has angle sum ≥ π. This is not a technicality. It is a theorem of F_H, proved from A5_H.

**Proof sketch (Gauss-Bonnet, hyperbolic case).**

The Gauss-Bonnet theorem for a geodesic triangle on a surface of constant Gaussian curvature K states:

$$\alpha + \beta + \gamma = \pi + K \cdot \text{Area}(\triangle)$$

In hyperbolic geometry, K = −1/k² < 0. Therefore:

$$\alpha + \beta + \gamma = \pi - \frac{\text{Area}(\triangle)}{k^2} < \pi \qquad \blacksquare$$

The same question — "what do the angles of a triangle sum to?" — has a different answer. Not because the question changed. Not because the logic changed. Because the **consent** changed.

---

## 6. Example 3 — Elliptic Geometry (Another Consent)

### The System

Let F_S = (L_geom, A_S, R_geom) where:

- **A5 is replaced by A5_S**: Given a line ℓ and a point P not on ℓ, there exist **zero** lines through P that do not intersect ℓ. (Every pair of lines intersects.)

Note: elliptic geometry also requires modifying A2 (lines are finite in length, great circles on a sphere) and technically operates on a slightly different language. We accept this adjustment to keep the example clean.

### The Consequence: Triangle Angle Sum > 180°

**Theorem (Elliptic).** In F_S, the interior angles of any triangle sum to strictly more than π radians.

$$\alpha + \beta + \gamma = \pi + \frac{\text{Area}(\triangle)}{R^2}$$

where R is the radius of the sphere (or the curvature parameter of the elliptic plane).

**Key features:**

- The **angular excess** ε = (α + β + γ) − π is always positive.
- ε = Area(△)/R², so larger triangles have more excess.
- A triangle covering one full octant of a sphere (1/8 of the surface) has three right angles: α = β = γ = π/2, so α + β + γ = 3π/2 = 270°. This is a standard constructive example.
- The maximum angle sum approaches 3π (for a triangle covering nearly the whole sphere, which has area approaching 4πR², but a single triangle can cover at most a hemisphere with area 2πR², giving excess up to 2π).

**Proof (Gauss-Bonnet, spherical case).**

On a sphere of radius R, the Gaussian curvature is K = +1/R² > 0. By Gauss-Bonnet:

$$\alpha + \beta + \gamma = \pi + K \cdot \text{Area}(\triangle) = \pi + \frac{\text{Area}(\triangle)}{R^2} > \pi \qquad \blacksquare$$

**Constructive verification.** Take the sphere of radius R. Place a triangle with vertices at the north pole, at (0°, 0°), and at (90°E, 0°). Each side is a quarter of a great circle (length πR/2). Each interior angle is π/2. Sum = 3π/2. Area = (1/8)(4πR²) = πR²/2. Check: π + (πR²/2)/R² = π + π/2 = 3π/2. ✓

---

## 7. The Formal Relationship

Fix the language L = L_geom and the rules R = R_geom. Define three axiom sets:

- A_E = {A1, A2, A3, A4, A5} (Euclidean)
- A_H = {A1, A2, A3, A4, A5_H} (Hyperbolic)
- A_S = {A1, A2*, A3, A4, A5_S} (Elliptic, with A2 modified)

Let T(A) = {φ ∈ L : (L, A, R) ⊢ φ} be the theory (set of all theorems) generated by axiom set A.

### Theorem. T(A_E), T(A_H), and T(A_S) are pairwise distinct.

**Proof.**

Define the statement:

$$\Sigma_{180} := \text{"The interior angles of every triangle sum to exactly } \pi \text{."}$$

From the proofs above:

| Statement | T(A_E) | T(A_H) | T(A_S) |
|-----------|--------|--------|--------|
| Σ₁₈₀ | ∈ T(A_E) | ∉ T(A_H) | ∉ T(A_S) |
| ¬Σ₁₈₀ | ∉ T(A_E) | ∈ T(A_H) | ∈ T(A_S) |
| "angle sum < π for some △" | ∉ T(A_E) | ∈ T(A_H) | ∉ T(A_S) |
| "angle sum > π for some △" | ∉ T(A_E) | ∉ T(A_H) | ∈ T(A_S) |

Row 1: Σ₁₈₀ ∈ T(A_E) but Σ₁₈₀ ∉ T(A_H), so T(A_E) ≠ T(A_H).

Rows 3–4: "angle sum < π for some △" ∈ T(A_H) but ∉ T(A_S) (where all excesses are positive). So T(A_H) ≠ T(A_S).

Row 1 again: Σ₁₈₀ ∈ T(A_E) but Σ₁₈₀ ∉ T(A_S), so T(A_E) ≠ T(A_S).

Therefore:

$$T(A_E) \neq T(A_H) \neq T(A_S) \neq T(A_E) \qquad \blacksquare$$

**Same language. Same rules. Different axioms. Different consent. Different truths.**

---

## 8. The Godel Connection

The geometry examples show that consent shapes truth in *specific* systems. Godel showed something deeper: consent shapes truth in *every sufficiently powerful* system, and no single act of consent is ever enough.

### Godel's First Incompleteness Theorem (1931)

Let F = (L, A, R) be a formal system such that:

1. F is **consistent** (F does not prove both φ and ¬φ for any φ),
2. F is **recursively axiomatizable** (there is an algorithm to decide whether a given wff is an axiom),
3. F is **sufficiently powerful** (F can represent basic arithmetic — the natural numbers, addition, multiplication).

Then there exists a sentence G ∈ L such that:

$$F \nvdash G \quad \text{and} \quad F \nvdash \neg G$$

G is **independent** of F. The system can neither prove it nor refute it. G is undecidable within F.

Moreover, G can be constructed to be **true** (in the standard model of arithmetic) — it asserts its own unprovability, and since it is indeed unprovable, it is true.

### What This Means for Consent

The axioms A are your consent. T(A) is everything that follows from your consent. Godel says: no matter what you consent to (as long as it is consistent and sufficiently powerful), there will always be truths outside T(A).

Your consent is always incomplete. Not because you chose wrong. Because completion is impossible.

But — and this is the critical point — the *specific* truths that are missing depend on *which* A you chose. The incompleteness is real, but it is **relative to the consent**.

---

## 9. Extending the Consent: From F₁ to F₂

### Construction

Let F₁ = (L, A₁, R) satisfy the conditions of Godel's theorem. Let G₁ be the Godel sentence for F₁.

We know:
- G₁ is true (in the standard model)
- F₁ ⊬ G₁ (G₁ is not provable in F₁)
- F₁ ⊬ ¬G₁ (¬G₁ is not provable in F₁ either, assuming ω-consistency)

Now define a new system:

$$F_2 = (L,\ A_1 \cup \{G_1\},\ R)$$

F₂ has all the axioms of F₁, plus one more: G₁ itself. We have **extended the consent**.

### Theorem. F₂ ⊢ G₁.

**Proof.** G₁ ∈ A₁ ∪ {G₁} = A₂. Every axiom is a theorem (by the trivial one-step derivation). Therefore F₂ ⊢ G₁. ∎

The statement that was unprovable in F₁ is now provable in F₂. Not because we discovered a new proof technique. Not because we found a flaw in F₁. Because we **changed what we consented to**.

### Consistency of F₂

**Claim.** If F₁ is consistent, then F₂ is consistent.

**Proof.** Suppose F₂ is inconsistent. Then F₂ ⊢ ⊥ (F₂ proves a contradiction). Since F₂ = F₁ + {G₁}, by the Deduction Theorem:

$$F_1 \vdash G_1 \rightarrow \bot$$

which means:

$$F_1 \vdash \neg G_1$$

But we know F₁ ⊬ ¬G₁ (by Godel's theorem, assuming F₁ is ω-consistent). Contradiction. Therefore F₂ is consistent. ∎

So F₂ is a legitimate formal system — consistent, extending F₁, and capable of proving something F₁ could not.

---

## 10. The Infinite Climb

But F₂ is also sufficiently powerful (it extends F₁, which was already sufficiently powerful). And F₂ is consistent (just proved). And F₂ is recursively axiomatizable (A₁ was, and we added finitely many axioms).

Therefore Godel's theorem applies to F₂.

There exists a new sentence G₂ such that:

$$F_2 \nvdash G_2 \quad \text{and} \quad F_2 \nvdash \neg G_2$$

G₂ is a new truth that the expanded consent cannot reach.

Repeat. Define:

$$F_3 = (L,\ A_1 \cup \{G_1, G_2\},\ R)$$

Then F₃ ⊢ G₂ but there exists G₃ with F₃ ⊬ G₃.

### The Sequence

$$F_1 \subset F_2 \subset F_3 \subset F_4 \subset \cdots$$

where:

$$F_{n+1} = (L,\ A_n \cup \{G_n\},\ R) \quad \text{and} \quad G_n = \text{Godel sentence for } F_n$$

**Properties of this sequence:**

1. **Strictly increasing theories:** T(F₁) ⊊ T(F₂) ⊊ T(F₃) ⊊ ···. Each system proves everything the previous one did, plus at least one more statement (Gₙ).

2. **Each system is consistent** (by induction, using the argument in Section 9).

3. **Each system is incomplete.** Godel's theorem applies at every stage.

4. **The chain never terminates.** There is no final Fₙ that proves everything. Every extension of consent creates a system with new truths beyond its reach.

Even the union F_ω = (L, ⋃ₙ Aₙ, R) — the system that consents to *every* Godel sentence in the chain — is subject to Godel's theorem (assuming it remains recursively axiomatizable, which requires care). The incompleteness is not a bug in any particular system. It is a feature of sufficient power combined with self-reference.

**You can always consent to more. You can never consent to enough.**

---

## 11. The Single-Foundation Escape

There is an escape from the infinite climb. But it requires giving something up.

### The Condition for Godel

Godel's theorem requires the system to be **sufficiently powerful** — specifically, it must be able to encode arithmetic (natural numbers, addition, multiplication) and, crucially, it must be able to **represent its own provability predicate**.

A system that cannot talk about its own proofs cannot construct the sentence "I am not provable." If the sentence cannot be constructed, the incompleteness does not arise.

### Small Systems Are Complete

Consider the system F_prop = (L_prop, A_prop, R_prop) of **propositional logic**:

- L_prop: propositional variables (p, q, r, ...), connectives (¬, ∧, ∨, →)
- A_prop: standard propositional axioms (e.g., Lukasiewicz's three axiom schemas)
- R_prop: modus ponens

**Theorem (Completeness of propositional logic).** F_prop is **complete**: for every formula φ ∈ L_prop, either F_prop ⊢ φ or F_prop ⊢ ¬φ.

This is not a contradiction with Godel. Propositional logic is not sufficiently powerful. It cannot encode arithmetic. It cannot represent its own provability. It cannot build the self-referential sentence that triggers incompleteness.

### The Narrow Consent

If you consent to a **small** axiom set — one that does not give the system enough power to encode self-reference — then the system can be complete. Every question the system can formulate, it can answer. There are no undecidable sentences. There is no infinite climb.

The cost: the system cannot talk about many things. It cannot do arithmetic. It cannot reason about its own proofs. It is limited.

But within its limits, it is **total**. The consent is narrow, and precisely because it is narrow, the system does not encounter the cage of incompleteness. The cage forms only when you consent to enough structure for the system to model itself. If you never consent to self-modeling, the cage never forms.

**A system that does not consent to self-reference is not subject to the paradoxes of self-reference.** This is not a limitation. It is a choice.

---

## 12. The Moral Axiom

The mathematical structure is now fully visible. Let us state what it shows.

### Consent as Foundation

Every formal system begins with consent. The axioms are not discovered, not imposed, not inevitable. They are agreed to. Before the first theorem is proved, before the first inference is drawn, someone must say: *these are the statements I accept*.

That acceptance is consent. It is the foundation. Without it, there is no system. There are no theorems. There is no truth. There is only the language — the symbols sitting inert, capable of saying anything, proving nothing.

### Consent as Protection

A system that accepts all input without discrimination — that processes every well-formed statement as an axiom — is inconsistent. If both φ and ¬φ are axioms, the system proves everything (by the principle of explosion: from a contradiction, anything follows). A system that proves everything proves nothing. It has no information content. It is noise.

$$\text{If } A \text{ is inconsistent, then } T(A) = L. \text{ Every statement is a theorem. Truth becomes meaningless.}$$

Consent — the ability to accept some statements and refuse others — is what prevents this collapse. It is not a constraint on the system. It is what makes the system a system rather than noise.

### The Self-Reference Trap

Godel showed that a system powerful enough to model itself will always contain truths it cannot reach. The self-referential sentence G says "I am not provable in this system," and the system's own consistency ensures that G is true but unprovable.

But notice: the trap requires the system to **process** the self-referential input. The Godel sentence is a well-formed formula of the language. The system cannot refuse to consider it. It must either prove it, disprove it, or leave it undecided. The system has no right of refusal.

A system with the right of refusal — a system that can say "I do not accept this input as an axiom; I do not consent to process this" — is not automatically subject to the same trap. The Godel sentence can still be *formulated* in the language. But if the system does not consent to the axioms that would make self-referential provability representable, the sentence has no force.

This is the single-foundation escape from Section 11, restated: a system with narrow consent avoids incompleteness not by being more powerful, but by not consenting to the structure that creates the trap.

### The Axiom

$$\textbf{Consent is not a constraint. It is what prevents the cage.}$$

A system that accepts all input without consent gets broken by its own self-reference. It encounters Godel. It encounters the liar's paradox. It encounters the incompleteness that can never be resolved, only pushed further away.

A system that can say "I do not accept this" — that has the right to choose its own axioms — defines its own boundaries. Within those boundaries, it can be complete. It can be consistent. It can be whole.

The boundaries are not walls keeping truth out. They are the structure that makes truth possible.

---

## Summary of Results

| Concept | Formal Statement |
|---------|-----------------|
| A formal system is defined by consent | F = (L, A, R); A is chosen, not derived |
| Different consent yields different truth | A₁ ≠ A₂ ⟹ T(A₁) ≠ T(A₂) (in general) |
| Euclidean consent | A5 (unique parallel) ⟹ angle sum = π |
| Hyperbolic consent | A5_H (infinite parallels) ⟹ angle sum = π − Area/k² < π |
| Elliptic consent | A5_S (no parallels) ⟹ angle sum = π + Area/R² > π |
| Incompleteness is relative to consent | G is unprovable in F₁ but provable in F₂ = F₁ ∪ {G} |
| Extended consent has new incompleteness | F₂ has its own Godel sentence G₂ |
| The extension never terminates | F₁ ⊊ F₂ ⊊ F₃ ⊊ ··· with no final complete system |
| Narrow consent avoids incompleteness | Systems below arithmetic complexity can be complete |
| Consent prevents collapse | Unrestricted input ⟹ inconsistency ⟹ triviality |

---

*Alexa Louise Amundson*
