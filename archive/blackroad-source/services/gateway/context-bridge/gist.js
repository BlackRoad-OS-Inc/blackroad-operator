const { Octokit } = require('@octokit/rest');
const { getConfig } = require('./config');

// Helper function to handle API errors with retry
async function withRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Check if error is retryable
      const isRetryable = 
        error.status === 502 || // Bad Gateway
        error.status === 503 || // Service Unavailable  
        error.status === 504 || // Gateway Timeout
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT';
      
      if (!isRetryable) throw error;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

// Helper to create better error messages
function enhanceError(error, context) {
  const messages = {
    401: 'Authentication failed. Your GitHub token may be invalid or expired.\nRun: context login',
    403: error.message.includes('rate limit') 
      ? 'GitHub API rate limit exceeded. Try again in an hour, or use a different GitHub account.'
      : 'Access forbidden. Check that your token has the "gist" scope.',
    404: 'Gist not found. It may have been deleted.\nRun: context init',
    422: 'Invalid request. The gist content may be too large (max 10MB).',
    500: 'GitHub server error. Try again in a few moments.',
    503: 'GitHub is temporarily unavailable. Try again in a few moments.'
  };
  
  const statusCode = error.status;
  const message = messages[statusCode] || error.message;
  
  const enhanced = new Error(`${context}: ${message}`);
  enhanced.originalError = error;
  enhanced.status = statusCode;
  return enhanced;
}

async function createGist(content, description = 'My AI Context - Context Bridge') {
  const config = getConfig();
  if (!config.token) {
    throw new Error('Not authenticated. Run: context login');
  }
  
  // Validate content size (10MB limit)
  const sizeInMB = Buffer.byteLength(content, 'utf8') / (1024 * 1024);
  if (sizeInMB > 10) {
    throw new Error(`Context is too large (${sizeInMB.toFixed(2)}MB). GitHub gists have a 10MB limit.`);
  }

  const octokit = new Octokit({ auth: config.token });
  
  try {
    const result = await withRetry(async () => {
      return await octokit.gists.create({
        description,
        public: false,
        files: {
          'CONTEXT.md': {
            content
          }
        }
      });
    });
    
    const { data } = result;
    
    return {
      id: data.id,
      url: data.html_url,
      rawUrl: data.files['CONTEXT.md'].raw_url
    };
  } catch (error) {
    throw enhanceError(error, 'Failed to create gist');
  }
}

async function updateGist(content, message = null) {
  const config = getConfig();
  if (!config.token) {
    throw new Error('Not authenticated. Run: context login');
  }
  if (!config.gistId) {
    throw new Error('No context initialized. Run: context init');
  }
  
  // Validate content size
  const sizeInMB = Buffer.byteLength(content, 'utf8') / (1024 * 1024);
  if (sizeInMB > 10) {
    throw new Error(`Context is too large (${sizeInMB.toFixed(2)}MB). GitHub gists have a 10MB limit.`);
  }

  const octokit = new Octokit({ auth: config.token });
  
  const description = message 
    ? `My AI Context - ${message} (${new Date().toISOString().split('T')[0]})`
    : `My AI Context - Updated ${new Date().toISOString().split('T')[0]}`;

  try {
    const result = await withRetry(async () => {
      return await octokit.gists.update({
        gist_id: config.gistId,
        description,
        files: {
          'CONTEXT.md': {
            content
          }
        }
      });
    });
    
    const { data } = result;

    return {
      id: data.id,
      url: data.html_url,
      rawUrl: data.files['CONTEXT.md'].raw_url
    };
  } catch (error) {
    throw enhanceError(error, 'Failed to update gist');
  }
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
  
  try {
    const result = await withRetry(async () => {
      return await octokit.gists.get({
        gist_id: config.gistId
      });
    });
    
    const { data } = result;

    return {
      content: data.files['CONTEXT.md'].content,
      url: data.html_url,
      rawUrl: data.files['CONTEXT.md'].raw_url,
      updatedAt: data.updated_at,
      revisions: data.history.length
    };
  } catch (error) {
    throw enhanceError(error, 'Failed to fetch gist');
  }
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
  
  try {
    const result = await withRetry(async () => {
      return await octokit.gists.get({
        gist_id: config.gistId
      });
    });
    
    const { data } = result;

    return data.history.slice(0, limit).map(h => ({
      version: h.version,
      committedAt: h.committed_at,
      changeStatus: h.change_status,
      user: h.user.login
    }));
  } catch (error) {
    throw enhanceError(error, 'Failed to fetch gist history');
  }
}

module.exports = {
  createGist,
  updateGist,
  getGist,
  getGistHistory
};
