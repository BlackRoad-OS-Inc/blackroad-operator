'use client'

import { useState } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { useToast } from '@/components/ui/Toast'
import { STICKER_TEMPLATES, STICKER_CATEGORIES } from '@/lib/templates/stickers'
import type { StickerPlacement } from '@/lib/types'

interface Props {
  sceneId: string
  stickers: StickerPlacement[]
  sceneDurationFrames: number
}

export function StickerPicker({ sceneId, stickers, sceneDurationFrames }: Props) {
  const { addSticker, updateSticker, removeSticker } = useProjectStore()
  const { toast } = useToast()
  const [showPicker, setShowPicker] = useState(false)
  const [category, setCategory] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editing = stickers.find((s) => s.id === editingId)
  const filteredStickers = category
    ? STICKER_TEMPLATES.filter((s) => s.category === category)
    : STICKER_TEMPLATES

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-mono text-[#666] uppercase tracking-wider">
          Stickers & Shapes ({stickers.length})
        </label>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-xs px-3 py-1 bg-[#222] hover:bg-[#333] rounded-md transition-colors"
        >
          {showPicker ? 'Close' : '+ Add Sticker'}
        </button>
      </div>

      {/* Sticker picker */}
      {showPicker && (
        <div className="bg-[#0a0a0a] border border-[#333] rounded-xl p-3 mb-3 animate-fade-in">
          <div className="flex gap-1 mb-2 flex-wrap">
            <button
              onClick={() => setCategory(null)}
              className={`px-2 py-0.5 rounded text-[9px] transition-colors ${
                !category ? 'bg-[#FF1D6C] text-white' : 'bg-[#222] text-[#666]'
              }`}
            >
              All
            </button>
            {STICKER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-2 py-0.5 rounded text-[9px] transition-colors ${
                  category === cat.id ? 'bg-[#FF1D6C] text-white' : 'bg-[#222] text-[#666]'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-8 gap-1">
            {filteredStickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => {
                  addSticker(sceneId, {
                    stickerId: sticker.id,
                    position: { x: 50, y: 50 },
                    scale: 1,
                    rotation: 0,
                    animation: 'none',
                    startFrame: 0,
                    durationFrames: sceneDurationFrames,
                  })
                  toast(`Added ${sticker.name}`, 'success')
                  setShowPicker(false)
                }}
                className="w-10 h-10 flex items-center justify-center bg-[#111] border border-[#222] rounded-lg hover:border-[#FF1D6C] hover:scale-110 transition-all text-lg"
                title={sticker.name}
              >
                {sticker.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Placed stickers */}
      <div className="space-y-2">
        {stickers.map((sticker) => {
          const template = STICKER_TEMPLATES.find((t) => t.id === sticker.stickerId)
          if (!template) return null
          return (
            <div
              key={sticker.id}
              className={`bg-[#0a0a0a] border rounded-lg p-3 cursor-pointer transition-colors ${
                editingId === sticker.id ? 'border-[#FF1D6C]' : 'border-[#222] hover:border-[#444]'
              }`}
              onClick={() => setEditingId(editingId === sticker.id ? null : sticker.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{template.emoji}</span>
                  <span className="text-xs text-[#999]">{template.name}</span>
                  <span className="text-[9px] text-[#555]">{sticker.animation !== 'none' ? sticker.animation : ''}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSticker(sceneId, sticker.id)
                    toast('Sticker removed', 'info')
                  }}
                  className="text-[10px] text-[#555] hover:text-red-400"
                >
                  x
                </button>
              </div>

              {editingId === sticker.id && editing && (
                <div className="mt-3 space-y-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                  {/* Position */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-[#555]">X (%)</span>
                      <input
                        type="range" min={0} max={100}
                        value={editing.position.x}
                        onChange={(e) => updateSticker(sceneId, editing.id, { position: { ...editing.position, x: parseInt(e.target.value) } })}
                        className="w-full accent-[#FF1D6C]"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#555]">Y (%)</span>
                      <input
                        type="range" min={0} max={100}
                        value={editing.position.y}
                        onChange={(e) => updateSticker(sceneId, editing.id, { position: { ...editing.position, y: parseInt(e.target.value) } })}
                        className="w-full accent-[#FF1D6C]"
                      />
                    </div>
                  </div>

                  {/* Scale & rotation */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-[#555]">Scale ({editing.scale.toFixed(1)}x)</span>
                      <input
                        type="range" min={20} max={300}
                        value={Math.round(editing.scale * 100)}
                        onChange={(e) => updateSticker(sceneId, editing.id, { scale: parseInt(e.target.value) / 100 })}
                        className="w-full accent-[#FF1D6C]"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#555]">Rotation ({editing.rotation}°)</span>
                      <input
                        type="range" min={-180} max={180}
                        value={editing.rotation}
                        onChange={(e) => updateSticker(sceneId, editing.id, { rotation: parseInt(e.target.value) })}
                        className="w-full accent-[#FF1D6C]"
                      />
                    </div>
                  </div>

                  {/* Animation */}
                  <div>
                    <span className="text-[9px] text-[#555]">Animation</span>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {(['none', 'bounce', 'spin', 'pulse', 'shake', 'float'] as const).map((a) => (
                        <button
                          key={a}
                          onClick={() => updateSticker(sceneId, editing.id, { animation: a })}
                          className={`px-2 py-0.5 rounded text-[9px] transition-colors ${
                            editing.animation === a ? 'bg-[#FF1D6C] text-white' : 'bg-[#222] text-[#666]'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
