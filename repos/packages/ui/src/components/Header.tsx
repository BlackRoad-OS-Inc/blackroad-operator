export type HeaderProps = {
  title: string;
  subtitle?: string;
  host?: string;
};

export const Header = ({ title, subtitle, host }: HeaderProps) => {
  return (
    <header className="mx-auto w-full max-w-6xl px-6 py-10 text-slate-900">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
          {host ? host.replace(/^https?:\/\//, "") : ""}
        </span>
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        {subtitle ? <p className="text-lg text-slate-600">{subtitle}</p> : null}
      </div>
    </header>
  );
};
