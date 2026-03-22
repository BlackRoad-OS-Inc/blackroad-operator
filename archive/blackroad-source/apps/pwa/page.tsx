import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blackroad-900 via-purple-900 to-blackroad-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">
            🗺️ RoadMap
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Advanced Project Planning & Collaboration Platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <FeatureCard 
              title="Real-time Collaboration"
              description="Work together seamlessly with WebSocket-powered live updates"
              icon="👥"
            />
            <FeatureCard 
              title="Visual Planning"
              description="Kanban boards, Gantt charts, and timeline views"
              icon="📊"
            />
            <FeatureCard 
              title="Advanced Analytics"
              description="Track progress, velocity, and team performance"
              icon="📈"
            />
          </div>
          <div className="mt-12">
            <Link href="/dashboard" className="bg-blackroad-500 hover:bg-blackroad-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition">
              Get Started →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}
