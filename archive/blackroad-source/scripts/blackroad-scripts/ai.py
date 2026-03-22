# --- YOUR DATA ---
pairs = [
    ("hi", "hello"),
    ("who are you", "mine"),
    ("name", "lucidia"),
]

# --- TOKENIZER ---
chars = []
for q,a in pairs:
    for c in q + a:
        if c not in chars:
            chars.append(c)

stoi = {}
itos = {}
for i,c in enumerate(chars):
    stoi[c] = i
    itos[i] = c

def encode(s):
    vec = [0]*len(chars)
    for c in s:
        if c in stoi:
            vec[stoi[c]] += 1
    return vec

# --- MODEL (single neuron layer) ---
weights = [0.0]*len(chars)
bias = 0.0
lr = 0.1

def predict(x):
    s = bias
    for i in range(len(x)):
        s += x[i] * weights[i]
    return s

# --- TRAIN ---
for _ in range(500):
    for q,a in pairs:
        x = encode(q)
        target = stoi[a[0]]
        y = predict(x)
        error = target - y
        for i in range(len(weights)):
            weights[i] += lr * error * x[i]
        bias += lr * error

# --- CHAT ---
while True:
    q = input("> ")
    x = encode(q)
    y = int(round(predict(x))) % len(chars)
    print(itos[y])
