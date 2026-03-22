import torch
import torch.nn as nn
import torch.optim as optim

# --- DATA (yours) ---
data = [
    ("hi", "hello"),
    ("who are you", "i am mine"),
    ("what is your name", "lucidia"),
]

chars = sorted(set("".join(x+y for x,y in data)))
stoi = {c:i for i,c in enumerate(chars)}
itos = {i:c for c,i in stoi.items()}

def encode(s):
    return torch.tensor([stoi[c] for c in s])

def decode(t):
    return "".join(itos[i] for i in t)

# --- MODEL (yours) ---
class TinyAI(nn.Module):
    def __init__(self):
        super().__init__()
        self.embed = nn.Embedding(len(chars), 16)
        self.fc = nn.Linear(16, len(chars))

    def forward(self, x):
        x = self.embed(x)
        x = x.mean(dim=0)
        return self.fc(x)

model = TinyAI()
loss_fn = nn.CrossEntropyLoss()
opt = optim.Adam(model.parameters(), lr=0.01)

# --- TRAIN ---
for epoch in range(500):
    for q,a in data:
        x = encode(q)
        y = encode(a)[0]
        out = model(x)
        loss = loss_fn(out.unsqueeze(0), y.unsqueeze(0))
        opt.zero_grad()
        loss.backward()
        opt.step()

# --- CHAT ---
while True:
    q = input("> ")
    x = encode(q)
    out = model(x)
    print(decode([out.argmax().item()]))
