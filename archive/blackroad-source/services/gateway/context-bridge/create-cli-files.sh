#!/bin/bash

# lib/config.js
cat > lib/config.js << 'EOF'
const Conf = require('conf');
const path = require('path');
const os = require('os');

const config = new Conf({
  projectName: 'context-bridge',
  configName: 'config',
  cwd: path.join(os.homedir(), '.context-bridge')
});

function getConfig() {
  return {
    token: config.get('github_token'),
    gistId: config.get('gist_id'),
    gistUrl: config.get('gist_url'),
    rawUrl: config.get('raw_url'),
    lastUpdated: config.get('last_updated'),
    template: config.get('template'),
    name: config.get('name')
  };
}

function setConfig(key, value) {
  config.set(key, value);
}

function clearConfig() {
  config.clear();
}

module.exports = {
  getConfig,
  setConfig,
  clearConfig,
  config
};
EOF

# lib/gist.js
cat > lib/gist.js << 'EOF'
const { Octokit } = require('@octokit/rest');
const { getConfig } = require('./config');

async function createGist(content, description = 'My AI Context - Context Bridge') {
  const config = getConfig();
  if (!config.token) {
    throw new Error('Not authenticated. Run: context login');
  }

  const octokit = new Octokit({ auth: config.token });
  
  const { data } = await octokit.gists.create({
    description,
    public: false,
    files: {
      'CONTEXT.md': {
        content
      }
    }
  });

  return {
    id: data.id,
    url: data.html_url,
    rawUrl: data.files['CONTEXT.md'].raw_url
  };
}

async function updateGist(content, message = null) {
  const config = getConfig();
  if (!config.token) {
    throw new Error('Not authenticated. Run: context login');
  }
  if (!config.gistId) {
    throw new Error('No context initialized. Run: context init');
  }

  const octokit = new Octokit({ auth: config.token });
  
  const description = message 
    ? `My AI Context - ${message} (${new Date().toISOString().split('T')[0]})`
    : `My AI Context - Updated ${new Date().toISOString().split('T')[0]}`;

  const { data } = await octokit.gists.update({
    gist_id: config.gistId,
    description,
    files: {
      'CONTEXT.md': {
        content
      }
    }
  });

  return {
    id: data.id,
    url: data.html_url,
    rawUrl: data.files['CONTEXT.md'].raw_url
  };
}

async function getGist() {
  const config = getConfig();
  if (!config.token) {
    throw new Error('Not authenticated. Run: context login');
  }
  if (!config.gistId) {
    throw new Error('No context initialized. Run: context init');
  }

  const octokit = new Octokit({ auth: config.token });
  
  const { data } = await octokit.gists.get({
    gist_id: config.gistId
  });

  return {
    content: data.files['CONTEXT.md'].content,
    url: data.html_url,
    rawUrl: data.files['CONTEXT.md'].raw_url,
    updatedAt: data.updated_at,
    revisions: data.history.length
  };
}

async function getGistHistory(limit = 10) {
  const config = getConfig();
  if (!config.token) {
    throw new Error('Not authenticated. Run: context login');
  }
  if (!config.gistId) {
    throw new Error('No context initialized. Run: context init');
  }

  const octokit = new Octokit({ auth: config.token });
  
  const { data } = await octokit.gists.get({
    gist_id: config.gistId
  });

  return data.history.slice(0, limit).map(h => ({
    version: h.version,
    committedAt: h.committed_at,
    changeStatus: h.change_status,
    user: h.user.login
  }));
}

module.exports = {
  createGist,
  updateGist,
  getGist,
  getGistHistory
};
EOF

echo "Created lib files"
