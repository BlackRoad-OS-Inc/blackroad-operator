#!/usr/bin/env python3
"""
BlackRoad LoRa Radio Daemon
Waveshare SX1262 HAT over USB (CP2102 UART)

Sends and receives packets on 915 MHz.
Bridges to NATS when available, stdout always.
"""

import serial
import struct
import time
import sys
import threading
import json
from datetime import datetime

# Waveshare SX1262 register addresses
REG_ADDH = 0x00
REG_ADDL = 0x01
REG_NETID = 0x02
REG_REG0 = 0x03  # baud, parity, air rate
REG_REG1 = 0x04  # sub-packet, RSSI, tx power
REG_REG2 = 0x05  # channel
REG_REG3 = 0x06  # RSSI byte, tx method, relay, LBT, WOR
REG_CRYPT_H = 0x07
REG_CRYPT_L = 0x08

# Default config for BlackRoad mesh
MESH_CONFIG = {
    'addr': 0x0000,       # broadcast address
    'net_id': 0x00,       # network ID (all nodes must match)
    'channel': 18,        # channel 18 = 915 + 18 = 933 MHz
    'air_rate': 2,        # 0=0.3k, 1=1.2k, 2=2.4k, 3=4.8k, 4=9.6k, 5=19.2k
    'tx_power': 0,        # 0=22dBm, 1=17dBm, 2=13dBm, 3=10dBm
    'sub_packet': 0,      # 0=200B, 1=128B, 2=64B, 3=32B
}

PINK = '\033[38;5;205m'
GREEN = '\033[38;5;82m'
BLUE = '\033[38;5;69m'
AMBER = '\033[38;5;214m'
RESET = '\033[0m'


class BlackRoadRadio:
    def __init__(self, port=None, baud=9600):
        self.port = port or self._find_port()
        self.baud = baud
        self.ser = None
        self.running = False
        self.rx_count = 0
        self.tx_count = 0
        self.node_name = 'alexandria'  # this mac

    def _find_port(self):
        """Auto-detect Waveshare SX1262 (CP2102)"""
        import glob
        candidates = [
            '/dev/cu.SLAB_USBtoUART',
            '/dev/cu.usbserial-0001',
        ]
        # Also check Pi paths
        candidates += glob.glob('/dev/ttyUSB*')
        candidates += glob.glob('/dev/ttyAMA0')

        for p in candidates:
            try:
                s = serial.Serial(p, 9600, timeout=1)
                s.close()
                return p
            except:
                continue
        raise RuntimeError("No LoRa radio found")

    def connect(self):
        self.ser = serial.Serial(self.port, self.baud, timeout=0.1)
        time.sleep(0.3)
        self.ser.reset_input_buffer()
        print(f"{PINK}[RADIO]{RESET} Connected: {self.port} @ {self.baud} baud")

    def read_config(self):
        """Read module config (only works in config mode M0=0 M1=1)"""
        self.ser.reset_input_buffer()
        self.ser.write(bytes([0xC1, 0x00, 0x09]))
        time.sleep(0.5)
        resp = self.ser.read(self.ser.in_waiting or 12)
        if len(resp) >= 12 and resp[0] == 0xC1:
            addr = (resp[3] << 8) | resp[4]
            net_id = resp[5]
            reg0 = resp[6]
            reg1 = resp[7]
            channel = resp[8]
            reg3 = resp[9]
            crypt = (resp[10] << 8) | resp[11]
            air_rate = reg0 & 0x07
            tx_power = reg1 & 0x03
            print(f"{GREEN}[CONFIG]{RESET} addr=0x{addr:04X} net={net_id} ch={channel} "
                  f"air_rate={air_rate} tx_power={tx_power} crypt=0x{crypt:04X}")
            return resp
        else:
            print(f"{AMBER}[CONFIG]{RESET} No config response (module in transparent mode)")
            return None

    def write_config(self, cfg=None):
        """Write module config (only works in config mode M0=0 M1=1)"""
        cfg = cfg or MESH_CONFIG
        addr_h = (cfg['addr'] >> 8) & 0xFF
        addr_l = cfg['addr'] & 0xFF
        reg0 = 0x60 | (cfg['air_rate'] & 0x07)  # 9600 baud, 8N1
        reg1 = (cfg['sub_packet'] << 6) | 0x20 | (cfg['tx_power'] & 0x03)  # RSSI enable
        reg3 = 0x40  # RSSI byte enable, transparent TX, no relay, no LBT
        cmd = bytes([
            0xC0, 0x00, 0x09,
            addr_h, addr_l, cfg['net_id'],
            reg0, reg1, cfg['channel'],
            reg3, 0x00, 0x00  # no encryption
        ])
        self.ser.write(cmd)
        time.sleep(0.5)
        resp = self.ser.read(self.ser.in_waiting or 12)
        if resp:
            print(f"{GREEN}[CONFIG]{RESET} Written: ch={cfg['channel']} air={cfg['air_rate']} pwr={cfg['tx_power']}")
        return resp

    def send(self, data, dest_addr=0xFFFF):
        """Send data over LoRa (transparent mode)"""
        if isinstance(data, str):
            data = data.encode('utf-8')

        # BlackRoad packet format:
        # [2B magic] [1B type] [1B src_node] [1B len] [payload] [2B checksum]
        pkt = self._build_packet(data)
        self.ser.write(pkt)
        self.tx_count += 1
        ts = datetime.now().strftime('%H:%M:%S')
        print(f"{BLUE}[TX {self.tx_count}]{RESET} {ts} | {len(pkt)}B | {data[:50]}")

    def _build_packet(self, payload, pkt_type=0x01):
        """Build a BlackRoad mesh packet"""
        magic = b'BR'  # BlackRoad magic bytes
        src = 0x01  # node ID (1=alexandria)
        length = len(payload)
        header = struct.pack('!2sBBB', b'BR', pkt_type, src, length)
        raw = header + payload
        checksum = sum(raw) & 0xFFFF
        return raw + struct.pack('!H', checksum)

    def _parse_packet(self, raw):
        """Parse incoming BlackRoad mesh packet"""
        if len(raw) < 7:
            return {'type': 'raw', 'data': raw, 'valid': False}

        if raw[:2] == b'BR':
            pkt_type = raw[2]
            src = raw[3]
            length = raw[4]
            payload = raw[5:5+length]
            checksum = struct.unpack('!H', raw[5+length:7+length])[0] if len(raw) >= 7+length else 0
            expected = sum(raw[:5+length]) & 0xFFFF
            return {
                'type': 'mesh',
                'pkt_type': pkt_type,
                'src': src,
                'payload': payload,
                'checksum_valid': checksum == expected,
                'valid': True
            }
        return {'type': 'raw', 'data': raw, 'valid': True}

    def listen(self):
        """Listen for incoming packets"""
        self.running = True
        print(f"{PINK}[RADIO]{RESET} Listening on {self.port}...")
        buf = b''
        while self.running:
            try:
                avail = self.ser.in_waiting
                if avail:
                    data = self.ser.read(avail)
                    buf += data
                    # Try to parse complete packets
                    if len(buf) >= 7:
                        pkt = self._parse_packet(buf)
                        self.rx_count += 1
                        ts = datetime.now().strftime('%H:%M:%S')
                        if pkt['type'] == 'mesh':
                            print(f"{GREEN}[RX {self.rx_count}]{RESET} {ts} | "
                                  f"node={pkt['src']} | {pkt['payload']}")
                        else:
                            print(f"{GREEN}[RX {self.rx_count}]{RESET} {ts} | "
                                  f"raw {len(buf)}B | {buf.hex()} | {buf}")
                        buf = b''
                    elif len(buf) > 0:
                        # Timeout - flush partial
                        time.sleep(0.5)
                        if self.ser.in_waiting == 0 and len(buf) > 0:
                            self.rx_count += 1
                            ts = datetime.now().strftime('%H:%M:%S')
                            print(f"{GREEN}[RX {self.rx_count}]{RESET} {ts} | "
                                  f"raw {len(buf)}B | {buf.hex()} | {buf}")
                            buf = b''
                else:
                    time.sleep(0.05)
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"{AMBER}[ERR]{RESET} {e}")
                time.sleep(1)

    def beacon(self, interval=10):
        """Send periodic beacon"""
        count = 0
        while self.running:
            count += 1
            msg = json.dumps({
                'node': self.node_name,
                'seq': count,
                'ts': int(time.time()),
                'fleet': 'blackroad'
            })
            self.send(msg)
            time.sleep(interval)

    def interactive(self):
        """Interactive send/receive mode"""
        self.connect()
        self.read_config()

        # Start listener thread
        self.running = True
        rx_thread = threading.Thread(target=self.listen, daemon=True)
        rx_thread.start()

        print(f"\n{PINK}BlackRoad LoRa Radio{RESET}")
        print(f"Commands: send <msg> | beacon [sec] | config | status | quit\n")

        try:
            while True:
                try:
                    cmd = input(f"{PINK}lora>{RESET} ").strip()
                except EOFError:
                    break

                if not cmd:
                    continue
                elif cmd.startswith('send '):
                    self.send(cmd[5:])
                elif cmd.startswith('beacon'):
                    parts = cmd.split()
                    interval = int(parts[1]) if len(parts) > 1 else 10
                    print(f"Beaconing every {interval}s (Ctrl+C to stop)")
                    beacon_thread = threading.Thread(
                        target=self.beacon, args=(interval,), daemon=True)
                    beacon_thread.start()
                elif cmd == 'config':
                    self.read_config()
                elif cmd == 'status':
                    print(f"TX: {self.tx_count} | RX: {self.rx_count} | Port: {self.port}")
                elif cmd in ('quit', 'exit', 'q'):
                    break
                else:
                    # Treat as message to send
                    self.send(cmd)
        except KeyboardInterrupt:
            pass

        self.running = False
        print(f"\n{PINK}[RADIO]{RESET} Shutdown.")


def main():
    import argparse
    parser = argparse.ArgumentParser(description='BlackRoad LoRa Radio')
    parser.add_argument('--port', '-p', help='Serial port')
    parser.add_argument('--baud', '-b', type=int, default=9600)
    parser.add_argument('--listen', '-l', action='store_true', help='Listen only')
    parser.add_argument('--send', '-s', help='Send a message and exit')
    parser.add_argument('--beacon', type=int, help='Beacon interval in seconds')
    args = parser.parse_args()

    radio = BlackRoadRadio(port=args.port, baud=args.baud)
    radio.connect()

    if args.send:
        radio.send(args.send)
    elif args.listen:
        try:
            radio.listen()
        except KeyboardInterrupt:
            pass
    elif args.beacon:
        radio.running = True
        rx_thread = threading.Thread(target=radio.listen, daemon=True)
        rx_thread.start()
        try:
            radio.beacon(args.beacon)
        except KeyboardInterrupt:
            pass
    else:
        radio.interactive()


if __name__ == '__main__':
    main()
