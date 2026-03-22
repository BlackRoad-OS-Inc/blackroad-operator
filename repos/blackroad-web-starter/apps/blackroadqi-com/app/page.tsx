import Link from "next/link";
import { Button, Hero, FeatureGrid, CTA, Stats, Badge } from "@br/ui";
import { features, hero, story } from "./site-config";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero
        badge="🧠 Intelligence Research"
        title={
          <>
            Field intelligence through{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Qi-driven research
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
          { label: "Active Experiments", value: "40", suffix: "+" },
          { label: "Research Papers", value: "25", suffix: "+" },
          { label: "Lab Partners", value: "15", suffix: "+" },
          { label: "Ethics Reviews", value: "100", suffix: "%" },
        ]}
      />

      {/* Features Grid */}
      <FeatureGrid
        title="Intelligence experimentation framework"
        description="Prototype emergent behaviors and cognitive stacks grounded in ethical research practices."
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          ),
          title: feature.title,
          description: feature.description,
        }))}
        columns={3}
      />

      {/* Research Visualization Section */}
      <section className="bg-slate-900 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <Badge variant="primary" size="lg">
                Instrumented Research
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Data-driven intelligence insights
              </h2>
              <p className="mt-4 text-lg text-slate-300 leading-relaxed">
                Our cognition sandboxes provide full telemetry, replicable methods, and
                transparent documentation for every intelligence experiment.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Real-time behavior telemetry",
                  "Reproducible experimental protocols",
                  "Peer-reviewed methodology",
                  "Open knowledge sharing"
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
                  <Badge variant="primary">Experiment Dashboard</Badge>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    <span className="text-xs text-slate-400">Live</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-slate-300">Curiosity Index</span>
                      <span className="text-sm font-semibold text-indigo-400">87%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-600">
                      <div className="h-2 w-[87%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-slate-300">Alignment Score</span>
                      <span className="text-sm font-semibold text-indigo-400">94%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-600">
                      <div className="h-2 w-[94%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-slate-300">Cooperation Rate</span>
                      <span className="text-sm font-semibold text-indigo-400">91%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-600">
                      <div className="h-2 w-[91%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
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
              From theory to practice
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Building the commons for ethical intelligence research
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
        title="Join a lab sprint"
        description="Connect with our research desk to align on objectives, NDAs, and collaboration frameworks for the next cohort."
        variant="gradient"
        actions={
          <>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact">Request collaboration</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/20">
              <Link href="/docs">Browse findings</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
