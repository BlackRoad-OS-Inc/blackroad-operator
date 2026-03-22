import { ReactNode } from "react";

type CTAProps = {
  title: string;
  description: string;
  actions: ReactNode;
  variant?: "gradient" | "bordered";
};

export function CTA({ title, description, actions, variant = "gradient" }: CTAProps) {
  const variants = {
    gradient: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
    bordered: "border-2 border-slate-200 bg-white text-slate-900"
  };

  const descColors = {
    gradient: "text-indigo-100",
    bordered: "text-slate-600"
  };

  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className={`relative overflow-hidden rounded-3xl ${variants[variant]} px-8 py-16 shadow-2xl sm:px-16`}>
          {variant === "gradient" && (
            <>
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            </>
          )}
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h2>
            <p className={`mb-8 text-lg ${descColors[variant]}`}>
              {description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {actions}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
