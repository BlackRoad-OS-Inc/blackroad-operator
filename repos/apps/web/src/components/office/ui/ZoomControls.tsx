"use client"

import { useState, useEffect, useRef } from 'react'
import { ZOOM_MIN, ZOOM_MAX } from '../constants'

interface ZoomControlsProps {
  zoom: number
  onZoomChange: (zoom: number) => void
}

const btnBase: React.CSSProperties = {
  width: 36,
  height: 36,
  padding: 0,
  background: 'rgba(20, 20, 25, 0.85)',
  backdropFilter: 'blur(12px)',
  color: 'rgba(255, 255, 255, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 8,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
}

const FADE_DELAY_MS = 1200
const HIDE_DELAY_MS = 1800
const FADE_DURATION_SEC = 0.5

export default function ZoomControls({ zoom, onZoomChange }: ZoomControlsProps) {
  const [hovered, setHovered] = useState<'minus' | 'plus' | null>(null)
  const [showLevel, setShowLevel] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevZoomRef = useRef(zoom)

  const minDisabled = zoom <= ZOOM_MIN
  const maxDisabled = zoom >= ZOOM_MAX

  useEffect(() => {
    if (zoom === prevZoomRef.current) return
    prevZoomRef.current = zoom

    if (timerRef.current) clearTimeout(timerRef.current)
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)

    setShowLevel(true)
    setFadeOut(false)

    fadeTimerRef.current = setTimeout(() => {
      setFadeOut(true)
    }, FADE_DELAY_MS)

    timerRef.current = setTimeout(() => {
      setShowLevel(false)
      setFadeOut(false)
    }, HIDE_DELAY_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [zoom])

  return (
    <>
      {/* Zoom level indicator at top-center */}
      {showLevel && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            background: 'rgba(20, 20, 25, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            padding: '4px 12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            fontSize: '15px',
            color: 'rgba(255, 255, 255, 0.8)',
            userSelect: 'none',
            opacity: fadeOut ? 0 : 1,
            transition: `opacity ${FADE_DURATION_SEC}s ease-out`,
            pointerEvents: 'none',
          }}
        >
          {zoom}x
        </div>
      )}

      {/* Vertically stacked buttons — top-left */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <button
          onClick={() => onZoomChange(zoom + 1)}
          disabled={maxDisabled}
          onMouseEnter={() => setHovered('plus')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background: hovered === 'plus' && !maxDisabled ? 'rgba(255,255,255,0.12)' : btnBase.background,
            cursor: maxDisabled ? 'default' : 'pointer',
            opacity: maxDisabled ? 0.4 : 1,
          }}
          title="Zoom in (Ctrl+Scroll)"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <line x1="9" y1="3" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button
          onClick={() => onZoomChange(zoom - 1)}
          disabled={minDisabled}
          onMouseEnter={() => setHovered('minus')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background: hovered === 'minus' && !minDisabled ? 'rgba(255,255,255,0.12)' : btnBase.background,
            cursor: minDisabled ? 'default' : 'pointer',
            opacity: minDisabled ? 0.4 : 1,
          }}
          title="Zoom out (Ctrl+Scroll)"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </>
  )
}
