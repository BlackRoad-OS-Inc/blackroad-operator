'use client'

import { useState } from 'react'
import { HigglyCharacter } from './HigglyCharacter'
import type { CharacterTemplate } from '@/lib/types'

const BODY_COLORS = [
  '#FFD93D', '#FF7675', '#74B9FF', '#00B894', '#A29BFE',
  '#FD79A8', '#E17055', '#81ECEC', '#636E72', '#FDCB6E',
  '#55EFC4', '#E74C3C', '#9B59B6', '#E056A0', '#34495E',
  '#F39C12', '#1ABC9C', '#3498DB', '#E91E63', '#FF6B2B',
]

const FACE_COLORS = ['#FFEAA7', '#FFE082', '#DFE6E9', '#FAB1A0', '#B2BEC3', '#F8B4C8']
const EYE_COLORS = ['#2D3436', '#6C5CE7', '#0984E3', '#00B894', '#E17055']
const ACCESSORIES: CharacterTemplate['accessory'][] = ['none', 'hat', 'bow', 'glasses', 'crown', 'headband']
const SIZES: CharacterTemplate['size'][] = ['small', 'medium', 'large']

interface CharacterCreatorProps {
  onSave: (character: CharacterTemplate) => void
  onCancel: () => void
}

export function CharacterCreator({ onSave, onCancel }: CharacterCreatorProps) {
  const [name, setName] = useState('')
  const [bodyColor, setBodyColor] = useState('#FFD93D')
  const [accentColor, setAccentColor] = useState('#FF6B6B')
  const [faceColor, setFaceColor] = useState('#FFEAA7')
  const [eyeColor, setEyeColor] = useState('#2D3436')
  const [size, setSize] = useState<CharacterTemplate['size']>('medium')
  const [accessory, setAccessory] = useState<CharacterTemplate['accessory']>('none')

  function handleSave() {
    if (!name.trim()) return
    onSave({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      bodyColor,
      accentColor,
      faceColor,
      eyeColor,
      size,
      accessory,
    })
  }

  return (
    <div className="flex gap-8">
      {/* Preview */}
      <div className="flex flex-col items-center gap-4">
        <div className="bg-[#0a0a0a] border border-[#333] rounded-2xl p-8">
          <HigglyCharacter
            bodyColor={bodyColor}
            accentColor={accentColor}
            faceColor={faceColor}
            eyeColor={eyeColor}
            accessory={accessory}
            expression="happy"
            width={160}
            height={208}
          />
        </div>
        <div className="flex gap-3">
          {(['happy', 'neutral', 'surprised', 'sad'] as const).map((expr) => (
            <div key={expr} className="flex flex-col items-center gap-1">
              <HigglyCharacter
                bodyColor={bodyColor}
                accentColor={accentColor}
                faceColor={faceColor}
                eyeColor={eyeColor}
                accessory={accessory}
                expression={expr}
                width={48}
                height={62}
              />
              <span className="text-[9px] text-[#555]">{expr}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 space-y-5">
        {/* Name */}
        <div>
          <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Miss Awesome..."
            autoFocus
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder:text-[#444] focus:outline-none focus:border-[#FF1D6C] text-sm"
          />
        </div>

        {/* Body Color */}
        <div>
          <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">Body Color</label>
          <div className="flex gap-2 flex-wrap">
            {BODY_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setBodyColor(c); setAccentColor(darken(c, 0.2)) }}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  bodyColor === c ? 'border-white scale-110' : 'border-transparent hover:border-[#555]'
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Face Color */}
        <div>
          <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">Face</label>
          <div className="flex gap-2">
            {FACE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setFaceColor(c)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  faceColor === c ? 'border-white scale-110' : 'border-transparent hover:border-[#555]'
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Eye Color */}
        <div>
          <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">Eyes</label>
          <div className="flex gap-2">
            {EYE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setEyeColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  eyeColor === c ? 'border-white scale-110' : 'border-transparent hover:border-[#555]'
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">Size</label>
          <div className="flex gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-4 py-2 rounded-lg border text-xs font-medium capitalize transition-colors ${
                  size === s ? 'border-[#FF1D6C] text-white bg-[#1a1a1a]' : 'border-[#333] text-[#666] hover:border-[#555]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Accessory */}
        <div>
          <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">Accessory</label>
          <div className="flex gap-2 flex-wrap">
            {ACCESSORIES.map((a) => (
              <button
                key={a}
                onClick={() => setAccessory(a)}
                className={`px-4 py-2 rounded-lg border text-xs font-medium capitalize transition-colors ${
                  accessory === a ? 'border-[#FF1D6C] text-white bg-[#1a1a1a]' : 'border-[#333] text-[#666] hover:border-[#555]'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-[#333] text-[#999] rounded-lg hover:border-[#555] transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2.5 bg-white text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity text-sm"
          >
            Save Character
          </button>
        </div>
      </div>
    </div>
  )
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - amount)))
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - amount)))
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - amount)))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
