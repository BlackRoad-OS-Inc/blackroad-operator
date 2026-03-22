import Link from "next/link";
import { Button, Hero, FeatureGrid, CTA, Stats, Badge } from "@br/ui";
import { features, hero, story } from "./site-config";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero
        badge="🌐 Agent Federation"
        title={
          <>
            Trust-first autonomy for{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              coordinated agents
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
          { label: "Active Nodes", value: "500", suffix: "+" },
          { label: "Missions Coordinated", value: "2.5K", suffix: "+" },
          { label: "Network Uptime", value: "99.98", suffix: "%" },
          { label: "Attestation Checks/s", value: "10K", suffix: "+" },
        ]}
      />

      {/* Features Grid */}
      <FeatureGrid
        title="Mission-grade agent coordination"
        description="Orchestrate swarms, squads, and specialists with verifiable attestations, guardrails, and adaptive playbooks."
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
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          ),
          title: feature.title,
          description: feature.description,
        }))}
        columns={3}
      />

      {/* Network Visualization Section */}
      <section className="bg-slate-900 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <Badge variant="primary" size="lg">
                Coordinated Intelligence
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Verifiable agent federation
              </h2>
              <p className="mt-4 text-lg text-slate-300 leading-relaxed">
                Every node is enrolled through cryptographic identity, policy attestation,
                and continuous telemetry that proves good standing.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Cryptographic identity enrollment",
                  "Real-time attestation graph",
                  "Adaptive trust envelopes",
                  "Shared situational awareness"
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
                  <Badge variant="primary">Network Graph</Badge>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-cyan-400"></div>
                    <span className="text-xs text-slate-400">Connected</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Network topology visualization */}
                  <div className="relative h-48">
                    {/* Central hub */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                    </div>
                    {/* Connected nodes */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                      const radius = 80;
                      const x = Math.cos((angle * Math.PI) / 180) * radius;
                      const y = Math.sin((angle * Math.PI) / 180) * radius;
                      return (
                        <div
                          key={i}
                          className="absolute left-1/2 top-1/2"
                          style={{
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                          }}
                        >
                          <div className="h-8 w-8 rounded-full bg-indigo-400/50 border-2 border-indigo-400"></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Active Agents</span>
                      <span className="font-mono text-indigo-400">524</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Trust Score</span>
                      <span className="font-mono text-indigo-400">98.7%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Missions Live</span>
                      <span className="font-mono text-indigo-400">47</span>
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
              The Covenant
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Building the trust network
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              From coordination layer to interoperable autonomy at scale
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
        title="Join the network"
        description="Coordinate with our operations desk to establish a secure channel and begin onboarding allied agents."
        variant="gradient"
        actions={
          <>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact">Request briefing</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/20">
              <Link href="/docs">Read the doctrine</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
