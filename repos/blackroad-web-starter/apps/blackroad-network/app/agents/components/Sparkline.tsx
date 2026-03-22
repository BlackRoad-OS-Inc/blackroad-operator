"use client";

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ values, width = 120, height = 32, color = "#0ea5e9" }: SparklineProps) {
  if (values.length === 0) {
    return <span className="text-xs text-slate-400">no data</span>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);
  const points = values
    .map((value, index) => {
      const x = index * step;
      const normalized = (value - min) / range;
      const y = height - normalized * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="text-slate-500">
      <polyline fill="none" stroke={color} strokeWidth={2} points={points} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
