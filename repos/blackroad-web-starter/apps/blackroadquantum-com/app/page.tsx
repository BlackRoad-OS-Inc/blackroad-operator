import Link from "next/link";
import { Button, Hero, FeatureGrid, CTA, Stats, Badge } from "@br/ui";
import { features, hero, story } from "./site-config";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero
        badge="⚛️ Quantum Research"
        title={
          <>
            Quantum demonstrations for{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              decisive insights
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
          { label: "Quantum Demos", value: "30", suffix: "+" },
          { label: "Published Papers", value: "45", suffix: "+" },
          { label: "Hardware Partners", value: "8", suffix: "+" },
          { label: "Qubit Capacity", value: "1000", suffix: "+" },
        ]}
      />

      {/* Features Grid */}
      <FeatureGrid
        title="Quantum-classical hybrid research"
        description="From theoretical constructs to field demonstrations with annotated data and reproducible notebooks."
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          ),
          title: feature.title,
          description: feature.description,
        }))}
        columns={3}
      />

      {/* Quantum Visualization Section */}
      <section className="bg-slate-900 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <Badge variant="primary" size="lg">
                Quantum Computing
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Provable quantum advantage
              </h2>
              <p className="mt-4 text-lg text-slate-300 leading-relaxed">
                Our hybrid compute platform combines classical acceleration with quantum
                tooling for tractable, high-impact workloads.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Reproducible quantum notebooks",
                  "Calibration data included",
                  "Peer-reviewed methodologies",
                  "Hardware-agnostic protocols"
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
                  <Badge variant="primary">Quantum Circuit</Badge>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-purple-400"></div>
                    <span className="text-xs text-slate-400">Entangled</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {/* Visual representation of quantum states */}
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(16)].map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30"
                        style={{
                          opacity: Math.random() * 0.5 + 0.5,
                          animation: `pulse ${2 + Math.random() * 2}s ease-in-out infinite`
                        }}
                      />
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Fidelity</span>
                      <span className="font-mono text-indigo-400">99.2%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Gate Depth</span>
                      <span className="font-mono text-indigo-400">42</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Qubits</span>
                      <span className="font-mono text-indigo-400">127</span>
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
              Bridging quantum theory and practice
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Partnering with operators to solve high-impact quantum problems
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
        title="Request a quantum demonstration"
        description="Connect with our research desk to align on objectives, disclosure cadence, and co-authorship opportunities."
        variant="gradient"
        actions={
          <>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact">Schedule a demo</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/20">
              <Link href="/docs">Browse papers</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
