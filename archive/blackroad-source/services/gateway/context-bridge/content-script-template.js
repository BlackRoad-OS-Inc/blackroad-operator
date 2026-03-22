// This is a template showing the improved pattern
// Apply to: chatgpt.js, copilot.js, gemini.js

// Key improvements to apply:
// 1. Rate limiting with cooldown
// 2. Loading/success/error states
// 3. Fetch context before inserting
// 4. Better error messages
// 5. Disabled state during operation

const COOLDOWN_MS = 1000;
let isInserting = false;
let lastInsertTime = 0;

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
  button.innerHTML = `<svg class="context-bridge-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 1 1-6.219-8.56"/></svg><span>Inserting...</span>`;

  try {
    // Verify context is accessible
    const response = await fetch(contextUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch context (HTTP ${response.status})`);
    }
    
    // Insert message
    const message = `Read ${contextUrl} first, then help me with: `;
    inputArea.focus();
    inputArea.value = message + (inputArea.value || '');
    inputArea.setSelectionRange(message.length, message.length);
    
    // Success state
    lastInsertTime = now;
    button.classList.remove('loading');
    button.classList.add('injected');
    button.innerHTML = `<svg class="context-bridge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Context Inserted ✓</span>`;

    setTimeout(() => {
      button.classList.remove('injected');
      button.disabled = false;
      button.innerHTML = originalButtonHTML;
      isInserting = false;
    }, 2000);
  } catch (error) {
    // Error state
    console.error('Context Bridge error:', error);
    button.classList.remove('loading');
    button.classList.add('error');
    button.innerHTML = `<svg class="context-bridge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>Failed</span>`;
    alert(`Failed to insert context:\n\n${error.message}\n\nPlease check:\n1. Context URL is accessible\n2. You're connected to the internet\n3. Try refreshing the page`);
    
    setTimeout(() => {
      button.classList.remove('error');
      button.disabled = false;
      button.innerHTML = originalButtonHTML;
      isInserting = false;
    }, 3000);
  }
});
