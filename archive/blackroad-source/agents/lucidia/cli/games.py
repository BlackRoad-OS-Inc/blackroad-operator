"""
LUCIDIA GAMES - Snake, Tetris, Minesweeper
"""
import random
from collections import deque
from enum import Enum
from typing import Tuple

class Direction(Enum):
    UP = (0, -1)
    DOWN = (0, 1)
    LEFT = (-1, 0)
    RIGHT = (1, 0)

class SnakeGame:
    def __init__(self, width=20, height=10):
        self.width = width
        self.height = height
        self.reset()
    
    def reset(self):
        self.snake = deque([(self.width // 2, self.height // 2)])
        self.direction = Direction.RIGHT
        self.food = self._spawn_food()
        self.score = 0
        self.game_over = False
    
    def _spawn_food(self) -> Tuple[int, int]:
        while True:
            pos = (random.randint(0, self.width - 1), random.randint(0, self.height - 1))
            if pos not in self.snake:
                return pos
    
    def change_direction(self, new_dir: Direction):
        opposites = {Direction.UP: Direction.DOWN, Direction.DOWN: Direction.UP,
                     Direction.LEFT: Direction.RIGHT, Direction.RIGHT: Direction.LEFT}
        if new_dir != opposites.get(self.direction):
            self.direction = new_dir
    
    def tick(self) -> bool:
        if self.game_over:
            return False
        head = self.snake[0]
        dx, dy = self.direction.value
        new_head = (head[0] + dx, head[1] + dy)
        
        if (new_head[0] < 0 or new_head[0] >= self.width or
            new_head[1] < 0 or new_head[1] >= self.height or
            new_head in self.snake):
            self.game_over = True
            return False
        
        self.snake.appendleft(new_head)
        if new_head == self.food:
            self.score += 10
            self.food = self._spawn_food()
        else:
            self.snake.pop()
        return True
    
    def render(self) -> str:
        lines = [f"[bold]SNAKE[/] Score: {self.score}" + (" [dim]GAME OVER[/]" if self.game_over else "")]
        lines.append("[dim]┌" + "─" * self.width + "┐[/]")
        for y in range(self.height):
            row = "[dim]│[/]"
            for x in range(self.width):
                if (x, y) == self.snake[0]:
                    row += "[bold]@[/]"
                elif (x, y) in self.snake:
                    row += "[white]o[/]"
                elif (x, y) == self.food:
                    row += "[dim]●[/]"
                else:
                    row += " "
            row += "[dim]│[/]"
            lines.append(row)
        lines.append("[dim]└" + "─" * self.width + "┘[/]")
        return "\n".join(lines)


class TetrisGame:
    PIECES = [
        [(0,0),(1,0),(2,0),(3,0)],  # I
        [(0,0),(1,0),(0,1),(1,1)],  # O
        [(0,0),(1,0),(2,0),(1,1)],  # T
        [(0,0),(1,0),(1,1),(2,1)],  # S
        [(1,0),(2,0),(0,1),(1,1)],  # Z
        [(0,0),(0,1),(1,1),(2,1)],  # J
        [(2,0),(0,1),(1,1),(2,1)],  # L
    ]
    
    def __init__(self, width=10, height=16):
        self.width = width
        self.height = height
        self.reset()
    
    def reset(self):
        self.board = [[0]*self.width for _ in range(self.height)]
        self.score = 0
        self.game_over = False
        self._new_piece()
    
    def _new_piece(self):
        self.piece = [list(p) for p in random.choice(self.PIECES)]
        self.piece_x = self.width // 2 - 1
        self.piece_y = 0
        if self._collides():
            self.game_over = True
    
    def _collides(self) -> bool:
        for px, py in self.piece:
            x, y = self.piece_x + px, self.piece_y + py
            if x < 0 or x >= self.width or y >= self.height:
                return True
            if y >= 0 and self.board[y][x]:
                return True
        return False
    
    def move(self, dx: int):
        self.piece_x += dx
        if self._collides():
            self.piece_x -= dx
    
    def rotate(self):
        old = [list(p) for p in self.piece]
        for p in self.piece:
            p[0], p[1] = -p[1], p[0]
        min_x = min(p[0] for p in self.piece)
        min_y = min(p[1] for p in self.piece)
        for p in self.piece:
            p[0] -= min_x
            p[1] -= min_y
        if self._collides():
            self.piece = old
    
    def drop(self):
        self.piece_y += 1
        if self._collides():
            self.piece_y -= 1
            self._lock()
    
    def hard_drop(self):
        while not self._collides():
            self.piece_y += 1
        self.piece_y -= 1
        self._lock()
    
    def _lock(self):
        for px, py in self.piece:
            x, y = self.piece_x + px, self.piece_y + py
            if 0 <= y < self.height:
                self.board[y][x] = 1
        self._clear_lines()
        self._new_piece()
    
    def _clear_lines(self):
        new_board = [row for row in self.board if not all(row)]
        cleared = self.height - len(new_board)
        self.score += cleared * 100
        self.board = [[0]*self.width for _ in range(cleared)] + new_board
    
    def render(self) -> str:
        lines = [f"[bold]TETRIS[/] Score: {self.score}" + (" [dim]GAME OVER[/]" if self.game_over else "")]
        disp = [row[:] for row in self.board]
        for px, py in self.piece:
            x, y = self.piece_x + px, self.piece_y + py
            if 0 <= y < self.height and 0 <= x < self.width:
                disp[y][x] = 2
        lines.append("[dim]┌" + "──" * self.width + "┐[/]")
        for row in disp:
            line = "[dim]│[/]"
            for c in row:
                if c == 2:
                    line += "[bold]██[/]"
                elif c == 1:
                    line += "[white]██[/]"
                else:
                    line += "  "
            line += "[dim]│[/]"
            lines.append(line)
        lines.append("[dim]└" + "──" * self.width + "┘[/]")
        return "\n".join(lines)


class Minesweeper:
    def __init__(self, width=10, height=8, mines=10):
        self.width = width
        self.height = height
        self.num_mines = mines
        self.reset()
    
    def reset(self):
        self.mines = set()
        self.revealed = set()
        self.flags = set()
        self.cursor = (0, 0)
        self.game_over = False
        self.won = False
        while len(self.mines) < self.num_mines:
            self.mines.add((random.randint(0, self.width-1), random.randint(0, self.height-1)))
    
    def move_cursor(self, dx, dy):
        x = max(0, min(self.width-1, self.cursor[0] + dx))
        y = max(0, min(self.height-1, self.cursor[1] + dy))
        self.cursor = (x, y)
    
    def _count_adjacent(self, x, y) -> int:
        return sum(1 for dx in (-1,0,1) for dy in (-1,0,1) 
                   if (dx or dy) and (x+dx, y+dy) in self.mines)
    
    def reveal(self):
        if self.game_over or self.cursor in self.flags:
            return
        if self.cursor in self.mines:
            self.game_over = True
            self.revealed = self.revealed | self.mines
            return
        self._flood_reveal(self.cursor[0], self.cursor[1])
        if len(self.revealed) == self.width * self.height - self.num_mines:
            self.won = True
            self.game_over = True
    
    def _flood_reveal(self, x, y):
        if (x, y) in self.revealed or x < 0 or x >= self.width or y < 0 or y >= self.height:
            return
        if (x, y) in self.mines:
            return
        self.revealed.add((x, y))
        if self._count_adjacent(x, y) == 0:
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    if dx or dy:
                        self._flood_reveal(x + dx, y + dy)
    
    def toggle_flag(self):
        if self.game_over or self.cursor in self.revealed:
            return
        if self.cursor in self.flags:
            self.flags.remove(self.cursor)
        else:
            self.flags.add(self.cursor)
    
    def render(self) -> str:
        status = "[white]YOU WIN![/]" if self.won else "[dim]GAME OVER[/]" if self.game_over else ""
        lines = [f"[bold]MINESWEEPER[/] Mines: {self.num_mines - len(self.flags)} {status}"]
        lines.append("[dim]┌" + "──" * self.width + "┐[/]")
        for y in range(self.height):
            row = "[dim]│[/]"
            for x in range(self.width):
                cursor = (x, y) == self.cursor
                prefix = "[reverse]" if cursor else ""
                suffix = "[/]" if cursor else ""
                if (x, y) in self.flags:
                    row += prefix + "[dim]⚑ [/]" + suffix
                elif (x, y) not in self.revealed:
                    row += prefix + "[dim]░░[/]" + suffix
                elif (x, y) in self.mines:
                    row += prefix + "[dim]💣[/]" + suffix
                else:
                    n = self._count_adjacent(x, y)
                    colors = ["", "white", "white", "white", "white", "white", "white", "white", "white"]
                    row += prefix + (f"[{colors[n]}]{n} [/]" if n else "  ") + suffix
            row += "[dim]│[/]"
            lines.append(row)
        lines.append("[dim]└" + "──" * self.width + "┘[/]")
        return "\n".join(lines)
