import Link from 'next/link'
import { FloatingShapes, CommandPrompt } from './components/BlackRoadVisuals'

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center px-8">
      <FloatingShapes />
      
      <div className="relative z-10 text-center max-w-3xl">
        <div className="text-9xl font-bold mb-8 animate-glitch-1">404</div>
        
        <h1 className="text-5xl font-bold mb-6 hover-glow">
          Page Not Found 🔍
        </h1>
        
        <p className="text-2xl text-gray-400 mb-12">
          Looks like this page got lost in the quantum void. 
          Let's get you back on track.
        </p>

        <div className="mb-12">
          <CommandPrompt>blackroad navigate --home</CommandPrompt>
        </div>

        <div className="flex gap-6 justify-center">
          <Link 
            href="/"
            className="px-8 py-4 bg-white text-black font-mono text-sm hover-lift transition-all"
          >
            🏠 Go Home
          </Link>
          <Link 
            href="/docs"
            className="px-8 py-4 border border-white font-mono text-sm hover:bg-white hover:text-black hover-lift transition-all"
          >
            📚 Read Docs
          </Link>
          <Link 
            href="/contact"
            className="px-8 py-4 border border-white font-mono text-sm hover:bg-white hover:text-black hover-lift transition-all"
          >
            💬 Contact Us
          </Link>
        </div>

        <div className="mt-16 text-gray-500 font-mono text-sm">
          Error Code: 404_QUANTUM_VOID
        </div>
      </div>
    </div>
  )
}
