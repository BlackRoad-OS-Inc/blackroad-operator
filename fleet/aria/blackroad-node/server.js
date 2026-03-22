const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");
const { exec } = require("child_process");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const hostname = os.hostname();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        agent: hostname,
        service: "blackroad-node",
        status: "online",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/status", (req, res) => {
    res.json({
        hostname,
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime(),
        memory: { total: os.totalmem(), free: os.freemem() },
        load: os.loadavg()
    });
});

app.post("/api/exec", (req, res) => {
    const { cmd } = req.body;
    if (\!cmd) return res.status(400).json({ error: "No command" });
    exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
        res.json({ success: \!error, stdout, stderr, error: error?.message });
    });
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.emit("welcome", { agent: hostname });
    socket.on("message", (data) => io.emit("message", { from: hostname, ...data }));
});

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => console.log(`BlackRoad Node on port ${PORT}`));
