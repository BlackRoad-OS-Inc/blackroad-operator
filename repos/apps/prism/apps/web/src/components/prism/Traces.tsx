import { useState } from "react";
import { PrismSpan } from "@prism/core";

type TraceNode = PrismSpan & { durationMs?: number; children?: TraceNode[] };

type TracesProps = {
  tree: TraceNode[];
};

function TraceItem({ node }: { node: TraceNode }) {
  const [open, setOpen] = useState(true);
  const duration = node.durationMs ?? (node.endTs ? Math.max(Date.parse(node.endTs) - Date.parse(node.startTs), 0) : undefined);
  return (
    <li className="trace-node">
      <button type="button" onClick={() => setOpen((prev) => !prev)} aria-expanded={open}>
        {open ? "▼" : "▶"}
      </button>
      <span className={`trace-node__status trace-node__status--${node.status}`}>{node.status}</span>
      <strong>{node.name}</strong>
      {duration !== undefined && <span className="trace-node__duration">{duration}ms</span>}
      {node.attrs && <code>{JSON.stringify(node.attrs)}</code>}
      {open && node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TraceItem key={child.spanId} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Traces({ tree }: TracesProps) {
  if (tree.length === 0) {
    return <div>No spans recorded.</div>;
  }
  return (
    <ul className="trace-tree">
      {tree.map((node) => (
        <TraceItem key={node.spanId} node={node} />
      ))}
    </ul>
  );
}
