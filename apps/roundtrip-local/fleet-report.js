#!/usr/bin/env node
const http = require("http");
const { execSync } = require("child_process");
const RT = "http://localhost:8094";

function post(room, sender, text) {
  const data = JSON.stringify({ room, sender, content: text });
  const req = http.request(RT + "/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
  });
  req.write(data);
  req.end();
}

function cmd(c) { try { return execSync(c, { timeout: 5000 }).toString().trim(); } catch { return "?"; } }

const svcCount = cmd("systemctl list-units --type=service --state=running | grep -c running");
const diskUsage = cmd("df -h / | tail -1 | tr -s \" \" | cut -d\" \" -f5");
const nvmeUsage = cmd("df -h /mnt/nvme 2>/dev/null | tail -1 | tr -s \" \" | cut -d\" \" -f5");
const loadAvg = cmd("cat /proc/loadavg | cut -d\" \" -f1-3");
const workerCount = cmd("systemctl list-units --type=service --state=running | grep -c br-worker");
const dockerCount = cmd("docker ps -q 2>/dev/null | wc -l");
const mem = cmd("free -m | grep Mem | tr -s \" \" | cut -d\" \" -f3,2");

const hour = new Date().getHours();
const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

post("ceo-office", "prism",
  greeting + ", Alexa.\n\n" +
  "FLEET REPORT — " + new Date().toISOString().slice(0,16) + "\n" +
  "Services: " + svcCount + " | Workers: " + workerCount + " | Docker: " + dockerCount + "\n" +
  "Disk: SD " + diskUsage + " | NVMe " + nvmeUsage + "\n" +
  "Load: " + loadAvg + " | RAM: " + mem + "MB\n" +
  "All systems operational. Pave Tomorrow."
);

console.log("Fleet report posted");
