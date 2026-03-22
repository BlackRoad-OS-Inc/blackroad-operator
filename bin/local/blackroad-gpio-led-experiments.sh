#!/usr/bin/env bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# blackroad-gpio-led-experiments.sh
# Control external LEDs via GPIO pins OR show what would happen

set +e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PINK='\033[38;5;205m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${PINK}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║              🎨 GPIO LED QUANTUM & TRINARY EXPERIMENTS 🎨               ║
║                                                                          ║
║    Using GPIO Pins to Control External RGB LEDs                         ║
║    (Or simulating if no LEDs connected)                                 ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

cat > /tmp/gpio_led_control.py << 'PYTHON'
#!/usr/bin/env python3
"""
GPIO LED Control for Quantum & Trinary Visualization

Connect LEDs to these GPIO pins (with 220Ω resistors!):
  GPIO 18 (Pin 12) - RED LED    (for state |0⟩ or trinary 0)
  GPIO 23 (Pin 16) - GREEN LED  (for state |1⟩ or trinary 1)
  GPIO 24 (Pin 18) - BLUE LED   (for state |2⟩ or trinary 2)

Or run without hardware and see the simulation!
"""
import time
import random
import sys

# Try to import GPIO library
try:
    import lgpio
    HAVE_GPIO = True
    GPIO_LIB = "lgpio"
except ImportError:
    try:
        import RPi.GPIO as GPIO
        HAVE_GPIO = True
        GPIO_LIB = "RPi.GPIO"
    except ImportError:
        HAVE_GPIO = False
        GPIO_LIB = "None"
        print("⚠️  No GPIO library - running in SIMULATION mode")

# GPIO Pin definitions
PIN_RED = 18    # |0⟩ state or trinary 0
PIN_GREEN = 23  # |1⟩ state or trinary 1
PIN_BLUE = 24   # |2⟩ state or trinary 2

class QuantumLEDController:
    def __init__(self, simulate=False):
        self.simulate = simulate or not HAVE_GPIO
        self.gpio_lib = GPIO_LIB

        print(f"GPIO Library: {self.gpio_lib}")
        print(f"Mode: {'SIMULATION' if self.simulate else 'HARDWARE'}")
        print()

        if not self.simulate:
            if GPIO_LIB == "lgpio":
                try:
                    self.chip = lgpio.gpiochip_open(4)  # Pi 5 uses chip 4
                    lgpio.gpio_claim_output(self.chip, PIN_RED)
                    lgpio.gpio_claim_output(self.chip, PIN_GREEN)
                    lgpio.gpio_claim_output(self.chip, PIN_BLUE)
                    print("✓ GPIO pins initialized (Pi 5)")
                except Exception as e:
                    print(f"✗ GPIO init failed: {e}")
                    print("  Falling back to SIMULATION mode")
                    self.simulate = True
            elif GPIO_LIB == "RPi.GPIO":
                try:
                    GPIO.setmode(GPIO.BCM)
                    GPIO.setwarnings(False)
                    GPIO.setup(PIN_RED, GPIO.OUT)
                    GPIO.setup(PIN_GREEN, GPIO.OUT)
                    GPIO.setup(PIN_BLUE, GPIO.OUT)
                    print("✓ GPIO pins initialized (RPi.GPIO)")
                except Exception as e:
                    print(f"✗ GPIO init failed: {e}")
                    print("  Falling back to SIMULATION mode")
                    self.simulate = True

    def set_led(self, pin, state):
        """Set LED state (0=off, 1=on)"""
        colors = {PIN_RED: "RED", PIN_GREEN: "GREEN", PIN_BLUE: "BLUE"}

        if self.simulate:
            symbol = "●" if state else "○"
            print(f"  [{colors.get(pin, 'UNKNOWN')}] {symbol}")
        else:
            if GPIO_LIB == "lgpio":
                lgpio.gpio_write(self.chip, pin, state)
            elif GPIO_LIB == "RPi.GPIO":
                GPIO.output(pin, GPIO.HIGH if state else GPIO.LOW)

    def all_off(self):
        """Turn all LEDs off"""
        if not self.simulate:
            for pin in [PIN_RED, PIN_GREEN, PIN_BLUE]:
                self.set_led(pin, 0)

    def qubit_superposition(self, duration=5):
        """Visualize qubit: alternate RED and GREEN"""
        print("\n🌌 QUBIT SUPERPOSITION: |0⟩ ↔ |1⟩")
        print("Alternating RED (|0⟩) and GREEN (|1⟩)\n")

        end_time = time.time() + duration
        count = 0
        while time.time() < end_time:
            state = count % 2
            if state == 0:
                print(f"State |0⟩ (measurement {count+1})")
                self.set_led(PIN_RED, 1)
                self.set_led(PIN_GREEN, 0)
                self.set_led(PIN_BLUE, 0)
            else:
                print(f"State |1⟩ (measurement {count+1})")
                self.set_led(PIN_RED, 0)
                self.set_led(PIN_GREEN, 1)
                self.set_led(PIN_BLUE, 0)

            time.sleep(0.3)
            count += 1

        self.all_off()

    def qutrit_cycle(self, cycles=3):
        """Visualize qutrit: cycle through all 3 states"""
        print("\n🔺 QUTRIT: |0⟩ → |1⟩ → |2⟩")
        print("Cycling: RED → GREEN → BLUE\n")

        states = [
            (PIN_RED, "|0⟩ (RED)"),
            (PIN_GREEN, "|1⟩ (GREEN)"),
            (PIN_BLUE, "|2⟩ (BLUE)")
        ]

        for cycle in range(cycles):
            print(f"--- Cycle {cycle + 1} ---")
            for pin, name in states:
                print(f"State: {name}")
                self.set_led(PIN_RED, 1 if pin == PIN_RED else 0)
                self.set_led(PIN_GREEN, 1 if pin == PIN_GREEN else 0)
                self.set_led(PIN_BLUE, 1 if pin == PIN_BLUE else 0)
                time.sleep(0.5)

        self.all_off()

    def quantum_measurement(self, num_measurements=10):
        """Random measurement collapse"""
        print("\n⚛️  QUANTUM MEASUREMENT (Random Collapse)")
        print("Randomly measuring |0⟩ or |1⟩\n")

        results = []
        for i in range(num_measurements):
            state = random.choice([0, 1])
            results.append(state)

            if state == 0:
                print(f"Measurement {i+1}: |0⟩")
                self.set_led(PIN_RED, 1)
                self.set_led(PIN_GREEN, 0)
                self.set_led(PIN_BLUE, 0)
            else:
                print(f"Measurement {i+1}: |1⟩")
                self.set_led(PIN_RED, 0)
                self.set_led(PIN_GREEN, 1)
                self.set_led(PIN_BLUE, 0)

            time.sleep(0.3)

        # Statistics
        zeros = results.count(0)
        ones = results.count(1)
        print(f"\n📊 Results: |0⟩={zeros} ({zeros*10}%), |1⟩={ones} ({ones*10}%)")
        print(f"Expected: ~50%/50%")

        self.all_off()

    def trinary_counter(self, max_count=9):
        """Count in trinary (base-3)"""
        print("\n🔢 TRINARY COUNTER (Base-3)")
        print("Counting 0-8 in trinary\n")

        for i in range(max_count):
            # Show trinary representation
            trinary = ""
            n = i
            for _ in range(2):
                trinary = str(n % 3) + trinary
                n //= 3

            # Display using LEDs (least significant trit)
            trit = i % 3
            print(f"{i} = {trinary} (trit={trit})")

            if trit == 0:
                self.set_led(PIN_RED, 1)
                self.set_led(PIN_GREEN, 0)
                self.set_led(PIN_BLUE, 0)
            elif trit == 1:
                self.set_led(PIN_RED, 0)
                self.set_led(PIN_GREEN, 1)
                self.set_led(PIN_BLUE, 0)
            else:  # trit == 2
                self.set_led(PIN_RED, 0)
                self.set_led(PIN_GREEN, 0)
                self.set_led(PIN_BLUE, 1)

            time.sleep(0.4)

        self.all_off()

    def rgb_mixing(self):
        """Mix RGB colors to show quaternions/4D space"""
        print("\n🌈 RGB COLOR MIXING (Quaternion Space)")
        print("Cycling through color combinations\n")

        patterns = [
            ([1,0,0], "RED (i)"),
            ([0,1,0], "GREEN (j)"),
            ([0,0,1], "BLUE (k)"),
            ([1,1,0], "YELLOW (i+j)"),
            ([1,0,1], "MAGENTA (i+k)"),
            ([0,1,1], "PINK (j+k)"),
            ([1,1,1], "WHITE (i+j+k)"),
            ([0,0,0], "BLACK (0)"),
        ]

        for rgb, name in patterns:
            print(f"Color: {name}")
            self.set_led(PIN_RED, rgb[0])
            self.set_led(PIN_GREEN, rgb[1])
            self.set_led(PIN_BLUE, rgb[2])
            time.sleep(0.5)

        self.all_off()

    def bell_state(self):
        """Visualize Bell state (entanglement)"""
        print("\n🔗 BELL STATE (Entangled Qubits)")
        print("Correlated states: both ON or both OFF\n")

        for i in range(8):
            state = random.choice([0, 1])
            if state == 0:
                print(f"Measurement {i+1}: |00⟩ (both OFF)")
                self.set_led(PIN_RED, 0)
                self.set_led(PIN_GREEN, 0)
            else:
                print(f"Measurement {i+1}: |11⟩ (both ON)")
                self.set_led(PIN_RED, 1)
                self.set_led(PIN_GREEN, 1)

            time.sleep(0.4)

        self.all_off()

    def cleanup(self):
        """Cleanup GPIO"""
        self.all_off()
        if not self.simulate and GPIO_LIB == "RPi.GPIO":
            GPIO.cleanup()
        elif not self.simulate and GPIO_LIB == "lgpio":
            lgpio.gpiochip_close(self.chip)

# Main
if __name__ == "__main__":
    controller = QuantumLEDController()

    print("=" * 60)
    print("QUANTUM & TRINARY LED EXPERIMENTS")
    print("=" * 60)

    if controller.simulate:
        print("\n⚠️  SIMULATION MODE")
        print("Connect LEDs to GPIO 18, 23, 24 for real hardware!")
        print()

    try:
        controller.qubit_superposition(duration=3)
        time.sleep(0.5)

        controller.qutrit_cycle(cycles=2)
        time.sleep(0.5)

        controller.quantum_measurement(num_measurements=10)
        time.sleep(0.5)

        controller.trinary_counter(max_count=9)
        time.sleep(0.5)

        controller.rgb_mixing()
        time.sleep(0.5)

        controller.bell_state()

        print("\n✓ All experiments complete!")

    except KeyboardInterrupt:
        print("\nInterrupted!")
    finally:
        controller.cleanup()
PYTHON

echo -e "\n${BOLD}${YELLOW}Running GPIO experiments on all Pis...${NC}\n"

run_gpio_experiment() {
    local name=$1
    local user=$2
    local key=$3
    local ip=$4

    echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${YELLOW}$name ($ip)${NC}"
    echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    if [[ -n "$key" && -f "$HOME/.ssh/$key" ]]; then
        ssh -i "$HOME/.ssh/$key" -o StrictHostKeyChecking=no "${user}@${ip}" \
            "python3 -" < /tmp/gpio_led_control.py 2>&1
    else
        ssh -o StrictHostKeyChecking=no "${user}@${ip}" \
            "python3 -" < /tmp/gpio_led_control.py 2>&1
    fi
    echo ""
}

# Run on all Pis simultaneously
echo -e "${BOLD}${MAGENTA}Experiment 1: Aria - The Beast (142 containers)${NC}"
run_gpio_experiment "Aria" "pi" "br_mesh_ed25519" "192.168.4.82"

echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}GPIO LED EXPERIMENTS COMPLETE!${NC}"
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${PINK}What you just saw:${NC}"
echo "  💡 Qubit states visualized (RED ↔ GREEN)"
echo "  🔺 Qutrit states (RED → GREEN → BLUE)"
echo "  ⚛️  Quantum measurement collapse"
echo "  🔢 Trinary counting (base-3)"
echo "  🌈 RGB color mixing (quaternion space)"
echo "  🔗 Bell state entanglement"
echo ""
echo -e "${YELLOW}Hardware Connection Guide:${NC}"
echo "  GPIO 18 (Pin 12) → RED LED → 220Ω resistor → GND"
echo "  GPIO 23 (Pin 16) → GREEN LED → 220Ω resistor → GND"
echo "  GPIO 24 (Pin 18) → BLUE LED → 220Ω resistor → GND"
echo ""
echo -e "${MAGENTA}Or for BUILT-IN LED control (needs sudo):${NC}"
echo "  Run: sudo python3 /tmp/gpio_led_control.py"
