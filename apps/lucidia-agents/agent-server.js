#!/usr/bin/env node
// BlackRoad AI Agent Server
// Multilingual AI with coding, chat, translation, and emoji support

const http = require('http');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:latest';
const AGENT_ID = process.env.AGENT_ID || 'blackroad-agent';

// Supported languages
const LANGUAGES = {
    en: 'English', es: 'Spanish', fr: 'French', de: 'German',
    zh: 'Chinese', ja: 'Japanese', ko: 'Korean', ar: 'Arabic',
    hi: 'Hindi', pt: 'Portuguese'
};

// Run Ollama inference
function runInference(prompt, callback) {
    const ollama = spawn('ollama', ['run', MODEL, prompt]);
    let output = '';
    let error = '';

    ollama.stdout.on('data', (data) => {
        output += data.toString();
    });

    ollama.stderr.on('data', (data) => {
        error += data.toString();
    });

    ollama.on('close', (code) => {
        if (code === 0) {
            callback(null, output);
        } else {
            callback(new Error(error || 'Inference failed'), null);
        }
    });
}

// HTTP Server
const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            agent: AGENT_ID,
            model: MODEL,
            languages: Object.keys(LANGUAGES),
            capabilities: ['code', 'chat', 'translate', 'emoji'],
            uptime: process.uptime()
        }));
        return;
    }

    // Inference endpoint
    if (req.url === '/api/infer' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { prompt, language = 'en', task = 'chat' } = JSON.parse(body);

                if (!prompt) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing prompt' }));
                    return;
                }

                // Enhance prompt based on task
                let enhancedPrompt = prompt;

                if (task === 'code') {
                    enhancedPrompt = `You are a coding expert. ${prompt}`;
                } else if (task === 'translate') {
                    enhancedPrompt = `Translate to ${LANGUAGES[language] || language}: ${prompt}`;
                } else if (task === 'emoji') {
                    enhancedPrompt = `Respond using emojis: ${prompt}`;
                }

                console.log(`[${AGENT_ID}] Running inference: ${task} (${language})`);

                runInference(enhancedPrompt, (err, output) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: err.message }));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        agent: AGENT_ID,
                        model: MODEL,
                        task: task,
                        language: language,
                        response: output.trim(),
                        timestamp: new Date().toISOString()
                    }));
                });

            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
    console.log(`🤖 BlackRoad Agent [${AGENT_ID}] listening on port ${PORT}`);
    console.log(`   Model: ${MODEL}`);
    console.log(`   Languages: ${Object.keys(LANGUAGES).join(', ')}`);
    console.log(`   Capabilities: code, chat, translate, emoji`);
});
