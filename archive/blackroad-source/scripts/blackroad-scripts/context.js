#!/usr/bin/env node
// Lucidia Context Manager
// Auto-detects git repo, files, codex, and memory context

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class ContextManager {
  constructor(cwd = process.cwd()) {
    this.cwd = cwd;
  }

  // Detect all context
  async detect() {
    return {
      git: this.getGitContext(),
      files: this.getFileContext(),
      codex: this.getCodexContext(),
      memory: this.getMemoryContext(),
      detected_at: new Date().toISOString()
    };
  }

  // Git context
  getGitContext() {
    try {
      // Check if in git repo
      const isRepo = execSync('git rev-parse --is-inside-work-tree 2>/dev/null', { 
        cwd: this.cwd,
        encoding: 'utf8' 
      }).trim() === 'true';

      if (!isRepo) return null;

      // Get repo info
      const repo = execSync('git rev-parse --show-toplevel', { 
        cwd: this.cwd,
        encoding: 'utf8' 
      }).trim();

      const branch = execSync('git branch --show-current', { 
        cwd: this.cwd,
        encoding: 'utf8' 
      }).trim();

      // Recent commits (last 5)
      const commits = execSync('git log --oneline -5', { 
        cwd: this.cwd,
        encoding: 'utf8' 
      }).trim().split('\n').map(line => {
        const [hash, ...msg] = line.split(' ');
        return { hash, message: msg.join(' ') };
      });

      // Uncommitted changes
      const status = execSync('git status --porcelain', { 
        cwd: this.cwd,
        encoding: 'utf8' 
      }).trim();

      const hasChanges = status.length > 0;
      const changedFiles = status ? status.split('\n').map(line => {
        const [status, ...file] = line.trim().split(' ');
        return { status, file: file.join(' ') };
      }) : [];

      return {
        repo: path.basename(repo),
        repo_path: repo,
        branch,
        commits,
        has_changes: hasChanges,
        changed_files: changedFiles
      };
    } catch (err) {
      return null;
    }
  }

  // File context
  getFileContext() {
    try {
      // Current directory
      const cwd = this.cwd;

      // List files in current directory
      const files = fs.readdirSync(cwd)
        .filter(f => !f.startsWith('.'))
        .filter(f => fs.statSync(path.join(cwd, f)).isFile())
        .slice(0, 10); // Limit to 10 files

      // Detect language/framework
      let language = 'unknown';
      let framework = null;

      if (fs.existsSync(path.join(cwd, 'package.json'))) {
        language = 'javascript';
        try {
          const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
          if (pkg.dependencies) {
            if (pkg.dependencies.next) framework = 'next.js';
            else if (pkg.dependencies.react) framework = 'react';
            else if (pkg.dependencies.express) framework = 'express';
          }
        } catch (err) {
          // Ignore
        }
      } else if (fs.existsSync(path.join(cwd, 'requirements.txt'))) {
        language = 'python';
      } else if (fs.existsSync(path.join(cwd, 'Cargo.toml'))) {
        language = 'rust';
      } else if (fs.existsSync(path.join(cwd, 'go.mod'))) {
        language = 'go';
      }

      return {
        cwd,
        files,
        language,
        framework,
        file_count: files.length
      };
    } catch (err) {
      return null;
    }
  }

  // Codex context (check if available)
  getCodexContext() {
    const codexScript = path.join(os.homedir(), 'blackroad-codex-search.py');
    
    if (fs.existsSync(codexScript)) {
      return {
        available: true,
        path: codexScript,
        components: 22244 // Known count
      };
    }

    return { available: false };
  }

  // Memory context (check recent sessions)
  getMemoryContext() {
    const memoryDir = path.join(os.homedir(), '.lucidia', 'memory', 'sessions');
    
    try {
      if (!fs.existsSync(memoryDir)) {
        return { sessions: [] };
      }

      const sessions = fs.readdirSync(memoryDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, 5) // Last 5 sessions
        .map(f => {
          const file = path.join(memoryDir, f);
          const stat = fs.statSync(file);
          return {
            file: f,
            created: stat.birthtime,
            modified: stat.mtime
          };
        });

      return { sessions };
    } catch (err) {
      return { sessions: [] };
    }
  }

  // Format context for display
  format(context) {
    let output = '\n╔════════════════════════════════════════════════════════╗\n';
    output += '║  📋 Context Detected                                  ║\n';
    output += '╚════════════════════════════════════════════════════════╝\n\n';

    // Git
    if (context.git) {
      output += `📁 Git Repository: ${context.git.repo}\n`;
      output += `   Branch: ${context.git.branch}\n`;
      output += `   Recent commits: ${context.git.commits.length}\n`;
      if (context.git.has_changes) {
        output += `   ⚠️  Uncommitted changes: ${context.git.changed_files.length} files\n`;
      }
      output += '\n';
    }

    // Files
    if (context.files) {
      output += `📂 Working Directory: ${context.files.cwd}\n`;
      output += `   Language: ${context.files.language}\n`;
      if (context.files.framework) {
        output += `   Framework: ${context.files.framework}\n`;
      }
      output += `   Files: ${context.files.file_count}\n`;
      output += '\n';
    }

    // Codex
    if (context.codex && context.codex.available) {
      output += `📚 Codex Available: ${context.codex.components.toLocaleString()} components\n\n`;
    }

    // Memory
    if (context.memory && context.memory.sessions.length > 0) {
      output += `🧠 Recent Sessions: ${context.memory.sessions.length}\n\n`;
    }

    return output;
  }
}

module.exports = ContextManager;
