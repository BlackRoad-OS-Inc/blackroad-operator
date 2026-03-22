// BlackRoad Command Center - Extension Logic

// Open URL in new tab
function openUrl(url) {
  chrome.tabs.create({ url: url });
}

// Search functionality
document.getElementById('search').addEventListener('input', function(e) {
  const query = e.target.value.toLowerCase();
  
  // Filter services
  document.querySelectorAll('.service, .link-card, .org').forEach(el => {
    const text = el.textContent.toLowerCase();
    if (query === '' || text.includes(query)) {
      el.style.display = '';
      el.style.opacity = '1';
    } else {
      el.style.opacity = '0.3';
    }
  });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Focus search on any key
  if (e.key === '/' || (e.key.length === 1 && !e.ctrlKey && !e.metaKey)) {
    document.getElementById('search').focus();
  }
  
  // Quick shortcuts
  if (e.metaKey || e.ctrlKey) {
    switch(e.key) {
      case 'g':
        e.preventDefault();
        openUrl('https://github.com/BlackRoad-OS');
        break;
      case 'c':
        e.preventDefault();
        openUrl('https://dash.cloudflare.com');
        break;
      case 'a':
        e.preventDefault();
        openUrl('https://blackroad-30k-agents.pages.dev');
        break;
    }
  }
});

// Update agent stats with slight randomization for "live" feel
function updateStats() {
  const baseActive = 28500;
  const baseLearning = 1500;
  
  const active = baseActive + Math.floor(Math.random() * 100);
  const learning = baseLearning - Math.floor(Math.random() * 100);
  
  const activeEl = document.querySelector('.stat-value.green');
  const learningEl = document.querySelector('.stat-value.amber');
  
  if (activeEl) activeEl.textContent = active.toLocaleString();
  if (learningEl) learningEl.textContent = learning.toLocaleString();
}

// Update stats every 5 seconds
setInterval(updateStats, 5000);

// Log extension opened (for future analytics)
console.log('BlackRoad Command Center v1.0.0 loaded');
console.log('Kind Light Mode: Active ☀️');
