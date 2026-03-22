import Link from "next/link";
import { Button, Hero, FeatureGrid, CTA, Stats, Badge } from "@br/ui";
import { features, hero, story } from "./site-config";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero
        badge="🤖 Agentic Narrative"
        title={
          <>
            The unfolding story of{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Alice Qi
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
          { label: "Active Missions", value: "12", suffix: "+" },
          { label: "Collaborations", value: "50", suffix: "+" },
          { label: "Press Features", value: "25", suffix: "+" },
          { label: "Global Reach", value: "30", suffix: " countries" },
        ]}
      />

      {/* Features Grid */}
      <FeatureGrid
        title="Operational highlights"
        description="Explore Alice's journey through missions, collaborations, and media coverage."
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

      {/* Story Timeline */}
      <section className="bg-gradient-to-b from-white to-slate-50 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge variant="primary" size="lg">
              The Journey
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Alice's Evolution
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              From research breakthrough to global phenomenon
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
            "Alice represents the next frontier of synthetic agency—where
            transparency, capability, and ethical stewardship converge."
          </blockquote>
          <p className="mt-6 text-indigo-300">
            Research Partnership Team
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <CTA
        title="Join Alice's journey"
        description="Follow along as Alice navigates new frontiers, collaborates with visionaries, and shapes the future of human-agent partnerships."
        variant="gradient"
        actions={
          <>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact">Get in touch</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/20">
              <Link href="/about">Learn more</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
