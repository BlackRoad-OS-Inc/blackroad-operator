# Graph Classes Closed under Self-intersection & Extensional ESO (11 Nov 2025)

## Graph Classes Closed under Self-intersection
- Establishes a dichotomy for Maximum Independent Set (MIS) and weighted MIS on graph classes closed under self-intersection.
- Key structural criterion: presence or absence of the tripod graph as a self-intersection-subgraph.
  - Tripod forbidden ⇒ MIS solvable in polynomial time via dynamic decomposition over bounded-complexity gadgets.
  - Tripod allowed ⇒ MIS remains NP-hard by reductions embedding hard instances into self-intersection-closed classes.
- Conceptual placement: self-intersection-closed classes sit strictly between monotone (subgraph-closed) and hereditary (induced-subgraph-closed) classes, expanding the frontier of tractable MIS beyond monotone settings while pinpointing the exact barrier.
- Technique highlights: introduces canonical self-intersection decompositions, identifies minimal hard configurations, and leverages circle graph representations to translate geometric constraints into combinatorial certificates.

## On the Computational Power of Extensional ESO
- Investigates the expressive strength of the extensional fragment of existential second-order logic (ESO) where second-order variables only appear extensionally (i.e., without existential quantification over relation elements inside first-order scopes).
- Main correspondence: extensional ESO captures precisely the languages definable in hereditary first-order logic (HFO).
  - Subclass with monotone universal FO part coincides with finitely bounded constraint satisfaction problems (CSPs), giving a descriptive complexity characterization of that CSP family.
- Complexity implications: certain NP problems (e.g., Graph Isomorphism, Monotone Dualization) reduce to extensional ESO, suggesting the logic can capture NP-intermediate phenomena.
- Limitation: extensional ESO cannot express all NP languages unless E = NE, delineating its computational ceiling.
- Methods combine logical normal forms, reductions preserving extensionality, and model-theoretic analysis of finitely bounded templates.

## Shared Insight
These results align algorithmic and logical boundaries: the graph-theoretic dichotomy pinpoints when a classic NP-hard problem becomes tractable within a refined closure property, while the logical characterization maps extensional ESO to well-understood classes (HFO and finitely bounded CSPs), revealing how structural restrictions in logic echo complexity separations.
