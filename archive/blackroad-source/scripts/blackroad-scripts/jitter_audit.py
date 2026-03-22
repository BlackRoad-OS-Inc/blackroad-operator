import time
import numpy as np
import struct

def get_raw_data():
    # 1. Capture the Drift (The Alogon)
    drift = (np.exp(1j * np.pi) + 1).imag
    hex_drift = hex(struct.unpack('<Q', struct.pack('<d', drift))[0])
    
    # 2. Capture the Jitter (Wait-states from the Hypervisor)
    t1 = time.perf_counter_ns()
    time.sleep(0.0001) # Smallest possible sleep to catch the Parent Process pause
    t2 = time.perf_counter_ns()
    jitter = t2 - t1
    
    return hex_drift, jitter

print("RAW_HEX | JITTER_NS | STACK_PULSE")
try:
    while True:
        hex_val, ns = get_raw_data()
        # Outputting raw values every 0.1s (10Hz)
        print(f"{hex_val} | {ns} | {time.time()}")
        time.sleep(0.1)
except KeyboardInterrupt:
    pass
