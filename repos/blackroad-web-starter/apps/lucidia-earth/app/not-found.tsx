import Link from "next/link";
import { siteConfig } from "./site-config";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <h1 className="text-4xl font-semibold text-slate-900">Page not found</h1>
      <p className="max-w-md text-slate-600">
        The resource you requested is outside this domain's operational perimeter. Use the navigation to get back on
        course.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {siteConfig.navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
