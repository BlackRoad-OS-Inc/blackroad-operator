import Link from "next/link";
import { Button, Hero, FeatureGrid, CTA, Stats, Badge } from "@br/ui";
import { features, hero, story } from "./site-config";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero
        badge="✨ Persona Portal"
        title={
          <>
            Navigate the Lucidia{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              persona constellation
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
          { label: "Active Personae", value: "50", suffix: "+" },
          { label: "Story Arcs", value: "200", suffix: "+" },
          { label: "Community Creators", value: "1.2K", suffix: "+" },
          { label: "Continuity Accuracy", value: "99", suffix: "%" },
        ]}
      />

      {/* Features Grid */}
      <FeatureGrid
        title="Curated persona ecosystem"
        description="Discover, activate, and harmonize Lucidia personae for experiential worlds and collaborative storytelling."
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
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          title: feature.title,
          description: feature.description,
        }))}
        columns={3}
      />

      {/* Persona Constellation Section */}
      <section className="bg-slate-900 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <Badge variant="primary" size="lg">
                Living Canon
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Coherent cross-medium narratives
              </h2>
              <p className="mt-4 text-lg text-slate-300 leading-relaxed">
                Our continuity intelligence keeps timeline reconciliations synchronized
                across immersive deployments and collaborative performances.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Curated persona dossiers",
                  "Guided activation rituals",
                  "Relationship mapping tools",
                  "Timeline synchronization"
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
                  <Badge variant="primary">Persona Gallery</Badge>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-violet-400"></div>
                    <span className="text-xs text-slate-400">Active</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Persona cards */}
                  {[
                    { name: "Aurora", role: "Dream Weaver", color: "from-pink-500 to-rose-500" },
                    { name: "Cipher", role: "Truth Seeker", color: "from-indigo-500 to-blue-500" },
                    { name: "Echo", role: "Memory Keeper", color: "from-purple-500 to-violet-500" },
                    { name: "Solstice", role: "Time Bender", color: "from-amber-500 to-orange-500" }
                  ].map((persona, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 rounded-lg bg-slate-700/50 p-4 transition hover:bg-slate-700"
                    >
                      <div className={`h-12 w-12 flex-shrink-0 rounded-full bg-gradient-to-br ${persona.color} flex items-center justify-center text-white font-bold`}>
                        {persona.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{persona.name}</div>
                        <div className="text-xs text-slate-400">{persona.role}</div>
                      </div>
                      <div className="text-xs text-indigo-400">View →</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-slate-700/30 p-3 text-center">
                  <div className="text-xs text-slate-400">Registry Status</div>
                  <div className="mt-1 text-lg font-bold text-indigo-400">52 Active Personae</div>
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
              The Weaving
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A living constellation
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              From campus salons to collaborative world-building at scale
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

      {/* Testimonial / Quote Section */}
      <section className="bg-slate-900 px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <svg
            className="mx-auto mb-6 h-12 w-12 text-indigo-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="text-2xl font-medium leading-relaxed text-white sm:text-3xl">
            "The Lucidia personae gave our world depth and coherence we couldn't achieve
            alone. Each character feels alive, interconnected, authentic."
          </blockquote>
          <p className="mt-6 text-indigo-300">
            Community Steward, World-Builder Collective
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <CTA
        title="Open the portal"
        description="Stewards can help you choose a persona blend or create a new presence for your experiential world."
        variant="gradient"
        actions={
          <>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact">Connect with stewards</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/20">
              <Link href="/docs">Explore registry</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
