import Link from "next/link";
import { Button, Hero, FeatureGrid, CTA, Stats, Badge } from "@br/ui";
import { features, hero, story } from "./site-config";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero
        badge="🎨 Creative Studio"
        title={
          <>
            Studio courses for{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              expressive technologists
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
          { label: "Active Students", value: "300", suffix: "+" },
          { label: "Studio Sessions", value: "120", suffix: "+" },
          { label: "Tool Templates", value: "50", suffix: "+" },
          { label: "Completion Rate", value: "92", suffix: "%" },
        ]}
      />

      {/* Features Grid */}
      <FeatureGrid
        title="Master emerging creative technologies"
        description="Curriculum, toolchains, and critique rituals to help creative teams navigate the frontier of immersive media."
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
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          ),
          title: feature.title,
          description: feature.description,
        }))}
        columns={3}
      />

      {/* Creative Showcase Section */}
      <section className="bg-slate-900 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <Badge variant="primary" size="lg">
                Learning in Public
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Build with the best tools
              </h2>
              <p className="mt-4 text-lg text-slate-300 leading-relaxed">
                Our toolchain library provides preconfigured workspaces, templates, and
                agentic assistants that accelerate your creative production.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Live critique with expert mentors",
                  "Production-ready templates",
                  "AI-powered creative assistants",
                  "Open-source community tools"
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
                  <Badge variant="primary">Creative Canvas</Badge>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-pink-400"></div>
                    <span className="text-xs text-slate-400">Creating</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Creative tools visualization */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 p-4">
                      <div className="mb-2 text-xs text-slate-400">Motion</div>
                      <div className="h-16 rounded bg-gradient-to-r from-pink-500 to-purple-500 opacity-60"></div>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 p-4">
                      <div className="mb-2 text-xs text-slate-400">Sound</div>
                      <div className="space-y-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="h-2 rounded bg-gradient-to-r from-indigo-500 to-cyan-500"
                            style={{ width: `${Math.random() * 60 + 40}%`, opacity: 0.6 }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-4">
                      <div className="mb-2 text-xs text-slate-400">Interactive</div>
                      <div className="grid grid-cols-3 gap-1">
                        {[...Array(9)].map((_, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded bg-gradient-to-br from-amber-500 to-orange-500"
                            style={{ opacity: Math.random() * 0.3 + 0.4 }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-4">
                      <div className="mb-2 text-xs text-slate-400">AI Tools</div>
                      <div className="flex items-center justify-center h-16">
                        <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Active Projects</span>
                      <span className="text-indigo-400">24</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Templates Used</span>
                      <span className="text-indigo-400">156</span>
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
              Where craft meets code
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Empowering artists to navigate the frontier of immersive technology
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
        title="Join the next cohort"
        description="Tell us about your creative practice and the tools you rely on so we can recommend the right track for your journey."
        variant="gradient"
        actions={
          <>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact">Apply now</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/20">
              <Link href="/docs">View catalog</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
