"use client";

import { useEffect } from "react";

export function Analytics() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const payload = {
        path: window.location.pathname,
        ts: new Date().toISOString(),
      };
      console.debug("[analytics] page-view", payload);
    }
  }, []);

  return null;
}
