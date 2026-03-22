/**
 * BlackRoad Studio — Component Library Index
 * Exports all design system primitives following the brand design system.
 * Colors: --hot-pink: #FF1D6C | --electric-blue: #2979FF | --violet: #9C27B0 | --amber: #F5A623
 * Spacing: Golden Ratio φ = 1.618 (8 → 13 → 21 → 34 → 55px)
 */

export * from "./Button";
export * from "./Card";
export * from "./Badge";
export * from "./Input";
export * from "./Modal";
export * from "./Toast";
export * from "./Spinner";
export * from "./AgentAvatar";
export * from "./StatusDot";
export * from "./CodeBlock";
export * from "./MetricCard";

// Design token re-exports
export const tokens = {
  colors: {
    brand: {
      hotPink:       "#FF1D6C",
      electricBlue:  "#2979FF",
      violet:        "#9C27B0",
      amber:         "#F5A623",
    },
    agents: {
      lucidia: "#9C27B0",
      alice:   "#2979FF",
      octavia: "#F5A623",
      prism:   "#00BCD4",
      echo:    "#4CAF50",
      cipher:  "#FF1D6C",
    },
  },
  spacing: { xs: 8, sm: 13, md: 21, lg: 34, xl: 55 },
  gradient: "linear-gradient(135deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%)",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  lineHeight: 1.618,
} as const;
