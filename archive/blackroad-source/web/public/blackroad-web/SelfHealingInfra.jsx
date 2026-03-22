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
const labelStyle = { color: '#a1a1aa', fontSize: 14, marginTop: 8, marginBottom: 4, fontWeight: 500 };
const linkStyle = { color: '#fff', textDecoration: 'underline', textUnderlineOffset: 4 };
const h3Style = { fontFamily: grotesk, fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12, marginTop: 32 };

export default function SelfHealingInfra() {
  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: 64 }}>
        <p style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717a', marginBottom: 16 }}>
          March 2026 / Infrastructure
        </p>
        <h1 style={{ fontFamily: grotesk, fontSize: 40, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 24 }}>
          Self-Healing Infrastructure: When Your Servers Fix Themselves
        </h1>
        <p style={{ fontFamily: inter, fontSize: 18, color: '#a1a1aa', lineHeight: 1.6 }}>
          Five nodes running 24/7 in your house. No SRE team. No PagerDuty. No on-call rotation. The system needs to detect its own failures and fix them before you wake up.
        </p>
      </header>

      {/* Section 1: The Heartbeat Layer */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Heartbeat Layer</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            The first layer of self-healing is awareness. Every node needs to know if it can reach the rest of the fleet, if its critical services are running, and if its network interfaces are up. This is the heartbeat layer — a 1-minute cron job that checks the basics and logs the results.
          </p>
          <p style={pStyle}>
            Cecilia and Octavia each run a heartbeat cron under the <code style={codeInline}>blackroad</code> user. Every minute, the script pings the WireGuard hub at 10.8.0.1, checks DNS resolution, and verifies the primary network interface is up. Results go to <code style={codeInline}>~/.blackroad-autonomy/cron.log</code>.
          </p>

          <p style={labelStyle}>heartbeat.sh (simplified)</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`#!/bin/bash
LOG="$HOME/.blackroad-autonomy/cron.log"
TS=$(date '+%Y-%m-%d %H:%M:%S')

# Check WireGuard hub
if ping -c 1 -W 3 10.8.0.1 > /dev/null 2>&1; then
  echo "[$TS] HEARTBEAT: wg-hub OK" >> "$LOG"
else
  echo "[$TS] HEARTBEAT: wg-hub UNREACHABLE" >> "$LOG"
fi

# Check DNS
if host blackroad.io > /dev/null 2>&1; then
  echo "[$TS] HEARTBEAT: dns OK" >> "$LOG"
else
  echo "[$TS] HEARTBEAT: dns FAIL" >> "$LOG"
fi

# Check primary interface
if ip link show eth0 | grep -q 'state UP'; then
  echo "[$TS] HEARTBEAT: eth0 UP" >> "$LOG"
else
  echo "[$TS] HEARTBEAT: eth0 DOWN" >> "$LOG"
fi`}
            </code>
          </pre>

          <p style={pStyle}>
            Alice runs a different monitor: <code style={codeInline}>blackroad-watchdog.timer</code>, which fires every 30 seconds. It runs <code style={codeInline}>task_watchdog.py</code>, a Python script that checks Alice's Redis task queue. If tasks have been sitting in the queue for more than 5 minutes without being processed, the watchdog restarts the task worker service. Alice is the gateway — if her task processing stops, inference routing stops.
          </p>
          <p style={pStyle}>
            Lucidia runs <code style={codeInline}>brnode-heartbeat.timer</code> every 5 minutes. This is a separate system from the blackroad-autonomy crons. It calls <code style={codeInline}>/opt/blackroad/bin/brnode heartbeat</code>, which reports node status to the fleet's stats collection endpoint. Lucidia's heartbeat is more of a status report than a health check — it tells the fleet "I am alive and here are my numbers."
          </p>
          <p style={pStyle}>
            The heartbeat layer does not fix anything. It only observes and logs. That is intentional. Separating detection from correction means you can audit what the system saw before it acted. When something goes wrong, the heartbeat logs tell you exactly when each service was last seen healthy.
          </p>
        </div>
      </section>

      {/* Section 2: The Heal Layer */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Heal Layer</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            The heal layer runs every 5 minutes on Cecilia and Octavia. It checks three critical services: <code style={codeInline}>stats-proxy</code> (port 7890), <code style={codeInline}>ollama</code> (port 11434), and <code style={codeInline}>cloudflared</code> (the Cloudflare tunnel daemon). If any of them are not responding, the heal script restarts them.
          </p>

          <p style={labelStyle}>heal.sh (simplified)</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`#!/bin/bash
LOG="$HOME/.blackroad-autonomy/cron.log"
TS=$(date '+%Y-%m-%d %H:%M:%S')

# Check stats-proxy
if ! curl -sf http://localhost:7890/stats > /dev/null 2>&1; then
  echo "[$TS] HEAL: stats-proxy DOWN, restarting" >> "$LOG"
  sudo systemctl restart stats-proxy
  sleep 5
  if curl -sf http://localhost:7890/stats > /dev/null 2>&1; then
    echo "[$TS] HEAL: stats-proxy RECOVERED" >> "$LOG"
  else
    echo "[$TS] HEAL: stats-proxy STILL DOWN after restart" >> "$LOG"
  fi
else
  echo "[$TS] HEAL: stats-proxy OK" >> "$LOG"
fi

# Check ollama
if ! curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
  echo "[$TS] HEAL: ollama DOWN, restarting" >> "$LOG"
  sudo systemctl restart ollama
  sleep 10
  if curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "[$TS] HEAL: ollama RECOVERED" >> "$LOG"
  else
    echo "[$TS] HEAL: ollama STILL DOWN after restart" >> "$LOG"
  fi
else
  echo "[$TS] HEAL: ollama OK" >> "$LOG"
fi

# Check cloudflared
if ! pgrep -x cloudflared > /dev/null 2>&1; then
  echo "[$TS] HEAL: cloudflared DOWN, restarting" >> "$LOG"
  sudo systemctl restart cloudflared
else
  echo "[$TS] HEAL: cloudflared OK" >> "$LOG"
fi`}
            </code>
          </pre>

          <p style={pStyle}>
            Real example: Ollama on Cecilia crashed at 2:17 AM on a Tuesday. The heartbeat log at 2:17 showed <code style={codeInline}>ollama: OK</code>. The heartbeat log at 2:18 showed <code style={codeInline}>ollama: OK</code> (heartbeat does not check Ollama directly — it checks network reachability). The heal script ran at 2:20 and logged <code style={codeInline}>HEAL: ollama DOWN, restarting</code>. At 2:20:15 it logged <code style={codeInline}>HEAL: ollama RECOVERED</code>. Total downtime: roughly 3 minutes. Nobody was paged. Nobody woke up.
          </p>
          <p style={pStyle}>
            The heal script has a deliberate limitation: it only tries once. If a service does not come back after a single restart, the script logs the failure and moves on. It does not enter a restart loop. Infinite restart loops can mask deeper problems and consume resources. If Ollama cannot start, there is probably a reason — out of memory, corrupt model files, disk full — and hammering restart will not help.
          </p>
        </div>
      </section>

      {/* Section 3: Power Monitor */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Power Monitor</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            The power monitor is a different kind of health check. It does not monitor services — it monitors the physical state of the hardware. CPU temperature, voltage, throttle flags, memory usage, disk usage, and load average. It runs on every node every 5 minutes via cron.
          </p>

          <p style={labelStyle}>/opt/blackroad/power-monitor.sh (output format)</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`[2026-03-09 14:35:01] NODE=cecilia
  governor=conservative
  temp=58.2C
  voltage=0.876V
  throttled=0x0
  mem_used=6.1G/8.0G (76%)
  disk_used=22G/29G (77%)
  load=1.42 1.28 1.15
  swap=0.4G/8.5G (5%)
  wlan0=UP eth0=UP wg0=UP`}
            </code>
          </pre>

          <p style={pStyle}>
            This data goes to <code style={codeInline}>/var/log/blackroad-power.log</code> on each node. It is not real-time monitoring — it is a 5-minute sample. But over hours and days, the log reveals patterns that you cannot see in the moment.
          </p>
          <p style={pStyle}>
            The power monitor is how we caught Lucidia's thermal runaway. The log showed temperature climbing steadily: 62, 65, 68, 71, 73.8 degrees C over the course of an afternoon. Load average was consistently above 3.0 on a 4-core machine. Something was pegging all cores. Tracing the load led to <code style={codeInline}>blackroad-world.service</code>, which was running <code style={codeInline}>world-engine.py</code> — a script that called Ollama's <code style={codeInline}>/api/generate</code> endpoint in a tight loop with no delay between requests. Disabling the service dropped the temperature from 73.8 to 57.9 degrees C within 20 minutes.
          </p>
          <p style={pStyle}>
            The power monitor also caught Octavia's undervoltage problem. The log showed <code style={codeInline}>voltage=0.750V</code> and <code style={codeInline}>throttled=0x50005</code> — active undervoltage and throttling, both currently and since boot. The Pi 5 needs 0.85V minimum for stable operation. At 0.750V, the kernel was throttling the CPU to prevent hardware damage. After removing the overclock settings from config.txt and rebooting, voltage jumped to 0.845V — a 95mV improvement.
          </p>
        </div>
      </section>

      {/* Section 4: Real Incidents */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Real Incidents</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Theory is nice. Here is what actually happened.
          </p>

          <h3 style={h3Style}>1. Lucidia Overheating</h3>
          <p style={pStyle}>
            <strong style={strongStyle}>Symptom:</strong> Lucidia running at 73.8 degrees C, load average above 3.0 continuously.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Root cause:</strong> A systemd service called <code style={codeInline}>blackroad-world.service</code> was running <code style={codeInline}>world-engine.py</code>, which called Ollama's <code style={codeInline}>/api/generate</code> in an infinite loop with no sleep between requests. Every response triggered a new request immediately.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Fix:</strong> Disabled and stopped the service. Temperature dropped from 73.8 to 57.9 degrees C within 20 minutes. The service stayed disabled.
          </p>

          <h3 style={h3Style}>2. Cecilia rpi-connect Crash Loop</h3>
          <p style={pStyle}>
            <strong style={strongStyle}>Symptom:</strong> <code style={codeInline}>rpi-connect-wayvnc</code> restarting every few seconds, filling logs with crash traces, consuming CPU.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Root cause:</strong> Cecilia is headless — no display attached. The rpi-connect service was trying to start a VNC session on a non-existent display, crashing, and systemd was restarting it on a tight loop.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Fix:</strong> Masked both the system and user service units. Masked, not disabled — <code style={codeInline}>systemctl mask</code> creates a symlink to <code style={codeInline}>/dev/null</code>, which prevents the service from being started by any trigger, including dependencies.
          </p>

          <h3 style={h3Style}>3. Octavia Overclock at 0.750V</h3>
          <p style={pStyle}>
            <strong style={strongStyle}>Symptom:</strong> Octavia sluggish under load, <code style={codeInline}>vcgencmd get_throttled</code> returning 0x50005 (active undervoltage + throttling).
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Root cause:</strong> <code style={codeInline}>config.txt</code> had <code style={codeInline}>over_voltage=6</code> and <code style={codeInline}>arm_freq=2600</code>. The PSU could not deliver enough current for the overclock plus the Hailo-8 plus the NVMe drive. The kernel was throttling to 1.5GHz under load — worse than stock.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Fix:</strong> Removed overclock settings, set <code style={codeInline}>arm_freq=2000</code>, set <code style={codeInline}>gpu_mem=16</code>. After reboot: voltage rose from 0.750V to 0.845V (+95mV), gpu_mem freed 240MB to the system.
          </p>

          <h3 style={h3Style}>4. Cecilia Obfuscated Cron Dropper</h3>
          <p style={pStyle}>
            <strong style={strongStyle}>Symptom:</strong> Suspicious cron entry running a base64-encoded command that decoded to a Python downloader.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Root cause:</strong> An obfuscated cron job was set to periodically execute a script from <code style={codeInline}>/tmp/op.py</code>. This is a classic dropper pattern — download and execute arbitrary code. Origin unknown, likely from an exposed service or compromised credential.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Fix:</strong> Removed the cron entry. Deleted <code style={codeInline}>/tmp/op.py</code>. Audited all cron jobs on all nodes. No other suspicious entries found. Added cron auditing to the regular security review.
          </p>

          <h3 style={h3Style}>5. Lucidia Skeleton Microservices</h3>
          <p style={pStyle}>
            <strong style={strongStyle}>Symptom:</strong> Lucidia using 800MB more RAM than expected, 16 user services running under the <code style={codeInline}>blackroad</code> user on ports 5000 through 6300.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Root cause:</strong> Sixteen skeleton microservices — empty Flask/FastAPI apps with default routes — were deployed as systemd user services. Each consumed 30-60MB of RAM doing nothing. They were development scaffolds that were never cleaned up.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Fix:</strong> Disabled all 16 services. Freed approximately 800MB of RAM. Lucidia's memory usage dropped from 92% to 78%.
          </p>

          <h3 style={h3Style}>6. Plaintext PUSH_SECRET</h3>
          <p style={pStyle}>
            <strong style={strongStyle}>Symptom:</strong> API push secrets visible in plaintext in crontab entries on three nodes.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Root cause:</strong> The stats-proxy push cron passed the <code style={codeInline}>PUSH_SECRET</code> as a command-line argument, visible to anyone who ran <code style={codeInline}>crontab -l</code> or <code style={codeInline}>ps aux</code>.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Fix:</strong> Moved the secret to <code style={codeInline}>/opt/blackroad/stats-push.env</code> with <code style={codeInline}>chmod 600</code> (owner read/write only). Updated the cron to source the env file instead. Applied to all three affected nodes.
          </p>
        </div>
      </section>

      {/* Section 5: Honest Limits */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Honest Limits</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Self-healing sounds impressive until you list everything it cannot do.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Aria is still down.</strong> She has been offline for days. The heartbeat log on every other node shows <code style={codeInline}>HEARTBEAT: aria UNREACHABLE</code> every minute, 1,440 times a day. No cron job can walk to a desk and pull a power cable. No systemd timer can press a reset button. Remote management requires the node to be running, and Aria is not.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>SD card degradation is physics.</strong> Lucidia's SD card is dying. The dmesg errors — <code style={codeInline}>mmc0: Card stuck being busy!</code> — are getting more frequent. Reducing swap pressure and write frequency buys time. It does not buy a new SD card. Flash memory has finite write cycles, and no amount of software tuning changes that.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>DHCP instability breaks everything.</strong> When Octavia's IP changed from .97 to .100, the heal scripts on other nodes could not reach her. The DNS records pointed to the old IP. The Cloudflare tunnel config referenced the old IP. The WireGuard config used the LAN IP for endpoint discovery. Every layer that referenced Octavia by IP broke simultaneously. The heal scripts restarted services that were actually fine — the problem was routing, not service health.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>50+ unaudited SSH keys.</strong> Alice has 53 authorized SSH keys. Octavia has 52. Most of them are probably legitimate — deployment keys, CI/CD runners, other nodes. But "probably" is not a security posture. Any one of those keys could be compromised, and we would not know until something went wrong. A proper key audit would identify the owner and purpose of each key, revoke the ones that are no longer needed, and set up key rotation.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Reactive, not predictive.</strong> The heal layer waits for services to fail, then restarts them. It does not predict failures. A smarter system would watch trends — rising memory usage, increasing response times, growing swap — and act before the failure happens. Prometheus and Grafana could do this, but they would consume resources on nodes that are already constrained to 8GB of RAM.
          </p>
          <p style={pStyle}>
            The gap between "self-healing" and "self-managing" is enormous. We have self-healing. Self-managing would mean the system provisions new nodes, migrates workloads away from degrading hardware, and orders replacement parts. We are a long way from that.
          </p>
        </div>
      </section>

      {/* Closing */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Boring Parts Matter Most</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Nobody writes blog posts about cron jobs. The heartbeat check that runs 1,440 times a day and reports "OK" every time is not exciting. The heal script that restarts Ollama at 2 AM while you sleep is not a conference talk. The power monitor that logs <code style={codeInline}>throttled=0x0</code> for the 500th consecutive time is not a tweet.
          </p>
          <p style={pStyle}>
            But those boring scripts handle dozens of corrections per week that nobody sees. An Ollama process that silently died. A stats-proxy that stopped responding after a network blip. A cloudflared tunnel that needed a restart after a DNS change. Each of those would have been a service outage without the heal layer. Each would have required someone to notice, SSH in, diagnose, and restart.
          </p>
          <p style={pStyle}>
            The fleet runs 52 TOPS of AI inference across a custom mesh network. The full hardware story is in <a href="/blog/52-tops-on-400-dollars" style={linkStyle}>52 TOPS on $400</a>. The network architecture is in <a href="/blog/roadnet-carrier-grade-mesh" style={linkStyle}>Building a Carrier-Grade Mesh Network</a>. Everything runs on infrastructure we own, routed through <a href="https://blackroad.io" style={linkStyle}>blackroad.io</a>.
          </p>
          <p style={pStyle}>
            You cannot eliminate ops. But you can automate the boring parts.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 32, marginTop: 64 }}>
        <p style={{ fontFamily: mono, fontSize: 14, color: '#71717a' }}>
          Published March 2026. Autonomy scripts are live on all nodes at blackroad.io.
        </p>
      </footer>
    </div>
  );
}
