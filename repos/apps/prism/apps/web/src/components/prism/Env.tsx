import { useMemo, useState } from "react";

type EnvProps = {
  values: Record<string, string | number | boolean | null | undefined>;
  secrets?: string[];
};

const maskSecret = (value: unknown) => (value == null ? "" : "••••••");

export default function Env({ values, secrets = [] }: EnvProps) {
  const [filter, setFilter] = useState("");
  const secretSet = useMemo(() => new Set(secrets), [secrets]);
  const entries = useMemo(() => {
    const lower = filter.trim().toLowerCase();
    return Object.entries(values)
      .filter(([key]) => (lower ? key.toLowerCase().includes(lower) : true))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [values, filter]);

  return (
    <div className="env-view">
      <label className="env-view__filter">
        Filter
        <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Search env vars" />
      </label>
      <dl>
        {entries.map(([key, value]) => {
          const isSecret = secretSet.has(key);
          return (
            <div key={key} className={`env-view__entry${isSecret ? " env-view__entry--secret" : ""}`}>
              <dt>{key}</dt>
              <dd>{isSecret ? maskSecret(value) : String(value ?? "")}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
