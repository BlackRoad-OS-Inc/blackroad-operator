/**
 * Heatmap Scanner
 * Scans JSONL transcripts under ~/.claude/projects/ to aggregate
 * daily activity statistics (sessions, messages, tool usage, tokens, cost).
 * Provides data for GitHub contribution graph-style heatmap.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { roundCost, calculateTokenCost } = require('./pricing');

/** Retention period (days) */
const MAX_AGE_DAYS = 400;

class HeatmapScanner {
  /**
   * @param {(msg: string) => void} [debugLog]
   */
  constructor(debugLog = () => {}) {
    this.debugLog = debugLog;
    this.scanInterval = null;

    /** Persistence path (uses homedir at instance creation time) */
    this.persistDir = path.join(os.homedir(), '.pixel-agent-desk');
    this.persistFile = path.join(this.persistDir, 'heatmap.json');

    /** @type {Record<string, DayStats>} "YYYY-MM-DD" → statistics */
    this.days = {};
    /** Last scan timestamp */
    this.lastScan = 0;
    /** Per-file incremental offsets @type {Record<string, FileOffset>} */
    this.fileOffsets = {};

    // Restore persisted data
    this._loadPersisted();
  }

  /**
   * Start periodic scanning
   * @param {number} intervalMs (default 5 minutes)
   */
  start(intervalMs = 300_000) {
    this.debugLog('[HeatmapScanner] Started');
    this.scanAll();
    this.scanInterval = setInterval(() => this.scanAll(), intervalMs);
  }

  stop() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    this._savePersisted();
    this.debugLog('[HeatmapScanner] Stopped');
  }

  /**
   * Full scan — search all JSONL files under ~/.claude/projects/
   */
  async scanAll() {
    const claudeDir = path.join(os.homedir(), '.claude', 'projects');
    if (!fs.existsSync(claudeDir)) {
      this.debugLog('[HeatmapScanner] No ~/.claude/projects/ directory');
      return;
    }

    const jsonlFiles = this._findJsonlFiles(claudeDir);
    let newEntries = 0;

    for (const filePath of jsonlFiles) {
      try {
        newEntries += this._scanFile(filePath);
      } catch (e) {
        this.debugLog(`[HeatmapScanner] Error scanning ${filePath}: ${e.message}`);
      }
    }

    this.lastScan = Date.now();
    this._pruneOldDays();

    if (newEntries > 0) {
      this.debugLog(`[HeatmapScanner] Scanned ${jsonlFiles.length} files, ${newEntries} new entries`);
      this._savePersisted();
    }
  }

  /**
   * Return daily statistics
   * @returns {{ days: Record<string, DayStats>, lastScan: number }}
   */
  getDailyStats() {
    return { days: this.days, lastScan: this.lastScan };
  }

  /**
   * Range query
   * @param {string} startDate "YYYY-MM-DD"
   * @param {string} endDate "YYYY-MM-DD"
   * @returns {Record<string, DayStats>}
   */
  getRange(startDate, endDate) {
    const result = {};
    for (const [date, stats] of Object.entries(this.days)) {
      if (date >= startDate && date <= endDate) {
        result[date] = stats;
      }
    }
    return result;
  }

  // ─── Internal implementation ───

  /**
   * Recursively traverse directory and return list of .jsonl files
   * @param {string} dir
   * @returns {string[]}
   */
  _findJsonlFiles(dir) {
    const results = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...this._findJsonlFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
          results.push(fullPath);
        }
      }
    } catch {
      // Ignore permission issues, etc.
    }
    return results;
  }

  /**
   * Incremental scan of a single file
   * @param {string} filePath
   * @returns {number} Number of newly processed entries
   */
  _scanFile(filePath) {
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch {
      return 0;
    }

    const offset = this.fileOffsets[filePath];

    // Skip if no changes
    if (offset && offset.size === stat.size && offset.mtimeMs === stat.mtimeMs) {
      return 0;
    }

    const startByte = offset ? offset.bytesRead : 0;
    if (startByte >= stat.size) {
      // File shrank (truncated/rotated) → re-read from the beginning
      if (startByte > stat.size) {
        this.fileOffsets[filePath] = { bytesRead: 0, size: 0, mtimeMs: 0 };
        return this._scanFile(filePath);
      }
      return 0;
    }

    // Extract project name — ~/.claude/projects/{project-hash}/ structure
    const projectName = this._extractProjectName(filePath);

    // Incremental read
    const fd = fs.openSync(filePath, 'r');
    let buf;
    try {
      buf = Buffer.alloc(stat.size - startByte);
      fs.readSync(fd, buf, 0, buf.length, startByte);
    } finally {
      fs.closeSync(fd);
    }

    const chunk = buf.toString('utf-8');
    const lines = chunk.split('\n').filter(Boolean);
    let count = 0;

    for (const line of lines) {
      let entry;
      try { entry = JSON.parse(line); } catch { continue; }
      if (!entry.timestamp) continue;
      // Ignore sidechain (internal to compact)
      if (entry.isSidechain) continue;

      const dateKey = entry.timestamp.slice(0, 10); // "YYYY-MM-DD"
      if (!dateKey || dateKey.length !== 10) continue;

      this._ensureDay(dateKey);
      const day = this.days[dateKey];

      // Session count (unique by sessionId)
      const sessionId = entry.sessionId || null;

      if (entry.type === 'user') {
        day.userMessages++;
        if (sessionId && !day._sessions.has(sessionId)) {
          day._sessions.add(sessionId);
          day.sessions++;
        }
      }

      if (entry.type === 'assistant' && entry.message) {
        day.assistantMessages++;

        // Token aggregation
        const usage = entry.message.usage;
        if (usage) {
          const input = usage.input_tokens || 0;
          const cacheRead = usage.cache_read_input_tokens || 0;
          const cacheCreate = usage.cache_creation_input_tokens || 0;
          const output = usage.output_tokens || 0;

          day.inputTokens += input + cacheRead + cacheCreate;
          day.outputTokens += output;

          const model = entry.message.model || null;
          const entryCost = roundCost(calculateTokenCost(
            { input, cacheRead, cacheCreate, output }, model
          ));
          day.estimatedCost += entryCost;

          // Per-model aggregation
          if (model) {
            if (!day.byModel[model]) {
              day.byModel[model] = { inputTokens: 0, outputTokens: 0, estimatedCost: 0 };
            }
            day.byModel[model].inputTokens += input + cacheRead + cacheCreate;
            day.byModel[model].outputTokens += output;
            day.byModel[model].estimatedCost += entryCost;
          }
        }

        // tool_use block count
        if (Array.isArray(entry.message.content)) {
          for (const block of entry.message.content) {
            if (block.type === 'tool_use') day.toolUses++;
          }
        }
      }

      // Add project
      if (projectName && !day._projects.has(projectName)) {
        day._projects.add(projectName);
        day.projects.push(projectName);
      }

      count++;
    }

    // Update offset
    this.fileOffsets[filePath] = {
      bytesRead: stat.size,
      size: stat.size,
      mtimeMs: stat.mtimeMs,
    };

    return count;
  }

  /**
   * Initialize daily statistics for a date key
   * @param {string} dateKey "YYYY-MM-DD"
   */
  _ensureDay(dateKey) {
    if (!this.days[dateKey]) {
      this.days[dateKey] = {
        sessions: 0,
        userMessages: 0,
        assistantMessages: 0,
        toolUses: 0,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
        byModel: {},
        projects: [],
        // Internal tracking (excluded during serialization)
        _sessions: new Set(),
        _projects: new Set(),
      };
    }
  }

  /**
   * Extract project name from file path
   * ~/.claude/projects/{encoded-project-path}/... → attempt to decode
   * @param {string} filePath
   * @returns {string|null}
   */
  _extractProjectName(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const match = normalizedPath.match(/\.claude\/projects\/([^/]+)/);
    if (!match) return null;

    const encoded = match[1];
    // Claude CLI encodes the project path as a directory name
    // The last segment is the meaningful project name
    const parts = encoded.split('-');
    // Return as-is if too short
    if (parts.length <= 1) return encoded;
    return parts[parts.length - 1] || encoded;
  }

  /**
   * Clean up data older than MAX_AGE_DAYS
   */
  _pruneOldDays() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - MAX_AGE_DAYS);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    for (const dateKey of Object.keys(this.days)) {
      if (dateKey < cutoffStr) {
        delete this.days[dateKey];
      }
    }
  }

  /**
   * Save persisted data
   */
  _savePersisted() {
    try {
      if (!fs.existsSync(this.persistDir)) {
        fs.mkdirSync(this.persistDir, { recursive: true });
      }

      // Exclude _sessions and _projects Sets from serialization
      const serialDays = {};
      for (const [date, stats] of Object.entries(this.days)) {
        const { _sessions, _projects, ...rest } = stats;
        rest.estimatedCost = roundCost(rest.estimatedCost);
        // Round per-model costs
        if (rest.byModel) {
          for (const m of Object.keys(rest.byModel)) {
            rest.byModel[m].estimatedCost = roundCost(rest.byModel[m].estimatedCost);
          }
        }
        serialDays[date] = rest;
      }

      const data = {
        days: serialDays,
        lastScan: this.lastScan,
        fileOffsets: this.fileOffsets,
      };

      fs.writeFileSync(this.persistFile, JSON.stringify(data), 'utf-8');
    } catch (e) {
      this.debugLog(`[HeatmapScanner] Failed to save: ${e.message}`);
    }
  }

  /**
   * Load persisted data
   */
  _loadPersisted() {
    try {
      if (!fs.existsSync(this.persistFile)) return;
      const raw = fs.readFileSync(this.persistFile, 'utf-8');
      const data = JSON.parse(raw);

      if (data.days) {
        for (const [date, stats] of Object.entries(data.days)) {
          this.days[date] = {
            ...stats,
            byModel: stats.byModel || {},
            _sessions: new Set(),
            _projects: new Set(stats.projects || []),
          };
        }
      }
      if (data.lastScan) this.lastScan = data.lastScan;
      if (data.fileOffsets) this.fileOffsets = data.fileOffsets;

      this.debugLog(`[HeatmapScanner] Loaded ${Object.keys(this.days).length} days from cache`);
    } catch (e) {
      this.debugLog(`[HeatmapScanner] Failed to load cache: ${e.message}`);
    }
  }
}

/**
 * @typedef {Object} DayStats
 * @property {number} sessions
 * @property {number} userMessages
 * @property {number} assistantMessages
 * @property {number} toolUses
 * @property {number} inputTokens
 * @property {number} outputTokens
 * @property {number} estimatedCost
 * @property {Record<string, {inputTokens: number, outputTokens: number, estimatedCost: number}>} byModel
 * @property {string[]} projects
 */

/**
 * @typedef {Object} FileOffset
 * @property {number} bytesRead
 * @property {number} size
 * @property {number} mtimeMs
 */

module.exports = HeatmapScanner;
