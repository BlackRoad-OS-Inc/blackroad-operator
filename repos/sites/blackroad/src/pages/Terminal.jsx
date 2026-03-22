import { useRef, useState, useEffect } from "react";
import {
  buildQuantumVisualization,
  QUANTUM_UPDATE_INTERVAL_MS,
} from "../lib/quantumVisualization.js";

const QUANTUM_COMMAND_OUTPUT = [
  "🌌 Quantum math visualization started (animations below)",
  "Press Ctrl+C or type 'clear' to stop",
];

export default function Terminal() {
  const [lines, setLines] = useState(["Type 'help' or 'health'."]);
  const inputRef = useRef(null);
  const [quantumActive, setQuantumActive] = useState(false);
  const [quantumFrame, setQuantumFrame] = useState(0);

  useEffect(() => {
    if (!quantumActive) return;
    const timer = setInterval(() => {
      setQuantumFrame((frame) => frame + 1);
    }, QUANTUM_UPDATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [quantumActive]);

  const run = async (cmd) => {
    const [c, ...rest] = cmd.trim().split(/\s+/);
    if (!c) return;
    if (c === "help") return ["help, health, echo <text>, clear, quantum"];
    if (c === "echo") return [rest.join(" ")];
    if (c === "clear") return ["\x07"]; // bell; UI clears
    if (c === "health") {
      try {
        const r = await fetch("/api/health", { cache: "no-store" });
        return [await r.text()];
      } catch (e) {
        return [String(e)];
      }
    }
    if (c === "quantum") {
      setQuantumActive(true);
      setQuantumFrame(0);
      return QUANTUM_COMMAND_OUTPUT;
    }
    return [`unknown: ${c}`];
  };

  const onKey = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = e.currentTarget.value;
      e.currentTarget.value = "";
      if (v.trim() === "clear") setQuantumActive(false);
      setLines((x) => [...x, `$ ${v}`]);
      const out = await run(v);
      if (out?.[0] === "\x07") {
        setLines([]);
        setQuantumActive(false);
        return;
      }
      setLines((x) => [...x, ...(out ?? [])]);
    }
  };

  const quantumLines = quantumActive
    ? buildQuantumVisualization(quantumFrame)
    : [];

  const displayLines = quantumActive ? [...lines, ...quantumLines] : lines;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Terminal</h2>
      <div className="h-56 overflow-auto border border-neutral-800 rounded p-2 bg-black/50 mb-2">
        {displayLines.map((l, i) => (
          <div key={i} className="font-mono text-sm">
            {l}
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        onKeyDown={onKey}
        placeholder="type a command…"
        className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 font-mono"
      />
    </div>
  );
}
