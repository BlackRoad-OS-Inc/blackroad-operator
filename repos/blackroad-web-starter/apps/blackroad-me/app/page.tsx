import Link from "next/link";
import { Button, Hero, FeatureGrid, CTA, Stats, Badge } from "@br/ui";
import { features, hero, story } from "./site-config";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero
        badge="🔐 Persona Assurance"
        title={
          <>
            Unified{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Identity
            </span>{" "}
            for humans and agents
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
          { label: "Identity Records", value: "1M", suffix: "+" },
          { label: "Verified Credentials", value: "5M", suffix: "+" },
          { label: "Agent Teams", value: "10K", suffix: "+" },
          { label: "Uptime", value: "99.9", suffix: "%" },
        ]}
      />

      {/* Features Grid */}
      <FeatureGrid
        title="Identity infrastructure for the AI era"
        description="Bind humans, agents, and devices into a unified trust fabric with programmable consent."
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

      {/* Story Timeline */}
      <section className="bg-gradient-to-b from-white to-slate-50 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge variant="primary" size="lg">
              Our Approach
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Redefining trust for human-agent teams
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              When traditional identity systems couldn't keep pace with agent velocity
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {story.map((chapter, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border-2 border-indigo-100 bg-white p-8 shadow-sm transition hover:border-indigo-300 hover:shadow-xl"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
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

      {/* Benefits Section */}
      <section className="bg-white px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Trust that scales with your agents
              </h2>
              <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                BlackRoad Identity provides verifiable credentials, lifecycle access management,
                and adaptive consent frameworks designed for human-augmented agent teams.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Bind biometrics, devices, and agent certificates",
                  "Dynamic consent policies for data sharing",
                  "Automated joiner-mover-leaver workflows",
                  "Cross-network collaboration without sacrificing security"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="h-6 w-6 flex-shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 p-8">
                <div className="flex h-full items-center justify-center">
                  <svg className="h-full w-full text-indigo-600/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTA
        title="Ready to secure your identity infrastructure?"
        description="Join leading organizations using BlackRoad Identity to manage trust across human and agent teams."
        variant="gradient"
        actions={
          <>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact">Launch enrollment</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/20">
              <Link href="/docs">Read documentation</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
