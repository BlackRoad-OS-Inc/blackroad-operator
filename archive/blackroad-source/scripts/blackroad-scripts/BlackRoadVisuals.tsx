// BlackRoad Visual Language System
// Shapes, Symbols, Animations, and Emoji Components

export function AnimatedGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-5">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 animate-pulse" />
      <div className="grid grid-cols-12 gap-1 h-full">
        {Array.from({ length: 144 }).map((_, i) => (
          <div 
            key={i} 
            className="border border-white/5 animate-pulse"
            style={{ animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export function FloatingShapes() {
  const shapes = [
    { emoji: '◼', x: '10%', y: '20%', delay: 0 },
    { emoji: '◆', x: '80%', y: '15%', delay: 1 },
    { emoji: '▲', x: '15%', y: '70%', delay: 2 },
    { emoji: '●', x: '85%', y: '75%', delay: 3 },
    { emoji: '◢', x: '50%', y: '10%', delay: 4 },
  ]
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {shapes.map((shape, i) => (
        <div
          key={i}
          className="absolute text-4xl text-white/10 animate-float"
          style={{
            left: shape.x,
            top: shape.y,
            animationDelay: `${shape.delay}s`,
          }}
        >
          {shape.emoji}
        </div>
      ))}
    </div>
  )
}

export function StatusEmoji({ status, className }: { status: 'online' | 'loading' | 'error' | 'success' | 'green' | 'yellow' | 'red'; className?: string }) {
  const emoji = {
    online: '🟢',
    loading: '🟡',
    error: '🔴',
    success: '✅',
    green: '🟢',
    yellow: '🟡',
    red: '🔴'
  }[status]
  
  return <span className="inline-block animate-pulse">{emoji}</span>
}

export function MetricEmoji({ type }: { type: 'cpu' | 'memory' | 'disk' | 'network' | 'speed' | 'uptime' | 'lightning' | 'cd' | 'globe' | 'rocket' | 'clock' }) {
  const emoji = {
    cpu: '⚡',
    memory: '💾',
    disk: '💿',
    network: '🌐',
    speed: '🚀',
    uptime: '⏱️',
    lightning: '⚡',
    cd: '💿',
    globe: '🌐',
    rocket: '🚀',
    clock: '⏱️'
  }[type]
  
  return <span className="mr-2">{emoji}</span>
}

export function BlackRoadSymbol({ variant = 'default', size, className }: { variant?: 'default' | 'minimal' | 'animated'; size?: number | string; className?: string }) {
  if (variant === 'minimal') {
    return <span className="font-bold text-2xl">●━━</span>
  }
  
  if (variant === 'animated') {
    return (
      <div className="flex items-center gap-1">
        <span className="animate-pulse">●</span>
        <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>━</span>
        <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>━</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-white rounded-full" />
      <div className="w-8 h-0.5 bg-white" />
      <div className="w-3 h-3 border-2 border-white" />
    </div>
  )
}

export function GeometricPattern({ type = 'grid', opacity }: { type?: 'grid' | 'dots' | 'lines' | 'diagonal'; opacity?: number }) {
  if (type === 'dots') {
    return (
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>
    )
  }
  
  if (type === 'lines') {
    return (
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, white, white 1px, transparent 1px, transparent 40px)',
        }} />
      </div>
    )
  }
  
  if (type === 'diagonal') {
    return (
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, white, white 1px, transparent 1px, transparent 40px)',
        }} />
      </div>
    )
  }
  
  return <AnimatedGrid />
}

export function CommandPrompt({ children, command }: { children?: React.ReactNode; command?: string }) {
  return (
    <div className="font-mono text-sm">
      <span className="text-green-400">❯</span>
      <span className="ml-2">{children ?? command}</span>
      <span className="animate-blink ml-1">▋</span>
    </div>
  )
}

export function LoadingBar({ progress = 0 }: { progress?: number }) {
  return (
    <div className="w-full h-1 bg-white/10 overflow-hidden">
      <div 
        className="h-full bg-white transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

const PULSE_COLORS: Record<string, { base: string; ping: string }> = {
  white: { base: 'bg-white', ping: 'bg-white' },
  green: { base: 'bg-green-500', ping: 'bg-green-500' },
  red: { base: 'bg-red-500', ping: 'bg-red-500' },
  yellow: { base: 'bg-yellow-400', ping: 'bg-yellow-400' },
  blue: { base: 'bg-blue-500', ping: 'bg-blue-500' },
  purple: { base: 'bg-purple-500', ping: 'bg-purple-500' },
}

export function PulsingDot({ color = 'white' }: { color?: string }) {
  const classes = PULSE_COLORS[color] || PULSE_COLORS.white
  return (
    <span className="relative flex h-3 w-3">
      <span 
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${classes.ping} opacity-75`}
      />
      <span 
        className={`relative inline-flex rounded-full h-3 w-3 ${classes.base}`}
      />
    </span>
  )
}

export function GlitchText({ children, text }: { children?: string; text?: string }) {
  const content = children ?? text ?? ''
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{content}</span>
      <span
        className="absolute top-0 left-0 text-red-500 animate-glitch-1 opacity-80"
        aria-hidden="true"
      >
        {content}
      </span>
      <span
        className="absolute top-0 left-0 text-blue-500 animate-glitch-2 opacity-80"
        aria-hidden="true"
      >
        {content}
      </span>
    </span>
  )
}

export function ScanLine() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute w-full h-0.5 bg-white/20 animate-scan" />
    </div>
  )
}
