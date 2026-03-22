"use client";

import { useEffect, useRef } from "react";
import type { AgentGraphResponse } from "../data";

interface GraphCanvasProps {
  graph: AgentGraphResponse | null;
}

const COLORS: Record<string, string> = {
  mentor: "#38bdf8",
  peer: "#a855f7",
  apprentice: "#f97316",
};

export function GraphCanvas({ graph }: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graph) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const clientWidth = canvas.clientWidth || 640;
    const clientHeight = canvas.clientHeight || 360;
    const width = clientWidth * dpr;
    const height = clientHeight * dpr;
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.save();
    context.scale(dpr, dpr);

    context.translate(clientWidth / 2, clientHeight / 2);

    const positionMap = new Map(graph.positions.map((position) => [position.id, position] as const));

    context.strokeStyle = "rgba(148, 163, 184, 0.4)";
    context.lineWidth = 1.5;
    for (const edge of graph.edges) {
      const from = positionMap.get(edge.from);
      const to = positionMap.get(edge.to);
      if (!from || !to) {
        continue;
      }
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    }

    for (const node of graph.nodes) {
      const position = positionMap.get(node.id);
      if (!position) {
        continue;
      }
      context.beginPath();
      context.fillStyle = COLORS[position.ring] ?? "#10b981";
      context.strokeStyle = "white";
      context.lineWidth = 1.5;
      context.arc(position.x, position.y, 10, 0, Math.PI * 2);
      context.fill();
      context.stroke();

      context.font = "12px Inter, system-ui";
      context.fillStyle = "#1e293b";
      context.textAlign = "center";
      context.fillText(node.label, position.x, position.y + 20);
    }

    context.restore();
  }, [graph]);

  return <canvas ref={canvasRef} className="h-80 w-full rounded-lg bg-slate-50 shadow-inner" />;
}
