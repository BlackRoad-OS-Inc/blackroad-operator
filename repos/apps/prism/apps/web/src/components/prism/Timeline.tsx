import { useMemo, useState } from "react";
import { PrismEvent } from "@prism/core";

type TimelineProps = {
  events: PrismEvent[];
};

const DEFAULT_FILTERS = ["all", "errors", "runs", "files"] as const;

type Filter = (typeof DEFAULT_FILTERS)[number] | string;

function categorize(event: PrismEvent): Filter {
  if (event.topic.includes("error") || event.payload?.status === "error") return "errors";
  if (event.topic.startsWith("actions.run")) return "runs";
  if (event.topic.startsWith("actions.file")) return "files";
  return "all";
}

export default function Timeline({ events }: TimelineProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const filters = useMemo(() => {
    const buckets = new Set<Filter>(DEFAULT_FILTERS);
    events.forEach((event) => buckets.add(event.actor));
    return Array.from(buckets);
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((event) => {
      if (filter === "all") return true;
      if (DEFAULT_FILTERS.includes(filter as any)) {
        return categorize(event) === filter;
      }
      return event.actor === filter;
    });
  }, [events, filter]);

  return (
    <div className="timeline">
      <div className="timeline__filters">
        {filters.map((item) => (
          <button key={item} type="button" onClick={() => setFilter(item)} className={filter === item ? "is-active" : ""}>
            {item}
          </button>
        ))}
      </div>
      <ol className="timeline__events">
        {filtered.map((event) => (
          <li key={event.id}>
            <header>
              <span className="timeline__actor">{event.actor}</span>
              <time dateTime={event.at}>{new Date(event.at).toLocaleTimeString()}</time>
            </header>
            <div className="timeline__topic">{event.topic}</div>
            <pre>{JSON.stringify(event.payload, null, 2)}</pre>
          </li>
        ))}
      </ol>
    </div>
  );
}
