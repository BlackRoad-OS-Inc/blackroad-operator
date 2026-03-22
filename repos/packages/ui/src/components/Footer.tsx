import { SITES } from "@blackroad/config/domain.config";

export type FooterProps = {
  host?: string;
  className?: string;
};

export const Footer = ({ host, className }: FooterProps) => {
  const year = new Date().getFullYear();
  const currentSite = host ? SITES.find((site) => host.endsWith(site.domain)) : undefined;
  const label = currentSite ? currentSite.title : "BlackRoad";

  return (
    <footer
      className={`mt-16 border-t border-black/10 bg-slate-950/90 py-10 text-sm text-slate-200 backdrop-blur ${className ?? ""}`.trim()}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium tracking-wide">© {year} {label}. All rights reserved.</p>
        <nav className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em] text-slate-400">
          <a className="hover:text-white" href="/about">
            About
          </a>
          <a className="hover:text-white" href="/contact">
            Contact
          </a>
          <a className="hover:text-white" href="/docs">
            Docs
          </a>
          <a className="hover:text-white" href="/status">
            Status
          </a>
        </nav>
      </div>
    </footer>
  );
};
