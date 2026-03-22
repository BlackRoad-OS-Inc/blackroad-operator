'use client'

import { useProjectStore } from '@/stores/project-store'
import { useRouter, useParams } from 'next/navigation'
import { useState, useRef, useCallback } from 'react'
import { BACKGROUND_TEMPLATES } from '@/lib/templates/backgrounds'
import { SceneThumbnail } from '@/components/ui/SceneThumbnail'
import { ImageGenerator } from '@/components/ai/ImageGenerator'
import { TextOverlayEditor } from '@/components/overlays/TextOverlayEditor'
import { StickerPicker } from '@/components/overlays/StickerPicker'
import { SFXPicker } from '@/components/overlays/SFXPicker'
import { useToast } from '@/components/ui/Toast'
import type { Scene } from '@/lib/types'

const SCENE_TYPES: { type: Scene['type']; label: string; icon: string; desc: string }[] = [
  { type: 'title', label: 'Title Card', icon: '🎬', desc: 'Opening title with text' },
  { type: 'dialogue', label: 'Dialogue', icon: '💬', desc: 'Characters talking to each other' },
  { type: 'narration', label: 'Narration', icon: '📖', desc: 'Narrator speaks over a scene' },
  { type: 'end', label: 'End Card', icon: '🏁', desc: 'Closing credits and "The End"' },
]

export default function ScriptPage() {
  const params = useParams()
  const router = useRouter()
  const {
    getCurrentProject,
    addScene,
    duplicateScene,
    updateScene,
    removeScene,
    reorderScenes,
    addDialogue,
    updateDialogue,
    removeDialogue,
    setCurrentScene,
    currentSceneId,
  } = useProjectStore()
  const { toast } = useToast()

  const [showAddScene, setShowAddScene] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const project = getCurrentProject()
  if (!project) return <div className="p-8 text-[#666]">Loading project...</div>

  const selectedScene = project.scenes.find((s) => s.id === currentSceneId)

  return (
    <div className="flex h-screen">
      {/* Scene List */}
      <div className="w-80 border-r border-[#222] flex flex-col">
        <div className="px-4 py-4 border-b border-[#222] flex items-center justify-between">
          <h2 className="font-semibold text-sm">Scenes ({project.scenes.length})</h2>
          <button
            onClick={() => setShowAddScene(true)}
            className="text-xs px-3 py-1.5 bg-[#222] hover:bg-[#333] rounded-md transition-colors"
          >
            + Add
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {project.scenes.length === 0 && (
            <div className="p-6 text-center text-[#555] text-sm">
              <p className="mb-3">No scenes yet.</p>
              <button
                onClick={() => setShowAddScene(true)}
                className="text-[#FF1D6C] hover:underline text-xs"
              >
                Add your first scene
              </button>
            </div>
          )}

          {project.scenes.map((scene, index) => (
            <div
              key={scene.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverIndex(index)
              }}
              onDragEnd={() => {
                if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
                  reorderScenes(dragIndex, dragOverIndex)
                  toast('Scene reordered', 'success')
                }
                setDragIndex(null)
                setDragOverIndex(null)
              }}
              onClick={() => setCurrentScene(scene.id)}
              className={`px-3 py-2.5 border-b border-[#1a1a1a] cursor-pointer transition-all group ${
                currentSceneId === scene.id
                  ? 'bg-[#1a1a1a] border-l-2 border-l-[#FF1D6C]'
                  : 'hover:bg-[#111]'
              } ${dragIndex === index ? 'opacity-40' : ''} ${
                dragOverIndex === index && dragIndex !== index ? 'border-t-2 border-t-[#FF1D6C]' : ''
              }`}
            >
              <div className="flex gap-3 items-start">
                {/* Drag handle */}
                <div className="text-[#333] group-hover:text-[#666] cursor-grab active:cursor-grabbing mt-2 text-[10px] leading-none select-none">
                  ⠿
                </div>
                {/* Mini thumbnail */}
                <SceneThumbnail scene={scene} width={64} height={36} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-mono text-[#666]">
                      {index + 1}. {scene.type}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateScene(scene.id)
                          toast('Scene duplicated', 'success')
                        }}
                        className="text-[#555] hover:text-white text-[10px] px-1"
                        title="Duplicate"
                      >
                        dup
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeScene(scene.id)
                          toast('Scene removed', 'info')
                        }}
                        className="text-[#444] hover:text-red-400 text-xs px-1"
                      >
                        x
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#999] truncate">
                    {scene.type === 'title' || scene.type === 'end'
                      ? scene.narration || 'Untitled'
                      : scene.dialogue.length > 0
                        ? scene.dialogue[0].text
                        : scene.narration || 'Empty scene'}
                  </div>
                  <div className="text-[9px] font-mono text-[#444] mt-0.5">
                    {scene.characters.length}ch · {scene.dialogue.length}ln · {scene.transition}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next step */}
        <div className="px-4 py-4 border-t border-[#222]">
          <button
            onClick={() => router.push(`/${params.projectId}/characters`)}
            className="w-full py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Next: Characters
          </button>
        </div>
      </div>

      {/* Scene Editor */}
      <div className="flex-1 overflow-y-auto">
        {selectedScene ? (
          <SceneEditor scene={selectedScene} />
        ) : (
          <div className="flex items-center justify-center h-full text-[#555] text-sm">
            {project.scenes.length === 0
              ? 'Add a scene to get started'
              : 'Select a scene to edit'}
          </div>
        )}
      </div>

      {/* Add Scene Modal */}
      {showAddScene && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowAddScene(false)}
        >
          <div
            className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-lg animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Add Scene</h3>
            <div className="grid grid-cols-2 gap-3">
              {SCENE_TYPES.map((st) => (
                <button
                  key={st.type}
                  onClick={() => {
                    addScene(st.type)
                    setShowAddScene(false)
                    toast(`Added ${st.label}`, 'success')
                  }}
                  className="text-left p-4 bg-[#0a0a0a] border border-[#333] rounded-xl hover:border-[#FF1D6C] transition-colors"
                >
                  <div className="text-2xl mb-2">{st.icon}</div>
                  <div className="font-semibold text-sm mb-1">{st.label}</div>
                  <div className="text-xs text-[#666]">{st.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SceneEditor({ scene }: { scene: Scene }) {
  const { updateScene, addDialogue, updateDialogue, removeDialogue } = useProjectStore()
  const { toast } = useToast()
  const [showImageGen, setShowImageGen] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'overlays' | 'audio'>('content')

  return (
    <div className="p-6 max-w-3xl animate-fade-in">
      {/* Scene header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold capitalize">{scene.type} Scene</h2>
          <span className="text-xs font-mono text-[#666] bg-[#1a1a1a] px-2 py-1 rounded">
            {scene.id.slice(0, 8)}
          </span>
        </div>
        <button
          onClick={() => setShowImageGen(true)}
          className="px-3 py-1.5 text-xs bg-gradient-to-r from-[#FF6B2B] to-[#FF2255] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          AI Generate Background
        </button>
      </div>

      {/* Editor tabs */}
      <div className="flex gap-4 mb-6 border-b border-[#222] pb-2">
        {([
          { id: 'content' as const, label: 'Content' },
          { id: 'overlays' as const, label: `Overlays (${(scene.overlays?.length || 0) + (scene.stickers?.length || 0)})` },
          { id: 'audio' as const, label: `Audio (${scene.sfx?.length || 0})` },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-xs font-medium pb-2 border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-[#FF1D6C] text-white' : 'border-transparent text-[#666] hover:text-[#999]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* AI Image Generator Modal */}
      {showImageGen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowImageGen(false)}
        >
          <div
            className="bg-[#111] border border-[#333] rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-6">Generate Background with AI</h3>
            <ImageGenerator
              onImageGenerated={(imageUrl, imageId) => {
                toast('Background generated! Applied to scene.', 'success')
                setShowImageGen(false)
              }}
              onClose={() => setShowImageGen(false)}
            />
          </div>
        </div>
      )}

      {/* Content tab */}
      {activeTab === 'content' && (
        <>
          {/* Duration */}
          <div className="mb-6">
            <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              min={1}
              max={300}
              value={Math.round(scene.durationFrames / 30)}
              onChange={(e) => updateScene(scene.id, { durationFrames: parseInt(e.target.value || '5') * 30 })}
              className="w-24 bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF1D6C]"
            />
          </div>

          {/* Background picker */}
          <div className="mb-6">
            <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">
              Background
            </label>
            <div className="flex gap-2 flex-wrap">
              {BACKGROUND_TEMPLATES.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => updateScene(scene.id, { backgroundId: bg.id })}
                  className={`w-20 h-12 rounded-lg border-2 transition-all overflow-hidden relative group ${
                    scene.backgroundId === bg.id
                      ? 'border-[#FF1D6C] scale-105'
                      : 'border-[#333] hover:border-[#555]'
                  }`}
                  title={bg.name}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      background: `linear-gradient(180deg, ${bg.skyColor} 60%, ${bg.groundColor} 100%)`,
                    }}
                  />
                  <span className="absolute inset-0 flex items-end justify-center pb-0.5 text-[8px] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/40 to-transparent">
                    {bg.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Transition picker */}
          <div className="mb-6">
            <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">
              Transition
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['cut', 'fade', 'slide-left', 'slide-right', 'wipe', 'zoom'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateScene(scene.id, { transition: t })}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    scene.transition === t
                      ? 'border-[#FF1D6C] text-white bg-[#1a1a1a]'
                      : 'border-[#333] text-[#666] hover:border-[#555]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title / Narration text */}
          {(scene.type === 'title' || scene.type === 'end' || scene.type === 'narration') && (
            <div className="mb-6">
              <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-2">
                {scene.type === 'narration' ? 'Narration Text' : 'Title Text'}
              </label>
              <textarea
                value={scene.narration ?? ''}
                onChange={(e) => updateScene(scene.id, { narration: e.target.value })}
                placeholder={
                  scene.type === 'title'
                    ? 'Enter your title...'
                    : scene.type === 'end'
                      ? 'The End'
                      : 'Write the narration...'
                }
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-[#444] focus:outline-none focus:border-[#FF1D6C] resize-none h-24"
              />
            </div>
          )}

          {/* Dialogue lines */}
          {(scene.type === 'dialogue' || scene.type === 'narration') && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-[#666] uppercase tracking-wider">
                  Dialogue Lines ({scene.dialogue.length})
                </label>
                <button
                  onClick={() => {
                    addDialogue(scene.id, {
                      characterId: null,
                      text: '',
                      voiceId: 'narrator-warm',
                      audioUrl: null,
                      audioDurationMs: 0,
                    })
                    toast('Line added', 'success')
                  }}
                  className="text-xs px-3 py-1 bg-[#222] hover:bg-[#333] rounded-md transition-colors"
                >
                  + Add Line
                </button>
              </div>

              <div className="space-y-3">
                {scene.dialogue.map((line, i) => (
                  <div key={line.id} className="bg-[#111] border border-[#222] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-[#555]">Line {i + 1}</span>
                      <button
                        onClick={() => {
                          removeDialogue(scene.id, line.id)
                          toast('Line removed', 'info')
                        }}
                        className="text-xs text-[#555] hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={line.text}
                      onChange={(e) =>
                        updateDialogue(scene.id, line.id, { text: e.target.value })
                      }
                      placeholder="What does this character say?"
                      className="w-full bg-[#0a0a0a] border border-[#222] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#555] resize-none h-16"
                    />
                    {line.audioUrl && (
                      <div className="mt-2 text-xs text-green-500 font-mono">
                        Audio generated ({Math.round(line.audioDurationMs / 1000)}s)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Overlays tab */}
      {activeTab === 'overlays' && (
        <div className="space-y-6">
          <TextOverlayEditor
            sceneId={scene.id}
            overlays={scene.overlays || []}
            sceneDurationFrames={scene.durationFrames}
          />
          <div className="border-t border-[#222] pt-6">
            <StickerPicker
              sceneId={scene.id}
              stickers={scene.stickers || []}
              sceneDurationFrames={scene.durationFrames}
            />
          </div>
        </div>
      )}

      {/* Audio tab */}
      {activeTab === 'audio' && (
        <SFXPicker sceneId={scene.id} sfx={scene.sfx || []} />
      )}
    </div>
  )
}
