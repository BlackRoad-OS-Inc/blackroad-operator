"""
LUCIDIA EDITOR
Terminal text editor
⬥ BlackRoad OS, Inc.
"""

from typing import List, Optional
from pathlib import Path


class Editor:
    """Simple text editor with basic operations"""
    
    def __init__(self):
        self.lines: List[str] = [""]
        self.cursor_x = 0
        self.cursor_y = 0
        self.filename: Optional[str] = None
        self.modified = False
        self.scroll_offset = 0
        self.view_height = 20
    
    def new(self):
        """Create new empty buffer"""
        self.lines = [""]
        self.cursor_x = 0
        self.cursor_y = 0
        self.filename = None
        self.modified = False
    
    def open(self, filename: str, vfs=None) -> bool:
        """Open a file"""
        try:
            if vfs:
                content = vfs.cat(filename)
                if content.startswith("cat:"):
                    return False
            else:
                content = Path(filename).read_text()
            
            self.lines = content.split('\n')
            if not self.lines:
                self.lines = [""]
            self.filename = filename
            self.cursor_x = 0
            self.cursor_y = 0
            self.modified = False
            return True
        except:
            return False
    
    def save(self, filename: str = None, vfs=None) -> bool:
        """Save to file"""
        fname = filename or self.filename
        if not fname:
            return False
        
        try:
            content = '\n'.join(self.lines)
            if vfs:
                vfs.write(fname, content)
            else:
                Path(fname).write_text(content)
            
            self.filename = fname
            self.modified = False
            return True
        except:
            return False
    
    def insert_char(self, char: str):
        """Insert character at cursor"""
        line = self.lines[self.cursor_y]
        self.lines[self.cursor_y] = line[:self.cursor_x] + char + line[self.cursor_x:]
        self.cursor_x += 1
        self.modified = True
    
    def insert_newline(self):
        """Insert newline at cursor"""
        line = self.lines[self.cursor_y]
        self.lines[self.cursor_y] = line[:self.cursor_x]
        self.lines.insert(self.cursor_y + 1, line[self.cursor_x:])
        self.cursor_y += 1
        self.cursor_x = 0
        self.modified = True
    
    def backspace(self):
        """Delete character before cursor"""
        if self.cursor_x > 0:
            line = self.lines[self.cursor_y]
            self.lines[self.cursor_y] = line[:self.cursor_x-1] + line[self.cursor_x:]
            self.cursor_x -= 1
            self.modified = True
        elif self.cursor_y > 0:
            # Join with previous line
            prev_len = len(self.lines[self.cursor_y - 1])
            self.lines[self.cursor_y - 1] += self.lines[self.cursor_y]
            del self.lines[self.cursor_y]
            self.cursor_y -= 1
            self.cursor_x = prev_len
            self.modified = True
    
    def delete(self):
        """Delete character at cursor"""
        line = self.lines[self.cursor_y]
        if self.cursor_x < len(line):
            self.lines[self.cursor_y] = line[:self.cursor_x] + line[self.cursor_x+1:]
            self.modified = True
        elif self.cursor_y < len(self.lines) - 1:
            # Join with next line
            self.lines[self.cursor_y] += self.lines[self.cursor_y + 1]
            del self.lines[self.cursor_y + 1]
            self.modified = True
    
    def move_cursor(self, dx: int, dy: int):
        """Move cursor by offset"""
        self.cursor_y = max(0, min(len(self.lines) - 1, self.cursor_y + dy))
        max_x = len(self.lines[self.cursor_y])
        self.cursor_x = max(0, min(max_x, self.cursor_x + dx))
    
    def move_to(self, x: int, y: int):
        """Move cursor to position"""
        self.cursor_y = max(0, min(len(self.lines) - 1, y))
        max_x = len(self.lines[self.cursor_y])
        self.cursor_x = max(0, min(max_x, x))
    
    def home(self):
        """Move to start of line"""
        self.cursor_x = 0
    
    def end(self):
        """Move to end of line"""
        self.cursor_x = len(self.lines[self.cursor_y])
    
    def page_up(self):
        """Move up one page"""
        self.cursor_y = max(0, self.cursor_y - self.view_height)
    
    def page_down(self):
        """Move down one page"""
        self.cursor_y = min(len(self.lines) - 1, self.cursor_y + self.view_height)
    
    def get_content(self) -> str:
        """Get full content"""
        return '\n'.join(self.lines)
    
    def set_content(self, content: str):
        """Set content from string"""
        self.lines = content.split('\n')
        if not self.lines:
            self.lines = [""]
        self.modified = True
    
    def render(self, width=60, height=20) -> str:
        """Render editor view"""
        # Adjust scroll
        if self.cursor_y < self.scroll_offset:
            self.scroll_offset = self.cursor_y
        elif self.cursor_y >= self.scroll_offset + height - 2:
            self.scroll_offset = self.cursor_y - height + 3
        
        lines = []
        
        # Title bar
        title = f" {self.filename or 'untitled'}"
        if self.modified:
            title += " [modified]"
        title = title[:width-2].ljust(width-2)
        lines.append(f"[bold reverse]{title}[/]")
        
        # Content
        for i in range(height - 2):
            line_num = self.scroll_offset + i
            if line_num < len(self.lines):
                line = self.lines[line_num]
                display = line[:width-5]
                
                # Show cursor
                if line_num == self.cursor_y:
                    if self.cursor_x <= len(display):
                        before = display[:self.cursor_x]
                        cursor_char = display[self.cursor_x] if self.cursor_x < len(display) else " "
                        after = display[self.cursor_x+1:] if self.cursor_x < len(display) else ""
                        display = f"{before}[reverse]{cursor_char}[/]{after}"
                
                lines.append(f"[dim]{line_num+1:3}[/] {display}")
            else:
                lines.append(f"[dim]  ~[/]")
        
        # Status bar
        status = f" Ln {self.cursor_y+1}, Col {self.cursor_x+1} | ^S save ^Q quit"
        status = status[:width-2].ljust(width-2)
        lines.append(f"[bold reverse]{status}[/]")
        
        return "\n".join(lines)


# Test
if __name__ == "__main__":
    ed = Editor()
    ed.set_content("Hello, world!\nThis is a test.\nLine 3.")
    print(ed.render())
