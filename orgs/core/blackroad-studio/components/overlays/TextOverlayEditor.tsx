'use client'

import { useState } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { useToast } from '@/components/ui/Toast'
import type { TextOverlay, TextAnimation, TextOverlayStyle } from '@/lib/types'
import { TEXT_OVERLAY_DEFAULTS } from '@/lib/constants'

const ANIMATIONS: { id: TextAnimation; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'fade-in', label: 'Fade In' },
  { id: 'typewriter', label: 'Typewriter' },
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'slide-down', label: 'Slide Down' },
  { id: 'slide-left', label: 'Slide Left' },
  { id: 'slide-right', label: 'Slide Right' },
  { id: 'bounce-in', label: 'Bounce In' },
  { id: 'scale-in', label: 'Scale In' },
  { id: 'spin-in', label: 'Spin In' },
  { id: 'glitch', label: 'Glitch' },
  { id: 'wave', label: 'Wave' },
]

const FONTS = [
  { id: 'Space Grotesk', label: 'Space Grotesk' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono' },
  { id: 'Inter', label: 'Inter' },
  { id: 'Comic Sans MS', label: 'Comic Sans' },
] as const

const PRESET_STYLES: { label: string; style: Partial<TextOverlayStyle>; animation: TextAnimation }[] = [
  {
    label: 'Title',
    style: { fontSize: 72, bold: true, color: '#FFFFFF', outline: true, outlineColor: '#000000' },
    animation: 'scale-in',
  },
  {
    label: 'Subtitle',
    style: { fontSize: 36, bold: false, color: '#CCCCCC', outline: false, backgroundColor: 'rgba(0,0,0,0.6)' },
    animation: 'fade-in',
  },
  {
    label: 'Callout',
    style: { fontSize: 28, bold: true, color: '#FFFF00', outline: true, outlineColor: '#000000' },
    animation: 'bounce-in',
  },
  {
    label: 'Lower Third',
    style: { fontSize: 24, bold: true, color: '#FFFFFF', backgroundColor: 'rgba(255,29,108,0.85)', align: 'left' as const },
    animation: 'slide-left',
  },
  {
    label: 'Countdown',
    style: { fontSize: 120, bold: true, color: '#FF2255', fontFamily: 'JetBrains Mono' as const, outline: true, outlineColor: '#000000' },
    animation: 'scale-in',
  },
  {
    label: 'Code',
    style: { fontSize: 20, bold: false, color: '#00FF88', fontFamily: 'JetBrains Mono' as const, backgroundColor: 'rgba(0,0,0,0.9)' },
    animation: 'typewriter',
  },
]

interface Props {
  sceneId: string
  overlays: TextOverlay[]
  sceneDurationFrames: number
}

export function TextOverlayEditor({ sceneId, overlays, sceneDurationFrames }: Props) {
  const { addTextOverlay, updateTextOverlay, removeTextOverlay } = useProjectStore()
  const { toast } = useToast()
  const [editingId, setEditingId] = useState<string | null>(null)

  const editing = overlays.find((o) => o.id === editingId)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-mono text-[#666] uppercase tracking-wider">
          Text Overlays ({overlays.length})
        </label>
        <button
          onClick={() => {
            addTextOverlay(sceneId)
            toast('Text overlay added', 'success')
          }}
          className="text-xs px-3 py-1 bg-[#222] hover:bg-[#333] rounded-md transition-colors"
        >
          + Add Text
        </button>
      </div>

      {/* Preset quick-add */}
      <div className="flex gap-2 flex-wrap mb-3">
        {PRESET_STYLES.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              addTextOverlay(sceneId, {
                text: preset.label === 'Countdown' ? '3' : preset.label,
                style: { ...TEXT_OVERLAY_DEFAULTS, ...preset.style },
                animation: preset.animation,
              })
              toast(`Added "${preset.label}" text`, 'success')
            }}
            className="text-[10px] px-2 py-1 bg-[#1a1a1a] border border-[#333] rounded hover:border-[#555] transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Overlay list */}
      <div className="space-y-2">
        {overlays.map((overlay) => (
          <div
            key={overlay.id}
            className={`bg-[#0a0a0a] border rounded-lg p-3 cursor-pointer transition-colors ${
              editingId === overlay.id ? 'border-[#FF1D6C]' : 'border-[#222] hover:border-[#444]'
            }`}
            onClick={() => setEditingId(editingId === overlay.id ? null : overlay.id)}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-sm font-medium truncate max-w-[200px]"
                style={{
                  color: overlay.style.color,
                  fontFamily: overlay.style.fontFamily,
                  fontWeight: overlay.style.bold ? 'bold' : 'normal',
                  fontStyle: overlay.style.italic ? 'italic' : 'normal',
                }}
              >
                {overlay.text}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-[#555]">{overlay.animation}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTextOverlay(sceneId, overlay.id)
                    toast('Text removed', 'info')
                  }}
                  className="text-[10px] text-[#555] hover:text-red-400"
                >
                  x
                </button>
              </div>
            </div>

            {/* Expanded editor */}
            {editingId === overlay.id && editing && (
              <div className="mt-3 space-y-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                {/* Text content */}
                <textarea
                  value={editing.text}
                  onChange={(e) => updateTextOverlay(sceneId, editing.id, { text: e.target.value })}
                  className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#FF1D6C] resize-none h-16"
                />

                {/* Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-[#555]">X Position (%)</span>
                    <input
                      type="range"
                      min={0} max={100}
                      value={editing.position.x}
                      onChange={(e) => updateTextOverlay(sceneId, editing.id, { position: { ...editing.position, x: parseInt(e.target.value) } })}
                      className="w-full accent-[#FF1D6C]"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#555]">Y Position (%)</span>
                    <input
                      type="range"
                      min={0} max={100}
                      value={editing.position.y}
                      onChange={(e) => updateTextOverlay(sceneId, editing.id, { position: { ...editing.position, y: parseInt(e.target.value) } })}
                      className="w-full accent-[#FF1D6C]"
                    />
                  </div>
                </div>

                {/* Font & size */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[9px] text-[#555]">Font</span>
                    <select
                      value={editing.style.fontFamily}
                      onChange={(e) => updateTextOverlay(sceneId, editing.id, { style: { ...editing.style, fontFamily: e.target.value as TextOverlayStyle['fontFamily'] } })}
                      className="w-full bg-[#111] border border-[#333] rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                    >
                      {FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#555]">Size</span>
                    <input
                      type="number"
                      min={12} max={200}
                      value={editing.style.fontSize}
                      onChange={(e) => updateTextOverlay(sceneId, editing.id, { style: { ...editing.style, fontSize: parseInt(e.target.value) || 48 } })}
                      className="w-full bg-[#111] border border-[#333] rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#555]">Color</span>
                    <input
                      type="color"
                      value={editing.style.color}
                      onChange={(e) => updateTextOverlay(sceneId, editing.id, { style: { ...editing.style, color: e.target.value } })}
                      className="w-full h-7 bg-transparent border-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Style toggles */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: 'bold', label: 'B', active: editing.style.bold },
                    { key: 'italic', label: 'I', active: editing.style.italic },
                    { key: 'outline', label: 'Outline', active: editing.style.outline },
                    { key: 'shadow', label: 'Shadow', active: editing.style.shadow },
                  ].map(({ key, label, active }) => (
                    <button
                      key={key}
                      onClick={() => updateTextOverlay(sceneId, editing.id, { style: { ...editing.style, [key]: !active } })}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        active ? 'bg-[#FF1D6C] text-white' : 'bg-[#222] text-[#666]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Animation */}
                <div>
                  <span className="text-[9px] text-[#555]">Animation</span>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {ANIMATIONS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => updateTextOverlay(sceneId, editing.id, { animation: a.id })}
                        className={`px-2 py-0.5 rounded text-[9px] transition-colors ${
                          editing.animation === a.id ? 'bg-[#FF1D6C] text-white' : 'bg-[#222] text-[#666] hover:bg-[#333]'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timing */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-[#555]">Start (seconds)</span>
                    <input
                      type="number"
                      min={0}
                      max={Math.floor(sceneDurationFrames / 30)}
                      value={Math.round(editing.startFrame / 30)}
                      onChange={(e) => updateTextOverlay(sceneId, editing.id, { startFrame: (parseInt(e.target.value) || 0) * 30 })}
                      className="w-full bg-[#111] border border-[#333] rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#555]">Duration (seconds)</span>
                    <input
                      type="number"
                      min={1}
                      max={Math.floor(sceneDurationFrames / 30)}
                      value={Math.round(editing.durationFrames / 30)}
                      onChange={(e) => updateTextOverlay(sceneId, editing.id, { durationFrames: (parseInt(e.target.value) || 3) * 30 })}
                      className="w-full bg-[#111] border border-[#333] rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Opacity & rotation */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-[#555]">Opacity ({Math.round(editing.style.opacity * 100)}%)</span>
                    <input
                      type="range"
                      min={10} max={100}
                      value={Math.round(editing.style.opacity * 100)}
                      onChange={(e) => updateTextOverlay(sceneId, editing.id, { style: { ...editing.style, opacity: parseInt(e.target.value) / 100 } })}
                      className="w-full accent-[#FF1D6C]"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#555]">Rotation ({editing.style.rotation}°)</span>
                    <input
                      type="range"
                      min={-180} max={180}
                      value={editing.style.rotation}
                      onChange={(e) => updateTextOverlay(sceneId, editing.id, { style: { ...editing.style, rotation: parseInt(e.target.value) } })}
                      className="w-full accent-[#FF1D6C]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
