#!/usr/bin/env node
// Lucidia Daemon
// Background service that keeps models warm and handles requests

const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const Config = require('./config');
const Orchestrator = require('./orchestrator');

const LUCIDIA_DIR = path.join(os.homedir(), '.lucidia');
const PID_FILE = path.join(LUCIDIA_DIR, 'daemon.pid');
const LOG_FILE = path.join(LUCIDIA_DIR, 'daemon.log');

class Daemon {
  constructor() {
    this.config = new Config();
    this.orchestrator = new Orchestrator(this.config);
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS for web UI
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });

    // Logging
    this.app.use((req, res, next) => {
      this.log(`${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        version: this.config.get('version'),
        uptime: process.uptime()
      });
    });

    // Execute task (single model)
    this.app.post('/api/task', async (req, res) => {
      try {
        const { prompt, model } = req.body;
        const result = await this.orchestrator.executeTask(prompt, model);
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Execute task (multi-model)
    this.app.post('/api/collab', async (req, res) => {
      try {
        const { prompt, models } = req.body;
        const results = await this.orchestrator.collaborate(prompt, models);
        res.json(results);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Get config
    this.app.get('/api/config', (req, res) => {
      res.json(this.config.config);
    });

    // Update config
    this.app.post('/api/config', (req, res) => {
      try {
        const { key, value } = req.body;
        this.config.set(key, value);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // List models
    this.app.get('/api/models', (req, res) => {
      res.json(this.config.config.models);
    });
  }

  // Logging
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    // Console
    console.log(logMessage.trim());
    
    // File
    try {
      fs.appendFileSync(LOG_FILE, logMessage);
    } catch (err) {
      // Ignore write errors
    }
  }

  // Start daemon
  async start() {
    const port = this.config.get('daemon.port', 11435);
    const host = this.config.get('daemon.host', 'localhost');

    // Check if already running
    if (this.isRunning()) {
      console.log('Daemon already running');
      return;
    }

    // Write PID file
    fs.writeFileSync(PID_FILE, process.pid.toString());

    // Start server
    this.server = this.app.listen(port, host, () => {
      this.log(`Lucidia daemon started on ${host}:${port}`);
      console.log(`✅ Daemon running at http://${host}:${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.stop());
    process.on('SIGINT', () => this.stop());
  }

  // Stop daemon
  stop() {
    this.log('Stopping daemon...');
    
    // Close server
    if (this.server) {
      this.server.close();
    }

    // Remove PID file
    if (fs.existsSync(PID_FILE)) {
      fs.unlinkSync(PID_FILE);
    }

    this.log('Daemon stopped');
    process.exit(0);
  }

  // Check if daemon is running
  isRunning() {
    if (!fs.existsSync(PID_FILE)) {
      return false;
    }

    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
    
    try {
      // Check if process exists
      process.kill(pid, 0);
      return true;
    } catch (err) {
      // Process doesn't exist, clean up stale PID
      fs.unlinkSync(PID_FILE);
      return false;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const daemon = new Daemon();
  daemon.start();
}

module.exports = Daemon;
