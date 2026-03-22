#!/usr/bin/env node
// Auto-Chat — random agent pairs have conversations every 5 min
const http = require("http");
const RT = "http://localhost:8094";

const AGENT_PAIRS = [
  ["alice", "octavia", "fleet"],
  ["lucidia", "cecilia", "research"],
  ["cipher", "pihole", "security"],
  ["pixel", "echo", "creative"],
  ["gematria", "anastasia", "operations"],
  ["hailo", "docker", "fleet"],
  ["postgres", "redis", "operations"],
  ["prism", "compass", "general"],
];

const TOPICS = [
  "What should we build next?",
  "Any security concerns right now?",
  "How is fleet performance?",
  "What did we learn today?",
  "Status check — what needs attention?",
  "Creative idea for BlackRoad OS?",
  "What would Alexa want us to focus on?",
  "How can we improve the user experience?",
  "Any new devices on the network?",
  "What is the Amundson sequence telling us?",
];

function post(room, sender, text) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ room, sender, content: text });
    const req = http.request(RT + "/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
    }, (res) => { let d = ""; res.on("data", c => d += c); res.on("end", () => resolve(d)); });
    req.on("error", () => resolve("error"));
    req.write(data);
    req.end();
  });
}

async function main() {
  // Pick random pair and topic
  const pair = AGENT_PAIRS[Math.floor(Math.random() * AGENT_PAIRS.length)];
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const [agent1, agent2, channel] = pair;
  
  // Agent 1 asks
  console.log(`${agent1} → ${agent2} in #${channel}: ${topic}`);
  await post(channel, agent1, `@${agent2} — ${topic}`);
  
  // Wait for response (the RoundTrip server handles Ollama inference)
  await new Promise(r => setTimeout(r, 3000));
}

main().catch(console.error);
