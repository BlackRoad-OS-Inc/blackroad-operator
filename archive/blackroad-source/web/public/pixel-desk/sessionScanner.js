/**
 * Session Scanner
 * Node.js implementation of the claude-sessions.ts pattern from Mission Control.
 * Parses transcript_path (JSONL) files every 60 seconds to extract token/cost/session
 * statistics and supplements them into the agentManager.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { roundCost, calculateTokenCost } = require('./pricing');

class SessionScanner {
    /**
     * @param {import('./agentManager')} agentManager
     * @param {(msg: string) => void} [debugLog]
     */
    constructor(agentManager, debugLog = () => { }) {
        this.agentManager = agentManager;
        this.debugLog = debugLog;
        this.scanInterval = null;
        /** @type {Map<string, SessionStats>} agentId → last scan result */
        this.lastScanResults = new Map();
    }

    /**
     * Start periodic scanning
     * @param {number} intervalMs Scan interval (default 60 seconds)
     */
    start(intervalMs = 60_000) {
        this.debugLog('[SessionScanner] Started');
        this.scanAll(); // Run once immediately
        this.scanInterval = setInterval(() => this.scanAll(), intervalMs);
    }

    stop() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        this.debugLog('[SessionScanner] Stopped');
    }

    /** Scan all agents' JSONL files and update statistics */
    scanAll() {
        if (!this.agentManager) return;
        const agents = this.agentManager.getAllAgents();
        let updated = 0;

        for (const agent of agents) {
            if (!agent.jsonlPath) continue;

            try {
                const stats = this.parseSessionFile(agent.jsonlPath);
                if (!stats) continue;

                this.lastScanResults.set(agent.id, stats);

                // Supplement if JSONL parsed values exceed tokens collected from hooks
                const cur = agent.tokenUsage || { inputTokens: 0, outputTokens: 0, estimatedCost: 0 };
                if (stats.inputTokens > cur.inputTokens || stats.outputTokens > cur.outputTokens) {
                    this.agentManager.updateAgent({
                        ...agent,
                        tokenUsage: {
                            inputTokens: stats.inputTokens,
                            outputTokens: stats.outputTokens,
                            estimatedCost: stats.estimatedCost,
                        },
                        // Supplement model info from JSONL if missing
                        model: agent.model || stats.model || null,
                    }, 'scanner');
                    updated++;
                }
            } catch (e) {
                this.debugLog(`[SessionScanner] Error scanning ${agent.jsonlPath}: ${e.message}`);
            }
        }

        if (updated > 0) {
            this.debugLog(`[SessionScanner] Updated ${updated} agent(s) from JSONL scan`);
        }
    }

    /**
     * Parse a single JSONL file
     * @param {string} filePath transcript_path value (may include ~/... format)
     * @returns {SessionStats | null}
     */
    parseSessionFile(filePath) {
        // Windows: replace ~ → os.homedir()
        const resolvedPath = filePath.startsWith('~')
            ? path.join(os.homedir(), filePath.slice(1))
            : filePath;

        let content;
        try {
            content = fs.readFileSync(resolvedPath, 'utf-8');
        } catch {
            return null;
        }

        const lines = content.split('\n').filter(Boolean);
        if (lines.length === 0) return null;

        let model = null;
        let userMessages = 0;
        let assistantMessages = 0;
        let toolUses = 0;
        let inputTokens = 0;
        let outputTokens = 0;
        let cacheReadTokens = 0;
        let cacheCreationTokens = 0;
        let firstMessageAt = null;
        let lastMessageAt = null;
        let lastActivity = null;

        for (const line of lines) {
            let entry;
            try { entry = JSON.parse(line); } catch { continue; }

            // Track timestamp
            if (entry.timestamp) {
                if (!firstMessageAt) firstMessageAt = entry.timestamp;
                lastMessageAt = entry.timestamp;
            }

            // Ignore sidechain (internal to compact)
            if (entry.isSidechain) continue;

            // Last activity time
            if (entry.timestamp) lastActivity = entry.timestamp;

            if (entry.type === 'user') {
                userMessages++;
            }

            if (entry.type === 'assistant' && entry.message) {
                assistantMessages++;

                // Extract model
                if (entry.message.model) model = entry.message.model;

                // Extract token usage (including cache)
                const usage = entry.message.usage;
                if (usage) {
                    inputTokens += usage.input_tokens || 0;
                    cacheReadTokens += usage.cache_read_input_tokens || 0;
                    cacheCreationTokens += usage.cache_creation_input_tokens || 0;
                    outputTokens += usage.output_tokens || 0;
                }

                // Count tool_use blocks
                if (Array.isArray(entry.message.content)) {
                    for (const block of entry.message.content) {
                        if (block.type === 'tool_use') toolUses++;
                    }
                }
            }
        }

        const totalInputTokens = inputTokens + cacheReadTokens + cacheCreationTokens;
        const estimatedCost = calculateTokenCost({
            input: inputTokens, cacheRead: cacheReadTokens,
            cacheCreate: cacheCreationTokens, output: outputTokens
        }, model);

        return {
            model,
            userMessages,
            assistantMessages,
            toolUses,
            inputTokens: totalInputTokens,
            outputTokens,
            estimatedCost: roundCost(estimatedCost),
            firstMessageAt,
            lastMessageAt,
            lastActivity,
        };
    }

    /**
     * Return scan statistics for a specific agent
     * @param {string} agentId
     * @returns {SessionStats | null}
     */
    getSessionStats(agentId) {
        return this.lastScanResults.get(agentId) || null;
    }

    /**
     * Return all scan results (for dashboard API)
     * @returns {Record<string, SessionStats>}
     */
    getAllStats() {
        return Object.fromEntries(this.lastScanResults);
    }
}

/**
 * @typedef {Object} SessionStats
 * @property {string|null} model
 * @property {number} userMessages
 * @property {number} assistantMessages
 * @property {number} toolUses
 * @property {number} inputTokens
 * @property {number} outputTokens
 * @property {number} estimatedCost
 * @property {string|null} firstMessageAt
 * @property {string|null} lastMessageAt
 * @property {string|null} lastActivity
 */

module.exports = SessionScanner;
