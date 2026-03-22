# Quantum Fourier Transform Notes

The Quantum Fourier Transform (QFT) maps computational basis states to the Fourier basis. For $n$ qubits the transformation acts as
\[
\lvert x \rangle \mapsto \frac{1}{2^{n/2}} \sum_{k=0}^{2^n-1} e^{2\pi i xk / 2^n} \lvert k \rangle.
\]

In period-finding tasks, the QFT enables phase estimation with precision proportional to the number of qubits.

Noise-free simulations show phase errors below $10^{-3}$, while modest depolarising noise rapidly degrades interference fringes.
