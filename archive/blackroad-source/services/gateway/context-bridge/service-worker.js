/**
 * Context Bridge - Background Service Worker
 * Handles extension state and context URL storage
 */

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Context Bridge installed');
  
  // Set default state
  chrome.storage.sync.get(['contextUrl'], (result) => {
    if (!result.contextUrl) {
      console.log('No context URL set yet');
    } else {
      console.log('Context URL loaded:', result.contextUrl);
    }
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getContextUrl') {
    chrome.storage.sync.get(['contextUrl', 'rawUrl'], (result) => {
      sendResponse({
        contextUrl: result.contextUrl,
        rawUrl: result.rawUrl
      });
    });
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'setContextUrl') {
    chrome.storage.sync.set({
      contextUrl: request.contextUrl,
      rawUrl: request.rawUrl
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'clearContext') {
    chrome.storage.sync.remove(['contextUrl', 'rawUrl'], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Badge to show if context is set
chrome.storage.sync.get(['contextUrl'], (result) => {
  if (result.contextUrl) {
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
  }
});

// Listen for storage changes to update badge
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.contextUrl) {
    if (changes.contextUrl.newValue) {
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
});
