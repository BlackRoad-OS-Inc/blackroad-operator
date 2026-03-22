'use client'

import { useState } from 'react'
import Draggable from 'react-draggable'
import { X, Minus, Square, Maximize2 } from 'lucide-react'

export interface WindowProps {
  id: string
  title: string
  children: React.ReactNode
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
  onClose?: () => void
  onMinimize?: () => void
  icon?: React.ReactNode
}

export default function Window({
  id,
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 400 },
  onClose,
  onMinimize,
  icon,
}: WindowProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [size, setSize] = useState(initialSize)
  const [position, setPosition] = useState(initialPosition)

  const handleMaximize = () => {
    if (isMaximized) {
      setSize(initialSize)
      setPosition(initialPosition)
    } else {
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 80 })
      setPosition({ x: 20, y: 40 })
    }
    setIsMaximized(!isMaximized)
  }

  return (
    <Draggable
      handle=".window-header"
      defaultPosition={initialPosition}
      position={isMaximized ? { x: 20, y: 40 } : undefined}
      disabled={isMaximized}
    >
      <div
        className="window"
        style={{
          position: 'absolute',
          width: size.width,
          height: size.height,
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1000,
        }}
      >
        {/* Window Header */}
        <div
          className="window-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            cursor: isMaximized ? 'default' : 'move',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icon}
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>
              {title}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onMinimize && (
              <button
                onClick={onMinimize}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#fff',
                }}
              >
                <Minus size={16} />
              </button>
            )}
            <button
              onClick={handleMaximize}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#fff',
              }}
            >
              {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,0,0,0.7)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#fff',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Window Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#0a0a0a',
            color: '#e0e0e0',
          }}
        >
          {children}
        </div>
      </div>
    </Draggable>
  )
}

function Minimize2({ size }: { size: number }) {
  return <Square size={size} />
}
