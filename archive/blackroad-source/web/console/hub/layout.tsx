import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlackRoad OS",
  description: "The Operating System for Governed AI — 135+ repos, live data, no terminal needed.",
};

const NAV_PRIMARY = [
  { href: "/", label: "Home" },
  { href: "/apps", label: "Apps" },
  { href: "/repos", label: "Repos" },
  { href: "/agents", label: "Agents" },
  { href: "/fleet", label: "Fleet" },
  { href: "/issues", label: "Issues" },
  { href: "/activity", label: "Activity" },
  { href: "/status", label: "Status" },
];

const NAV_SECONDARY = [
  { href: "/simulation", label: "Simulation" },
  { href: "/english", label: "English" },
  { href: "/math", label: "Math" },
  { href: "/graph", label: "Graph" },
  { href: "/compare", label: "Compare" },
  { href: "/docs", label: "Docs" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen flex flex-col`}>
        <nav className="border-b border-white/10 bg-black/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
            <Link href="/" className="font-bold text-lg gradient-text flex-shrink-0">
              BlackRoad OS
            </Link>
            <div className="flex gap-0.5 overflow-x-auto scrollbar-none">
              {NAV_PRIMARY.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-2.5 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all whitespace-nowrap"
                >
                  {n.label}
                </Link>
              ))}
              <span className="mx-1 text-white/10 self-center">|</span>
              {NAV_SECONDARY.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-2.5 py-1.5 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all whitespace-nowrap"
                >
                  {n.label}
                </Link>
              ))}
            </div>
            <a
              href="https://github.com/BlackRoad-OS"
              target="_blank"
              rel="noopener"
              className="ml-auto text-xs text-gray-500 hover:text-white transition-colors flex-shrink-0"
            >
              GitHub
            </a>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/5 bg-black/50 mt-20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="font-bold gradient-text text-sm">BlackRoad OS</div>
                <div className="text-xs text-gray-600 mt-1">The Operating System for Governed AI</div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <Link href="/apps" className="hover:text-white transition-colors">Apps</Link>
                <Link href="/repos" className="hover:text-white transition-colors">Repos</Link>
                <Link href="/status" className="hover:text-white transition-colors">Status</Link>
                <Link href="/fleet" className="hover:text-white transition-colors">Fleet</Link>
                <a href="https://github.com/BlackRoad-OS" target="_blank" rel="noopener" className="hover:text-white transition-colors">GitHub</a>
                <a href="https://git.blackroad.io" target="_blank" rel="noopener" className="hover:text-white transition-colors">Gitea</a>
              </div>
            </div>
            <div className="text-xs text-gray-700 mt-6">
              BlackRoad OS, Inc. — All data live from GitHub API.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
