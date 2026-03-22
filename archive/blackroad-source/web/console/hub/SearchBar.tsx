"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export default function SearchBar({ placeholder = "Search repos..." }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  function handleSearch(value: string) {
    setQuery(value);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.push(`?${params.toString()}`);
    });
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all"
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      )}
      {query && !isPending && (
        <button
          onClick={() => handleSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-sm"
        >
          ✕
        </button>
      )}
    </div>
  );
}
