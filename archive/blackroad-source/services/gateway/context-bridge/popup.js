/**
 * Context Bridge - Popup Script
 */

let contextUrl = null;
let rawUrl = null;

// Load state
chrome.storage.sync.get(['contextUrl', 'rawUrl'], (result) => {
  contextUrl = result.contextUrl;
  rawUrl = result.rawUrl;
  updateUI();
});

function updateUI() {
  const noContext = document.getElementById('no-context');
  const hasContext = document.getElementById('has-context');
  const setContext = document.getElementById('set-context');

  if (rawUrl) {
    noContext.style.display = 'none';
    hasContext.style.display = 'block';
    setContext.style.display = 'none';
    document.getElementById('context-url-display').value = rawUrl;
  } else {
    noContext.style.display = 'block';
    hasContext.style.display = 'none';
    setContext.style.display = 'none';
  }
}

// Copy button
document.getElementById('copy-btn')?.addEventListener('click', () => {
  const input = document.getElementById('context-url-display');
  input.select();
  document.execCommand('copy');
  
  const btn = document.getElementById('copy-btn');
  btn.innerHTML = '<span>✓</span>';
  setTimeout(() => {
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    `;
  }, 1000);
});

// Preview button
document.getElementById('preview-btn')?.addEventListener('click', async () => {
  if (!rawUrl) return;
  
  const btn = document.getElementById('preview-btn');
  btn.innerHTML = '<span class="spinner">⏳</span> Loading...';
  btn.disabled = true;
  
  try {
    const response = await fetch(rawUrl);
    const content = await response.text();
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    // Open in new tab with safely escaped content
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Context Preview</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            max-width: 800px; 
            margin: 40px auto; 
            padding: 20px; 
            line-height: 1.6;
            background: #fff;
            color: #1a1a1a;
          }
          pre { 
            background: #f5f5f5; 
            padding: 16px; 
            border-radius: 8px; 
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: 'SF Mono', Monaco, 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
          }
          h1 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
          }
          .meta {
            color: #666;
            font-size: 14px;
            margin-top: -10px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Your Context Preview</h1>
        <div class="meta">Source: ${escapeHtml(rawUrl)}</div>
        <pre>${escapeHtml(content)}</pre>
      </body>
      </html>
    `);
    previewWindow.document.close();
  } catch (error) {
    alert('Failed to load context: ' + error.message);
  } finally {
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      Preview Context
    `;
    btn.disabled = false;
  }
});

// Change button
document.getElementById('change-btn')?.addEventListener('click', () => {
  document.getElementById('has-context').style.display = 'none';
  document.getElementById('set-context').style.display = 'block';
  document.getElementById('context-url-input').value = rawUrl || '';
});

// Save button
document.getElementById('save-btn')?.addEventListener('click', async () => {
  const url = document.getElementById('context-url-input').value.trim();
  const btn = document.getElementById('save-btn');
  const originalText = btn.innerHTML;
  
  if (!url) {
    alert('Please enter a URL');
    return;
  }
  
  // Better URL validation - check actual domain
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch (e) {
    alert('Invalid URL format. Please enter a valid URL.');
    return;
  }
  
  // Check if it's from GitHub domains
  const validDomains = ['gist.github.com', 'gist.githubusercontent.com', 'raw.githubusercontent.com'];
  const isValidDomain = validDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain));
  
  if (!isValidDomain) {
    alert('Please enter a valid GitHub Gist raw URL.\n\nAccepted domains:\n- gist.github.com\n- gist.githubusercontent.com\n- raw.githubusercontent.com');
    return;
  }
  
  // Validate URL actually returns content
  btn.innerHTML = '⏳ Validating...';
  btn.disabled = true;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const content = await response.text();
    if (content.length === 0) {
      throw new Error('URL returned empty content');
    }
    
    // Check if it looks like HTML instead of markdown/text
    if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
      throw new Error('URL returned HTML instead of raw content. Make sure to use the raw URL from your gist.');
    }
    
    // Success! Save it
    chrome.storage.sync.set({
      rawUrl: url,
      contextUrl: url
    }, () => {
      rawUrl = url;
      contextUrl = url;
      btn.innerHTML = '✓ Saved!';
      setTimeout(() => {
        updateUI();
      }, 1000);
    });
  } catch (error) {
    alert(`Failed to validate URL:\n\n${error.message}\n\nPlease check:\n1. URL is accessible\n2. It's the raw gist URL\n3. You're connected to the internet`);
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// Cancel button
document.getElementById('cancel-btn')?.addEventListener('click', () => {
  updateUI();
});

// Clear button
document.getElementById('clear-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  
  if (confirm('Clear your context URL?')) {
    chrome.storage.sync.remove(['contextUrl', 'rawUrl'], () => {
      contextUrl = null;
      rawUrl = null;
      updateUI();
    });
  }
});
