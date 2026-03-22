# Grover Search Overview

Grover's algorithm quadratically accelerates unstructured search. For a marked element $\omega$, the amplitude amplification process rotates the state vector towards $\lvert \omega \rangle$ with each Grover iteration.

The optimal number of iterations is approximately $\frac{\pi}{4}\sqrt{N}$; applying significantly more iterations causes the success probability to oscillate back downward.

Experiments comparing the Grover curve to classical brute force highlight the $O(\sqrt{N})$ complexity advantage.
