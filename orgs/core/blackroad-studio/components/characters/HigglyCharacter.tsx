'use client'

import React from 'react'

interface HigglyCharacterProps {
  bodyColor: string
  accentColor: string
  faceColor: string
  eyeColor: string
  accessory: 'none' | 'hat' | 'bow' | 'glasses' | 'crown' | 'headband'
  mouthOpen?: boolean
  expression?: 'happy' | 'neutral' | 'surprised' | 'sad'
  width?: number
  height?: number
  className?: string
}

/**
 * Little Miss / Mr. Men style character:
 * - Big round/oval body (body IS the head — one big shape)
 * - Face drawn directly on the body
 * - Tiny stick arms and legs
 * - Bold, simple, bright
 */
export function HigglyCharacter({
  bodyColor,
  accentColor,
  faceColor,
  eyeColor,
  accessory,
  mouthOpen = false,
  expression = 'happy',
  width = 200,
  height = 260,
  className,
}: HigglyCharacterProps) {
  const cx = 100
  const cy = 100
  const bodyRx = 65
  const bodyRy = 72

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 260"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shadow */}
      <ellipse cx={cx} cy={245} rx={40} ry={8} fill="rgba(0,0,0,0.12)" />

      {/* Tiny stick legs */}
      <line x1={cx - 20} y1={cy + bodyRy - 10} x2={cx - 25} y2={230} stroke={darken(bodyColor, 0.2)} strokeWidth={5} strokeLinecap="round" />
      <line x1={cx + 20} y1={cy + bodyRy - 10} x2={cx + 25} y2={230} stroke={darken(bodyColor, 0.2)} strokeWidth={5} strokeLinecap="round" />

      {/* Tiny shoes */}
      <ellipse cx={cx - 28} cy={234} rx={10} ry={6} fill={accentColor} />
      <ellipse cx={cx + 28} cy={234} rx={10} ry={6} fill={accentColor} />

      {/* Tiny stick arms */}
      <line x1={cx - bodyRx + 5} y1={cy + 15} x2={cx - bodyRx - 20} y2={cy + 45} stroke={darken(bodyColor, 0.2)} strokeWidth={5} strokeLinecap="round" />
      <line x1={cx + bodyRx - 5} y1={cy + 15} x2={cx + bodyRx + 20} y2={cy + 45} stroke={darken(bodyColor, 0.2)} strokeWidth={5} strokeLinecap="round" />

      {/* Tiny hands */}
      <circle cx={cx - bodyRx - 22} cy={cy + 48} r={6} fill={faceColor} />
      <circle cx={cx + bodyRx + 22} cy={cy + 48} r={6} fill={faceColor} />

      {/* Main body — one big oval/circle (body IS head, Mr. Men style) */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={bodyRx}
        ry={bodyRy}
        fill={bodyColor}
        stroke={darken(bodyColor, 0.12)}
        strokeWidth={3}
      />

      {/* Body highlight — shine effect */}
      <ellipse
        cx={cx - 20}
        cy={cy - 20}
        rx={22}
        ry={35}
        fill="rgba(255,255,255,0.15)"
        transform={`rotate(-15 ${cx - 20} ${cy - 20})`}
      />

      {/* Cheeks */}
      <ellipse cx={cx - 32} cy={cy + 12} rx={12} ry={8} fill="rgba(255,150,150,0.3)" />
      <ellipse cx={cx + 32} cy={cy + 12} rx={12} ry={8} fill="rgba(255,150,150,0.3)" />

      {/* Eyes */}
      <Eyes cx={cx} cy={cy - 8} eyeColor={eyeColor} expression={expression} />

      {/* Nose — tiny dot */}
      <circle cx={cx} cy={cy + 8} r={4} fill={darken(faceColor, 0.1)} />

      {/* Mouth */}
      <Mouth cx={cx} cy={cy + 22} open={mouthOpen} expression={expression} />

      {/* Accessory — sits on top of the body oval */}
      <Accessory type={accessory} cx={cx} topY={cy - bodyRy} color={accentColor} />
    </svg>
  )
}

function Eyes({
  cx,
  cy,
  eyeColor,
  expression,
}: {
  cx: number
  cy: number
  eyeColor: string
  expression: string
}) {
  const gap = 22

  if (expression === 'surprised') {
    return (
      <>
        <circle cx={cx - gap} cy={cy} r={11} fill="white" stroke="#ddd" strokeWidth={1} />
        <circle cx={cx + gap} cy={cy} r={11} fill="white" stroke="#ddd" strokeWidth={1} />
        <circle cx={cx - gap} cy={cy} r={6} fill={eyeColor} />
        <circle cx={cx + gap} cy={cy} r={6} fill={eyeColor} />
        <circle cx={cx - gap + 2} cy={cy - 2} r={2.5} fill="white" />
        <circle cx={cx + gap + 2} cy={cy - 2} r={2.5} fill="white" />
      </>
    )
  }

  if (expression === 'sad') {
    return (
      <>
        <circle cx={cx - gap} cy={cy} r={9} fill="white" stroke="#ddd" strokeWidth={1} />
        <circle cx={cx + gap} cy={cy} r={9} fill="white" stroke="#ddd" strokeWidth={1} />
        <circle cx={cx - gap} cy={cy + 2} r={5} fill={eyeColor} />
        <circle cx={cx + gap} cy={cy + 2} r={5} fill={eyeColor} />
        {/* Worried eyebrows */}
        <line x1={cx - gap - 8} y1={cy - 16} x2={cx - gap + 6} y2={cy - 13} stroke={eyeColor} strokeWidth={3} strokeLinecap="round" />
        <line x1={cx + gap + 8} y1={cy - 16} x2={cx + gap - 6} y2={cy - 13} stroke={eyeColor} strokeWidth={3} strokeLinecap="round" />
      </>
    )
  }

  // Happy / neutral — classic Mr. Men big oval eyes
  return (
    <>
      <ellipse cx={cx - gap} cy={cy} rx={10} ry={12} fill="white" stroke="#ddd" strokeWidth={1} />
      <ellipse cx={cx + gap} cy={cy} rx={10} ry={12} fill="white" stroke="#ddd" strokeWidth={1} />
      <circle cx={cx - gap} cy={cy + 1} r={5} fill={eyeColor} />
      <circle cx={cx + gap} cy={cy + 1} r={5} fill={eyeColor} />
      <circle cx={cx - gap + 1.5} cy={cy - 1} r={2} fill="white" />
      <circle cx={cx + gap + 1.5} cy={cy - 1} r={2} fill="white" />
    </>
  )
}

function Mouth({
  cx,
  cy,
  open,
  expression,
}: {
  cx: number
  cy: number
  open: boolean
  expression: string
}) {
  if (open) {
    // Big open mouth — Mr. Men style
    return (
      <>
        <ellipse cx={cx} cy={cy + 2} rx={14} ry={12} fill="#333" />
        <ellipse cx={cx} cy={cy - 2} rx={14} ry={5} fill="#E74C3C" />
      </>
    )
  }

  if (expression === 'surprised') {
    return <ellipse cx={cx} cy={cy + 2} rx={10} ry={12} fill="#333" />
  }

  if (expression === 'sad') {
    return (
      <path
        d={`M${cx - 14} ${cy + 6} Q${cx} ${cy - 6} ${cx + 14} ${cy + 6}`}
        stroke="#333"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
    )
  }

  // Big happy grin — THE classic Little Miss smile
  return (
    <path
      d={`M${cx - 18} ${cy - 2} Q${cx} ${cy + 18} ${cx + 18} ${cy - 2}`}
      stroke="#333"
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    />
  )
}

function Accessory({
  type,
  cx,
  topY,
  color,
}: {
  type: string
  cx: number
  topY: number
  color: string
}) {
  switch (type) {
    case 'hat':
      return (
        <g>
          <ellipse cx={cx} cy={topY + 8} rx={45} ry={10} fill={darken(color, 0.1)} />
          <rect x={cx - 25} y={topY - 30} width={50} height={40} rx={12} fill={color} stroke={darken(color, 0.15)} strokeWidth={2} />
        </g>
      )
    case 'bow':
      return (
        <g transform={`translate(${cx}, ${topY + 2})`}>
          <path d="M0 0 L-16 -10 L-14 10 Z" fill={color} />
          <path d="M0 0 L16 -10 L14 10 Z" fill={color} />
          <circle cx={0} cy={0} r={5} fill={darken(color, 0.25)} />
        </g>
      )
    case 'crown':
      return (
        <polygon
          points={`${cx - 28},${topY + 8} ${cx - 20},${topY - 22} ${cx - 10},${topY - 5} ${cx},${topY - 28} ${cx + 10},${topY - 5} ${cx + 20},${topY - 22} ${cx + 28},${topY + 8}`}
          fill={color}
          stroke={darken(color, 0.15)}
          strokeWidth={2}
        />
      )
    case 'glasses':
      return (
        <g>
          <circle cx={cx - 22} cy={topY + 72} r={14} fill="none" stroke={color} strokeWidth={4} />
          <circle cx={cx + 22} cy={topY + 72} r={14} fill="none" stroke={color} strokeWidth={4} />
          <line x1={cx - 8} y1={topY + 72} x2={cx + 8} y2={topY + 72} stroke={color} strokeWidth={4} />
          <line x1={cx - 36} y1={topY + 72} x2={cx - 48} y2={topY + 64} stroke={color} strokeWidth={3} strokeLinecap="round" />
          <line x1={cx + 36} y1={topY + 72} x2={cx + 48} y2={topY + 64} stroke={color} strokeWidth={3} strokeLinecap="round" />
        </g>
      )
    case 'headband':
      return (
        <path
          d={`M${cx - 55} ${topY + 30} Q${cx} ${topY - 10} ${cx + 55} ${topY + 30}`}
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          fill="none"
        />
      )
    default:
      return null
  }
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - amount)))
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - amount)))
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - amount)))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export default HigglyCharacter
