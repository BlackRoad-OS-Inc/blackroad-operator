tags: edge, memristor, fefet, snn

# Low-power edge agent research highlights

## 1. Memristor-based adaptive ADC for compute-in-memory
- Source: Nature Communications, "Memristor-based adaptive analog-to-digital conversion for efficient and accurate compute-in-memory" (2025).
- Highlights:
  - Adaptive ADC architecture paired with memristor arrays.
  - ~15.1× energy reduction and ~12.9× area reduction versus prior art.
  - When deployed in CIM systems: up to ~57.2% lower energy overhead and ~30.7% lower area overhead.
- Notes for pilots:
  - Pair with small memristor test arrays on FPGA carrier boards to explore <100 mW inference nodes.
  - Track integration risks: memristor yield, analog variability, interface calibration.

## 2. Hafnia-based FeFET progress review
- Source: Nano Convergence review, "Recent advances in ferroelectric materials, devices, and in-memory/neuromorphic computing" (Nov 2025).
- Highlights:
  - Surveys the state of hafnia ferroelectric devices for embedded non-volatile memory and neuromorphic compute.
  - Finds that process maturity is improving to the point where small-scale edge deployments are realistic.
  - Identifies endurance and device variability as the dominant engineering risks.
- Notes for pilots:
  - Begin with tiny FeFET evaluation arrays tied to shared driver/tooling stacks.
  - Emphasize accelerated endurance / variability characterization before scaling capacity.

## 3. Spiking neural network SoC prototype
- Source: arXiv, "A High-Throughput Spiking Neural Network Processor Enabling Synaptic Delay Emulation" (Nov 2025).
- Highlights:
  - Implemented on a PYNQ Z2 FPGA platform with synaptic delay support and spiking attention.
  - Achieved ~93.4% accuracy on the SHD benchmark with throughput around 104 samples/sec.
  - Reported power draw ~282 mW for the SoC design.
- Notes for pilots:
  - Reproduce measurements on in-house PYNQ Z2 hardware to validate sub-watt performance envelopes.
  - Integrate with memristor/FeFET modules via NeuroSim or similar toolchains for end-to-end edge inference stacks.

## Combined pilot direction
- Assemble a sub-1 W edge node stack: FPGA SNN core + memristor or FeFET CIM module + adaptive ADC.
- Instrument power, latency, and robustness under environmental variation (temperature, supply noise).
- Maintain focus on analog component variability, endurance testing, and toolchain maturity.
