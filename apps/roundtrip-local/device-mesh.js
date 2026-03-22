#!/usr/bin/env node
// Device Mesh Scanner — runs every 5 min, posts to RoundTrip
const http = require("http");
const { execSync } = require("child_process");

const RT = "http://localhost:8094";

function post(room, sender, text) {
  const data = JSON.stringify({ room, sender, content: text });
  const req = http.request(RT + "/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": data.length },
  });
  req.write(data);
  req.end();
}

// Scan network
function scanDevices() {
  try {
    const arp = execSync("arp -a 2>/dev/null || ip neigh 2>/dev/null", { timeout: 10000 }).toString();
    const lines = arp.split("\n").filter(l => l.includes("192.168.4."));
    const devices = lines.map(l => {
      const ip = l.match(/192\.168\.4\.\d+/)?.[0] || "?";
      const mac = l.match(/([0-9a-f]{2}[:-]){5}[0-9a-f]{2}/i)?.[0] || "?";
      return { ip, mac };
    }).filter(d => d.ip !== "?");
    return devices;
  } catch { return []; }
}

// Check Pi fleet
function checkFleet() {
  const nodes = [
    { name: "alice", ip: "192.168.4.49" },
    { name: "cecilia", ip: "192.168.4.96" },
    { name: "octavia", ip: "192.168.4.101" },
    { name: "aria", ip: "192.168.4.98" },
    { name: "lucidia", ip: "192.168.4.38" },
  ];
  const results = [];
  for (const node of nodes) {
    try {
      execSync(`ping -c1 -W2 ${node.ip}`, { timeout: 5000, stdio: "pipe" });
      results.push(`${node.name}: ONLINE`);
    } catch {
      results.push(`${node.name}: DOWN`);
    }
  }
  return results;
}

// Check services
function checkServices() {
  try {
    const svcs = execSync("systemctl list-units --type=service --state=running 2>/dev/null | grep -c running", { timeout: 5000 }).toString().trim();
    const ports = execSync("ss -tlnp 2>/dev/null | grep -c LISTEN", { timeout: 5000 }).toString().trim();
    const docker = execSync("docker ps --format {{.Names}} 2>/dev/null | wc -l", { timeout: 5000 }).toString().trim();
    return { services: svcs, ports, docker };
  } catch { return { services: "?", ports: "?", docker: "?" }; }
}

// Main scan
const devices = scanDevices();
const fleet = checkFleet();
const svcs = checkServices();
const uptime = execSync("uptime -p 2>/dev/null || uptime", { timeout: 5000 }).toString().trim();

// Post to fleet channel
post("fleet", "mesh-scanner", 
  `HEARTBEAT ${new Date().toISOString().slice(0,16)}\n` +
  `Fleet: ${fleet.join(" | ")}\n` +
  `Octavia: ${svcs.services} services, ${svcs.ports} ports, ${svcs.docker} containers\n` +
  `Network: ${devices.length} devices on 192.168.4.x\n` +
  `Uptime: ${uptime}`
);

// Post to IoT channel if new devices found
if (devices.length > 0) {
  post("iot", "mesh-scanner",
    `Network scan: ${devices.length} devices\n` +
    devices.map(d => `  ${d.ip} (${d.mac})`).join("\n")
  );
}

console.log(`Scan complete: ${devices.length} devices, fleet: ${fleet.join(", ")}`);
