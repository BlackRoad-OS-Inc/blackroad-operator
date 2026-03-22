import { ReactNode } from "react";

type CardProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function Card({ title, description, action }: CardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
      {action ? <div className="mt-auto text-sm font-medium text-indigo-600">{action}</div> : null}
    </div>
  );
}
