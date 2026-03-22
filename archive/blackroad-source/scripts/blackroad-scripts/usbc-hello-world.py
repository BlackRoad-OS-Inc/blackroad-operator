#!/usr/bin/env python3
"""
USB-C Hello World Test
Sends "Hello World" to the USB serial device
"""

import serial
import serial.tools.list_ports
import time
import sys

def find_usb_serial():
    """Find the CH340 USB serial device"""
    ports = serial.tools.list_ports.comports()
    for port in ports:
        # CH340 device (VID: 0x1a86, PID: 0x7523)
        if port.vid == 0x1a86 and port.pid == 0x7523:
            return port.device
    return None

def main():
    print("🌌 BlackRoad USB-C Operator - Hello World Test")
    print("=" * 50)

    # Find the device
    device = find_usb_serial()
    if not device:
        print("❌ USB serial device not found!")
        print("Looking for: VID=0x1a86 PID=0x7523 (CH340)")
        print("\nAvailable ports:")
        for port in serial.tools.list_ports.comports():
            print(f"  - {port.device}: {port.description}")
        sys.exit(1)

    print(f"✅ Found device: {device}")

    try:
        # Open serial connection
        # Common baud rates: 9600, 115200
        ser = serial.Serial(device, 115200, timeout=1)
        print(f"✅ Opened connection at 115200 baud")

        # Send Hello World
        message = "Hello World from BlackRoad OS!\n"
        ser.write(message.encode('utf-8'))
        print(f"📤 Sent: {message.strip()}")

        # Try to read response
        time.sleep(0.5)
        if ser.in_waiting > 0:
            response = ser.read(ser.in_waiting).decode('utf-8', errors='ignore')
            print(f"📥 Response: {response}")
        else:
            print("📭 No response (device may not echo)")

        # Send YES/NO test
        print("\n" + "=" * 50)
        print("Testing YES/NO operator commands:")

        for cmd in ["YES", "NO", "YES"]:
            ser.write(f"{cmd}\n".encode('utf-8'))
            print(f"📤 Sent: {cmd}")
            time.sleep(0.3)

            if ser.in_waiting > 0:
                response = ser.read(ser.in_waiting).decode('utf-8', errors='ignore')
                print(f"📥 Response: {response}")

        ser.close()
        print("\n✅ Test complete!")

    except serial.SerialException as e:
        print(f"❌ Serial error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
