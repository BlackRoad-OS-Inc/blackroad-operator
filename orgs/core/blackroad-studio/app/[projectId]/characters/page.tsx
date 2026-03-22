'use client'

import { useProjectStore } from '@/stores/project-store'
import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { HigglyCharacter } from '@/components/characters/HigglyCharacter'
import { CharacterCreator } from '@/components/characters/CharacterCreator'
import { CHARACTER_TEMPLATES } from '@/lib/templates/characters'
import { useToast } from '@/components/ui/Toast'
import type { CharacterTemplate } from '@/lib/types'

export default function CharactersPage() {
  const params = useParams()
  const router = useRouter()
  const {
    getCurrentProject,
    currentSceneId,
    addCharacterToScene,
    removeCharacterFromScene,
    setCurrentScene,
    customCharacters,
    addCustomCharacter,
    removeCustomCharacter,
  } = useProjectStore()
  const { toast } = useToast()
  const [showCreator, setShowCreator] = useState(false)

  const project = getCurrentProject()
  if (!project) return <div className="p-8 text-[#666]">Loading...</div>

  const scene = project.scenes.find((s) => s.id === currentSceneId) ?? project.scenes[0]
  const allCharacters = [...CHARACTER_TEMPLATES, ...customCharacters]

  function handleAddCharacter(char: CharacterTemplate) {
    if (!scene) return
    addCharacterToScene(scene.id, {
      characterId: char.id,
      position: {
        x: 0.2 + Math.random() * 0.6,
        y: 0.75 + Math.random() * 0.1,
      },
      scale: char.size === 'small' ? 0.8 : char.size === 'large' ? 1.2 : 1,
      animation: 'idle',
      enterAnimation: 'bounce-in',
    })
    toast(`Added ${char.name}`, 'success')
  }

  function handleCreateCharacter(char: CharacterTemplate) {
    addCustomCharacter(char)
    setShowCreator(false)
    toast(`Created ${char.name}!`, 'success')
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Choose Characters</h2>
        <button
          onClick={() => setShowCreator(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#FF6B2B] via-[#FF2255] to-[#8844FF] text-white font-semibold rounded-lg text-xs hover:opacity-90 transition-opacity"
        >
          + Create Character
        </button>
      </div>
      <p className="text-sm text-[#666] mb-6">
        Add characters to each scene. Click a character to add them.
      </p>

      {/* Scene selector */}
      {project.scenes.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {project.scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentScene(s.id)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                s.id === scene?.id
                  ? 'border-[#FF1D6C] text-white bg-[#1a1a1a]'
                  : 'border-[#333] text-[#666] hover:border-[#555]'
              }`}
            >
              Scene {i + 1}: {s.type}
            </button>
          ))}
        </div>
      )}

      {!scene ? (
        <div className="text-[#555]">Create a scene first in the Script tab.</div>
      ) : (
        <>
          {/* Current characters in scene */}
          {scene.characters.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider mb-3">
                In This Scene ({scene.characters.length})
              </h3>
              <div className="flex gap-4 flex-wrap">
                {scene.characters.map((placement) => {
                  const template = allCharacters.find(
                    (c) => c.id === placement.characterId
                  )
                  if (!template) return null
                  return (
                    <div
                      key={placement.characterId}
                      className="relative group bg-[#111] border border-[#333] rounded-xl p-4 flex flex-col items-center animate-fade-in"
                    >
                      <HigglyCharacter
                        bodyColor={template.bodyColor}
                        accentColor={template.accentColor}
                        faceColor={template.faceColor}
                        eyeColor={template.eyeColor}
                        accessory={template.accessory}
                        expression="happy"
                        width={80}
                        height={112}
                      />
                      <span className="text-xs mt-2 text-[#999]">{template.name}</span>
                      <div className="text-[9px] text-[#555] mt-0.5 font-mono">
                        {placement.animation} · {placement.enterAnimation}
                      </div>
                      <button
                        onClick={() => {
                          removeCharacterFromScene(scene.id, placement.characterId)
                          toast(`Removed ${template.name}`, 'info')
                        }}
                        className="absolute top-1 right-1 text-xs text-[#555] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        x
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Custom characters */}
          {customCharacters.length > 0 && (
            <>
              <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider mb-3">
                Your Custom Characters ({customCharacters.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
                {customCharacters.map((char) => {
                  const alreadyInScene = scene.characters.some((c) => c.characterId === char.id)
                  return (
                    <button
                      key={char.id}
                      disabled={alreadyInScene}
                      onClick={() => handleAddCharacter(char)}
                      className={`relative flex flex-col items-center p-4 rounded-xl border transition-all ${
                        alreadyInScene
                          ? 'border-[#333] opacity-40 cursor-not-allowed'
                          : 'border-[#FF1D6C]/30 hover:border-[#FF1D6C] hover:bg-[#111] cursor-pointer'
                      }`}
                    >
                      <HigglyCharacter
                        bodyColor={char.bodyColor}
                        accentColor={char.accentColor}
                        faceColor={char.faceColor}
                        eyeColor={char.eyeColor}
                        accessory={char.accessory}
                        width={90}
                        height={126}
                      />
                      <span className="text-sm mt-2 font-medium">{char.name}</span>
                      <span className="text-[9px] text-[#FF1D6C]/60 font-mono">custom</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeCustomCharacter(char.id)
                          toast(`Deleted ${char.name}`, 'info')
                        }}
                        className="absolute top-1 right-1 text-xs text-[#555] hover:text-red-400 opacity-0 group-hover:opacity-100"
                      >
                        x
                      </button>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* Character catalog */}
          <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider mb-3">
            Character Library ({CHARACTER_TEMPLATES.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CHARACTER_TEMPLATES.map((char) => {
              const alreadyInScene = scene.characters.some(
                (c) => c.characterId === char.id
              )
              return (
                <button
                  key={char.id}
                  disabled={alreadyInScene}
                  onClick={() => handleAddCharacter(char)}
                  className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                    alreadyInScene
                      ? 'border-[#333] opacity-40 cursor-not-allowed'
                      : 'border-[#333] hover:border-[#FF1D6C] hover:bg-[#111] cursor-pointer'
                  }`}
                >
                  <HigglyCharacter
                    bodyColor={char.bodyColor}
                    accentColor={char.accentColor}
                    faceColor={char.faceColor}
                    eyeColor={char.eyeColor}
                    accessory={char.accessory}
                    width={90}
                    height={126}
                  />
                  <span className="text-sm mt-2 font-medium">{char.name}</span>
                  <span className="text-[10px] text-[#555] capitalize">
                    {char.size} · {char.accessory}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-[#222]">
        <button
          onClick={() => router.push(`/${params.projectId}/script`)}
          className="px-5 py-2.5 border border-[#333] text-[#999] rounded-lg text-sm hover:border-[#555] transition-colors"
        >
          Script
        </button>
        <button
          onClick={() => router.push(`/${params.projectId}/voice`)}
          className="px-5 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Next: Voice
        </button>
      </div>

      {/* Character Creator Modal */}
      {showCreator && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowCreator(false)}
        >
          <div
            className="bg-[#111] border border-[#333] rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-6">Create Custom Character</h3>
            <CharacterCreator
              onSave={handleCreateCharacter}
              onCancel={() => setShowCreator(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
