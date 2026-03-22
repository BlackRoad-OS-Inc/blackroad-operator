import { ReactNode } from "react";
import clsx from "clsx";

type SectionProps = {
  children: ReactNode;
  className?: string;
  variant?: "white" | "gray" | "dark";
  padding?: "sm" | "md" | "lg";
};

export function Section({ children, className, variant = "white", padding = "lg" }: SectionProps) {
  const variants = {
    white: "bg-white",
    gray: "bg-slate-50",
    dark: "bg-slate-900 text-white"
  };

  const paddings = {
    sm: "py-12",
    md: "py-16",
    lg: "py-24"
  };

  return (
    <section className={clsx(variants[variant], paddings[padding], className)}>
      {children}
    </section>
  );
}
