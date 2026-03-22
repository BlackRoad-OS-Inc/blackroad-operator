'use client'

import { useProjectStore } from '@/stores/project-store'
import { useRouter, useParams } from 'next/navigation'
import { VOICE_OPTIONS } from '@/lib/templates/voices'
import { CHARACTER_TEMPLATES } from '@/lib/templates/characters'
import { useState, useRef } from 'react'
import { generateTTS as generateCloudTTS } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

export default function VoicePage() {
  const params = useParams()
  const router = useRouter()
  const { getCurrentProject, updateDialogue, customCharacters } = useProjectStore()
  const { toast } = useToast()
  const [generating, setGenerating] = useState<string | null>(null)
  const [previewVoice, setPreviewVoice] = useState<string | null>(null)
  const [useAiTTS, setUseAiTTS] = useState(true)
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})

  const project = getCurrentProject()
  if (!project) return <div className="p-8 text-[#666]">Loading...</div>

  const allCharacters = [...CHARACTER_TEMPLATES, ...customCharacters]

  const allDialogue = project.scenes.flatMap((scene) =>
    scene.dialogue.map((line) => ({ ...line, sceneId: scene.id, sceneOrder: scene.order }))
  )

  const generatedCount = allDialogue.filter((l) => l.audioUrl).length

  async function generateTTS(sceneId: string, lineId: string, text: string, voiceId: string) {
    if (!text.trim()) return
    setGenerating(lineId)

    try {
      if (useAiTTS) {
        // Use Cloudflare Workers AI TTS
        const { blob, audioId } = await generateCloudTTS(text, voiceId, lineId)
        const audioUrl = URL.createObjectURL(blob)

        // Get duration from the audio
        const audio = new Audio(audioUrl)
        await new Promise<void>((resolve) => {
          audio.onloadedmetadata = () => resolve()
          audio.onerror = () => resolve()
        })

        updateDialogue(sceneId, lineId, {
          audioDurationMs: Math.round((audio.duration || 3) * 1000),
          audioUrl,
        })
        audioRefs.current[lineId] = audio
        toast('Audio generated with AI', 'success')
      } else {
        // Fallback: Web Speech API
        const utterance = new SpeechSynthesisUtterance(text)
        const voices = window.speechSynthesis.getVoices()
        const voice = VOICE_OPTIONS.find((v) => v.id === voiceId)

        const systemVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (voice?.gender === 'female' ? v.name.includes('Female') || v.name.includes('Samantha') : true)
        )
        if (systemVoice) utterance.voice = systemVoice

        const words = text.split(/\s+/).length
        const estimatedMs = Math.round((words / 150) * 60 * 1000)

        utterance.onend = () => {
          updateDialogue(sceneId, lineId, {
            audioDurationMs: estimatedMs,
            audioUrl: `tts://${voiceId}/${encodeURIComponent(text)}`,
          })
          setGenerating(null)
          toast('Audio generated', 'success')
        }

        window.speechSynthesis.speak(utterance)
        return
      }
    } catch (err: any) {
      toast(err.message || 'TTS failed — trying browser fallback', 'error')
      // Fallback to browser TTS
      setUseAiTTS(false)
    }

    setGenerating(null)
  }

  function playAudio(lineId: string) {
    const audio = audioRefs.current[lineId]
    if (audio) {
      audio.currentTime = 0
      audio.play()
    }
  }

  function previewVoiceSample(voiceId: string) {
    const voice = VOICE_OPTIONS.find((v) => v.id === voiceId)
    if (!voice) return
    setPreviewVoice(voiceId)
    const utterance = new SpeechSynthesisUtterance(voice.sampleText)
    utterance.onend = () => setPreviewVoice(null)
    window.speechSynthesis.speak(utterance)
  }

  async function generateAll() {
    const ungenerated = allDialogue.filter((l) => l.text.trim() && !l.audioUrl)
    toast(`Generating ${ungenerated.length} audio clips...`, 'info')
    for (const line of ungenerated) {
      await generateTTS(line.sceneId, line.id, line.text, line.voiceId)
    }
    toast('All audio generated!', 'success')
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Choose Voices</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[#666] cursor-pointer">
            <input
              type="checkbox"
              checked={useAiTTS}
              onChange={(e) => setUseAiTTS(e.target.checked)}
              className="accent-[#FF1D6C]"
            />
            AI Voice
          </label>
          <span className="text-[10px] font-mono text-[#555] bg-[#1a1a1a] px-2 py-1 rounded">
            {generatedCount}/{allDialogue.length} generated
          </span>
        </div>
      </div>
      <p className="text-sm text-[#666] mb-8">
        Assign a voice to each dialogue line and generate audio.
        {useAiTTS ? ' Using Cloudflare Workers AI for TTS.' : ' Using browser speech synthesis.'}
      </p>

      {/* Voice catalog */}
      <div className="mb-8">
        <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider mb-3">
          Available Voices
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VOICE_OPTIONS.map((voice) => (
            <button
              key={voice.id}
              onClick={() => previewVoiceSample(voice.id)}
              className={`text-left p-3 bg-[#111] border rounded-xl transition-colors ${
                previewVoice === voice.id
                  ? 'border-[#FF1D6C]'
                  : 'border-[#222] hover:border-[#444]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold mb-1">{voice.name}</div>
                {previewVoice === voice.id && (
                  <span className="w-2 h-2 bg-[#FF1D6C] rounded-full animate-pulse" />
                )}
              </div>
              <div className="text-[10px] text-[#555] capitalize">
                {voice.gender} · {voice.style}
              </div>
              <div className="text-[10px] text-[#444] mt-1 truncate">{voice.sampleText}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Dialogue lines */}
      <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider mb-3">
        Assign Voices to Lines ({allDialogue.length} lines)
      </h3>

      {allDialogue.length === 0 && (
        <div className="text-sm text-[#555] bg-[#111] border border-[#222] rounded-xl p-6 text-center">
          No dialogue lines yet. Go back to Script to add some.
        </div>
      )}

      <div className="space-y-3">
        {allDialogue.map((line) => {
          const charTemplate = allCharacters.find((c) => c.id === line.characterId)
          return (
            <div
              key={line.id}
              className={`bg-[#111] border rounded-xl p-4 transition-colors ${
                line.audioUrl ? 'border-green-900/30' : 'border-[#222]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {charTemplate && (
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ background: charTemplate.bodyColor }}
                    />
                  )}
                  <span className="text-xs font-mono text-[#666]">
                    Scene {line.sceneOrder + 1} · {charTemplate?.name ?? 'Narrator'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {line.audioUrl && (
                    <>
                      <button
                        onClick={() => playAudio(line.id)}
                        className="text-[10px] text-green-500 hover:text-green-400 font-mono"
                      >
                        Play
                      </button>
                      <span className="text-[10px] text-green-500/60 font-mono">
                        {(line.audioDurationMs / 1000).toFixed(1)}s
                      </span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-sm text-[#ccc] mb-3">
                &ldquo;{line.text || 'Empty line'}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <select
                  value={line.voiceId}
                  onChange={(e) =>
                    updateDialogue(line.sceneId, line.id, { voiceId: e.target.value })
                  }
                  className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF1D6C]"
                >
                  {VOICE_OPTIONS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.gender}, {v.style})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    generateTTS(line.sceneId, line.id, line.text, line.voiceId)
                  }
                  disabled={!line.text || generating === line.id}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                    line.audioUrl
                      ? 'bg-[#222] hover:bg-[#333] text-[#999]'
                      : 'bg-gradient-to-r from-[#FF6B2B] to-[#FF2255] text-white hover:opacity-90'
                  } disabled:opacity-40`}
                >
                  {generating === line.id ? (
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    </span>
                  ) : line.audioUrl ? 'Redo' : 'Generate'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bulk generate */}
      {allDialogue.length > 0 && (
        <button
          onClick={generateAll}
          disabled={generating !== null}
          className="mt-6 w-full py-3 bg-gradient-to-r from-[#FF6B2B] via-[#FF2255] to-[#8844FF] text-white font-semibold rounded-xl text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          Generate All Audio ({allDialogue.filter((l) => l.text && !l.audioUrl).length} remaining)
        </button>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-[#222]">
        <button
          onClick={() => router.push(`/${params.projectId}/characters`)}
          className="px-5 py-2.5 border border-[#333] text-[#999] rounded-lg text-sm hover:border-[#555] transition-colors"
        >
          Characters
        </button>
        <button
          onClick={() => router.push(`/${params.projectId}/preview`)}
          className="px-5 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Next: Preview
        </button>
      </div>
    </div>
  )
}
