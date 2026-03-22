import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  workspaceId: string;
  role: 'admin' | 'member';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, _password: string) => {
        // Try API first, fall back to local auth for demo
        let token: string | null = null;
        let user: User | null = null;
        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: _password }),
          });
          if (res.ok) {
            const data = await res.json();
            token = data.token;
            user = data.user;
          }
        } catch { /* API unavailable */ }

        // Fallback: local demo auth
        if (!user) {
          const id = email.toLowerCase().replace(/[@.]/g, '_');
          user = {
            id,
            email: email.toLowerCase(),
            name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
            workspaceId: 'blackroad-default',
            role: email.endsWith('@blackroad.io') ? 'admin' : 'member',
          };
          token = `demo_${id}_${Date.now()}`;
        }

        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      signup: async (email: string, _password: string, name: string) => {
        let token: string | null = null;
        let user: User | null = null;
        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: _password, name }),
          });
          if (res.ok) {
            const data = await res.json();
            token = data.token;
            user = data.user;
          }
        } catch { /* API unavailable */ }

        if (!user) {
          const id = email.toLowerCase().replace(/[@.]/g, '_');
          user = {
            id,
            email: email.toLowerCase(),
            name: name || email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
            workspaceId: 'blackroad-default',
            role: email.endsWith('@blackroad.io') ? 'admin' : 'member',
          };
          token = `demo_${id}_${Date.now()}`;
        }

        set({ user, token, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
