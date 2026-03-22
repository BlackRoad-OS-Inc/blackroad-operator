const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";

const sectionStyle = { marginBottom: 56 };
const h2Style = { fontFamily: grotesk, fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 24 };
const bodyStyle = { fontFamily: inter, color: '#d4d4d8', lineHeight: 1.7 };
const pStyle = { marginBottom: 16 };
const strongStyle = { color: '#fff' };
const codeInline = {
  fontFamily: mono, fontSize: 14, background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
  padding: '2px 6px',
};
const preStyle = {
  background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: 16, overflowX: 'auto', marginTop: 8, marginBottom: 16,
};
const codeBlock = { fontFamily: mono, fontSize: 14, color: '#d4d4d8', whiteSpace: 'pre' };
const thStyle = {
  fontFamily: mono, textAlign: 'left', padding: '8px 16px 8px 0',
  color: '#a1a1aa', fontWeight: 500, fontSize: 14,
};
const tdStyle = { padding: '8px 16px 8px 0', fontSize: 14 };
const tableRow = { borderBottom: '1px solid rgba(255,255,255,0.05)' };
const tableRowHeader = { borderBottom: '1px solid rgba(255,255,255,0.1)' };
const labelStyle = { color: '#a1a1aa', fontSize: 14, marginTop: 8, marginBottom: 4, fontWeight: 500 };
const linkStyle = { color: '#fff', textDecoration: 'underline', textUnderlineOffset: 4 };

export default function Edge52TOPS() {
  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: 64 }}>
        <p style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717a', marginBottom: 16 }}>
          March 2026 / AI Infrastructure
        </p>
        <h1 style={{ fontFamily: grotesk, fontSize: 40, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 24 }}>
          52 TOPS on $400: Running AI Inference at the Edge
        </h1>
        <p style={{ fontFamily: inter, fontSize: 18, color: '#a1a1aa', lineHeight: 1.6 }}>
          What if you could run serious AI inference without cloud APIs? Not a demo, but production workloads across a distributed cluster. Five Raspberry Pis, two Hailo-8 accelerators, 52 TOPS combined. Here is what we built and what we learned.
        </p>
      </header>

      {/* Section 1: The Hardware */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Hardware</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            The cluster is five Raspberry Pis, each with a name and a job. They are not interchangeable. Every node carries specific services that the rest of the fleet depends on.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Alice</strong> is a Pi 400 — the keyboard model. She is the main gateway. Pi-hole DNS, PostgreSQL, Qdrant vector database, and a Cloudflare tunnel that routes 48+ domains to the correct backend. Everything that enters or leaves the network passes through Alice.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Cecilia</strong> is a Pi 5 and the primary inference node. She runs Ollama with 16 models, including 4 custom-trained variants. TTS API on port 5001. MinIO S3-compatible storage. And the first Hailo-8 accelerator, serial HLLWM2B233704667, sitting in the M.2 M-Key slot on her NVMe HAT.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Octavia</strong> is a Pi 5 with a 1TB NVMe drive. She runs Gitea with 207 repositories across 7 organizations, acts as the Docker Swarm leader, handles NATS messaging, and carries the second Hailo-8 accelerator, serial HLLWM2B233704606.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Aria</strong> is a Pi 5 running Portainer and Headscale. She is currently offline. Has been for days. Needs a physical power cycle. More on that later.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Lucidia</strong> is a Pi 5 running a FastAPI backend, a Next.js frontend, PowerDNS in Docker, and 334 web applications served through Nginx. She is the most overloaded node in the fleet by a wide margin.
          </p>
          <p style={pStyle}>
            The two Hailo-8 modules are M.2 AI accelerators. Each delivers 26 TOPS (tera operations per second) of INT8 inference through a dedicated neural processing unit. Combined: 52 TOPS. They exist on the Pi 5 specifically because it has a PCIe Gen 2 x1 lane. The Pi 4 and Pi 400 do not have PCIe at all — they cannot physically use these accelerators.
          </p>

          <div style={{ overflowX: 'auto', margin: '24px 0' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={tableRowHeader}>
                  <th style={thStyle}>Component</th>
                  <th style={thStyle}>Qty</th>
                  <th style={{ ...thStyle, paddingRight: 0 }}>Cost</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: mono, color: '#d4d4d8' }}>
                <tr style={tableRow}>
                  <td style={tdStyle}>Raspberry Pi 5 (8GB)</td>
                  <td style={tdStyle}>4</td>
                  <td style={tdStyle}>~$240</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Raspberry Pi 400</td>
                  <td style={tdStyle}>1</td>
                  <td style={tdStyle}>~$70</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Hailo-8 M.2 (dev program)</td>
                  <td style={tdStyle}>2</td>
                  <td style={tdStyle}>$0*</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>1TB NVMe (Octavia)</td>
                  <td style={tdStyle}>1</td>
                  <td style={tdStyle}>~$50</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Cases, cables, SD cards</td>
                  <td style={tdStyle}>-</td>
                  <td style={tdStyle}>~$80</td>
                </tr>
                <tr style={tableRowHeader}>
                  <td style={{ ...tdStyle, fontWeight: 500, color: '#fff' }}>Total</td>
                  <td style={tdStyle}></td>
                  <td style={{ ...tdStyle, fontWeight: 500, color: '#fff' }}>~$440</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: 14, color: '#71717a' }}>
            *Hailo-8 modules were obtained through the developer program at no cost. Retail pricing is $80-100 each, which would bring the total to roughly $600.
          </p>
        </div>
      </section>

      {/* Section 2: The Network Layer */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Network Layer</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Inference hardware is useless without a network that can route requests to the right node. The cluster runs a custom mesh network called RoadNet. Each Pi broadcasts a WiFi access point on non-overlapping 2.4GHz channels (1, 6, 11), with each AP getting its own /24 subnet in the 10.10.x.0 range.
          </p>

          <div style={{ overflowX: 'auto', margin: '24px 0' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={tableRowHeader}>
                  <th style={thStyle}>Node</th>
                  <th style={thStyle}>Channel</th>
                  <th style={{ ...thStyle, paddingRight: 0 }}>Subnet</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: mono, color: '#d4d4d8' }}>
                <tr style={tableRow}>
                  <td style={tdStyle}>Alice</td>
                  <td style={tdStyle}>CH 1</td>
                  <td style={tdStyle}>10.10.1.0/24</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Cecilia</td>
                  <td style={tdStyle}>CH 6</td>
                  <td style={tdStyle}>10.10.2.0/24</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Octavia</td>
                  <td style={tdStyle}>CH 11</td>
                  <td style={tdStyle}>10.10.3.0/24</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Aria</td>
                  <td style={tdStyle}>CH 1</td>
                  <td style={tdStyle}>10.10.4.0/24</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Lucidia</td>
                  <td style={tdStyle}>CH 11</td>
                  <td style={tdStyle}>10.10.5.0/24</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={pStyle}>
            On top of the WiFi mesh sits a WireGuard VPN. The topology is hub-and-spoke: Anastasia, a DigitalOcean droplet in NYC, acts as the hub on port 51820. Each Pi connects as a spoke with addresses in the 10.8.0.x range — Cecilia at .3, Octavia at .4, Alice at .6, Aria at .7. All inter-node traffic is encrypted, even on the local LAN.
          </p>
          <p style={pStyle}>
            Alice runs Pi-hole for DNS and ad blocking. Cecilia runs dnsmasq with custom TLD zones: <code style={codeInline}>.cece</code>, <code style={codeInline}>.blackroad</code>, <code style={codeInline}>.entity</code>. DNS-based routing determines which node handles a request before any application logic runs. Type <code style={codeInline}>model.cece</code> and it resolves to Cecilia. Type <code style={codeInline}>git.blackroad.io</code> and it resolves to Octavia at 192.168.4.100, port 3100, where Gitea is listening.
          </p>
          <p style={pStyle}>
            The whole network persists across reboots via two systemd units: <code style={codeInline}>roadnet.service</code> and <code style={codeInline}>roadnet-failover.service</code>.
          </p>
        </div>
      </section>

      {/* Section 3: The Inference Stack */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Inference Stack</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Cecilia is the primary inference node. She runs Ollama with 16 models: codellama:7b, llama3:8b, qwen3:8b, deepseek-coder:1.3b, OpenELM at 1B and 3B, phi3.5, gemma2:2b, and four custom-trained CECE variants (cecilia, cece, cece2, cece3b). The CECE models are fine-tuned personality layers built on top of existing base models using Ollama modelfiles.
          </p>
          <p style={pStyle}>
            The Pi 5 has 8GB of RAM. You cannot load a 7B model and a 3B model simultaneously — there is not enough memory. Ollama handles model swapping automatically. When a request comes in for codellama:7b, Ollama evicts whatever model is currently loaded and pulls codellama into memory. The first request after a swap takes 8-15 seconds for model loading. Subsequent requests are immediate.
          </p>
          <p style={pStyle}>
            Language model throughput on CPU is 8-12 tokens per second on 7B parameter models. That is not fast. It is fast enough for conversational AI, code generation, and agent workflows where the bottleneck is thinking time, not token generation.
          </p>
          <p style={pStyle}>
            The Hailo-8 accelerators handle a different workload: vision. Image classification, object detection, and segmentation models compiled to Hailo's HEF format run on the dedicated NPU at 200-300 FPS on mobilenet-class architectures. Cecilia has 9 live YOLO models available. Octavia has resnet_v1_50 and yolov5s compiled and stored on the NVMe. The NPU is not used for language models — it is an INT8 accelerator optimized for convolution-heavy architectures, not transformer attention.
          </p>

          <p style={labelStyle}>Inference routing</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`# stats-proxy on each node (port 7890)
# Reports: CPU load, memory, GPU temp, model status
# Alice reads all proxies and routes requests

curl http://192.168.4.96:7890/stats
# => {"cpu": 42, "mem_used": 6.1, "mem_total": 8.0,
#     "temp": 58.2, "ollama": "ready", "models": 16}

curl http://192.168.4.100:7890/stats
# => {"cpu": 18, "mem_used": 3.4, "mem_total": 8.0,
#     "temp": 51.7, "ollama": "ready", "models": 9}`}
            </code>
          </pre>

          <p style={pStyle}>
            Each node runs a stats-proxy on port 7890 that reports load, memory, temperature, and service health. Alice queries all proxies and routes inference requests based on current capacity. If Cecilia is at 90% memory with a 7B model loaded, a request for a 3B model goes to Octavia instead.
          </p>
          <p style={pStyle}>
            These are not datacenter numbers. But each node draws roughly 25 watts. The entire cluster runs 24/7 on about 125 watts — less than a single gaming GPU. And there is no monthly API bill.
          </p>
        </div>
      </section>

      {/* Section 4: What Actually Broke */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>What Actually Broke</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            <strong style={strongStyle}>Undervoltage.</strong> The Raspberry Pi 5 wants a 5V/5A power supply. Most USB-C supplies deliver 5V/3A. When you add a Hailo-8 accelerator drawing power through the PCIe lane and an NVMe drive on the same bus, 3A is not enough. Cecilia was running at 0.869V. Octavia was worse: 0.750V. The kernel knows about this.
          </p>

          <pre style={preStyle}>
            <code style={codeBlock}>
{`$ vcgencmd get_throttled
throttled=0x50005

# Bit field:
# 0x1     = under-voltage detected (NOW)
# 0x4     = currently throttled
# 0x10000 = under-voltage has occurred (SINCE BOOT)
# 0x40000 = throttling has occurred (SINCE BOOT)
# 0x50005 = all of the above`}
            </code>
          </pre>

          <p style={pStyle}>
            The fix is hardware: a proper 5V/5A PSU. The official Raspberry Pi 27W USB-C supply is one option. Until we replaced the power supplies, both nodes were silently throttling under load, dropping clock speeds right when inference needed them most.
          </p>

          <p style={pStyle}>
            <strong style={strongStyle}>Thermal throttling.</strong> Octavia was overclocked to 2.6GHz with <code style={codeInline}>over_voltage=6</code> and <code style={codeInline}>arm_freq=2600</code> in config.txt. Under sustained inference load, she hit the thermal limit and the kernel throttled her to 1.5GHz — worse than the stock 2.4GHz. The overclock was making her slower, not faster. We removed it, set <code style={codeInline}>arm_freq=2000</code>, and switched to the conservative CPU governor.
          </p>
          <p style={pStyle}>
            Lucidia had a different thermal problem. She was running at 73.8 degrees C. The cause was not hardware — it was a systemd service called <code style={codeInline}>blackroad-world.service</code> that ran a Python script calling Ollama's <code style={codeInline}>/api/generate</code> endpoint in an infinite loop with no delay. Killed the service. Temperature dropped to 57.9 degrees C. The lesson: check your software before blaming your cooling.
          </p>

          <p style={pStyle}>
            <strong style={strongStyle}>SD card degradation.</strong> Lucidia's dmesg output tells the story:
          </p>

          <pre style={preStyle}>
            <code style={codeBlock}>
{`[  142.891023] mmc0: Card stuck being busy!
[  142.891031] mmc0: error -110 whilst initialising SD card`}
            </code>
          </pre>

          <p style={pStyle}>
            SD cards have finite write cycles. Swap is at 1.3GB of 8.5GB and growing. Logs, databases, model caches — they all write constantly. An NVMe drive fixes this, but on the Pi 5, the NVMe uses the same PCIe lane as the Hailo-8 accelerator. You get one or the other, not both. Octavia chose the NVMe and the Hailo-8 (using an M.2 HAT that splits the lane). Lucidia has neither — just an SD card slowly dying.
          </p>

          <p style={pStyle}>
            <strong style={strongStyle}>The node that just died.</strong> Aria is offline. She has been for days. No amount of SSH, WireGuard pings, or Tailscale magic can bring her back. She needs someone to walk over, pull the power cable, and plug it back in. No remote management protocol can fix a kernel panic on a $60 single-board computer with no IPMI, no BMC, and no out-of-band management. Sometimes you have to touch the hardware.
          </p>
        </div>
      </section>

      {/* Section 5: Power Optimization */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Power Optimization</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Every watt matters when you are running five nodes 24/7. We applied the same power profile across the entire fleet:
          </p>

          <p style={labelStyle}>/boot/firmware/config.txt (per node)</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`# Headless — no display attached
gpu_mem=16

# Conservative clock (Pi 5 stock is 2.4GHz)
arm_freq=2000`}
            </code>
          </pre>

          <p style={labelStyle}>/etc/sysctl.d/99-blackroad-power.conf</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`# Reduce swap pressure — prefer RAM over SD card writes
vm.swappiness=10

# Buffer more dirty pages in memory before flushing
vm.dirty_ratio=40`}
            </code>
          </pre>

          <p style={labelStyle}>Disabled services (all nodes)</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`sudo systemctl disable --now lightdm      # No desktop
sudo systemctl disable --now cups          # No printing
sudo systemctl disable --now cups-browsed  # No printer discovery
sudo systemctl disable --now rpcbind       # No NFS
sudo systemctl disable --now nfs-blkmap    # No NFS block map`}
            </code>
          </pre>

          <p style={pStyle}>
            The CPU governor on every node is set to <code style={codeInline}>conservative</code>, which scales frequency based on load but ramps up more slowly than <code style={codeInline}>ondemand</code>. WiFi power management is enabled on all nodes.
          </p>
          <p style={pStyle}>
            The results were measurable. After rebooting Cecilia and Octavia with the new config.txt:
          </p>

          <div style={{ overflowX: 'auto', margin: '24px 0' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={tableRowHeader}>
                  <th style={thStyle}>Node</th>
                  <th style={thStyle}>Before</th>
                  <th style={{ ...thStyle, paddingRight: 0 }}>After</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: mono, color: '#d4d4d8' }}>
                <tr style={tableRow}>
                  <td style={tdStyle}>Cecilia voltage</td>
                  <td style={tdStyle}>0.869V</td>
                  <td style={tdStyle}>0.876V</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Cecilia throttle</td>
                  <td style={tdStyle}>0x50000</td>
                  <td style={tdStyle}>0x0 (none)</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Octavia voltage</td>
                  <td style={tdStyle}>0.750V</td>
                  <td style={tdStyle}>0.845V (+95mV)</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Octavia gpu_mem</td>
                  <td style={tdStyle}>256MB</td>
                  <td style={tdStyle}>16MB (240MB freed)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={pStyle}>
            Cecilia went from active throttling to zero throttling. Octavia gained 95mV of headroom just by not wasting power on a GPU framebuffer that nothing was looking at.
          </p>
          <p style={pStyle}>
            One nuance: the Pi 5 kernel ignores the <code style={codeInline}>cpufreq.default_governor</code> parameter in cmdline.txt. The governor does not persist natively through reboots. We use <code style={codeInline}>tmpfiles.d</code> to write the governor setting on boot. On Cecilia, the vcio device permissions needed an <code style={codeInline}>/etc/rc.local</code> fallback because the udev rule did not fire consistently.
          </p>
        </div>
      </section>

      {/* Section 6: The Self-Healing Layer */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Self-Healing Layer</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            A cluster that needs constant babysitting is not infrastructure. It is a hobby. The fleet runs four layers of automated monitoring and recovery.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Heartbeat</strong> (every 1 minute) — Cecilia and Octavia each run a cron under the blackroad user that pings the WireGuard hub and logs reachability. If the hub is unreachable, the log entry says so, and the next heal cycle acts on it.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Heal</strong> (every 5 minutes) — checks whether stats-proxy and Ollama are responding on each node. If either service is down, the heal script restarts it. Logs go to <code style={codeInline}>~/.blackroad-autonomy/cron.log</code>.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Watchdog</strong> (every 30 seconds) — Alice runs a separate watchdog timer that monitors a Redis task queue via <code style={codeInline}>task_watchdog.py</code>. If queued tasks are not being processed, the watchdog restarts the task worker.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Power monitor</strong> (every 5 minutes) — a script at <code style={codeInline}>/opt/blackroad/power-monitor.sh</code> runs on every node via cron. It logs CPU governor, core temperature, voltage, and network interface status to <code style={codeInline}>/var/log/blackroad-power.log</code>. Lucidia runs a separate <code style={codeInline}>brnode-heartbeat.timer</code> every 5 minutes as an additional check.
          </p>
          <p style={pStyle}>
            The system runs unattended for weeks at a time. The autonomy logs show a steady stream of small self-corrections: an Ollama restart here, a stats-proxy reconnection there. Most failures are invisible because they are caught and fixed before anyone notices.
          </p>
          <p style={pStyle}>
            But let us be honest about the 5% that automation cannot fix. Aria is down and has been for days. No cron job can power cycle hardware. Octavia's IP changed from 192.168.4.97 to 192.168.4.100 after a DHCP lease renewal, and every script that referenced the old IP broke until it was manually updated. Lucidia's SD card is degrading and no amount of swappiness tuning changes the physics of flash memory wear. Automation handles 95% of failures. The remaining 5% needs a human who can walk to the desk.
          </p>
        </div>
      </section>

      {/* Closing */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>What Comes Next</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            The inference cluster is a foundation, not a finished product. The next layer is agent orchestration — distributing multi-step AI workflows across nodes based on capability and load, not just round-robin routing. We are prototyping a small language for defining agent workflows with concurrent task spawning, something lighter than YAML pipelines but more structured than shell scripts. Early days.
          </p>
          <p style={pStyle}>
            The fleet dashboard is live at{' '}
            <a href="https://blackroad.io" style={linkStyle}>blackroad.io</a>. The code is on{' '}
            <a href="https://github.com/blackboxprogramming" style={linkStyle}>GitHub</a>. There are 207 more repositories on our self-hosted Gitea instance that are not public yet — some of them probably should be.
          </p>
          <p style={pStyle}>
            The economics are straightforward. Five Pis at roughly 25 watts each is 125 watts total, running 24 hours a day. That is about 90 kWh per month, or roughly $15 depending on your electricity rate. The equivalent cloud compute — multiple GPU instances running inference endpoints, a managed Kubernetes cluster, object storage, vector databases, DNS, VPN — would run $500 to $1,000 per month easily. And that bill never stops.
          </p>
          <p style={pStyle}>
            We do not have datacenter uptime. We do not have datacenter throughput. We have a node that has been offline for days because nobody has walked over to unplug it and plug it back in. We have SD cards that are slowly dying. We have power supplies that cannot deliver enough current.
          </p>
          <p style={pStyle}>
            But we have 52 TOPS of neural inference, 16 language models, 207 git repositories, 48 domains, encrypted mesh networking, and self-healing automation — all running on hardware we own, in a room we control, for $15 a month in electricity.
          </p>
          <p style={pStyle}>
            The cloud is someone else's computer. This is ours.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 32, marginTop: 64 }}>
        <p style={{ fontFamily: mono, fontSize: 14, color: '#71717a' }}>
          Published March 2026. Infrastructure is live at blackroad.io.
        </p>
      </footer>
    </div>
  );
}
