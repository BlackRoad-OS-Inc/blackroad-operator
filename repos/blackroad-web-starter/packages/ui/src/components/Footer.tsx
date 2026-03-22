import Link from "next/link";

type FooterLink = {
  href: string;
  label: string;
};

type FooterProps = {
  links?: FooterLink[];
};

const crossSiteLinks: FooterLink[] = [
  { href: "https://blackroad.network/agents", label: "Registry" },
  { href: "https://lucidia.earth/admissions", label: "Admissions" },
  { href: "https://blackroadai.com/agents", label: "API Catalog" },
];

export function Footer({ links = [] }: FooterProps) {
  const year = new Date().getFullYear();
  const mergedLinks = [...crossSiteLinks, ...links].filter(
    (link, index, array) => array.findIndex((item) => item.href === link.href) === index
  );

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">© {year} BlackRoad. All rights reserved.</p>
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-4">
            {mergedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-slate-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
