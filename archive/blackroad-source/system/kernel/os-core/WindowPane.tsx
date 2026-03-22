import * as React from "react";

export type WindowPaneProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
};

const paneClass = [
  "rounded-2xl",
  "border border-br-neon-accent/60",
  "bg-br-neon-dark/60",
  "backdrop-blur-md",
  "text-white",
  "shadow-2xl"
].join(" ");

export const WindowPane: React.FC<WindowPaneProps> = ({ title, className = "", children, ...rest }) => (
  <section className={`${paneClass} ${className}`} {...rest}>
    {title ? (
      <header className="px-4 py-2 border-b border-br-neon-glow/30 text-sm uppercase tracking-[0.2em] text-br-neon-glow">
        {title}
      </header>
    ) : null}
    <div className="p-4">{children}</div>
  </section>
);
