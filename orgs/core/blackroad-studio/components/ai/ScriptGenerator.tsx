'use client'

import { useState } from 'react'
import { generateScript, type GeneratedScene } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface ScriptGeneratorProps {
  idea: string
  contentType: string
  tone: string
  audience: string
  characterNames: string[]
  numScenes: number
  onGenerated: (scenes: GeneratedScene[]) => void
  onError?: (error: string) => void
}

export function ScriptGenerator({
  idea,
  contentType,
  tone,
  audience,
  characterNames,
  numScenes,
  onGenerated,
  onError,
}: ScriptGeneratorProps) {
  const { toast } = useToast()
  const [generating, setGenerating] = useState(false)
  const [scenes, setScenes] = useState<GeneratedScene[] | null>(null)

  async function handleGenerate() {
    setGenerating(true)
    try {
      const result = await generateScript({
        idea,
        contentType,
        tone,
        audience,
        characters: characterNames,
        numScenes,
      })
      setScenes(result)
      toast(`Generated ${result.length} scenes!`, 'success')
    } catch (err: any) {
      const msg = err.message || 'Script generation failed'
      toast(msg, 'error')
      onError?.(msg)
    } finally {
      setGenerating(false)
    }
  }

  function handleAccept() {
    if (scenes) onGenerated(scenes)
  }

  return (
    <div className="space-y-4">
      {!scenes ? (
        <div className="text-center">
          <p className="text-sm text-[#666] mb-4">
            AI will generate a {numScenes}-scene script based on your idea.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-8 py-3.5 bg-gradient-to-r from-[#FF6B2B] via-[#FF2255] to-[#8844FF] text-white font-bold rounded-xl text-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Writing script...
              </span>
            ) : (
              'Generate with AI'
            )}
          </button>
        </div>
      ) : (
        <div>
          <h3 className="font-semibold mb-3">Generated Script Preview</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {scenes.map((scene, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-[#555]">Scene {i + 1}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    scene.type === 'title' ? 'bg-orange-900/30 text-orange-400'
                    : scene.type === 'end' ? 'bg-gray-900/30 text-gray-400'
                    : scene.type === 'narration' ? 'bg-purple-900/30 text-purple-400'
                    : 'bg-blue-900/30 text-blue-400'
                  }`}>
                    {scene.type}
                  </span>
                </div>
                {scene.narration && (
                  <p className="text-xs text-[#888] italic mb-1">{scene.narration}</p>
                )}
                {scene.dialogue?.map((line, j) => (
                  <p key={j} className="text-xs text-[#ccc]">
                    <span className="text-[#FF1D6C] font-medium">{line.character}:</span> {line.text}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 px-4 py-2.5 border border-[#333] text-[#999] rounded-lg text-sm hover:border-[#555] transition-colors"
            >
              {generating ? 'Regenerating...' : 'Regenerate'}
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Use This Script
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
