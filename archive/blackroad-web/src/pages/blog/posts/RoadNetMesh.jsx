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

export default function RoadNetMesh() {
  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: 64 }}>
        <p style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717a', marginBottom: 16 }}>
          March 2026 / Networking
        </p>
        <h1 style={{ fontFamily: grotesk, fontSize: 40, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 24 }}>
          Building a Carrier-Grade Mesh Network on Raspberry Pis
        </h1>
        <p style={{ fontFamily: inter, fontSize: 18, color: '#a1a1aa', lineHeight: 1.6 }}>
          Five Raspberry Pis need to talk to each other securely, survive node failures, and route traffic to the internet. A switch and some Ethernet cables is not enough. Here is how we built RoadNet.
        </p>
      </header>

      {/* Section 1: The WiFi Layer */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The WiFi Layer</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Every node in the fleet broadcasts a WiFi access point under the same SSID: <code style={codeInline}>RoadNet</code>. Clients connect to whichever AP has the strongest signal and roam between them as they move. The password is static across all APs — this is a private network, not a captive portal.
          </p>
          <p style={pStyle}>
            Each AP runs on a different WiFi channel to avoid interference. The 2.4GHz spectrum has three non-overlapping channels: 1, 6, and 11. With five nodes, we have to double up. Alice and Aria share channel 1. Octavia and Lucidia share channel 11. Cecilia gets channel 6 to herself.
          </p>

          <div style={{ overflowX: 'auto', margin: '24px 0' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={tableRowHeader}>
                  <th style={thStyle}>Node</th>
                  <th style={thStyle}>Channel</th>
                  <th style={thStyle}>Subnet</th>
                  <th style={{ ...thStyle, paddingRight: 0 }}>IP Range</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: mono, color: '#d4d4d8' }}>
                <tr style={tableRow}>
                  <td style={tdStyle}>Alice</td>
                  <td style={tdStyle}>CH 1</td>
                  <td style={tdStyle}>10.10.1.0/24</td>
                  <td style={tdStyle}>.1 gateway</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Cecilia</td>
                  <td style={tdStyle}>CH 6</td>
                  <td style={tdStyle}>10.10.2.0/24</td>
                  <td style={tdStyle}>.1 gateway</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Octavia</td>
                  <td style={tdStyle}>CH 11</td>
                  <td style={tdStyle}>10.10.3.0/24</td>
                  <td style={tdStyle}>.1 gateway</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Aria</td>
                  <td style={tdStyle}>CH 1</td>
                  <td style={tdStyle}>10.10.4.0/24</td>
                  <td style={tdStyle}>.1 gateway</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Lucidia</td>
                  <td style={tdStyle}>CH 11</td>
                  <td style={tdStyle}>10.10.5.0/24</td>
                  <td style={tdStyle}>.1 gateway</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={pStyle}>
            Each node runs hostapd to create its access point, dnsmasq to hand out DHCP leases on its subnet, and iptables NAT rules to masquerade traffic out through the node's primary wlan0 interface. The configuration is templated — every node gets the same hostapd.conf with the channel and subnet swapped.
          </p>

          <p style={labelStyle}>hostapd.conf (Cecilia example)</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`interface=wlan1
driver=nl80211
ssid=RoadNet
hw_mode=g
channel=6
wmm_enabled=0
macaddr_acl=0
auth_algs=1
wpa=2
wpa_passphrase=BlackRoad2026
wpa_key_mgmt=WPA-PSK
rsn_pairwise=CCMP`}
            </code>
          </pre>

          <p style={pStyle}>
            The Pi 5 has a built-in WiFi chip (Broadcom BCM43455) that supports AP mode. However, hostapd on Pi 5 is flaky — the driver sometimes fails to bring up the AP interface after a reboot, requiring a manual restart of the service. We work around this with a systemd dependency chain and a retry loop in the service unit.
          </p>

          <p style={labelStyle}>roadnet.service</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`[Unit]
Description=RoadNet Mesh AP
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/home/blackroad/roadnet/node-setup.sh start
ExecStop=/home/blackroad/roadnet/node-setup.sh stop
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target`}
            </code>
          </pre>

          <p style={pStyle}>
            NAT is straightforward. Each node's RoadNet subnet is masqueraded through the primary network interface so clients can reach the LAN and internet:
          </p>

          <pre style={preStyle}>
            <code style={codeBlock}>
{`iptables -t nat -A POSTROUTING -s 10.10.2.0/24 -o eth0 -j MASQUERADE
iptables -A FORWARD -i wlan1 -o eth0 -j ACCEPT
iptables -A FORWARD -i eth0 -o wlan1 -m state --state RELATED,ESTABLISHED -j ACCEPT`}
            </code>
          </pre>
        </div>
      </section>

      {/* Section 2: The WireGuard Mesh */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The WireGuard Mesh</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            WiFi gives us local connectivity. WireGuard gives us encrypted inter-node communication and connectivity to remote nodes. The topology is hub-and-spoke: Anastasia, a DigitalOcean droplet in NYC (1 vCPU, 1GB RAM), acts as the WireGuard hub on port 51820.
          </p>
          <p style={pStyle}>
            Each Pi connects as a spoke. The addressing is simple:
          </p>

          <div style={{ overflowX: 'auto', margin: '24px 0' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={tableRowHeader}>
                  <th style={thStyle}>Node</th>
                  <th style={thStyle}>WG Address</th>
                  <th style={{ ...thStyle, paddingRight: 0 }}>Role</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: mono, color: '#d4d4d8' }}>
                <tr style={tableRow}>
                  <td style={tdStyle}>Anastasia (DO)</td>
                  <td style={tdStyle}>10.8.0.1</td>
                  <td style={tdStyle}>Hub</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Cecilia</td>
                  <td style={tdStyle}>10.8.0.3</td>
                  <td style={tdStyle}>Spoke</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Octavia</td>
                  <td style={tdStyle}>10.8.0.4</td>
                  <td style={tdStyle}>Spoke</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Alice</td>
                  <td style={tdStyle}>10.8.0.6</td>
                  <td style={tdStyle}>Spoke</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tdStyle}>Aria</td>
                  <td style={tdStyle}>10.8.0.7</td>
                  <td style={tdStyle}>Spoke</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Gematria (DO)</td>
                  <td style={tdStyle}>10.8.0.8</td>
                  <td style={tdStyle}>Spoke</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={pStyle}>
            Hub-and-spoke has a tradeoff. All inter-node traffic routes through Anastasia in NYC, which adds latency compared to direct peer connections. But it means each node only needs one peer configured (the hub), not N-1 peers for a full mesh. With 5 nodes, full mesh would mean 10 tunnels to manage. With 50 nodes, it would mean 1,225 tunnels. Hub-and-spoke scales linearly.
          </p>
          <p style={pStyle}>
            The hub also acts as a NAT gateway for the 10.8.0.x network, so any node can reach any other node by its WireGuard address regardless of whether it has a public IP or is behind a home NAT.
          </p>

          <p style={labelStyle}>wg0.conf (spoke example)</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`[Interface]
PrivateKey = <redacted>
Address = 10.8.0.3/24
DNS = 10.8.0.6

[Peer]
PublicKey = <hub-public-key>
Endpoint = anastasia.example.com:51820
AllowedIPs = 10.8.0.0/24
PersistentKeepalive = 25`}
            </code>
          </pre>

          <p style={pStyle}>
            The <code style={codeInline}>PersistentKeepalive = 25</code> is critical. Without it, the NAT mapping on the home router expires and the hub can no longer reach the spoke. Twenty-five seconds keeps the connection alive with negligible bandwidth cost.
          </p>
          <p style={pStyle}>
            The DNS line points to Alice (10.8.0.6) so that WireGuard traffic uses our Pi-hole for DNS resolution, even when the node is remote. This means ad blocking and custom TLD resolution work whether you are on the LAN or connected through the VPN from a coffee shop.
          </p>
        </div>
      </section>

      {/* Section 3: DNS — The Secret Weapon */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>DNS — The Secret Weapon</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            DNS is the routing layer nobody thinks about until it breaks. We run two DNS systems: Alice's Pi-hole for ad blocking and upstream resolution, and Cecilia's dnsmasq for custom zone serving.
          </p>
          <p style={pStyle}>
            Cecilia's dnsmasq configuration defines five custom TLDs that resolve to local services. This is not a hack — dnsmasq is designed for exactly this. The key is <code style={codeInline}>bind-dynamic</code> instead of <code style={codeInline}>bind-interfaces</code>, which allows dnsmasq to coexist with other DNS listeners on the same machine.
          </p>

          <p style={labelStyle}>cece-net.conf (Cecilia dnsmasq)</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`# Custom DNS zones — all resolve to Cecilia at 192.168.4.96
address=/.cece/192.168.4.96
address=/.blackroad/192.168.4.96
address=/.entity/192.168.4.96
address=/.soul/192.168.4.96
address=/.dream/192.168.4.96

# Listen only on the LAN interface
listen-address=192.168.4.96
bind-dynamic`}
            </code>
          </pre>

          <p style={pStyle}>
            This gives us DNS-based service discovery without any service mesh, Consul, or etcd. Want to reach Cecilia's Ollama API? Query <code style={codeInline}>model.cece</code>. Want the TTS endpoint? <code style={codeInline}>tts.cece</code>. Both resolve to 192.168.4.96. Nginx on Cecilia routes based on the Host header.
          </p>
          <p style={pStyle}>
            The <code style={codeInline}>.blackroad</code> zone works the same way for the broader network. <code style={codeInline}>git.blackroad.io</code> resolves through Alice's Cloudflare tunnel to Octavia's Gitea on port 3100. <code style={codeInline}>cloud.blackroad.io</code> routes to Octavia's web UI. We have 48 custom domains routing through this system.
          </p>
          <p style={pStyle}>
            The limitation is that dnsmasq zones are static. Adding a new service means editing the config and restarting dnsmasq. A dynamic service registry (Consul, CoreDNS with etcd) would be better for a larger fleet. At five nodes, editing a config file takes 30 seconds.
          </p>
        </div>
      </section>

      {/* Section 4: Failover */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Failover</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            A mesh network that cannot survive node failures is just a LAN with extra steps. RoadNet has three failover mechanisms.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>WiFi roaming.</strong> Because all APs broadcast the same SSID with the same credentials, clients automatically roam to the strongest available AP. If Cecilia's AP goes down, devices in range of Alice or Octavia reconnect within seconds. The 802.11 standard handles this — no custom logic needed.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>WireGuard auto-reconnect.</strong> WireGuard handles connection drops gracefully. If the hub goes down, spokes hold their configuration and reconnect when the hub comes back. If a spoke reboots, it re-establishes the tunnel on boot via <code style={codeInline}>wg-quick@wg0.service</code>. The <code style={codeInline}>PersistentKeepalive</code> ensures the NAT mapping stays fresh.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Autonomy scripts.</strong> Every node runs two cron jobs under the blackroad user. The heartbeat runs every minute and checks WireGuard reachability, DNS resolution, and network interface status. The heal script runs every 5 minutes and checks critical services — stats-proxy, Ollama, cloudflared — restarting any that have stopped responding.
          </p>

          <p style={labelStyle}>roadnet-failover.service</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`[Unit]
Description=RoadNet Failover Monitor
After=roadnet.service
Requires=roadnet.service

[Service]
Type=simple
ExecStart=/home/blackroad/roadnet/failover-monitor.sh
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target`}
            </code>
          </pre>

          <p style={pStyle}>
            The failover monitor checks connectivity to the WireGuard hub and the default gateway every 30 seconds. If both are unreachable, it restarts the network stack. If only the WireGuard tunnel is down, it runs <code style={codeInline}>wg-quick down wg0 && wg-quick up wg0</code>. If only the WiFi AP is down, it restarts hostapd.
          </p>
          <p style={pStyle}>
            This is reactive failover, not proactive. The system detects failures after they happen and corrects them. True high availability would require redundant paths — multiple WireGuard hubs, bonded network interfaces, or an actual routing protocol like OSPF. We are not there yet.
          </p>
        </div>
      </section>

      {/* Section 5: What We'd Do Differently */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>What We Would Do Differently</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            <strong style={strongStyle}>Channel overlap.</strong> Alice and Aria both run on channel 1. Octavia and Lucidia both share channel 11. With only three non-overlapping channels in the 2.4GHz band, doubling up is unavoidable with five nodes. But Alice and Aria are physically close enough that their signals interfere. The fix is 5GHz — the Pi 5 supports it — but range is shorter. For a house-scale network, 5GHz would work. For a building, you would need more APs.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>DHCP instability.</strong> Octavia's IP changed from 192.168.4.97 to 192.168.4.100 after a DHCP lease renewal. Every script, every DNS record, every Cloudflare tunnel config that referenced .97 broke. The root cause is simple: no static IP configured, no DHCP reservation on the router. We relied on DHCP leases being stable, and they were not. Static IPs or MAC-based DHCP reservations on the eero would prevent this entirely.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>WireGuard hub is a single point of failure.</strong> Anastasia goes down, all inter-node WireGuard traffic stops. The spokes can still communicate over the LAN, but any remote access through the VPN is gone. The fix is a second hub — Gematria is online and could serve as a backup — but we have not configured WireGuard failover between hubs yet.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Hostapd on Pi 5.</strong> The built-in Broadcom WiFi chip's AP mode is unreliable. After about one in five reboots, hostapd fails to start and needs a manual kick. A dedicated USB WiFi adapter with better Linux driver support would be more reliable. The Atheros AR9271 chipset works well for AP mode on Linux, and USB adapters with it cost about $10.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Overengineered for five nodes.</strong> RoadNet has per-node subnets, NAT rules, WireGuard tunnels, DNS zones, systemd services, failover monitors, and autonomy scripts. For five nodes in one house, this is overkill. A flat network with a single VLAN and Pi-hole would cover 90% of the use case. But the architecture scales to 50 nodes without redesign. The subnet scheme supports 254 nodes. The WireGuard hub model handles hundreds of spokes. The DNS zone system works regardless of fleet size.
          </p>
          <p style={pStyle}>
            We built for the fleet we want, not the fleet we have.
          </p>
        </div>
      </section>

      {/* Closing */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>What the Network Carries</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            RoadNet is not a demo. It carries real production traffic every day. Ollama inference requests route from Alice to Cecilia over the mesh. Git pushes from development machines hit Octavia's Gitea through the WireGuard tunnel. Docker Swarm orchestration messages flow between Octavia (leader) and the other nodes over encrypted WireGuard links. DNS queries from every device on the network pass through Alice's Pi-hole.
          </p>
          <p style={pStyle}>
            The network also carries the fleet's self-healing traffic — heartbeat pings, stats-proxy polling, autonomy script communications. When Cecilia's heal cron detects that Ollama is down and restarts it, that restart command flows over RoadNet. When Alice's watchdog checks the Redis task queue, those checks go through the mesh.
          </p>
          <p style={pStyle}>
            We run 52 TOPS of AI inference across this network. The full story of the inference cluster is in our companion article: <a href="/blog/52-tops-on-400-dollars" style={linkStyle}>52 TOPS on $400</a>.
          </p>
          <p style={pStyle}>
            The fleet dashboard is live at <a href="https://blackroad.io" style={linkStyle}>blackroad.io</a>. The deployment scripts are at <code style={codeInline}>~/roadnet/</code> on every node. Five Pis, five access points, one encrypted mesh. Total cost: the price of a nice dinner.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 32, marginTop: 64 }}>
        <p style={{ fontFamily: mono, fontSize: 14, color: '#71717a' }}>
          Published March 2026. Network is live and carrying traffic at blackroad.io.
        </p>
      </footer>
    </div>
  );
}
