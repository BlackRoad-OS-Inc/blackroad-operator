/**
 * Universal hook script for all Claude CLI events.
 * Receives JSON from stdin and forwards to the local HTTP hook server.
 * PID detection is performed via PowerShell in main.js (process.ppid is inaccurate as it returns the shell PID).
 */
const http = require('http');
const PORT = 47821;

const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
    try {
        const data = JSON.parse(Buffer.concat(chunks).toString());
        // process.ppid is not used because it returns the shell (cmd.exe) PID
        // Actual Claude PID is detected via PowerShell in main.js
        data._timestamp = Date.now();

        const body = Buffer.from(JSON.stringify(data), 'utf-8');

        // HTTP transmission
        const req = http.request({
            hostname: '127.0.0.1',
            port: PORT,
            path: '/hook',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': body.length }
        }, () => process.exit(0));

        req.on('error', () => process.exit(0));
        req.setTimeout(3000, () => { req.destroy(); process.exit(0); });
        req.write(body);
        req.end();
    } catch (e) {
        process.exit(0);
    }
});
