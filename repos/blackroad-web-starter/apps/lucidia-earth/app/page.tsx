import Link from "next/link";
import { Button, Card } from "@br/ui";

import { CsrPulse } from "./components/CsrPulse";
import { SsrPipelineCard } from "./components/SsrPipelineCard";
import { features, hero, launchChecklist, pipelineTargets, vercelProject } from "./site-config";

type ChecklistStatus = "complete" | "in-progress" | "pending";

const CHECKLIST_STYLES: Record<ChecklistStatus, { label: string; className: string }> = {
  complete: { label: "Done", className: "bg-emerald-500/15 text-emerald-200" },
  "in-progress": { label: "In flight", className: "bg-amber-500/15 text-amber-200" },
  pending: { label: "Queued", className: "bg-slate-500/15 text-slate-200" },
};

function ActionButton({
  action,
  variant,
}: {
  action: { label: string; href: string; external?: boolean };
  variant?: "primary" | "secondary";
}) {
  const isExternal = action.external ?? action.href.startsWith("http");
  const rel = isExternal ? "noreferrer" : undefined;
  const target = isExternal ? "_blank" : undefined;

  return (
    <Button asChild variant={variant === "secondary" ? "secondary" : undefined}>
      <Link href={action.href} target={target} rel={rel}>
        {action.label}
      </Link>
    </Button>
  );
}

function ChecklistStatusBadge({ status }: { status: ChecklistStatus }) {
  const config = CHECKLIST_STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-300">{hero.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{hero.title}</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-200">{hero.description}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <ActionButton action={hero.primary} />
          <ActionButton action={hero.secondary} variant="secondary" />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {hero.metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-200">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
              <p className="mt-3 text-sm text-slate-100/80">{metric.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Lucidia platform pillars</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          The landing experience balances narrative and operational clarity so teams can jump from discovery to deployment
          without losing momentum.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} title={feature.title} description={feature.description} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Deployment pipeline</h3>
              <p className="mt-1 text-sm text-slate-600">
                SSR milestones land on the left while the CSR pulse confirms hydration. Lucidia is ready to ship wherever your
                Vercel environments live.
              </p>
            </div>
            <Link
              href={vercelProject.projectUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View Vercel dashboard →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {pipelineTargets.map((target) => (
              <SsrPipelineCard key={target.title} {...target} />
            ))}
          </div>
        </div>

        <CsrPulse
          projectName={vercelProject.name}
          projectUrl={vercelProject.projectUrl}
          deployUrl={vercelProject.deployUrl}
        />
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-slate-900">Launch readiness checklist</h3>
        <div className="mt-6 space-y-4">
          {launchChecklist.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <ChecklistStatusBadge status={item.status} />
              <div>
                <p className="text-base font-medium text-slate-900">{item.label}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600">
          Need deeper integration notes? Review the Vercel deployment playbook in the Lucidia docs or open a task in the Prism
          Console to collaborate with infrastructure leads.
        </p>
      </section>
    </div>
  );
}
