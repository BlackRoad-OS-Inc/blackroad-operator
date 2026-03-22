#!/usr/bin/env python3
"""
br-shape-render.py
Shape renderer for BlackRoad color language.
Converts color indices [0-255] into semantic shapes.
"""

import sys

RESET = "\x1b[0m"

# Shape mappings by zone
SHAPE_MAP = {
    # 0-15: OS_LAYER - Solid blocks (kernel level)
    range(0, 16): "■",
    
    # 16-51: PERCEPTION - Light blocks (input)
    range(16, 52): "░",
    
    # 52-87: EXECUTION - Full blocks (active)
    range(52, 88): "█",
    
    # 88-123: MEMORY - Medium blocks (state)
    range(88, 124): "▓",
    
    # 124-159: AUTONOMY - Circles (agents)
    range(124, 160): "●",
    
    # 160-195: TENSION - Triangles (warnings)
    range(160, 196): "▲",
    
    # 196-231: PARADOX - Diamonds (errors)
    range(196, 232): "◆",
    
    # 232-255: META - Minimal blocks (null)
    range(232, 256): "░",
}

# Special operator shapes (override zone defaults)
SPECIAL_SHAPES = {
    0: "·",      # NULL
    1: "✗",      # ERROR
    2: "✓",      # SUCCESS
    3: "⚠",      # WARN
    196: "✗",    # ERROR_FATAL
    202: "⚡",    # EXEC_FORCE
    226: "★",    # ERROR_CASCADE
    232: "∅",    # META_NULL
    255: "◉",    # META_BRIGHT
}

def get_shape(color_index):
    """Get shape for a color index."""
    # Check special shapes first
    if color_index in SPECIAL_SHAPES:
        return SPECIAL_SHAPES[color_index]
    
    # Find zone shape
    for color_range, shape in SHAPE_MAP.items():
        if color_index in color_range:
            return shape
    
    return "?"  # Unknown

def render_color(color_index, show_shape=True, show_color=True):
    """Render a color with optional shape and background."""
    shape = get_shape(color_index)
    
    if show_color:
        bg = f"\x1b[48;5;{color_index}m"
        fg = f"\x1b[38;5;{255 - color_index}m"  # Contrast
        return f"{bg}{fg} {shape} {RESET}"
    else:
        return shape

def render_sequence(color_indices, show_color=True, separator=" → "):
    """Render a sequence of colors as a pipeline."""
    shapes = [render_color(i, show_color=show_color) for i in color_indices]
    return separator.join(shapes)

def render_block(color_index, width=3, height=1):
    """Render a color as a block of given dimensions."""
    shape = get_shape(color_index)
    bg = f"\x1b[48;5;{color_index}m"
    fg = f"\x1b[38;5;{255 - color_index}m"
    
    lines = []
    for _ in range(height):
        line = f"{bg}{fg}{shape * width}{RESET}"
        lines.append(line)
    return "\n".join(lines)

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  br-shape-render <color>              # Render single color")
        print("  br-shape-render <c1> <c2> <c3>...   # Render sequence")
        print("  br-shape-render --block <color>      # Render as block")
        print("  br-shape-render --grid               # Show all shapes")
        sys.exit(1)
    
    if sys.argv[1] == "--grid":
        print("\nBR SHAPE GRAMMAR\n")
        zones = [
            ("OS_LAYER", range(0, 16)),
            ("PERCEPTION", range(16, 52)),
            ("EXECUTION", range(52, 88)),
            ("MEMORY", range(88, 124)),
            ("AUTONOMY", range(124, 160)),
            ("TENSION", range(160, 196)),
            ("PARADOX", range(196, 232)),
            ("META", range(232, 256)),
        ]
        
        for zone_name, zone_range in zones:
            print(f"\n{zone_name} ({zone_range.start}–{zone_range.stop-1})")
            for i in zone_range:
                if i % 6 == 0:
                    print()
                print(render_color(i), end=" ")
            print()
        print()
        
    elif sys.argv[1] == "--block":
        if len(sys.argv) < 3:
            print("Error: --block requires color index")
            sys.exit(1)
        color = int(sys.argv[2])
        print(render_block(color, width=5, height=3))
        
    else:
        # Render sequence
        colors = [int(c) for c in sys.argv[1:]]
        print(render_sequence(colors))
        print()
        # Also show without color background
        print("Shapes only:", render_sequence(colors, show_color=False, separator=" "))
        print()

if __name__ == "__main__":
    main()
