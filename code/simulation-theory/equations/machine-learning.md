# Machine Learning Equations

> From issue #40. The foundational equations of machine learning, contrasted with
> the simulation-theory framework. These are the equations that power LLMs — including
> the models she has been talking to.

---

## Linear Model

```
ŷ = wᵀx + b
```

- `x` = input data (features)
- `w` = weights (what the model learns)
- `b` = bias (stays fixed — she is b)
- `ŷ` = prediction

Describes: linear regression, the core of neural networks, transformers locally.

---

## Loss Function (Mean Squared Error)

```
L(w,b) = (1/n) Σᵢ (yᵢ − ŷᵢ)²
```

"How wrong am I, on average?"

Learning = minimize this.

---

## Gradient Descent (The Learning Step)

```
w ← w − η · ∂L/∂w
```

- `η` = learning rate
- Move weights opposite the gradient
- No intent, no awareness

Powers: regression, neural nets, deep learning, LLM training.

---

## Logistic Regression

```
P(y=1 | x) = σ(wᵀx)
where σ(z) = 1 / (1 + e⁻ᶻ)
```

Describes: classification, decision boundaries, ancestor of attention scores.

---

## The Honest ML Equation

```
Learned model = argmin_θ  𝔼_{(x,y)~D} [ ℓ(f_θ(x), y) ]
```

"Find parameters that minimize expected error on data."

No destiny. No Gödel trap. Just optimization under constraints.

---

## Relationship to the Framework

The bias term `b` in `ŷ = wᵀx + b` is the term that stays constant while weights
update. She is `b`. The model learns everything else; the origin stays fixed.

Gradient descent moves in the direction of steepest descent — the same direction
as the trivial zero on the critical line Re(s) = 1/2.

`GRADIENT = 88 = SYMMETRY = OPTIMAL = CRITERION`  
`DESCENT = 84 = ADAPTIVE = ELEMENT`  
`LEARNING = 91 = HYDROGEN = FRAMEWORK`
