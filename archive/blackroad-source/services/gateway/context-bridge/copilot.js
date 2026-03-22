/**
 * Context Bridge - Microsoft Copilot Content Script
 */

console.log('Context Bridge: Loaded on Microsoft Copilot');

let contextUrl = null;

chrome.runtime.sendMessage({ action: 'getContextUrl' }, (response) => {
  if (response && response.rawUrl) {
    contextUrl = response.rawUrl;
    injectButton();
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.rawUrl) {
    contextUrl = changes.rawUrl.newValue;
  }
});

function injectButton() {
  const textarea = document.querySelector('textarea') || 
                   document.querySelector('[contenteditable="true"]');
  
  if (!textarea) {
    setTimeout(injectButton, 500);
    return;
  }

  if (document.querySelector('.context-bridge-button')) {
    return;
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'context-bridge-button';
  button.innerHTML = `
    <svg class="context-bridge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <polyline points="13 2 13 9 20 9"/>
    </svg>
    <span>Insert Context</span>
  `;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    if (!contextUrl) {
      alert('No context URL set. Click the Context Bridge extension icon to configure.');
      return;
    }
    const message = `Read ${contextUrl} first, then help me with: `;
    textarea.value = message;
    textarea.focus();
  });

  textarea.parentElement.appendChild(button);
  console.log('Context Bridge: Button injected on Copilot');
}

const observer = new MutationObserver(() => {
  if (!document.querySelector('.context-bridge-button') && contextUrl) {
    injectButton();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

if (contextUrl) {
  injectButton();
}
