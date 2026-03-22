#!/usr/bin/env python3
"""Quick USB-C test - what's this device?"""

import serial
import time

DEVICE = "/dev/cu.usbserial-110"

def quick_test():
    print("🌌 Quick USB-C Test")
    print("=" * 50)

    for baud in [9600, 115200]:
        print(f"\n📡 Testing {baud} baud...")
        try:
            ser = serial.Serial(DEVICE, baud, timeout=1)

            # Try different init sequences
            tests = [
                (b"AT\r\n", "AT command"),
                (b"\r\n", "Newline"),
                (b"?\r\n", "Question"),
                (b"HELLO\r\n", "Hello"),
                (b"\x00\x01\x02", "Binary"),
            ]

            for cmd, desc in tests:
                ser.write(cmd)
                time.sleep(0.3)
                if ser.in_waiting > 0:
                    resp = ser.read(ser.in_waiting)
                    print(f"  ✅ {desc}: {resp}")
                    ser.close()
                    return
                else:
                    print(f"  ⚪ {desc}: no response")

            ser.close()

        except Exception as e:
            print(f"  ❌ Error: {e}")

    print("\n💡 Device info:")
    print(f"  - Path: {DEVICE}")
    print(f"  - Chip: CH340 USB-to-Serial")
    print(f"  - Power: 98mA (active)")
    print(f"  - LED: ON (you mentioned)")
    print("\n🤔 This might be:")
    print("  1. Arduino/ESP32 waiting for sketch upload")
    print("  2. Output-only device (logging/debugging)")
    print("  3. Custom device with specific protocol")
    print("  4. Device in bootloader mode")
    print("\n📝 What's connected to this USB port?")

if __name__ == "__main__":
    quick_test()
