/**
 * Context Bridge - Storage Monitor
 * Monitors chrome.storage.sync usage and warns when approaching quota
 */

const STORAGE_QUOTA = 102400; // 100KB Chrome sync storage limit
const WARN_THRESHOLD = 0.9; // Warn at 90%
const ITEM_QUOTA = 8192; // 8KB per item limit

async function checkStorageUsage() {
  return new Promise((resolve) => {
    chrome.storage.sync.getBytesInUse(null, (bytesInUse) => {
      const percentUsed = bytesInUse / STORAGE_QUOTA;
      const isNearLimit = percentUsed >= WARN_THRESHOLD;
      
      resolve({
        bytesInUse,
        bytesRemaining: STORAGE_QUOTA - bytesInUse,
        percentUsed: Math.round(percentUsed * 100),
        isNearLimit,
        quota: STORAGE_QUOTA
      });
    });
  });
}

async function checkItemSize(key, value) {
  const size = new Blob([JSON.stringify(value)]).size;
  const isTooBig = size > ITEM_QUOTA;
  
  return {
    key,
    size,
    isTooBig,
    quota: ITEM_QUOTA,
    percentOfQuota: Math.round((size / ITEM_QUOTA) * 100)
  };
}

async function displayStorageWarning() {
  const usage = await checkStorageUsage();
  
  if (usage.isNearLimit) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'storage-warning';
    warningDiv.innerHTML = `
      <strong>⚠️ Storage Warning</strong>
      <p>You're using ${usage.percentUsed}% of available storage.</p>
      <p>Consider cleaning up old data or switching to local storage.</p>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
      container.insertBefore(warningDiv, container.firstChild);
    }
  }
  
  return usage;
}

// Monitor storage on popup open
if (typeof chrome !== 'undefined' && chrome.storage) {
  displayStorageWarning().then(usage => {
    console.log('Storage usage:', usage);
  });
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkStorageUsage,
    checkItemSize,
    displayStorageWarning
  };
}
