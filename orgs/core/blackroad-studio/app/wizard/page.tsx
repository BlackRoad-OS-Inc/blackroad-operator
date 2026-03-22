'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/stores/project-store'
import { HigglyCharacter } from '@/components/characters/HigglyCharacter'
import { CHARACTER_TEMPLATES } from '@/lib/templates/characters'
import { BACKGROUND_TEMPLATES } from '@/lib/templates/backgrounds'
import { VOICE_OPTIONS } from '@/lib/templates/voices'
import { generateScript, type GeneratedScene } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

const CONTENT_TYPES = [
  { id: 'animated-movie', label: 'Animated Movie', icon: '🎬', desc: 'Full-length animated film with story arcs' },
  { id: 'tv-show', label: 'TV Show / Series', icon: '📺', desc: 'Episodic animated series' },
  { id: 'youtube', label: 'YouTube Video', icon: '▶️', desc: 'YouTube content — explainers, vlogs, essays' },
  { id: 'podcast', label: 'Animated Podcast', icon: '🎙️', desc: 'Podcast with animated characters' },
  { id: 'explainer', label: 'Explainer', icon: '💡', desc: 'Educational or product explainer' },
  { id: 'story', label: 'Kids Story', icon: '📖', desc: 'Children\'s animated story' },
  { id: 'music-video', label: 'Music Video', icon: '🎵', desc: 'Animated music video' },
  { id: 'ad', label: 'Ad / Promo', icon: '📢', desc: 'Short promotional video' },
]

const STYLE_QUESTIONS: { id: string; question: string; options: { value: string; label: string }[] }[] = [
  {
    id: 'tone',
    question: 'What\'s the vibe?',
    options: [
      { value: 'funny', label: 'Funny / Comedy' },
      { value: 'dramatic', label: 'Dramatic / Serious' },
      { value: 'educational', label: 'Educational' },
      { value: 'chill', label: 'Chill / Relaxed' },
      { value: 'inspirational', label: 'Inspirational' },
      { value: 'spooky', label: 'Spooky / Mystery' },
    ],
  },
  {
    id: 'audience',
    question: 'Who\'s watching?',
    options: [
      { value: 'kids', label: 'Kids (3-8)' },
      { value: 'tweens', label: 'Tweens (9-13)' },
      { value: 'teens', label: 'Teens' },
      { value: 'adults', label: 'Adults' },
      { value: 'everyone', label: 'Everyone' },
    ],
  },
  {
    id: 'length',
    question: 'How long?',
    options: [
      { value: '30s', label: '30 seconds' },
      { value: '1min', label: '1 minute' },
      { value: '3min', label: '3 minutes' },
      { value: '5min', label: '5 minutes' },
      { value: '10min', label: '10 minutes' },
      { value: '20min', label: '20 minutes' },
      { value: '40min', label: '40 minutes' },
    ],
  },
  {
    id: 'setting',
    question: 'Where does it take place?',
    options: [
      { value: 'neighborhood', label: 'Neighborhood' },
      { value: 'school', label: 'School' },
      { value: 'park', label: 'Park / Outdoors' },
      { value: 'house-interior', label: 'Home / Indoors' },
      { value: 'space', label: 'Outer Space' },
      { value: 'beach', label: 'Beach' },
      { value: 'night-sky', label: 'Night Time' },
    ],
  },
  {
    id: 'characters',
    question: 'How many characters?',
    options: [
      { value: '1', label: 'Solo (1)' },
      { value: '2', label: 'Duo (2)' },
      { value: '3', label: 'Small Group (3)' },
      { value: '5', label: 'Ensemble (5+)' },
    ],
  },
  {
    id: 'narration',
    question: 'Narration style?',
    options: [
      { value: 'narrator', label: 'Narrator voiceover' },
      { value: 'dialogue-only', label: 'Characters talk to each other' },
      { value: 'mixed', label: 'Mix of both' },
      { value: 'monologue', label: 'One character talks to camera' },
    ],
  },
  {
    id: 'music',
    question: 'Music vibe?',
    options: [
      { value: 'upbeat', label: 'Upbeat / Happy' },
      { value: 'calm', label: 'Calm / Ambient' },
      { value: 'dramatic', label: 'Dramatic / Cinematic' },
      { value: 'playful', label: 'Playful / Bouncy' },
      { value: 'none', label: 'No music' },
    ],
  },
]

export default function WizardPage() {
  const router = useRouter()
  const { createProject, addScene, addCharacterToScene, addDialogue, updateScene } =
    useProjectStore()

  const [step, setStep] = useState(0)
  const [contentType, setContentType] = useState<string | null>(null)
  const [idea, setIdea] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const { toast } = useToast()

  const totalSteps = 2 + STYLE_QUESTIONS.length // type + idea + questions

  function handleAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setStep((s) => s + 1)
  }

  async function handleGenerate() {
    setGenerating(true)
    setAiError(null)

    const name = idea.slice(0, 50) || `My ${contentType ?? 'Video'}`
    const numChars = parseInt(answers.characters ?? '2')
    const selectedChars = CHARACTER_TEMPLATES.slice(0, numChars)

    const sceneCounts: Record<string, number> = {
      '30s': 2, '1min': 3, '3min': 6, '5min': 10,
      '10min': 18, '20min': 35, '40min': 60,
    }
    const numScenes = sceneCounts[answers.length ?? '3min'] ?? 6

    // Try AI script generation first
    let aiScenes: GeneratedScene[] | null = null
    try {
      toast('AI is writing your script...', 'info')
      aiScenes = await generateScript({
        idea,
        contentType: contentType ?? 'story',
        tone: answers.tone ?? 'funny',
        audience: answers.audience ?? 'everyone',
        characters: selectedChars.map((c) => c.name),
        numScenes,
      })
      toast(`AI generated ${aiScenes.length} scenes!`, 'success')
    } catch (err: any) {
      setAiError(err.message)
      toast('AI unavailable — using template generation', 'info')
    }

    // Build the project
    const projectId = createProject(name)
    const setting = answers.setting ?? 'neighborhood'
    const hasNarrator = answers.narration === 'narrator' || answers.narration === 'mixed'

    if (aiScenes && aiScenes.length > 0) {
      // Use AI-generated scenes
      for (const aiScene of aiScenes) {
        const sceneType = aiScene.type === 'title' || aiScene.type === 'end' || aiScene.type === 'narration'
          ? aiScene.type
          : 'dialogue'
        addScene(sceneType as any)

        const currentProject = useProjectStore.getState().getCurrentProject()
        const scenes = currentProject?.scenes ?? []
        const currentScene = scenes[scenes.length - 1]
        if (!currentScene) continue

        // Set background
        const bgId = BACKGROUND_TEMPLATES.find((b) => b.id === aiScene.background)?.id ?? setting
        updateScene(currentScene.id, {
          backgroundId: bgId,
          narration: aiScene.narration,
          transition: sceneType === 'title' ? 'fade' : 'slide-left',
        })

        // Add characters
        if (sceneType !== 'title' && sceneType !== 'end') {
          selectedChars.forEach((char, ci) => {
            addCharacterToScene(currentScene.id, {
              characterId: char.id,
              position: { x: 0.2 + (ci / Math.max(1, selectedChars.length - 1)) * 0.6, y: 0.78 },
              scale: char.size === 'small' ? 0.85 : char.size === 'large' ? 1.15 : 1,
              animation: sceneType === 'narration' ? 'idle' : 'talking',
              enterAnimation: ci === 0 ? 'slide-left' : 'slide-right',
            })
          })
        }

        // Add AI-generated dialogue
        if (aiScene.dialogue) {
          for (const line of aiScene.dialogue) {
            const matchedChar = selectedChars.find(
              (c) => c.name.toLowerCase().includes(line.character.toLowerCase().split(' ').pop()!)
            )
            addDialogue(currentScene.id, {
              characterId: matchedChar?.id ?? null,
              text: line.text,
              voiceId: VOICE_OPTIONS[0].id,
              audioUrl: null,
              audioDurationMs: 0,
            })
          }
        }
      }
    } else {
      // Fallback: template-based generation
      addScene('title')
      const project = useProjectStore.getState().getCurrentProject()
      if (project?.scenes[0]) {
        updateScene(project.scenes[0].id, { narration: name, backgroundId: setting })
      }

      for (let i = 0; i < numScenes - 2; i++) {
        const isNarration = hasNarrator && i % 3 === 0
        addScene(isNarration ? 'narration' : 'dialogue')

        const currentProject = useProjectStore.getState().getCurrentProject()
        const scenes = currentProject?.scenes ?? []
        const currentScene = scenes[scenes.length - 1]
        if (!currentScene) continue

        updateScene(currentScene.id, {
          backgroundId: BACKGROUND_TEMPLATES[i % BACKGROUND_TEMPLATES.length].id,
          transition: i % 4 === 0 ? 'fade' : i % 4 === 1 ? 'slide-left' : 'cut',
        })

        selectedChars.forEach((char, ci) => {
          addCharacterToScene(currentScene.id, {
            characterId: char.id,
            position: { x: 0.2 + (ci / Math.max(1, selectedChars.length - 1)) * 0.6, y: 0.78 },
            scale: char.size === 'small' ? 0.85 : char.size === 'large' ? 1.15 : 1,
            animation: isNarration ? 'idle' : 'talking',
            enterAnimation: ci === 0 ? 'slide-left' : ci === selectedChars.length - 1 ? 'slide-right' : 'bounce-in',
          })
        })

        if (isNarration) {
          updateScene(currentScene.id, { narration: `[Scene ${i + 1} narration]` })
        }
        const linesPerScene = Math.min(numChars, 3)
        for (let l = 0; l < linesPerScene; l++) {
          const char = selectedChars[l % selectedChars.length]
          addDialogue(currentScene.id, {
            characterId: isNarration && l === 0 ? null : char.id,
            text: `[${char.name} — write dialogue here]`,
            voiceId: VOICE_OPTIONS[l % VOICE_OPTIONS.length].id,
            audioUrl: null,
            audioDurationMs: 0,
          })
        }
      }

      addScene('end')
      const finalProject = useProjectStore.getState().getCurrentProject()
      const endScene = finalProject?.scenes[finalProject.scenes.length - 1]
      if (endScene) updateScene(endScene.id, { narration: 'The End' })
    }

    setTimeout(() => {
      router.push(`/${projectId}/script`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#555]">
              Step {step + 1} of {totalSteps}
            </span>
            <span className="text-xs font-mono text-[#555]">
              {Math.round(((step + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B2B] via-[#FF2255] to-[#8844FF] rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 0: Content Type */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">What are you making?</h2>
            <p className="text-[#666] text-sm mb-6">Pick a format and we'll set everything up.</p>
            <div className="grid grid-cols-2 gap-3">
              {CONTENT_TYPES.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => {
                    setContentType(ct.id)
                    setStep(1)
                  }}
                  className="text-left p-5 bg-[#111] border border-[#222] rounded-xl hover:border-[#FF1D6C] transition-colors"
                >
                  <div className="text-2xl mb-2">{ct.icon}</div>
                  <div className="font-semibold text-sm">{ct.label}</div>
                  <div className="text-xs text-[#555] mt-1">{ct.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Describe Your Idea */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Describe your idea</h2>
            <p className="text-[#666] text-sm mb-6">
              Just talk about it. What's the story, topic, or concept?
            </p>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={
                contentType === 'explainer'
                  ? 'Explain how black holes work using fun characters...'
                  : contentType === 'podcast'
                    ? 'Two friends debate whether pizza is better than tacos...'
                    : contentType === 'story'
                      ? 'A little character named Sunny goes on an adventure to find the lost rainbow...'
                      : 'Describe your video idea here...'
              }
              autoFocus
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-5 py-4 text-white placeholder:text-[#444] focus:outline-none focus:border-[#FF1D6C] resize-none h-40 text-lg"
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setStep(0)}
                className="px-5 py-2.5 border border-[#333] text-[#666] rounded-lg text-sm hover:border-[#555]"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!idea.trim()}
                className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Style Questions */}
        {step >= 2 && step < 2 + STYLE_QUESTIONS.length && (
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {STYLE_QUESTIONS[step - 2].question}
            </h2>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {STYLE_QUESTIONS[step - 2].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(STYLE_QUESTIONS[step - 2].id, opt.value)}
                  className={`text-left p-4 bg-[#111] border rounded-xl transition-colors ${
                    answers[STYLE_QUESTIONS[step - 2].id] === opt.value
                      ? 'border-[#FF1D6C]'
                      : 'border-[#222] hover:border-[#444]'
                  }`}
                >
                  <div className="font-medium text-sm">{opt.label}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(step - 1)}
              className="mt-4 px-5 py-2.5 border border-[#333] text-[#666] rounded-lg text-sm hover:border-[#555]"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Generate */}
        {step >= 2 + STYLE_QUESTIONS.length && (
          <div className="text-center">
            {generating ? (
              <div>
                <div className="flex items-center justify-center gap-3 mb-6">
                  {CHARACTER_TEMPLATES.slice(0, 3).map((c, i) => (
                    <div
                      key={c.id}
                      className="animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    >
                      <HigglyCharacter
                        bodyColor={c.bodyColor}
                        accentColor={c.accentColor}
                        faceColor={c.faceColor}
                        eyeColor={c.eyeColor}
                        accessory={c.accessory}
                        width={60}
                        height={84}
                        mouthOpen={i === 1}
                      />
                    </div>
                  ))}
                </div>
                <h2 className="text-xl font-bold mb-2">AI is writing your script...</h2>
                <p className="text-sm text-[#666]">
                  Generating scenes, writing dialogue, placing characters
                </p>
                {aiError && (
                  <p className="text-xs text-amber-400 mt-2">
                    AI unavailable — using smart templates instead
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-2">Ready to create!</h2>
                <p className="text-sm text-[#666] mb-4">
                  "{idea.slice(0, 100)}{idea.length > 100 ? '...' : ''}"
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs font-mono text-[#555]">
                  <span className="bg-[#1a1a1a] px-2 py-1 rounded">{contentType}</span>
                  {Object.entries(answers).map(([k, v]) => (
                    <span key={k} className="bg-[#1a1a1a] px-2 py-1 rounded">
                      {k}: {v}
                    </span>
                  ))}
                </div>
                <button
                  onClick={handleGenerate}
                  className="px-10 py-4 bg-gradient-to-r from-[#FF6B2B] via-[#FF2255] to-[#8844FF] text-white font-bold rounded-xl text-lg hover:opacity-90 transition-opacity"
                >
                  Generate with AI
                </button>
                <div className="mt-4">
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-5 py-2.5 border border-[#333] text-[#666] rounded-lg text-sm hover:border-[#555]"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
