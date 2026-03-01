'use client'

import { useEffect, useState, type ReactNode } from 'react'

type BackgroundConfig = {
  mode: 'none' | 'image'
  fileId: string | null
  opacity: number
  blur: number
  fit: 'cover' | 'contain' | 'tile'
}

const WORKER_URL =
  process.env.NEXT_PUBLIC_BACKGROUNDS_URL ||
  'https://blackroad-backgrounds.blackroad.workers.dev'

const DEFAULT_CONFIG: BackgroundConfig = {
  mode: 'none',
  fileId: null,
  opacity: 0.15,
  blur: 0,
  fit: 'cover',
}

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<BackgroundConfig>(DEFAULT_CONFIG)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    // Try to load config from the backgrounds worker
    fetch(`${WORKER_URL}/backgrounds/config`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.mode === 'image' && data.fileId) {
          setConfig(data)
          setImageUrl(`${WORKER_URL}/backgrounds/${data.fileId}`)
        }
      })
      .catch(() => {
        // Worker not available — no background, that's fine
      })
  }, [])

  const showBackground = config.mode === 'image' && imageUrl

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {showBackground && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            opacity: config.opacity,
            filter: config.blur > 0 ? `blur(${config.blur}px)` : undefined,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: config.fit === 'tile' ? 'auto' : config.fit,
            backgroundRepeat: config.fit === 'tile' ? 'repeat' : 'no-repeat',
            backgroundPosition: 'center',
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}
