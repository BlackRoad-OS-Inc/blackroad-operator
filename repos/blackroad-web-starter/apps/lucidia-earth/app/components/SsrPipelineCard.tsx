import Link from "next/link";

type PipelineStatus = "ready" | "deploying" | "queued";

type Props = {
  title: string;
  description: string;
  status: PipelineStatus;
  url?: string;
};

const STATUS_STYLES: Record<PipelineStatus, { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-emerald-100 text-emerald-700" },
  deploying: { label: "Deploying", className: "bg-amber-100 text-amber-700" },
  queued: { label: "Queued", className: "bg-slate-100 text-slate-600" },
};

export function SsrPipelineCard({ title, description, status, url }: Props) {
  const statusConfig = STATUS_STYLES[status];

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-600">{description}</p>
      </div>
      {url ? (
        <Link
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Inspect environment →
        </Link>
      ) : (
        <span className="mt-4 text-sm text-slate-500">Awaiting promotion window</span>
      )}
    </div>
  );
}
