import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import { AuthProvider } from "@blackroad/lib/auth";

export const metadata: Metadata = {
  title: "BlackRoad OS · Core Desktop",
  description: "Core-Gen-0 scaffold for BlackRoad OS"
};

const NeonBar = () => (
  <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-gradient-to-r from-br-neon-accent/40 via-br-neon-glow/30 to-br-neon-accent/40 backdrop-blur border-b border-br-neon-glow/40">
    <span className="text-xs uppercase tracking-[0.35em] text-br-neon-glow">Core Desktop UI</span>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="System Online" />
        <span className="text-[10px] text-white/50">Agents: 0</span>
      </div>
      <button className="px-3 py-1 text-[10px] bg-br-neon-accent/20 hover:bg-br-neon-accent/30 border border-br-neon-glow/40 rounded transition-colors">
        Dock
      </button>
    </div>
  </div>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-br-neon-dark text-white">
      <body className="min-h-screen font-sans">
        <AuthProvider>
          <NeonBar />
          <main className="p-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
