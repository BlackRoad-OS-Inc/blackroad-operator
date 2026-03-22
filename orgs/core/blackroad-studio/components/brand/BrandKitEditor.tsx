'use client'

import { useState } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { useToast } from '@/components/ui/Toast'
import type { BrandKit } from '@/lib/types'

const DEFAULT_KIT: BrandKit = {
  name: 'My Brand',
  primaryColor: '#FF1D6C',
  secondaryColor: '#8844FF',
  accentColor: '#FF6B2B',
  backgroundColor: '#000000',
  textColor: '#FFFFFF',
  fontHeading: 'Space Grotesk',
  fontBody: 'Inter',
  logoUrl: null,
  watermark: false,
  watermarkPosition: 'bottom-right',
  watermarkOpacity: 0.3,
}

interface Props {
  projectId: string
  brandKit: BrandKit | null | undefined
  onClose: () => void
}

export function BrandKitEditor({ projectId, brandKit, onClose }: Props) {
  const { updateBrandKit, saveBrandKit, savedBrandKits, deleteBrandKit } = useProjectStore()
  const { toast } = useToast()
  const [kit, setKit] = useState<BrandKit>(brandKit || DEFAULT_KIT)

  function applyKit() {
    updateBrandKit(projectId, kit)
    toast('Brand kit applied', 'success')
    onClose()
  }

  function saveAsPreset() {
    saveBrandKit(kit)
    toast(`Brand kit "${kit.name}" saved`, 'success')
  }

  function loadPreset(preset: BrandKit) {
    setKit(preset)
    toast(`Loaded "${preset.name}"`, 'info')
  }

  return (
    <div className="space-y-4">
      {/* Saved presets */}
      {savedBrandKits.length > 0 && (
        <div>
          <span className="text-[9px] text-[#555] uppercase tracking-wider">Saved Brand Kits</span>
          <div className="flex gap-2 mt-1 flex-wrap">
            {savedBrandKits.map((preset) => (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#111] border border-[#333] rounded-lg hover:border-[#FF1D6C] transition-colors"
              >
                <div className="flex gap-0.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: preset.primaryColor }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: preset.secondaryColor }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: preset.accentColor }} />
                </div>
                <span className="text-[10px] text-white">{preset.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteBrandKit(preset.name)
                    toast('Deleted', 'info')
                  }}
                  className="text-[9px] text-[#555] hover:text-red-400 ml-1"
                >
                  x
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kit name */}
      <div>
        <span className="text-[9px] text-[#555] uppercase tracking-wider">Brand Name</span>
        <input
          type="text"
          value={kit.name}
          onChange={(e) => setKit({ ...kit, name: e.target.value })}
          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF1D6C] mt-1"
        />
      </div>

      {/* Color palette */}
      <div>
        <span className="text-[9px] text-[#555] uppercase tracking-wider">Colors</span>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { key: 'primaryColor' as const, label: 'Primary' },
            { key: 'secondaryColor' as const, label: 'Secondary' },
            { key: 'accentColor' as const, label: 'Accent' },
            { key: 'backgroundColor' as const, label: 'Background' },
            { key: 'textColor' as const, label: 'Text' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="color"
                value={kit[key]}
                onChange={(e) => setKit({ ...kit, [key]: e.target.value })}
                className="w-8 h-8 bg-transparent border-none cursor-pointer rounded"
              />
              <div>
                <div className="text-[10px] text-white">{label}</div>
                <div className="text-[8px] font-mono text-[#555]">{kit[key]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview swatch */}
      <div className="rounded-xl overflow-hidden border border-[#333]">
        <div className="h-16 flex items-center justify-center" style={{ background: kit.backgroundColor }}>
          <span style={{ color: kit.textColor, fontFamily: kit.fontHeading, fontWeight: 'bold', fontSize: 18 }}>
            {kit.name}
          </span>
        </div>
        <div className="h-2 flex">
          <div className="flex-1" style={{ background: kit.primaryColor }} />
          <div className="flex-1" style={{ background: kit.secondaryColor }} />
          <div className="flex-1" style={{ background: kit.accentColor }} />
        </div>
      </div>

      {/* Fonts */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: 'fontHeading' as const, label: 'Heading Font' },
          { key: 'fontBody' as const, label: 'Body Font' },
        ].map(({ key, label }) => (
          <div key={key}>
            <span className="text-[9px] text-[#555] uppercase tracking-wider">{label}</span>
            <select
              value={kit[key]}
              onChange={(e) => setKit({ ...kit, [key]: e.target.value as BrandKit['fontHeading'] })}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none mt-1"
            >
              <option value="Space Grotesk">Space Grotesk</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Inter">Inter</option>
            </select>
          </div>
        ))}
      </div>

      {/* Watermark */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={kit.watermark}
            onChange={(e) => setKit({ ...kit, watermark: e.target.checked })}
            className="accent-[#FF1D6C]"
          />
          <span className="text-xs text-[#999]">Watermark</span>
        </label>
        {kit.watermark && (
          <div className="flex items-center gap-2">
            <select
              value={kit.watermarkPosition}
              onChange={(e) => setKit({ ...kit, watermarkPosition: e.target.value as BrandKit['watermarkPosition'] })}
              className="bg-[#111] border border-[#333] rounded px-2 py-1 text-[10px] text-white"
            >
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
            <input
              type="range"
              min={10} max={80}
              value={Math.round(kit.watermarkOpacity * 100)}
              onChange={(e) => setKit({ ...kit, watermarkOpacity: parseInt(e.target.value) / 100 })}
              className="w-16 accent-[#FF1D6C]"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={applyKit}
          className="flex-1 py-2.5 bg-gradient-to-r from-[#FF6B2B] via-[#FF2255] to-[#8844FF] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Apply to Project
        </button>
        <button
          onClick={saveAsPreset}
          className="px-4 py-2.5 border border-[#333] text-[#999] rounded-lg text-sm hover:border-[#555] transition-colors"
        >
          Save Kit
        </button>
        <button
          onClick={() => {
            updateBrandKit(projectId, null)
            toast('Brand kit removed', 'info')
            onClose()
          }}
          className="px-4 py-2.5 border border-[#333] text-[#666] rounded-lg text-sm hover:border-red-900 hover:text-red-400 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
