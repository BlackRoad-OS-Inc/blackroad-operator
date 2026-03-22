import sys
C = [208, 202, 198, 163, 33]
def c(t, n): return f"\x1b[38;5;{n}m{t}\x1b[0m"
art = [
    "    ██████╗ ██████╗ ",
    "    ██╔══██╗██╔══██╗",
    "    ██████╔╝██████╔╝",
    "    ██╔══██╗██╔══██╗",
    "    ██████╔╝██║  ██║",
    "    ╚═════╝ ╚═╝  ╚═╝",
]
print("\x1b[2J\x1b[H\n")
for line in art:
    out = ""
    chars = [(i,ch) for i,ch in enumerate(line) if ch != ' ']
    for i, ch in enumerate(line):
        if ch == ' ':
            out += ch
        else:
            idx = [x[0] for x in chars].index(i)
            out += c(ch, C[int(idx / max(len(chars)-1,1) * 4)])
    print(out)
print(f"\n{c('        ░▒▓ BLACKROAD ▓▒░', 163)}\n")
