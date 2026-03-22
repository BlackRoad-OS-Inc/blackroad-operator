'use client'

import { useProjectStore } from '@/stores/project-store'
import { useToast } from '@/components/ui/Toast'
import type { CaptionSettings } from '@/lib/types'

const STYLES: { id: CaptionSettings['style']; label: string; desc: string }[] = [
  { id: 'default', label: 'Default', desc: 'White text on dark bar' },
  { id: 'bold', label: 'Bold', desc: 'Larger white text with outline' },
  { id: 'karaoke', label: 'Karaoke', desc: 'Yellow highlighted text' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean text, no background' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Subtle bar, elegant font' },
]

interface Props {
  projectId: string
  captions: CaptionSettings | null | undefined
}

export function CaptionEditor({ projectId, captions }: Props) {
  const { updateCaptions } = useProjectStore()
  const { toast } = useToast()

  const settings: CaptionSettings = captions || {
    enabled: false,
    style: 'default',
    position: 'bottom',
    fontSize: 'medium',
    backgroundColor: 'rgba(0,0,0,0.7)',
    textColor: '#FFFFFF',
    outline: false,
  }

  function update(updates: Partial<CaptionSettings>) {
    updateCaptions(projectId, { ...settings, ...updates })
  }

  return (
    <div className="space-y-3">
      {/* Enable toggle */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => {
              update({ enabled: e.target.checked })
              toast(e.target.checked ? 'Auto-captions enabled' : 'Captions disabled', 'success')
            }}
            className="accent-[#FF1D6C]"
          />
          <span className="text-xs font-medium text-white">Auto-Captions</span>
        </label>
        <span className="text-[9px] text-[#555]">Burns subtitles from dialogue into video</span>
      </div>

      {settings.enabled && (
        <>
          {/* Style presets */}
          <div>
            <span className="text-[9px] text-[#555] uppercase tracking-wider">Style</span>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => update({ style: s.id })}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    settings.style === s.id
                      ? 'border-[#FF1D6C] bg-[#1a1a1a]'
                      : 'border-[#222] hover:border-[#444]'
                  }`}
                >
                  <div className="text-[10px] font-medium text-white">{s.label}</div>
                  <div className="text-[8px] text-[#555]">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <span className="text-[9px] text-[#555] uppercase tracking-wider">Position</span>
            <div className="flex gap-2 mt-1">
              {(['top', 'middle', 'bottom'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => update({ position: pos })}
                  className={`px-3 py-1 rounded text-[10px] transition-colors ${
                    settings.position === pos ? 'bg-[#FF1D6C] text-white' : 'bg-[#222] text-[#666]'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <span className="text-[9px] text-[#555] uppercase tracking-wider">Size</span>
            <div className="flex gap-2 mt-1">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => update({ fontSize: size })}
                  className={`px-3 py-1 rounded text-[10px] transition-colors ${
                    settings.fontSize === size ? 'bg-[#FF1D6C] text-white' : 'bg-[#222] text-[#666]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-[#555]">Text</span>
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) => update({ textColor: e.target.value })}
                className="w-6 h-6 bg-transparent border-none cursor-pointer"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.outline}
                onChange={(e) => update({ outline: e.target.checked })}
                className="accent-[#FF1D6C]"
              />
              <span className="text-[9px] text-[#555]">Outline</span>
            </label>
          </div>

          {/* Preview */}
          <div className="bg-[#222] rounded-xl h-16 flex items-end justify-center pb-3 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#444]">
              Video Preview
            </div>
            <div
              className="relative z-10 px-4 py-1 rounded text-center"
              style={{
                backgroundColor: settings.style === 'minimal' || settings.style === 'karaoke'
                  ? 'transparent'
                  : settings.backgroundColor,
                color: settings.style === 'karaoke' ? '#FFFF00' : settings.textColor,
                fontSize: settings.fontSize === 'small' ? 10 : settings.fontSize === 'large' ? 14 : 12,
                fontWeight: settings.style === 'bold' ? 'bold' : 'normal',
                textShadow: settings.outline ? '1px 1px 2px #000, -1px -1px 2px #000' : 'none',
              }}
            >
              Sample caption text appears here
            </div>
          </div>
        </>
      )}
    </div>
  )
}
