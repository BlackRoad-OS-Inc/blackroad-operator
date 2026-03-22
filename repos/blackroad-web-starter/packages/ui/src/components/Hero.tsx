import { ReactNode } from "react";

type HeroProps = {
  title: string | ReactNode;
  subtitle?: string;
  description: string;
  actions?: ReactNode;
  badge?: string;
  variant?: "gradient" | "minimal" | "centered";
};

export function Hero({ title, subtitle, description, actions, badge, variant = "gradient" }: HeroProps) {
  const variants = {
    gradient: "bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900",
    minimal: "bg-white",
    centered: "bg-gradient-to-b from-white to-slate-50"
  };

  const textColors = {
    gradient: "text-white",
    minimal: "text-slate-900",
    centered: "text-slate-900"
  };

  const descColors = {
    gradient: "text-slate-300",
    minimal: "text-slate-600",
    centered: "text-slate-600"
  };

  return (
    <section className={`relative overflow-hidden ${variants[variant]} px-4 py-24 sm:py-32`}>
      {variant === "gradient" && (
        <>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
        </>
      )}
      <div className="relative mx-auto max-w-6xl text-center">
        {badge && (
          <div className="mb-6 inline-flex items-center rounded-full border border-indigo-200/20 bg-indigo-50/10 px-4 py-1.5 text-sm font-medium text-indigo-300 backdrop-blur-sm">
            {badge}
          </div>
        )}
        {subtitle && (
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-indigo-400">
            {subtitle}
          </p>
        )}
        <h1 className={`mb-6 text-4xl font-bold tracking-tight ${textColors[variant]} sm:text-6xl lg:text-7xl`}>
          {title}
        </h1>
        <p className={`mx-auto mb-10 max-w-3xl text-lg leading-relaxed ${descColors[variant]} sm:text-xl`}>
          {description}
        </p>
        {actions && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
