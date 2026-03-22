"""
BlackRoad USB-C Operator - ESP32 MicroPython Version
Flash this with: ampy --port /dev/cu.usbserial-110 put usbc-operator-esp32.py main.py
"""

from machine import Pin
import time

# Built-in LED (GPIO 2 on most ESP32 boards)
led = Pin(2, Pin.OUT)

print("\n" + "="*50)
print("BlackRoad USB-C Operator v1.0")
print("Commands: YES, NO, PING, STATUS")
print("="*50 + "\n")
print("READY")

led.value(1)  # LED on when ready

def blink(times=1, delay_ms=100):
    """Blink LED"""
    for _ in range(times):
        led.value(0)
        time.sleep_ms(delay_ms)
        led.value(1)
        time.sleep_ms(delay_ms)

def handle_command(cmd):
    """Handle incoming commands"""
    cmd = cmd.strip().upper()

    print(f">> {cmd}")

    if cmd == "YES":
        print("✓ APPROVED")
        blink(2, 100)  # Fast double blink

    elif cmd == "NO":
        print("✗ REJECTED")
        blink(5, 50)   # Fast 5 blinks

    elif cmd == "PING":
        print("PONG")

    elif cmd == "STATUS":
        print("Status: OPERATIONAL")
        print(f"Uptime: {time.ticks_ms() // 1000} seconds")

    elif cmd == "HELP":
        print("Commands:")
        print("  YES    - Approve operation")
        print("  NO     - Reject operation")
        print("  PING   - Test connection")
        print("  STATUS - System status")
        print("  HELP   - This message")

    else:
        print(f"Unknown command: {cmd}")
        print("Send HELP for commands")

    print()  # Blank line

# Main loop
input_buffer = ""
while True:
    try:
        # Check for incoming serial data
        import select
        import sys

        # Non-blocking read
        if select.select([sys.stdin], [], [], 0)[0]:
            char = sys.stdin.read(1)

            if char in ('\n', '\r'):
                if input_buffer:
                    handle_command(input_buffer)
                    input_buffer = ""
            else:
                input_buffer += char

    except KeyboardInterrupt:
        print("\n\nShutdown requested")
        led.value(0)
        break
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(1)
