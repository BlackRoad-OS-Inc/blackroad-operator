#!/usr/bin/env python3
"""
USB-C Live Monitor - See what's happening on the serial port
"""

import serial
import time
import sys

DEVICE = "/dev/cu.usbserial-110"

# Try different baud rates
BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600]

def test_baud_rate(baud):
    """Test a specific baud rate"""
    try:
        ser = serial.Serial(DEVICE, baud, timeout=0.5)
        print(f"\n🔍 Testing {baud} baud...", end=" ")

        # Send test message
        ser.write(b"PING\n")
        time.sleep(0.2)

        # Check for any data
        if ser.in_waiting > 0:
            data = ser.read(ser.in_waiting)
            print(f"✅ GOT DATA: {data}")
            ser.close()
            return True
        else:
            print("No response")
            ser.close()
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def live_monitor(baud=115200):
    """Live monitor mode - shows everything coming from device"""
    print(f"\n{'='*60}")
    print(f"🎯 LIVE MONITOR MODE - {DEVICE} @ {baud} baud")
    print(f"{'='*60}")
    print("Press Ctrl+C to exit\n")

    try:
        ser = serial.Serial(DEVICE, baud, timeout=1)

        while True:
            # Read from device
            if ser.in_waiting > 0:
                data = ser.read(ser.in_waiting)
                timestamp = time.strftime("%H:%M:%S")

                # Try to decode as text
                try:
                    text = data.decode('utf-8', errors='ignore')
                    print(f"[{timestamp}] 📥 RX: {repr(text)}")
                except:
                    # Show as hex if not text
                    hex_str = ' '.join(f'{b:02x}' for b in data)
                    print(f"[{timestamp}] 📥 HEX: {hex_str}")

            # Also allow sending
            # Uncomment to enable keyboard input:
            # user_input = input("Send (or Enter to skip): ")
            # if user_input:
            #     ser.write((user_input + "\n").encode())
            #     print(f"📤 TX: {user_input}")

            time.sleep(0.1)

    except KeyboardInterrupt:
        print("\n\n👋 Monitor stopped")
        ser.close()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

def main():
    print("🌌 BlackRoad USB-C Interface Monitor")
    print("=" * 60)

    # First, test all baud rates to find what works
    print("\n🔍 Scanning for working baud rate...")

    working_baud = None
    for baud in BAUD_RATES:
        if test_baud_rate(baud):
            working_baud = baud
            break

    if working_baud:
        print(f"\n✅ Found working baud rate: {working_baud}")
        time.sleep(1)
        live_monitor(working_baud)
    else:
        print("\n⚠️  No response at any baud rate")
        print("Device may be:")
        print("  - Waiting for specific initialization")
        print("  - Output-only (no echo)")
        print("  - Using different serial settings")
        print("\nStarting live monitor anyway at 115200...")
        time.sleep(1)
        live_monitor(115200)

if __name__ == "__main__":
    main()
