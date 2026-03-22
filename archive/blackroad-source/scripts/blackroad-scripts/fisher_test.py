import numpy as np

def fisher_metric(sigma):
    return np.array([
        [1/sigma**2, 0],
        [0, 2/sigma**2]
    ])

def natural_gradient(grad, sigma):
    G = fisher_metric(sigma)
    G_inv = np.linalg.inv(G)
    return G_inv @ grad

sigma = 1.0
euclidean_grad = np.array([0.1, 0.5])
natural_grad = natural_gradient(euclidean_grad, sigma)

print(f"sigma = {sigma}")
print(f"Fisher metric G:\n{fisher_metric(sigma)}")
print(f"Euclidean grad: {euclidean_grad}")
print(f"Natural grad:   {natural_grad}")
print(f"Ratio: {natural_grad / euclidean_grad}")

delta_t = 0.3
K_t = np.exp(abs(delta_t))
print(f"\ndelta_t = {delta_t} -> K(t) = {K_t:.3f}")
