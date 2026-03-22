import { useMemo, useState } from "react";
import { PrismDiff, diffStat } from "@prism/core";

type DiffsProps = {
  diffs: PrismDiff[];
};

function formatPatch(patch: string) {
  return patch
    .split("\n")
    .map((line, index) => {
      const className = line.startsWith("+") ? "diff-line--add" : line.startsWith("-") ? "diff-line--remove" : "";
      return (
        <div key={index} className={`diff-line ${className}`}>
          {line || "\u00a0"}
        </div>
      );
    });
}

export default function Diffs({ diffs }: DiffsProps) {
  const [selectedPath, setSelectedPath] = useState(() => diffs[0]?.path ?? "");
  const selected = diffs.find((diff) => diff.path === selectedPath) ?? diffs[0];
  const stats = useMemo(() => diffs.map((diff) => ({ diff, stat: diffStat(diff) })), [diffs]);

  if (diffs.length === 0) {
    return <div>No diffs to display.</div>;
  }

  return (
    <div className="diff-view">
      <aside>
        <ul>
          {stats.map(({ diff, stat }) => (
            <li key={diff.path}>
              <button
                type="button"
                className={diff.path === selected?.path ? "is-active" : ""}
                onClick={() => setSelectedPath(diff.path)}
              >
                <span>{diff.path}</span>
                <span className="diff-view__stat">
                  +{stat.additions} / -{stat.deletions}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="diff-view__content" aria-live="polite">
        {selected ? formatPatch(selected.patch) : <div>Select a file to view its patch.</div>}
      </section>
    </div>
  );
}
