import { useState, useEffect } from "react";

const AUTH_API = "https://auth.blackroad.io";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Capture token from URL (redirect from auth.blackroad.io)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        localStorage.setItem("br_token", urlToken);
        params.delete('token');
        const clean = params.toString();
        const newUrl = window.location.pathname + (clean ? '?' + clean : '');
        window.history.replaceState({}, '', newUrl);
      }
    }

    const token = localStorage.getItem("br_token");
    const cached = localStorage.getItem("br_user");

    if (!token) {
      setLoading(false);
      return;
    }

    // Use cached user immediately, then verify in background
    if (cached) {
      try { setUser(JSON.parse(cached)); } catch {}
    }

    fetch(`${AUTH_API}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setUser(data.user);
        localStorage.setItem("br_user", JSON.stringify(data.user));
      })
      .catch(() => {
        // Token expired or invalid
        localStorage.removeItem("br_token");
        localStorage.removeItem("br_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signout = () => {
    const token = localStorage.getItem("br_token");
    if (token) {
      fetch(`${AUTH_API}/api/signout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem("br_token");
    localStorage.removeItem("br_user");
    setUser(null);
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem("br_token") : null;
  return { user, loading, signout, isAuthenticated: !!user, token };
}
