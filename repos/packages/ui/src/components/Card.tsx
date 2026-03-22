import type { PropsWithChildren, ReactNode } from "react";

export type CardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
} & PropsWithChildren;

export const Card = ({ title, description, icon, children }: CardProps) => {
  return (
    <section
      className="flex h-full flex-col rounded-xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-md transition hover:-translate-y-1 hover:shadow-lg"
      aria-label={title}
    >
      <header className="mb-4 flex items-center gap-3">
        {icon ? <span className="text-2xl" aria-hidden>{icon}</span> : null}
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </header>
      {children ? <div className="mt-auto text-sm text-slate-700">{children}</div> : null}
    </section>
  );
};
