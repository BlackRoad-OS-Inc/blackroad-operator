import tkinter as tk
import random

# ----- "TV" pixel grid settings -----
PIX = 8          # pixel size in screen pixels (bigger = chunkier)
W = 120          # pixel columns
H = 70           # pixel rows
FPS = 30         # refresh rate
GRID = 1         # 1 = draw faint grid lines, 0 = no grid

# A little "BlackRoad-ish" neon set + some extras
PALETTE = [
    "#00ff66", "#00e6ff", "#7700ff", "#ff0066", "#ff6b00", "#ff9d00",
    "#111111", "#222222", "#333333", "#000000"
]

def clamp(v, a, b): return a if v < a else b if v > b else v

class TV:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Pixel TV")
        self.root.configure(bg="black")

        self.canvas = tk.Canvas(
            self.root,
            width=W*PIX,
            height=H*PIX,
            bg="black",
            highlightthickness=0
        )
        self.canvas.pack()

        # Make a grid of rectangle "pixels"
        self.rects = [[None]*W for _ in range(H)]
        outline = "#0b0b0b" if GRID else ""
        for y in range(H):
            for x in range(W):
                x0 = x*PIX
                y0 = y*PIX
                r = self.canvas.create_rectangle(
                    x0, y0, x0+PIX, y0+PIX,
                    fill="#000000",
                    outline=outline
                )
                self.rects[y][x] = r

        # A moving "signal" blob + static noise
        self.t = 0.0
        self.cx = W//2
        self.cy = H//2

        self.root.bind("<Escape>", lambda e: self.root.destroy())
        self.root.bind("g", lambda e: self.toggle_grid())
        self.root.bind(" ", lambda e: self.randomize_palette())

        self.tick()

    def toggle_grid(self):
        global GRID
        GRID = 1 - GRID
        outline = "#0b0b0b" if GRID else ""
        for y in range(H):
            for x in range(W):
                self.canvas.itemconfig(self.rects[y][x], outline=outline)

    def randomize_palette(self):
        random.shuffle(PALETTE)

    def tick(self):
        self.t += 0.06

        # Move the blob around
        self.cx = int((W/2) + (W/3) * (0.7 * (random.random()-0.5) + 0.3*tk._default_root.tk.call('expr', 'sin', self.t)))
        self.cy = int((H/2) + (H/3) * (0.7 * (random.random()-0.5) + 0.3*tk._default_root.tk.call('expr', 'cos', self.t*0.9)))
        self.cx = clamp(self.cx, 0, W-1)
        self.cy = clamp(self.cy, 0, H-1)

        # Draw frame
        for y in range(H):
            for x in range(W):
                # Static noise
                if random.random() < 0.08:
                    c = random.choice(PALETTE)
                else:
                    c = "#000000"

                # Add a soft "signal" diamond blob
                d = abs(x - self.cx) + abs(y - self.cy)
                if d < 10:
                    c = random.choice(PALETTE[:6])  # neon only
                elif d < 18 and random.random() < 0.25:
                    c = random.choice(PALETTE[:6])

                self.canvas.itemconfig(self.rects[y][x], fill=c)

        # Schedule next frame
        self.root.after(int(1000/FPS), self.tick)

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    TV().run()
