/**
 * UI Components — Dashboard button, keyboard shortcuts, context menu
 */

export function createWebDashboardButton() {
  const button = document.createElement('button');
  button.id = 'web-dashboard-btn';
  button.className = 'web-dashboard-btn';
  button.innerHTML = '🌐 Agent Desk';
  button.title = 'Open Agent Desk (Ctrl+D)';

  button.onclick = async () => {
    button.disabled = true;
    const originalHTML = button.innerHTML;
    button.innerHTML = '⏳ Opening...';

    try {
      if (window.electronAPI && window.electronAPI.openWebDashboard) {
        const result = await window.electronAPI.openWebDashboard();

        if (result.success) {
          button.innerHTML = '✓ Opened';
          setTimeout(() => {
            button.innerHTML = '🌐 Agent Desk';
            button.disabled = false;
          }, 2000);
        } else {
          button.innerHTML = '✗ Failed';
          console.error('[Renderer] Failed to open dashboard:', result.error);
          setTimeout(() => {
            button.innerHTML = originalHTML;
            button.disabled = false;
          }, 2000);
        }
      } else {
        console.error('[Renderer] electronAPI.openWebDashboard not available');
        button.disabled = false;
        button.innerHTML = originalHTML;
      }
    } catch (error) {
      console.error('[Renderer] Error opening dashboard:', error);
      button.innerHTML = '✗ Error';
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
      }, 2000);
    }
  };

  return button;
}

export function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + D: Open Mission Control Dashboard
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      const dashboardBtn = document.getElementById('web-dashboard-btn');
      if (dashboardBtn && !dashboardBtn.disabled) {
        dashboardBtn.click();
      }
    }

    // Tab: Navigate between agents
    if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const agents = Array.from(document.querySelectorAll('.agent-card'));
      if (agents.length === 0) return;

      const currentIndex = agents.findIndex(card => card === document.activeElement);

      if (e.shiftKey) {
        e.preventDefault();
        const prevIndex = currentIndex <= 0 ? agents.length - 1 : currentIndex - 1;
        agents[prevIndex].focus();
      } else if (currentIndex === -1) {
        e.preventDefault();
        agents[0].focus();
      }
    }

    // Escape: Close any overlays/modals
    if (e.key === 'Escape') {
      const contextMenu = document.querySelector('.context-menu');
      if (contextMenu) {
        contextMenu.remove();
      }
    }

    // Enter: Focus terminal for active agent
    if (e.key === 'Enter') {
      const focusedAgent = document.querySelector('.agent-card:focus') ||
                           document.querySelector('.agent-card[tabindex="0"]:focus');
      if (focusedAgent) {
        const agentId = focusedAgent.dataset.agentId;
        if (agentId && window.electronAPI && window.electronAPI.focusTerminal) {
          window.electronAPI.focusTerminal(agentId);
        }
      }
    }

    // Arrow keys: Navigate between agents
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      const agents = Array.from(document.querySelectorAll('.agent-card'));
      if (agents.length === 0) return;

      const currentIndex = agents.findIndex(card => card === document.activeElement);
      if (currentIndex === -1) return;

      e.preventDefault();

      let nextIndex;
      switch (e.key) {
        case 'ArrowLeft':
          nextIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowRight':
          nextIndex = Math.min(agents.length - 1, currentIndex + 1);
          break;
        case 'ArrowUp':
          nextIndex = Math.max(0, currentIndex - 10);
          break;
        case 'ArrowDown':
          nextIndex = Math.min(agents.length - 1, currentIndex + 10);
          break;
      }

      agents[nextIndex].focus();
    }
  });

}

export function setupContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    const agentCard = e.target.closest('.agent-card');
    if (!agentCard) return;

    e.preventDefault();

    const agentId = agentCard.dataset.agentId;
    if (!agentId) return;

    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <div class="context-menu-item" data-action="focus">
        <span class="menu-icon">🎯</span>
        <span class="menu-label">Focus Terminal</span>
        <span class="menu-shortcut">Enter</span>
      </div>
    `;

    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    menu.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        if (item.dataset.action === 'focus') {
          if (window.electronAPI && window.electronAPI.focusTerminal) {
            window.electronAPI.focusTerminal(agentId);
          }
        }
        menu.remove();
      });
    });

    document.body.appendChild(menu);

    const closeMenu = (e) => {
      if (!document.body.contains(menu) || !menu.contains(e.target)) {
        if (document.body.contains(menu)) menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  });

}
