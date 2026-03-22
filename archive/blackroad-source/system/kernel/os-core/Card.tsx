import * as React from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({ className = "", children, ...rest }) => (
  <div
    className={`border border-br-neon-glow/50 bg-br-neon-dark/40 rounded-xl p-4 shadow-lg ${className}`}
    {...rest}
  >
    {children}
  </div>
);
