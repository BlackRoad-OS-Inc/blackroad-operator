'use client'

import { useState } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { useToast } from '@/components/ui/Toast'
import { SFX_TEMPLATES, SFX_CATEGORIES } from '@/lib/templates/sfx'
import type { SoundEffect } from '@/lib/types'

interface Props {
  sceneId: string
  sfx: SoundEffect[]
}

export function SFXPicker({ sceneId, sfx }: Props) {
  const { addSFX, removeSFX } = useProjectStore()
  const { toast } = useToast()
  const [showPicker, setShowPicker] = useState(false)
  const [category, setCategory] = useState<string | null>(null)

  const filteredSFX = category
    ? SFX_TEMPLATES.filter((s) => s.category === category)
    : SFX_TEMPLATES

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-mono text-[#666] uppercase tracking-wider">
          Sound Effects ({sfx.length})
        </label>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-xs px-3 py-1 bg-[#222] hover:bg-[#333] rounded-md transition-colors"
        >
          {showPicker ? 'Close' : '+ Add SFX'}
        </button>
      </div>

      {/* SFX picker */}
      {showPicker && (
        <div className="bg-[#0a0a0a] border border-[#333] rounded-xl p-3 mb-3 animate-fade-in">
          <div className="flex gap-1 mb-3 flex-wrap">
            <button
              onClick={() => setCategory(null)}
              className={`px-2 py-0.5 rounded text-[9px] transition-colors ${
                !category ? 'bg-[#FF1D6C] text-white' : 'bg-[#222] text-[#666]'
              }`}
            >
              All
            </button>
            {SFX_CATEGORIES.map((cat) => (
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
          <div className="space-y-1">
            {filteredSFX.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  addSFX(sceneId, { sfxId: template.id, startFrame: 0, volume: 0.8 })
                  toast(`Added ${template.name}`, 'success')
                  setShowPicker(false)
                }}
                className="w-full text-left flex items-center justify-between bg-[#111] border border-[#222] rounded-lg px-3 py-2 hover:border-[#FF1D6C] transition-colors"
              >
                <div>
                  <span className="text-xs font-medium text-white">{template.name}</span>
                  <span className="text-[9px] text-[#555] ml-2">{template.description}</span>
                </div>
                <span className="text-[9px] font-mono text-[#444]">{template.durationMs}ms</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Added SFX */}
      <div className="space-y-1">
        {sfx.map((effect) => {
          const template = SFX_TEMPLATES.find((t) => t.id === effect.sfxId)
          if (!template) return null
          return (
            <div
              key={effect.id}
              className="flex items-center justify-between bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#FF6B2B] rounded-full" />
                <span className="text-xs text-white">{template.name}</span>
                <span className="text-[9px] text-[#555] capitalize">{template.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-[#444]">{template.durationMs}ms</span>
                <button
                  onClick={() => {
                    removeSFX(sceneId, effect.id)
                    toast('SFX removed', 'info')
                  }}
                  className="text-[10px] text-[#555] hover:text-red-400"
                >
                  x
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
