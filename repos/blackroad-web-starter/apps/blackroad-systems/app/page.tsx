import Link from "next/link";
import { Button, Hero, FeatureGrid, CTA, Stats, Badge } from "@br/ui";
import { features, hero, story } from "./site-config";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero
        badge="🔒 Zero-Trust Infrastructure"
        title={
          <>
            Infrastructure OS for{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              autonomous estates
            </span>
          </>
        }
        description={hero.description}
        variant="gradient"
        actions={
          <>
            <Button asChild variant="gradient" size="lg">
              <Link href={hero.primary.href}>{hero.primary.label}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={hero.secondary.href}>{hero.secondary.label}</Link>
            </Button>
          </>
        }
      />

      {/* Stats Section */}
      <Stats
        variant="light"
        stats={[
          { label: "Uptime SLA", value: "99.99", suffix: "%" },
          { label: "Security Certifications", value: "12", suffix: "+" },
          { label: "Policy Checks/Day", value: "1M", suffix: "+" },
          { label: "MTTR", value: "<5", suffix: " min" },
        ]}
      />

      {/* Features Grid */}
      <FeatureGrid
        title="Enterprise-grade infrastructure orchestration"
        description="Provision, harden, and monitor platforms with policy-as-code at every layer of your autonomous estate."
        features={features.map((feature) => ({
          icon: (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          ),
          title: feature.title,
          description: feature.description,
        }))}
        columns={3}
      />

      {/* Security Dashboard Section */}
      <section className="bg-slate-900 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <Badge variant="primary" size="lg">
                Security First
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Zero-trust from silicon to session
              </h2>
              <p className="mt-4 text-lg text-slate-300 leading-relaxed">
                Our policy lattice enforces declarative guardrails with just-in-time
                privileges, automatic drift remediation, and unified observability.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Continuous compliance monitoring",
                  "SBOM tracking & attestation",
                  "Automated anomaly detection",
                  "Sub-second policy enforcement"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="h-6 w-6 flex-shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-slate-800 p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <Badge variant="primary">Security Posture</Badge>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    <span className="text-xs text-slate-400">Secure</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-slate-300">Identity Verification</span>
                      <span className="text-sm font-semibold text-green-400">PASS</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-600">
                      <div className="h-2 w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-slate-300">Device Posture</span>
                      <span className="text-sm font-semibold text-green-400">PASS</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-600">
                      <div className="h-2 w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-slate-300">Workload Integrity</span>
                      <span className="text-sm font-semibold text-green-400">PASS</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-600">
                      <div className="h-2 w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-slate-700/30 p-3">
                      <div className="text-xl font-bold text-indigo-400">0</div>
                      <div className="text-xs text-slate-400">Incidents</div>
                    </div>
                    <div className="rounded-lg bg-slate-700/30 p-3">
                      <div className="text-xl font-bold text-indigo-400">2.4s</div>
                      <div className="text-xs text-slate-400">MTTR</div>
                    </div>
                    <div className="rounded-lg bg-slate-700/30 p-3">
                      <div className="text-xl font-bold text-indigo-400">100%</div>
                      <div className="text-xs text-slate-400">Coverage</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="bg-gradient-to-b from-white to-slate-50 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge variant="primary" size="lg">
              Our Journey
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Battle-tested infrastructure
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              From brittle automation to resilient operating system for autonomy
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {story.map((chapter, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border-2 border-indigo-100 bg-white p-8 shadow-sm transition hover:border-indigo-300 hover:shadow-xl"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                  {idx + 1}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900">
                  {chapter.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{chapter.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTA
        title="Secure your autonomous estate"
        description="Engage our systems command team for an environment assessment tailored to your regulatory surface and threat model."
        variant="gradient"
        actions={
          <>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact">Schedule assessment</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/20">
              <Link href="/docs">View controls</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
