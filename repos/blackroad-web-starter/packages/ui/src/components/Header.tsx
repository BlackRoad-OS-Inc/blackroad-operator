"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

type HeaderLink = {
  href: Route<string>;
  label: string;
};

type HeaderProps = {
  title: string;
  navigation: HeaderLink[];
};

export function Header({ title, navigation }: HeaderProps) {
  const [host, setHost] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.host);
    }
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{host || ""}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        </div>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-2 py-1 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
