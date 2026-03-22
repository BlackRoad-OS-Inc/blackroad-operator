/**
 * BlackRoad Clerk Authentication Integration
 * Universal auth system for all BlackRoad products
 */

import Clerk from '@clerk/clerk-js';

// Clerk configuration
const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY';

// Initialize Clerk
const clerk = new Clerk(CLERK_PUBLISHABLE_KEY);
await clerk.load();

/**
 * BlackRoad Auth Manager
 */
class BlackRoadAuth {
  constructor() {
    this.clerk = clerk;
    this.user = null;
    this.initialized = false;
  }

  /**
   * Initialize authentication
   */
  async init() {
    if (this.initialized) return;

    // Load user session
    this.user = this.clerk.user;
    this.initialized = true;

    // Setup UI components
    this.mountComponents();
    
    // Listen for auth state changes
    this.clerk.addListener(({ user }) => {
      this.user = user;
      this.onAuthStateChanged(user);
    });
  }

  /**
   * Mount Clerk UI components
   */
  mountComponents() {
    // Sign In button
    const signInBtn = document.getElementById('clerk-sign-in');
    if (signInBtn) {
      signInBtn.addEventListener('click', () => this.clerk.openSignIn());
    }

    // Sign Up button
    const signUpBtn = document.getElementById('clerk-sign-up');
    if (signUpBtn) {
      signUpBtn.addEventListener('click', () => this.clerk.openSignUp());
    }

    // User button
    const userBtn = document.getElementById('clerk-user-button');
    if (userBtn) {
      this.clerk.mountUserButton(userBtn);
    }

    // Sign Out button
    const signOutBtn = document.getElementById('clerk-sign-out');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => this.signOut());
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    await this.clerk.signOut();
    window.location.href = '/';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.user;
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Get user metadata
   */
  getUserMetadata() {
    return this.user?.publicMetadata || {};
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission) {
    const metadata = this.getUserMetadata();
    return metadata.permissions?.includes(permission) || false;
  }

  /**
   * Called when auth state changes
   */
  onAuthStateChanged(user) {
    // Update UI
    const authElements = document.querySelectorAll('[data-auth-required]');
    authElements.forEach(el => {
      el.style.display = user ? 'block' : 'none';
    });

    const unauthElements = document.querySelectorAll('[data-unauth-required]');
    unauthElements.forEach(el => {
      el.style.display = user ? 'none' : 'block';
    });

    // Emit custom event
    window.dispatchEvent(new CustomEvent('blackroad:auth:changed', {
      detail: { user }
    }));
  }

  /**
   * Protect a route (redirect if not authenticated)
   */
  protectRoute(redirectTo = '/sign-in') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectTo;
    }
  }

  /**
   * Get auth token for API calls
   */
  async getToken() {
    return await this.clerk.session?.getToken();
  }

  /**
   * Make authenticated API request
   */
  async fetch(url, options = {}) {
    const token = await this.getToken();
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

// Create global instance
window.BlackRoadAuth = new BlackRoadAuth();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.BlackRoadAuth.init();
  });
} else {
  window.BlackRoadAuth.init();
}

export default BlackRoadAuth;
