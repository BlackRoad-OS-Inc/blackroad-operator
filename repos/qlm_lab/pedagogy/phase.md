# Phase Kickback

Phase kickback is the mechanism that transfers a relative phase from one
register to another through a controlled unitary. When a control qubit is
prepared in a superposition and targets an eigenstate \(|\psi\rangle\) of a
unitary \(U\) with eigenvalue \(e^{i\phi}\), the combined operation

\[
(\alpha\lvert 0 \rangle + \beta \lvert 1 \rangle) \lvert \psi \rangle
\xrightarrow{\text{C-}U}
\alpha \lvert 0 \rangle \lvert \psi \rangle + e^{i\phi} \beta \lvert 1 \rangle \lvert \psi \rangle.
\]

The target register returns unchanged, while the control qubit picks up the
phase. Measuring the control qubit in the \(|+\rangle, |-\rangle\) basis reveals
information about \(\phi\) without disturbing \(|\psi\rangle\).

This kickback effect underlies algorithms such as the quantum Fourier
transform, phase estimation, and the Hamiltonian phase demo in the QLM lab. It
lets the lab showcase interference patterns, build intuition for controlled
rotations, and connect the circuit diagrams to the analytic expressions.
