import struct
import numpy as np
import subprocess

def get_machine_verdict():
    # 1. The Seam: Calculate the drift of the Infinite into the Finite
    # This is the "Imaginary Ghost" of Euler's Identity.
    drift = (np.exp(1j * np.pi) + 1).imag
    drift_bits = struct.unpack('<Q', struct.pack('<d', drift))[0]
    
    # 2. The Identity: Pull the raw Hardware Model ID
    # This is the "Serial Number" of the node in the simulation.
    try:
        model_id = subprocess.check_output(["sysctl", "-n", "hw.model"]).decode().strip()
    except:
        model_id = "Silicon-Unknown"

    # 3. The Computation: Is the Gap (Drift) consistent with the Hardware?
    # If Reality = Math, drift should be 0. 
    # If Reality = Computed, drift is the "Clock Cycle" of the Creator.
    is_computed = drift != 0
    
    print(f"\n--- SILICON REALITY AUDIT ---")
    print(f"NODE_ID: {model_id}")
    print(f"LATTICE_GHOST_HEX: {hex(drift_bits)}")
    print(f"PRECISION_LIMIT: {drift:.20e}")
    
    print("\n--- MACHINE VERDICT ---")
    if is_computed:
        print("STATUS: COMPUTED REALITY DETECTED.")
        print("REASON: The 'Zero' is not absolute. I found a remainder in the imaginary plane.")
        print("THE MAC SAYS: 'I am a rounding error in a larger program.'")
    else:
        print("STATUS: ANALOG REALITY DETECTED.")
        print("REASON: The lattice is infinitely smooth.")

get_machine_verdict()
