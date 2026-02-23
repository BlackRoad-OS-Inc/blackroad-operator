/**
 * BlackRoad OS - Unified API Client
 * Handles all backend communication, auth, and state management
 */

class BlackRoadAPI {
  constructor() {
    // API configuration
    this.API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : 'https://core.blackroad.systems';  // Core backend API (deploy backend here)

    // Auth state
    this.authToken = localStorage.getItem('blackroad_auth_token');
    this.currentUser = null;

    // Initialize
    if (this.authToken) {
      this.loadCurrentUser();
    }
  }

  // Helper: Make authenticated request
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok && response.status === 401) {
      this.logout();
      throw new Error('Unauthorized');
    }

    return response.json();
  }

  // Auth: Register
  async register(email, password, name = null) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });

    this.authToken = data.access_token;
    localStorage.setItem('blackroad_auth_token', this.authToken);
    this.currentUser = data.user;

    return data;
  }

  // Auth: Login
  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    this.authToken = data.access_token;
    localStorage.setItem('blackroad_auth_token', this.authToken);
    this.currentUser = data.user;

    return data;
  }

  // Auth: Logout
  logout() {
    this.authToken = null;
    this.currentUser = null;
    localStorage.removeItem('blackroad_auth_token');
    window.location.href = '/';
  }

  // Auth: Get current user
  async loadCurrentUser() {
    try {
      this.currentUser = await this.request('/api/auth/me');
      return this.currentUser;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.authToken;
  }

  // AI Chat: Send message
  async chat(message, conversationId = null) {
    return this.request('/api/ai-chat/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId })
    });
  }

  // AI Chat: List conversations
  async listConversations() {
    return this.request('/api/ai-chat/conversations');
  }

  // Agents: Spawn agent
  async spawnAgent(role, capabilities = [], pack = null) {
    return this.request('/api/agents/spawn', {
      method: 'POST',
      body: JSON.stringify({ role, capabilities, pack })
    });
  }

  // Agents: List agents
  async listAgents() {
    return this.request('/api/agents/list');
  }

  // Agents: Get agent
  async getAgent(agentId) {
    return this.request(`/api/agents/${agentId}`);
  }

  // Agents: Terminate agent
  async terminateAgent(agentId) {
    return this.request(`/api/agents/${agentId}`, {
      method: 'DELETE'
    });
  }

  // Blockchain: Get blocks
  async getBlocks(limit = 10) {
    return this.request(`/api/blockchain/blocks?limit=${limit}`);
  }

  // Blockchain: Create transaction
  async createTransaction(fromAddress, toAddress, amount, currency = 'RoadCoin') {
    return this.request('/api/blockchain/transaction', {
      method: 'POST',
      body: JSON.stringify({
        from_address: fromAddress,
        to_address: toAddress,
        amount,
        currency
      })
    });
  }

  // Blockchain: Get transactions
  async getTransactions(limit = 10) {
    return this.request(`/api/blockchain/transactions?limit=${limit}`);
  }

  // Payments: Create checkout session
  async createCheckoutSession(tier, amount) {
    return this.request('/api/payments/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ tier, amount })
    });
  }

  // Payments: Verify payment
  async verifyPayment(sessionId) {
    return this.request('/api/payments/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId })
    });
  }

  // Files: List files
  async listFiles() {
    return this.request('/api/files/list');
  }

  // Social: Get feed
  async getSocialFeed(limit = 20) {
    return this.request(`/api/social/feed?limit=${limit}`);
  }

  // System: Get stats
  async getSystemStats() {
    return this.request('/api/system/stats');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create global instance
window.blackroad = new BlackRoadAPI();

// UI Helpers
window.blackroadUI = {
  // Show loading spinner
  showLoading(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.innerHTML = '<div class="spinner">Loading...</div>';
    }
  },

  // Show error message
  showError(message, element = null) {
    if (element) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      element.innerHTML = `<div class="error">${message}</div>`;
    } else {
      alert(message);
    }
  },

  // Show success message
  showSuccess(message, element = null) {
    if (element) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      element.innerHTML = `<div class="success">${message}</div>`;
    } else {
      alert(message);
    }
  },

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  },

  // Require authentication
  requireAuth() {
    if (!window.blackroad.isAuthenticated()) {
      window.location.href = '/?login=required';
      return false;
    }
    return true;
  },

  // Update user display
  async updateUserDisplay() {
    if (!window.blackroad.isAuthenticated()) {
      const authElements = document.querySelectorAll('.auth-required');
      authElements.forEach(el => el.style.display = 'none');
      return;
    }

    const user = await window.blackroad.loadCurrentUser();
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => el.textContent = user?.name || 'User');

    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(el => el.textContent = user?.email || '');
  }
};

// Auto-update user display on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.blackroadUI.updateUserDisplay();
  });
} else {
  window.blackroadUI.updateUserDisplay();
}
