/**
 * Context Bridge - ChatGPT Content Script
 * Injects "Insert Context" button into ChatGPT interface
 */

console.log('Context Bridge: Loaded on ChatGPT');

let contextUrl = null;
let isInjected = false;

// Get context URL from storage
chrome.runtime.sendMessage({ action: 'getContextUrl' }, (response) => {
  if (response && response.rawUrl) {
    contextUrl = response.rawUrl;
    injectButton();
  }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.rawUrl) {
    contextUrl = changes.rawUrl.newValue;
    updateButton();
  }
});

function injectButton() {
  // Find the textarea (ChatGPT uses a textarea)
  const textarea = document.querySelector('textarea[placeholder*="Message"]') || 
                   document.querySelector('textarea');
  
  if (!textarea) {
    setTimeout(injectButton, 500);
    return;
  }

  // Check if button already exists
  if (document.querySelector('.context-bridge-button')) {
    return;
  }

  // Find the container with the send button
  const formContainer = textarea.closest('form') || textarea.parentElement;
  
  if (!formContainer) {
    return;
  }

  // Create button
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'context-bridge-button';
  button.innerHTML = `
    <svg class="context-bridge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <polyline points="13 2 13 9 20 9"/>
    </svg>
    <span>Insert Context</span>
    <div class="context-bridge-tooltip">Click to insert your context</div>
  `;

  // Style to position near send button
  button.style.position = 'absolute';
  button.style.right = '60px';
  button.style.bottom = '12px';

  // Add click handler with improvements
  let isInserting = false;
  let lastInsertTime = 0;
  const COOLDOWN_MS = 1000;
  
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Rate limiting
    const now = Date.now();
    if (now - lastInsertTime < COOLDOWN_MS || isInserting) {
      return;
    }
    
    if (!contextUrl) {
      alert('No context URL set. Click the Context Bridge extension icon to configure.');
      return;
    }

    // Loading state
    isInserting = true;
    button.disabled = true;
    button.classList.add('loading');
    button.innerHTML = `
      <svg class="context-bridge-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <span>Inserting...</span>
    `;

    try {
      // Verify context is accessible
      const response = await fetch(contextUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch context (HTTP ${response.status})`);
      }
      
      // Insert context message
      const message = `Read ${contextUrl} first, then help me with: `;
      
      // Set textarea value
      textarea.value = message;
      textarea.focus();
      
      // Trigger input event so ChatGPT recognizes the change
      const inputEvent = new Event('input', { bubbles: true });
      textarea.dispatchEvent(inputEvent);
      
      // Position cursor at end
      textarea.setSelectionRange(message.length, message.length);

      // Success state
      lastInsertTime = now;
      button.classList.remove('loading');
      button.classList.add('injected');
      button.innerHTML = `
        <svg class="context-bridge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Context Inserted ✓</span>
      `;

      // Reset after 2 seconds
      setTimeout(() => {
        button.classList.remove('injected');
        button.disabled = false;
        button.innerHTML = `
          <svg class="context-bridge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          <span>Insert Context</span>
          <div class="context-bridge-tooltip">Click to insert your context</div>
        `;
        isInserting = false;
      }, 2000);
    } catch (error) {
      // Error state
      console.error('Context Bridge error:', error);
      button.classList.remove('loading');
      button.classList.add('error');
      button.innerHTML = `
        <svg class="context-bridge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>Failed</span>
      `;
      
      alert(`Failed to insert context:\n\n${error.message}\n\nPlease check:\n1. Context URL is accessible\n2. You're connected to the internet\n3. Try refreshing the page`);
      
      setTimeout(() => {
        button.classList.remove('error');
        button.disabled = false;
        button.innerHTML = `
          <svg class="context-bridge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          <span>Insert Context</span>
          <div class="context-bridge-tooltip">Click to insert your context</div>
        `;
        isInserting = false;
      }, 3000);
    }
  });

  // Add button to the form
  formContainer.style.position = 'relative';
  formContainer.appendChild(button);

  console.log('Context Bridge: Button injected on ChatGPT');
}

function updateButton() {
  const button = document.querySelector('.context-bridge-button');
  if (!button) {
    if (contextUrl) {
      injectButton();
    }
  }
}

// Watch for DOM changes (ChatGPT is a SPA)
const observer = new MutationObserver((mutations) => {
  if (!document.querySelector('.context-bridge-button') && contextUrl) {
    injectButton();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial injection
if (contextUrl) {
  injectButton();
}
