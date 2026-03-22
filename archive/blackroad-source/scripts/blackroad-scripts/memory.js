#!/usr/bin/env node
// Lucidia Memory System
// Manages sessions, patterns, and learned preferences

const fs = require('fs');
const path = require('path');
const os = require('os');

const MEMORY_DIR = path.join(os.homedir(), '.lucidia', 'memory');
const SESSIONS_DIR = path.join(MEMORY_DIR, 'sessions');
const PATTERNS_FILE = path.join(MEMORY_DIR, 'patterns.json');
const PREFS_FILE = path.join(MEMORY_DIR, 'preferences.json');

class Memory {
  constructor() {
    this.ensureDirectories();
  }

  // Ensure directories exist
  ensureDirectories() {
    [MEMORY_DIR, SESSIONS_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Save session
  async saveSession(session) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}.json`;
    const filepath = path.join(SESSIONS_DIR, filename);

    const sessionData = {
      id: timestamp,
      task: session.task,
      models: session.models,
      selected: session.selected,
      context: session.context || null,
      created: session.created || new Date().toISOString()
    };

    fs.writeFileSync(filepath, JSON.stringify(sessionData, null, 2));
    return sessionData;
  }

  // Load session
  async loadSession(id) {
    const files = fs.readdirSync(SESSIONS_DIR);
    const matching = files.find(f => f.startsWith(id));
    
    if (!matching) return null;

    const filepath = path.join(SESSIONS_DIR, matching);
    const content = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  }

  // List recent sessions
  async listSessions(limit = 10) {
    const files = fs.readdirSync(SESSIONS_DIR)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);

    return files.map(f => {
      const filepath = path.join(SESSIONS_DIR, f);
      const stat = fs.statSync(filepath);
      const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      
      return {
        id: f.replace('.json', ''),
        task: content.task,
        models_count: content.models.length,
        created: content.created,
        size: stat.size
      };
    });
  }

  // Learn pattern from interaction
  async learnPattern(interaction) {
    // Load existing patterns
    let patterns = [];
    if (fs.existsSync(PATTERNS_FILE)) {
      patterns = JSON.parse(fs.readFileSync(PATTERNS_FILE, 'utf8'));
    }

    // Extract pattern
    const pattern = {
      task_keywords: this.extractKeywords(interaction.task),
      model_used: interaction.selected_model,
      successful: interaction.successful !== false,
      timestamp: new Date().toISOString()
    };

    patterns.push(pattern);

    // Keep last 1000 patterns
    if (patterns.length > 1000) {
      patterns = patterns.slice(-1000);
    }

    fs.writeFileSync(PATTERNS_FILE, JSON.stringify(patterns, null, 2));
  }

  // Get preferences
  async getPreferences() {
    if (!fs.existsSync(PREFS_FILE)) {
      return {
        preferred_models: {},
        common_tasks: [],
        style: {
          concise: true,
          examples: true,
          explanations: true
        }
      };
    }

    return JSON.parse(fs.readFileSync(PREFS_FILE, 'utf8'));
  }

  // Update preferences
  async updatePreferences(prefs) {
    const current = await this.getPreferences();
    const updated = { ...current, ...prefs };
    fs.writeFileSync(PREFS_FILE, JSON.stringify(updated, null, 2));
    return updated;
  }

  // Extract keywords from task
  extractKeywords(task) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    return task.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !commonWords.includes(word))
      .slice(0, 5);
  }

  // Get statistics
  async getStats() {
    const sessions = await this.listSessions(1000);
    
    return {
      total_sessions: sessions.length,
      total_size: sessions.reduce((sum, s) => sum + s.size, 0),
      recent_sessions: sessions.slice(0, 5)
    };
  }

  // Clean old sessions (retention policy)
  async cleanup(retentionDays = 90) {
    const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    const files = fs.readdirSync(SESSIONS_DIR);
    
    let cleaned = 0;
    for (const file of files) {
      const filepath = path.join(SESSIONS_DIR, file);
      const stat = fs.statSync(filepath);
      
      if (stat.mtime.getTime() < cutoff) {
        fs.unlinkSync(filepath);
        cleaned++;
      }
    }
    
    return { cleaned, cutoff: new Date(cutoff).toISOString() };
  }
}

module.exports = Memory;
