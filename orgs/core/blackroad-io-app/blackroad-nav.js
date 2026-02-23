/**
 * BlackRoad OS - Unified Navigation Component
 * Add this to any page to get the standard BlackRoad navigation
 */

const blackroadNav = {
  apps: [
    { name: '🏠 Home', url: '/', icon: '🏠' },
    { name: '💬 Chat', url: '/chat.html', icon: '💬' },
    { name: '🤖 Agents', url: '/agents-live.html', icon: '🤖' },
    { name: '⛓️ Blockchain', url: '/blockchain-live.html', icon: '⛓️' },
    { name: '📁 Files', url: '/files-live.html', icon: '📁' },
    { name: '👥 Social', url: '/social-live.html', icon: '👥' },
    { name: '🔐 Wallet', url: '/wallet.html', icon: '🔐' },
    { name: '💳 Pay', url: '/pay.html', icon: '💳' },
    { name: '🔢 Math', url: '/math.html', icon: '🔢' },
    { name: '📚 Docs', url: '/docs.html', icon: '📚' },
    { name: '🔗 Integrations', url: '/integrations.html', icon: '🔗' },
    { name: '🎛️ Dashboard', url: '/dashboard.html', icon: '🎛️' }
  ],

  // Inject navigation HTML
  inject(containerId = 'blackroad-nav') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('BlackRoad Nav: Container not found');
      return;
    }

    const html = `
      <nav class="blackroad-nav">
        <div class="nav-brand">
          <a href="/">BlackRoad OS</a>
        </div>
        <div class="nav-menu">
          ${this.apps.map(app => `
            <a href="${app.url}" class="nav-item" ${window.location.pathname === app.url ? 'data-active="true"' : ''}>
              <span class="nav-icon">${app.icon}</span>
              <span class="nav-label">${app.name.replace(/^[^\s]+ /, '')}</span>
            </a>
          `).join('')}
        </div>
        <div class="nav-user">
          <span class="user-name" id="navUserName">Guest</span>
          <button class="nav-logout" onclick="window.blackroad?.logout()" style="display:none;" id="navLogoutBtn">Logout</button>
        </div>
      </nav>
    `;

    container.innerHTML = html;

    // Add styles if not already present
    if (!document.getElementById('blackroad-nav-styles')) {
      const style = document.createElement('style');
      style.id = 'blackroad-nav-styles';
      style.textContent = `
        .blackroad-nav {
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 24px;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .nav-brand a {
          font-size: 20px;
          font-weight: 900;
          background: linear-gradient(135deg, #FF9D00, #FF6B00, #FF0066, #D600AA, #7700FF, #0066FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none;
        }
        .nav-menu {
          display: flex;
          gap: 4px;
          flex: 1;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .nav-menu::-webkit-scrollbar { display: none; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          color: white;
          text-decoration: none;
          font-size: 14px;
          white-space: nowrap;
          opacity: 0.7;
          transition: all 0.2s;
        }
        .nav-item:hover {
          opacity: 1;
          background: rgba(255,255,255,0.1);
        }
        .nav-item[data-active="true"] {
          opacity: 1;
          background: rgba(119, 0, 255, 0.2);
          border: 1px solid rgba(119, 0, 255, 0.5);
        }
        .nav-icon { font-size: 16px; }
        .nav-label { font-weight: 500; }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-name {
          padding: 6px 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
        }
        .nav-logout {
          padding: 6px 12px;
          background: rgba(255, 0, 102, 0.2);
          border: 1px solid rgba(255, 0, 102, 0.5);
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-logout:hover {
          background: rgba(255, 0, 102, 0.3);
        }
        @media (max-width: 768px) {
          .blackroad-nav {
            flex-wrap: wrap;
            padding: 8px 16px;
          }
          .nav-menu {
            order: 3;
            width: 100%;
          }
          .nav-label {
            display: none;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Update user display
    this.updateUser();
  },

  // Update user display in nav
  async updateUser() {
    const userNameEl = document.getElementById('navUserName');
    const logoutBtn = document.getElementById('navLogoutBtn');

    if (!window.blackroad) {
      setTimeout(() => this.updateUser(), 100);
      return;
    }

    if (window.blackroad.isAuthenticated()) {
      try {
        const user = await window.blackroad.loadCurrentUser();
        if (userNameEl) userNameEl.textContent = user?.name || user?.email || 'User';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
      } catch (error) {
        if (userNameEl) userNameEl.textContent = 'Guest';
      }
    } else {
      if (userNameEl) userNameEl.textContent = 'Guest';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }
};

// Auto-inject on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('blackroad-nav')) {
      blackroadNav.inject();
    }
  });
} else {
  if (document.getElementById('blackroad-nav')) {
    blackroadNav.inject();
  }
}

// Make available globally
window.blackroadNav = blackroadNav;
