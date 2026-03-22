import { ReactNode } from "react";

type Feature = {
  icon?: ReactNode;
  title: string;
  description: string;
};

type FeatureGridProps = {
  title?: string;
  description?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
};

export function FeatureGrid({ title, description, features, columns = 3 }: FeatureGridProps) {
  const columnClasses = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <section className="bg-white px-4 py-24">
      <div className="mx-auto max-w-6xl">
        {(title || description) && (
          <div className="mb-16 text-center">
            {title && (
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                {description}
              </p>
            )}
          </div>
        )}
        <div className={`grid gap-8 ${columnClasses[columns]}`}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-indigo-200 hover:shadow-xl"
            >
              {feature.icon && (
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg transition group-hover:scale-110">
                  {feature.icon}
                </div>
              )}
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
