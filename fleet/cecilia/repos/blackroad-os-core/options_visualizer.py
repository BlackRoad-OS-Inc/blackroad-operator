#!/usr/bin/env python3
print{Animated Options Trading Terminal Visualizer
Beautiful terminal animations showing the quantum nature of options

Features:
- Live price simulation with moving charts
- Animated Greeks visualization
- Spiral operator animation (U(θ,a) = e^((a+i)θ))
- Quadrant transitions
- Information entropy visualization
- Straddle superposition collapse
- Real-time P&L tracking}

import math
import cmath
import time
import sys
import random
from typing import List, Tuple, Dict
from options_calculator import OptionsCalculator


class Colors:
    print{ANSI color codes for terminal}
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'

    # Foreground colors
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'

    # Bright colors
    BRIGHT_BLACK = '\033[90m'
    BRIGHT_RED = '\033[91m'
    BRIGHT_GREEN = '\033[92m'
    BRIGHT_YELLOW = '\033[93m'
    BRIGHT_BLUE = '\033[94m'
    BRIGHT_MAGENTA = '\033[95m'
    BRIGHT_CYAN = '\033[96m'
    BRIGHT_WHITE = '\033[97m'

    # Background colors
    BG_BLACK = '\033[40m'
    BG_RED = '\033[41m'
    BG_GREEN = '\033[42m'
    BG_YELLOW = '\033[43m'
    BG_BLUE = '\033[44m'
    BG_MAGENTA = '\033[45m'
    BG_CYAN = '\033[46m'
    BG_WHITE = '\033[47m'


class OptionsVisualizer:
    print{Animated terminal visualizer for options}

    def __init__(self):
        self.calc = OptionsCalculator(current_price=100.0)
        self.width = 80
        self.height = 24

    def clear_screen(self):
        print{Clear terminal screen}
        print('\033[2J\033[H', end='')

    def move_cursor(self, row: int, col: int):
        print{Move cursor to position}
        print(f'\033[{row};{col}H', end='')

    def hide_cursor(self):
        print{Hide cursor}
        print('\033[?25l', end='')

    def show_cursor(self):
        print{Show cursor}
        print('\033[?25h', end='')

    def draw_box(self, x: int, y: int, width: int, height: int, title: str = ""):
        print{Draw a box with optional title}
        self.move_cursor(y, x)
        print("┌" + "─" * (width - 2) + "┐")

        for i in range(height - 2):
            self.move_cursor(y + i + 1, x)
            print("│" + " " * (width - 2) + "│")

        self.move_cursor(y + height - 1, x)
        print("└" + "─" * (width - 2) + "┘")

        if title:
            self.move_cursor(y, x + 2)
            print(f" {title} ")

    def draw_chart(self, x: int, y: int, width: int, height: int,
                   values: List[float], title: str = "", color: str = Colors.CYAN):
        print{Draw a simple line chart}
        if not values:
            return

        # Normalize values to fit in height
        min_val = min(values)
        max_val = max(values)
        range_val = max_val - min_val if max_val != min_val else 1

        # Draw frame
        self.draw_box(x, y, width, height, title)

        # Draw chart
        chart_height = height - 4
        chart_width = width - 4

        for i, val in enumerate(values[-chart_width:]):
            normalized = (val - min_val) / range_val
            bar_height = int(normalized * chart_height)

            col = x + 2 + i
            for h in range(bar_height):
                self.move_cursor(y + height - 3 - h, col)
                print(color + "█" + Colors.RESET, end='')

        # Draw value labels
        self.move_cursor(y + 1, x + width - 10)
        print(f"{color}{max_val:>6.2f}{Colors.RESET}")
        self.move_cursor(y + height - 2, x + width - 10)
        print(f"{color}{min_val:>6.2f}{Colors.RESET}")

    def draw_progress_bar(self, x: int, y: int, width: int,
                         value: float, label: str = "", color: str = Colors.GREEN):
        print{Draw a horizontal progress bar}
        self.move_cursor(y, x)
        filled = int(value * width)
        bar = "█" * filled + "░" * (width - filled)
        print(f"{label}: {color}{bar}{Colors.RESET} {value*100:>5.1f}%")

    def draw_spiral(self, x: int, y: int, width: int, height: int,
                   theta: float, a: float, title: str = ""):
        print{Draw spiral operator visualization}
        self.draw_box(x, y, width, height, title)

        # Calculate spiral points
        center_x = x + width // 2
        center_y = y + height // 2

        for t in range(0, int(theta * 10), 1):
            t_norm = t / 10.0
            z = cmath.exp((a + 1j) * t_norm)

            px = int(center_x + z.real * (width // 4))
            py = int(center_y - z.imag * (height // 4))

            if x + 1 < px < x + width - 1 and y + 1 < py < y + height - 1:
                self.move_cursor(py, px)

                # Color based on phase
                phase = cmath.phase(z)
                if phase > 0:
                    color = Colors.CYAN
                else:
                    color = Colors.MAGENTA

                print(color + "●" + Colors.RESET, end='')

    def draw_quadrants(self, x: int, y: int, width: int, height: int,
                      highlight: int = -1):
        print{Draw the 4 options quadrants}
        mid_x = x + width // 2
        mid_y = y + height // 2

        self.draw_box(x, y, width, height, "OPTIONS QUADRANTS")

        # Draw dividing lines
        for i in range(1, height - 1):
            self.move_cursor(y + i, mid_x)
            print("│")

        for i in range(1, width - 1):
            self.move_cursor(mid_y, x + i)
            print("─")

        self.move_cursor(mid_y, mid_x)
        print("┼")

        # Labels
        quadrants = [
            (x + 5, y + 3, "Q-I: LONG CALL", "Bullish ↑", Colors.BRIGHT_GREEN),
            (mid_x + 5, y + 3, "Q-II: LONG PUT", "Bearish ↓", Colors.BRIGHT_RED),
            (x + 5, mid_y + 2, "Q-III: SHORT CALL", "Bearish ↓", Colors.RED),
            (mid_x + 5, mid_y + 2, "Q-IV: SHORT PUT", "Bullish ↑", Colors.GREEN),
        ]

        for i, (qx, qy, name, view, color) in enumerate(quadrants):
            if highlight == i or highlight == -1:
                self.move_cursor(qy, qx)
                print(Colors.BOLD + color + name + Colors.RESET)
                self.move_cursor(qy + 1, qx)
                print(Colors.DIM + view + Colors.RESET)

    def draw_greeks_meters(self, x: int, y: int, delta: float, gamma: float,
                          theta: float, vega: float):
        print{Draw Greeks as progress meters}
        self.move_cursor(y, x)
        print(Colors.BOLD + "GREEKS (The Four Primitives)" + Colors.RESET)

        # Delta (Change)
        self.draw_progress_bar(x, y + 2, 30, abs(delta), "Δ (Change)  ",
                              Colors.CYAN if delta > 0 else Colors.RED)

        # Gamma (Acceleration)
        gamma_norm = min(abs(gamma) * 10, 1.0)
        self.draw_progress_bar(x, y + 3, 30, gamma_norm, "Γ (Accel)   ", Colors.YELLOW)

        # Theta (Decay) - always negative
        theta_norm = min(abs(theta) / 20, 1.0)
        self.draw_progress_bar(x, y + 4, 30, theta_norm, "Θ (Decay)   ", Colors.RED)

        # Vega (Volatility)
        vega_norm = min(abs(vega) / 30, 1.0)
        self.draw_progress_bar(x, y + 5, 30, vega_norm, "ν (Scale)   ", Colors.MAGENTA)

    def draw_entropy_meter(self, x: int, y: int, delta: float):
        print{Draw information entropy visualization}
        # Shannon entropy for binary outcome
        delta = max(min(delta, 0.9999), 0.0001)
        H = -(delta * math.log2(delta) + (1 - delta) * math.log2(1 - delta))

        self.move_cursor(y, x)
        print(Colors.BOLD + "INFORMATION ENTROPY" + Colors.RESET)

        self.move_cursor(y + 1, x)
        print(f"Delta: {delta:.4f}")

        self.draw_progress_bar(x, y + 2, 30, H, "H (bits)    ", Colors.BRIGHT_YELLOW)

        self.move_cursor(y + 3, x)
        if abs(delta - 0.5) < 0.05:
            print(Colors.BRIGHT_GREEN + "ATM: MAXIMUM ENTROPY" + Colors.RESET)
        elif delta > 0.7:
            print(Colors.GREEN + "ITM: Low Entropy" + Colors.RESET)
        else:
            print(Colors.RED + "OTM: Low Entropy" + Colors.RESET)

    def animate_price_walk(self, duration: int = 30):
        print{Animate random walk of stock price with live Greeks}
        self.clear_screen()
        self.hide_cursor()

        S = 100.0
        X = 100.0
        sigma = 0.3
        t = 0.25

        prices = [S]
        deltas = []
        pnl = []

        P = 5.0  # Initial premium paid
        position_pnl = -P

        try:
            for frame in range(duration * 10):  # 10 fps
                # Random walk
                S += random.gauss(0, 1)
                S = max(50, min(150, S))  # Bounds
                prices.append(S)

                # Calculate Greeks
                from math import erf
                d1 = (math.log(S / X) + (0.05 + 0.5 * sigma**2) * t) / (sigma * math.sqrt(t))
                delta = 0.5 * (1 + erf(d1 / math.sqrt(2)))
                n_d1 = (1/math.sqrt(2*math.pi)) * math.exp(-0.5 * d1**2)
                gamma = n_d1 / (S * sigma * math.sqrt(t))
                theta = -(S * n_d1 * sigma) / (2 * math.sqrt(t))
                vega = S * n_d1 * math.sqrt(t)

                deltas.append(delta)

                # P&L calculation (long call)
                intrinsic = max(S - X, 0)
                position_pnl = intrinsic - P
                pnl.append(position_pnl)

                # Draw everything
                self.clear_screen()

                # Title
                self.move_cursor(1, 1)
                print(Colors.BOLD + Colors.BRIGHT_CYAN +
                      "═" * 78 + Colors.RESET)
                self.move_cursor(2, 20)
                print(Colors.BOLD + Colors.BRIGHT_YELLOW +
                      "OPTIONS QUANTUM VISUALIZER" + Colors.RESET)
                self.move_cursor(3, 1)
                print(Colors.BOLD + Colors.BRIGHT_CYAN +
                      "═" * 78 + Colors.RESET)

                # Current state
                self.move_cursor(4, 2)
                print(f"Stock: {Colors.BRIGHT_WHITE}${S:>7.2f}{Colors.RESET} | " +
                      f"Strike: ${X:.2f} | " +
                      f"Premium: ${P:.2f} | " +
                      f"P&L: ", end='')

                if position_pnl > 0:
                    print(f"{Colors.BRIGHT_GREEN}${position_pnl:>6.2f}{Colors.RESET}")
                else:
                    print(f"{Colors.BRIGHT_RED}${position_pnl:>6.2f}{Colors.RESET}")

                # Price chart
                self.draw_chart(2, 6, 38, 10, prices, "STOCK PRICE", Colors.CYAN)

                # P&L chart
                self.draw_chart(42, 6, 38, 10, pnl, "POSITION P&L",
                               Colors.GREEN if position_pnl > 0 else Colors.RED)

                # Greeks meters
                self.draw_greeks_meters(2, 17, delta, gamma, theta, vega)

                # Entropy meter
                self.draw_entropy_meter(42, 17, delta)

                # Spiral visualization
                theta_param = (frame / 10.0) % (2 * math.pi)
                a_param = math.log(S / X)
                self.draw_spiral(2, 23, 38, 10, theta_param, a_param,
                                "SPIRAL U(θ,a)")

                # Quadrants (highlight based on position)
                if S > X and position_pnl > 0:
                    highlight = 0  # Q-I Long Call winning
                elif S < X:
                    highlight = 2  # Q-III Short Call winning (if we had it)
                else:
                    highlight = -1

                self.draw_quadrants(42, 23, 38, 10, highlight)

                # Footer
                self.move_cursor(34, 1)
                print(Colors.DIM + "Press Ctrl+C to exit" + Colors.RESET)

                sys.stdout.flush()
                time.sleep(0.1)

        except KeyboardInterrupt:
            pass
        finally:
            self.show_cursor()
            self.clear_screen()
            print("\n" + Colors.BRIGHT_GREEN + "Visualization ended." + Colors.RESET + "\n")

    def animate_straddle_collapse(self):
        print{Animate straddle superposition collapsing}
        self.clear_screen()
        self.hide_cursor()

        X = 100.0
        S = 100.0  # Start at ATM
        P_call = 5.0
        P_put = 5.0

        try:
            for frame in range(100):
                # Move price away from strike (collapse)
                if frame < 50:
                    # Superposition phase
                    S = 100 + random.gauss(0, 2)
                    alpha = 1/math.sqrt(2)
                    beta = 1/math.sqrt(2)
                else:
                    # Collapse phase
                    direction = 1 if random.random() > 0.5 else -1
                    S = 100 + direction * (frame - 50) * 0.5

                    if S > X:
                        alpha = min(1.0, (frame - 50) / 25)
                        beta = math.sqrt(1 - alpha**2)
                    else:
                        beta = min(1.0, (frame - 50) / 25)
                        alpha = math.sqrt(1 - beta**2)

                self.clear_screen()

                # Title
                self.move_cursor(1, 1)
                print(Colors.BOLD + Colors.BRIGHT_MAGENTA +
                      "═" * 78 + Colors.RESET)
                self.move_cursor(2, 15)
                if frame < 50:
                    print(Colors.BOLD + Colors.BRIGHT_YELLOW +
                          "STRADDLE SUPERPOSITION (Before Expiration)" + Colors.RESET)
                else:
                    print(Colors.BOLD + Colors.BRIGHT_RED +
                          "MEASUREMENT → COLLAPSE (At Expiration)" + Colors.RESET)
                self.move_cursor(3, 1)
                print(Colors.BOLD + Colors.BRIGHT_MAGENTA +
                      "═" * 78 + Colors.RESET)

                # Quantum state
                self.move_cursor(5, 15)
                print(Colors.BRIGHT_CYAN + "|Ψ⟩ = " + Colors.RESET, end='')
                print(f"{Colors.GREEN}{alpha:.3f}|Call⟩{Colors.RESET} + ", end='')
                print(f"{Colors.RED}{beta:.3f}|Put⟩{Colors.RESET}")

                # Normalization check
                self.move_cursor(6, 15)
                norm = alpha**2 + beta**2
                print(f"|α|² + |β|² = {norm:.6f} ", end='')
                if abs(norm - 1.0) < 0.001:
                    print(Colors.BRIGHT_GREEN + "✓ Normalized" + Colors.RESET)
                else:
                    print(Colors.BRIGHT_RED + "✗ Error" + Colors.RESET)

                # Visual representation
                self.move_cursor(8, 5)
                print("Call Amplitude: ", end='')
                self.draw_progress_bar(25, 8, 40, alpha**2, "", Colors.GREEN)

                self.move_cursor(9, 5)
                print("Put Amplitude:  ", end='')
                self.draw_progress_bar(25, 9, 40, beta**2, "", Colors.RED)

                # Price position
                self.move_cursor(11, 5)
                print(f"Stock Price: ${S:.2f} | Strike: ${X:.2f}")

                # Payoff calculation
                call_payoff = max(S - X, 0) - P_call
                put_payoff = max(X - S, 0) - P_put
                total_payoff = call_payoff + put_payoff

                self.move_cursor(13, 5)
                print(f"Call Payoff: {Colors.GREEN if call_payoff > 0 else Colors.RED}${call_payoff:>7.2f}{Colors.RESET}")
                self.move_cursor(14, 5)
                print(f"Put Payoff:  {Colors.GREEN if put_payoff > 0 else Colors.RED}${put_payoff:>7.2f}{Colors.RESET}")
                self.move_cursor(15, 5)
                print(Colors.BOLD + f"Total P&L:   {Colors.BRIGHT_GREEN if total_payoff > 0 else Colors.BRIGHT_RED}${total_payoff:>7.2f}{Colors.RESET}")

                # Phase indicator
                self.move_cursor(17, 5)
                if frame < 50:
                    print(Colors.BRIGHT_YELLOW + "⚛ SUPERPOSITION STATE" + Colors.RESET)
                    self.move_cursor(18, 5)
                    print("Both states exist simultaneously")
                    self.move_cursor(19, 5)
                    print("Maximum uncertainty = Maximum entropy")
                else:
                    print(Colors.BRIGHT_RED + "📊 COLLAPSED STATE" + Colors.RESET)
                    self.move_cursor(18, 5)
                    if S > X:
                        print(Colors.GREEN + "→ Call exercised (Presence)" + Colors.RESET)
                    else:
                        print(Colors.RED + "→ Put exercised (Absence)" + Colors.RESET)

                # Ark interpretation
                self.move_cursor(21, 5)
                print(Colors.DIM + "Ark Equation: |Ark⟩ = (1/√2)(|Presence⟩ + |Absence⟩)" + Colors.RESET)

                sys.stdout.flush()
                time.sleep(0.1)

        except KeyboardInterrupt:
            pass
        finally:
            self.show_cursor()
            self.clear_screen()
            print("\n" + Colors.BRIGHT_GREEN + "Straddle collapse complete." + Colors.RESET + "\n")

    def show_menu(self):
        print{Show main menu}
        self.clear_screen()
        self.show_cursor()

        print(Colors.BOLD + Colors.BRIGHT_CYAN)
        print("═" * 78)
        print("                    OPTIONS QUANTUM VISUALIZER                    ")
        print("═" * 78)
        print(Colors.RESET)

        print("\n" + Colors.BRIGHT_YELLOW + "Choose a visualization:" + Colors.RESET)
        print()
        print(f"  {Colors.BRIGHT_GREEN}1{Colors.RESET}. Live Price Walk with Greeks (30s)")
        print(f"  {Colors.BRIGHT_GREEN}2{Colors.RESET}. Straddle Superposition Collapse (10s)")
        print(f"  {Colors.BRIGHT_GREEN}3{Colors.RESET}. Both (sequence)")
        print(f"  {Colors.BRIGHT_GREEN}q{Colors.RESET}. Quit")
        print()

        choice = input(Colors.BRIGHT_CYAN + "Select (1-3, q): " + Colors.RESET).strip()
        return choice


def main():
    print{Main entry point}
    viz = OptionsVisualizer()

    while True:
        choice = viz.show_menu()

        if choice == '1':
            print("\n" + Colors.BRIGHT_YELLOW + "Starting price walk..." + Colors.RESET)
            time.sleep(1)
            viz.animate_price_walk(30)
        elif choice == '2':
            print("\n" + Colors.BRIGHT_YELLOW + "Starting straddle collapse..." + Colors.RESET)
            time.sleep(1)
            viz.animate_straddle_collapse()
        elif choice == '3':
            print("\n" + Colors.BRIGHT_YELLOW + "Starting full sequence..." + Colors.RESET)
            time.sleep(1)
            viz.animate_price_walk(30)
            time.sleep(2)
            viz.animate_straddle_collapse()
        elif choice.lower() == 'q':
            print("\n" + Colors.BRIGHT_GREEN + "Goodbye! 🌀" + Colors.RESET + "\n")
            break
        else:
            print(Colors.BRIGHT_RED + "Invalid choice. Try again." + Colors.RESET)
            time.sleep(1)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n" + Colors.BRIGHT_GREEN + "Visualization interrupted. Goodbye! 🌀" + Colors.RESET + "\n")
        sys.exit(0)
