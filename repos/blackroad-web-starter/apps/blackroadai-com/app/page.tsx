import Link from "next/link";
import { Button, Hero, FeatureGrid, CTA, Stats, Badge } from "@br/ui";
import { features, hero, story } from "./site-config";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero
        badge="🚀 APIs & SDKs"
        title={
          <>
            Deploy agentic intelligence through{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              one API
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
          { label: "API Calls/Month", value: "50M", suffix: "+" },
          { label: "Uptime", value: "99.99", suffix: "%" },
          { label: "Models Supported", value: "100", suffix: "+" },
          { label: "Response Time", value: "<100", suffix: "ms" },
        ]}
      />

      {/* Features Grid */}
      <FeatureGrid
        title="Everything you need to ship AI-powered features"
        description="A unified platform for language models, vision AI, and decisioning engines with enterprise-grade security."
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
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          ),
          title: feature.title,
          description: feature.description,
        }))}
        columns={3}
      />

      {/* Code Example Section */}
      <section className="bg-slate-900 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <Badge variant="primary" size="lg">
                Developer First
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                From idea to production in minutes
              </h2>
              <p className="mt-4 text-lg text-slate-300 leading-relaxed">
                Our SDK handles authentication, retry logic, error handling, and observability
                so you can focus on building great products.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "RESTful API with OpenAPI spec",
                  "SDKs for Python, TypeScript, Go, Rust",
                  "Streaming responses for real-time apps",
                  "Built-in rate limiting and quotas"
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
              <div className="rounded-2xl bg-slate-800 p-6 font-mono text-sm shadow-2xl">
                <div className="mb-3 flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
                <pre className="overflow-x-auto text-slate-300">
{`import { BlackRoadAI } from '@blackroad/sdk'

const client = new BlackRoadAI({
  apiKey: process.env.BLACKROAD_API_KEY
})

const response = await client.chat({
  model: 'gpt-4',
  messages: [{
    role: 'user',
    content: 'Analyze this data...'
  }]
})

console.log(response.message)`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="bg-white px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge variant="primary" size="lg">
              Our Journey
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Built by developers, for developers
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              From fragmented pipelines to unified platform
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
        title="Start building with BlackRoad AI"
        description="Get API credentials and ship your first AI-powered feature today. Free tier includes 100K tokens/month."
        variant="gradient"
        actions={
          <>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact">Get API credentials</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/20">
              <Link href="/docs">View documentation</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
