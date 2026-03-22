# UVM Decision Matrix

**Source:** br-drive

---

Decision Matrix: The Universal Video Mesh (UVM)

You have the "Brains" (Pi 5s) and the "Nerves" (Gigabit/WiFi 6). These are the final steps to finalize your Wireless HDMI/KVM capability.

1. THE "NO-BUY" LIST (Software is Free)

The images you shared show pro-level tools that are completely free. Do not buy commercial versions.

Sunshine & Moonlight: These replace high-end wireless HDMI kits. They are open-source and specifically optimized for the H.265 hardware on your Pi 5s.

Barrier / InputLeap: This replaces physical KVM switches. It allows your Magic Mouse to transition between your Mac and your "Blue Machine" screens wirelessly.

Tailscale: This replaces complex VPN setups. It lets you "SSH" into your video feed from anywhere in the world.

2. THE "MUST BUY" (The $5 Missing Link)

To make a Pi run "Wireless HDMI" without a physical monitor attached, you need a Headless Ghost.

The Part: HDMI Dummy Plug (Headless Ghost).

Why: Without a monitor plugged in, the Pi often won't enable its high-performance GPU or high resolutions (like 4K). These $5 dongles trick the Pi into "thinking" a 4K monitor is attached, so it can broadcast that high-res signal to your other screens.

Quantity: Buy one for every "headless" Pi 5 in your cluster.

3. THE "UPGRADE" LIST (Optional Hardware)

4. THE CAPABILITY SETUP (What we do next)

Since you aren't buying software, we focus on the Configuration:

Node Entanglement: Install Sunshine on the Pi 5s. They become "Broadcasters."

Display Bonding: Install Moonlight on your 10.1" and 9.3" touchscreen nodes. They become "Receivers."

The Bridge: Connect your Pi 4B Capture Card to your MacBook. Now your MacBook is a "channel" on your wireless mesh.

The Magic Link: Run Barrier. Now your Apple Magic Keyboard controls whichever screen your eyes are on.

Summary Checklist

[ ] Hardware: Order 2-4 "HDMI Dummy Plugs" (Headless Ghosts).

[ ] Software: Download Sunshine (Host) and Moonlight (Client).

[ ] Networking: Connect all Pis to your TP-Link Gigabit Switch for the lowest possible latency.
