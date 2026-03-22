'use client'

import { useState } from 'react'
import { generateImage } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

const STYLES = [
  { id: 'cartoon', label: 'Cartoon' },
  { id: 'watercolor', label: 'Watercolor' },
  { id: 'pixel', label: 'Pixel Art' },
  { id: 'anime', label: 'Anime' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'realistic', label: 'Realistic' },
]

const PRESET_PROMPTS = [
  'A sunny neighborhood with colorful houses and a blue sky',
  'A magical forest with glowing mushrooms at night',
  'A cozy classroom with chalkboard and desks',
  'An underwater ocean scene with coral and fish',
  'A futuristic city with flying cars and neon lights',
  'A snowy mountain landscape at sunset',
  'A peaceful farm with red barn and rolling hills',
  'A carnival with ferris wheel and cotton candy stands',
]

interface ImageGeneratorProps {
  onImageGenerated: (imageUrl: string, imageId: string) => void
  onClose: () => void
}

export function ImageGenerator({ onImageGenerated, onClose }: ImageGeneratorProps) {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('cartoon')
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    setError(null)
    setPreview(null)

    try {
      const { blob, imageId } = await generateImage(prompt, style)
      const url = URL.createObjectURL(blob)
      setPreview(url)
      toast('Image generated!', 'success')
    } catch (err: any) {
      setError(err.message || 'Generation failed')
      toast('Generation failed — try again', 'error')
    } finally {
      setGenerating(false)
    }
  }

  function handleUse() {
    if (preview) {
      onImageGenerated(preview, `ai-${Date.now()}`)
    }
  }

  return (
    <div className="space-y-5">
      {/* Prompt */}
      <div>
        <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">
          Describe your scene
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A sunny park with a playground and tall oak trees..."
          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-[#444] focus:outline-none focus:border-[#FF1D6C] resize-none h-20"
          autoFocus
        />
      </div>

      {/* Preset prompts */}
      <div>
        <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">
          Quick prompts
        </label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => setPrompt(p)}
              className={`text-[10px] px-2.5 py-1.5 rounded-md border transition-colors ${
                prompt === p
                  ? 'border-[#FF1D6C] text-white bg-[#1a1a1a]'
                  : 'border-[#333] text-[#555] hover:border-[#555] hover:text-[#999]'
              }`}
            >
              {p.slice(0, 40)}...
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">
          Art style
        </label>
        <div className="flex gap-2">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`px-4 py-2 rounded-lg border text-xs font-medium transition-colors ${
                style === s.id
                  ? 'border-[#FF1D6C] text-white bg-[#1a1a1a]'
                  : 'border-[#333] text-[#666] hover:border-[#555]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || generating}
        className="w-full py-3 bg-gradient-to-r from-[#FF6B2B] via-[#FF2255] to-[#8844FF] text-white font-semibold rounded-xl text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        {generating ? 'Generating...' : 'Generate Image'}
      </button>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-3">
          <div className="border border-[#333] rounded-xl overflow-hidden">
            <img src={preview} alt="Generated" className="w-full aspect-video object-cover" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="flex-1 px-4 py-2.5 border border-[#333] text-[#999] rounded-lg text-sm hover:border-[#555] transition-colors"
            >
              Regenerate
            </button>
            <button
              onClick={handleUse}
              className="flex-1 px-4 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Use This Image
            </button>
          </div>
        </div>
      )}

      {/* Cancel */}
      <button
        onClick={onClose}
        className="w-full text-center text-xs text-[#555] hover:text-[#999] transition-colors py-2"
      >
        Cancel
      </button>
    </div>
  )
}
