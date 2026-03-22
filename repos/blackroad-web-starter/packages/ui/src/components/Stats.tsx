type Stat = {
  label: string;
  value: string;
  suffix?: string;
};

type StatsProps = {
  stats: Stat[];
  variant?: "light" | "dark";
};

export function Stats({ stats, variant = "light" }: StatsProps) {
  const bgClasses = {
    light: "bg-slate-50",
    dark: "bg-slate-900"
  };

  const valueClasses = {
    light: "text-slate-900",
    dark: "text-white"
  };

  const labelClasses = {
    light: "text-slate-600",
    dark: "text-slate-400"
  };

  return (
    <section className={`${bgClasses[variant]} px-4 py-16`}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className={`mb-2 text-4xl font-bold ${valueClasses[variant]} sm:text-5xl`}>
                {stat.value}
                {stat.suffix && <span className="text-indigo-500">{stat.suffix}</span>}
              </div>
              <div className={`text-sm font-medium uppercase tracking-wide ${labelClasses[variant]}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
