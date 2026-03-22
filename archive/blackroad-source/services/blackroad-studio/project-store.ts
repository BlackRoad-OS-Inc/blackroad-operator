import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type {
  StudioProject,
  Scene,
  CharacterPlacement,
  CharacterTemplate,
  DialogueLine,
  TextOverlay,
  TextOverlayStyle,
  TextAnimation,
  StickerPlacement,
  SoundEffect,
  BrandKit,
  CaptionSettings,
  AspectRatio,
} from '@/lib/types'
import { ASPECT_DIMENSIONS } from '@/lib/types'
import { DEFAULT_SCENE_DURATION_FRAMES, FPS, VIDEO_WIDTH, VIDEO_HEIGHT, TEXT_OVERLAY_DEFAULTS } from '@/lib/constants'

interface ProjectState {
  projects: StudioProject[]
  currentProjectId: string | null
  currentSceneId: string | null
  currentStep: 1 | 2 | 3 | 4 | 5 | 6
  customCharacters: CharacterTemplate[]
  savedBrandKits: BrandKit[]

  // Project actions
  createProject: (name: string, aspectRatio?: AspectRatio) => string
  createProjectFromTemplate: (name: string, scenes: Omit<Scene, 'id'>[]) => string
  deleteProject: (id: string) => void
  duplicateProject: (id: string) => string
  renameProject: (id: string, name: string) => void
  exportProject: (id: string) => string | null
  importProject: (json: string) => string | null
  updateProjectMusic: (id: string, music: { trackId: string; volume: number } | null) => void
  updateProjectSettings: (id: string, settings: Partial<StudioProject['settings']>) => void
  updateBrandKit: (id: string, brandKit: BrandKit | null) => void
  updateCaptions: (id: string, captions: CaptionSettings | null) => void
  setCurrentProject: (id: string) => void
  getCurrentProject: () => StudioProject | null

  // Scene actions
  addScene: (type: Scene['type']) => void
  duplicateScene: (id: string) => void
  updateScene: (id: string, updates: Partial<Scene>) => void
  removeScene: (id: string) => void
  reorderScenes: (fromIndex: number, toIndex: number) => void
  setCurrentScene: (id: string) => void
  getCurrentScene: () => Scene | null

  // Text overlay actions
  addTextOverlay: (sceneId: string, overlay?: Partial<TextOverlay>) => void
  updateTextOverlay: (sceneId: string, overlayId: string, updates: Partial<TextOverlay>) => void
  removeTextOverlay: (sceneId: string, overlayId: string) => void

  // Sticker actions
  addSticker: (sceneId: string, sticker: Omit<StickerPlacement, 'id'>) => void
  updateSticker: (sceneId: string, stickerId: string, updates: Partial<StickerPlacement>) => void
  removeSticker: (sceneId: string, stickerId: string) => void

  // SFX actions
  addSFX: (sceneId: string, sfx: Omit<SoundEffect, 'id'>) => void
  removeSFX: (sceneId: string, sfxId: string) => void

  // Character actions
  addCharacterToScene: (sceneId: string, placement: CharacterPlacement) => void
  removeCharacterFromScene: (sceneId: string, characterId: string) => void
  addCustomCharacter: (character: CharacterTemplate) => void
  removeCustomCharacter: (id: string) => void

  // Dialogue actions
  addDialogue: (sceneId: string, line: Omit<DialogueLine, 'id'>) => void
  updateDialogue: (sceneId: string, lineId: string, updates: Partial<DialogueLine>) => void
  removeDialogue: (sceneId: string, lineId: string) => void

  // Brand kit actions
  saveBrandKit: (kit: BrandKit) => void
  deleteBrandKit: (name: string) => void

  // Navigation
  setStep: (step: 1 | 2 | 3 | 4 | 5 | 6) => void
  nextStep: () => void
  prevStep: () => void
}

function updateProject(
  projects: StudioProject[],
  projectId: string,
  updater: (p: StudioProject) => StudioProject
): StudioProject[] {
  return projects.map((p) => (p.id === projectId ? updater({ ...p, updatedAt: Date.now() }) : p))
}

function updateSceneInProject(
  project: StudioProject,
  sceneId: string,
  updater: (s: Scene) => Scene
): StudioProject {
  return {
    ...project,
    updatedAt: Date.now(),
    scenes: project.scenes.map((s) => (s.id === sceneId ? updater(s) : s)),
  }
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      currentSceneId: null,
      currentStep: 1,
      customCharacters: [],
      savedBrandKits: [],

      createProject: (name: string, aspectRatio: AspectRatio = '16:9') => {
        const id = uuid()
        const dims = ASPECT_DIMENSIONS[aspectRatio]
        const project: StudioProject = {
          id,
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          scenes: [],
          settings: { fps: FPS, width: dims.width, height: dims.height, aspectRatio },
          status: 'draft',
        }
        set((s) => ({
          projects: [...s.projects, project],
          currentProjectId: id,
          currentStep: 1,
        }))
        return id
      },

      createProjectFromTemplate: (name: string, scenes: Omit<Scene, 'id'>[]) => {
        const id = uuid()
        const project: StudioProject = {
          id,
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          scenes: scenes.map((s) => ({ ...s, id: uuid() })),
          settings: { fps: FPS, width: VIDEO_WIDTH, height: VIDEO_HEIGHT, aspectRatio: '16:9' },
          status: 'draft',
        }
        set((s) => ({
          projects: [...s.projects, project],
          currentProjectId: id,
          currentStep: 1,
        }))
        return id
      },

      deleteProject: (id: string) => {
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          currentProjectId: s.currentProjectId === id ? null : s.currentProjectId,
        }))
      },

      duplicateProject: (id: string) => {
        const { projects } = get()
        const source = projects.find((p) => p.id === id)
        if (!source) return id
        const newId = uuid()
        const copy: StudioProject = {
          ...source,
          id: newId,
          name: `${source.name} (Copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          scenes: source.scenes.map((s) => ({ ...s, id: uuid() })),
        }
        set((s) => ({ projects: [...s.projects, copy], currentProjectId: newId }))
        return newId
      },

      renameProject: (id: string, name: string) => {
        set((s) => ({
          projects: updateProject(s.projects, id, (p) => ({ ...p, name })),
        }))
      },

      exportProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id)
        if (!project) return null
        return JSON.stringify(project, null, 2)
      },

      importProject: (json: string) => {
        try {
          const parsed = JSON.parse(json)
          if (!parsed.scenes || !parsed.name) return null
          const newId = uuid()
          const project: StudioProject = {
            ...parsed,
            id: newId,
            name: `${parsed.name} (Imported)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            scenes: (parsed.scenes || []).map((s: Scene) => ({
              ...s,
              id: uuid(),
              dialogue: (s.dialogue || []).map((d: DialogueLine) => ({ ...d, id: uuid() })),
            })),
          }
          set((s) => ({
            projects: [...s.projects, project],
            currentProjectId: newId,
          }))
          return newId
        } catch {
          return null
        }
      },

      updateProjectMusic: (id: string, music: { trackId: string; volume: number } | null) => {
        set((s) => ({
          projects: updateProject(s.projects, id, (p) => ({ ...p, music })),
        }))
      },

      updateProjectSettings: (id: string, settings: Partial<StudioProject['settings']>) => {
        set((s) => ({
          projects: updateProject(s.projects, id, (p) => ({
            ...p,
            settings: { ...p.settings, ...settings },
          })),
        }))
      },

      updateBrandKit: (id: string, brandKit: BrandKit | null) => {
        set((s) => ({
          projects: updateProject(s.projects, id, (p) => ({ ...p, brandKit })),
        }))
      },

      updateCaptions: (id: string, captions: CaptionSettings | null) => {
        set((s) => ({
          projects: updateProject(s.projects, id, (p) => ({ ...p, captions })),
        }))
      },

      setCurrentProject: (id: string) => {
        set({ currentProjectId: id, currentSceneId: null, currentStep: 1 })
      },

      getCurrentProject: () => {
        const { projects, currentProjectId } = get()
        return projects.find((p) => p.id === currentProjectId) ?? null
      },

      addScene: (type) => {
        const { currentProjectId, projects } = get()
        if (!currentProjectId) return
        const scene: Scene = {
          id: uuid(),
          order: projects.find((p) => p.id === currentProjectId)?.scenes.length ?? 0,
          type,
          backgroundId: 'neighborhood',
          characters: [],
          props: [],
          dialogue: [],
          narration: null,
          durationFrames: DEFAULT_SCENE_DURATION_FRAMES,
          transition: 'fade',
          overlays: [],
          stickers: [],
          sfx: [],
        }
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) => ({
            ...p,
            scenes: [...p.scenes, scene],
          })),
          currentSceneId: scene.id,
        }))
      },

      duplicateScene: (id) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) => {
            const source = p.scenes.find((sc) => sc.id === id)
            if (!source) return p
            const newScene: Scene = {
              ...source,
              id: uuid(),
              dialogue: source.dialogue.map((d) => ({ ...d, id: uuid() })),
              overlays: (source.overlays || []).map((o) => ({ ...o, id: uuid() })),
              stickers: (source.stickers || []).map((s) => ({ ...s, id: uuid() })),
              sfx: (source.sfx || []).map((s) => ({ ...s, id: uuid() })),
              order: p.scenes.length,
            }
            return { ...p, scenes: [...p.scenes, newScene] }
          }),
        }))
      },

      updateScene: (id, updates) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, id, (scene) => ({ ...scene, ...updates }))
          ),
        }))
      },

      removeScene: (id) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) => ({
            ...p,
            scenes: p.scenes
              .filter((sc) => sc.id !== id)
              .map((sc, i) => ({ ...sc, order: i })),
          })),
          currentSceneId: s.currentSceneId === id ? null : s.currentSceneId,
        }))
      },

      reorderScenes: (fromIndex, toIndex) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) => {
            const scenes = [...p.scenes]
            const [moved] = scenes.splice(fromIndex, 1)
            scenes.splice(toIndex, 0, moved)
            return { ...p, scenes: scenes.map((sc, i) => ({ ...sc, order: i })) }
          }),
        }))
      },

      setCurrentScene: (id) => set({ currentSceneId: id }),

      getCurrentScene: () => {
        const project = get().getCurrentProject()
        const { currentSceneId } = get()
        if (!project || !currentSceneId) return null
        return project.scenes.find((s) => s.id === currentSceneId) ?? null
      },

      // Text overlays
      addTextOverlay: (sceneId, partial) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        const overlay: TextOverlay = {
          id: uuid(),
          text: partial?.text ?? 'Your Text Here',
          position: partial?.position ?? { x: 50, y: 50 },
          style: partial?.style ?? { ...TEXT_OVERLAY_DEFAULTS },
          animation: partial?.animation ?? 'fade-in',
          startFrame: partial?.startFrame ?? 0,
          durationFrames: partial?.durationFrames ?? 90,
        }
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              overlays: [...(scene.overlays || []), overlay],
            }))
          ),
        }))
      },

      updateTextOverlay: (sceneId, overlayId, updates) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              overlays: (scene.overlays || []).map((o) =>
                o.id === overlayId ? { ...o, ...updates } : o
              ),
            }))
          ),
        }))
      },

      removeTextOverlay: (sceneId, overlayId) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              overlays: (scene.overlays || []).filter((o) => o.id !== overlayId),
            }))
          ),
        }))
      },

      // Stickers
      addSticker: (sceneId, sticker) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              stickers: [...(scene.stickers || []), { ...sticker, id: uuid() }],
            }))
          ),
        }))
      },

      updateSticker: (sceneId, stickerId, updates) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              stickers: (scene.stickers || []).map((st) =>
                st.id === stickerId ? { ...st, ...updates } : st
              ),
            }))
          ),
        }))
      },

      removeSticker: (sceneId, stickerId) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              stickers: (scene.stickers || []).filter((st) => st.id !== stickerId),
            }))
          ),
        }))
      },

      // SFX
      addSFX: (sceneId, sfx) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              sfx: [...(scene.sfx || []), { ...sfx, id: uuid() }],
            }))
          ),
        }))
      },

      removeSFX: (sceneId, sfxId) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              sfx: (scene.sfx || []).filter((s) => s.id !== sfxId),
            }))
          ),
        }))
      },

      addCharacterToScene: (sceneId, placement) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              characters: [...scene.characters, placement],
            }))
          ),
        }))
      },

      removeCharacterFromScene: (sceneId, characterId) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              characters: scene.characters.filter((c) => c.characterId !== characterId),
            }))
          ),
        }))
      },

      addCustomCharacter: (character: CharacterTemplate) => {
        set((s) => ({
          customCharacters: [...s.customCharacters, character],
        }))
      },

      removeCustomCharacter: (id: string) => {
        set((s) => ({
          customCharacters: s.customCharacters.filter((c) => c.id !== id),
        }))
      },

      addDialogue: (sceneId, line) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        const fullLine: DialogueLine = { ...line, id: uuid() }
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              dialogue: [...scene.dialogue, fullLine],
            }))
          ),
        }))
      },

      updateDialogue: (sceneId, lineId, updates) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              dialogue: scene.dialogue.map((d) =>
                d.id === lineId ? { ...d, ...updates } : d
              ),
            }))
          ),
        }))
      },

      removeDialogue: (sceneId, lineId) => {
        const { currentProjectId } = get()
        if (!currentProjectId) return
        set((s) => ({
          projects: updateProject(s.projects, currentProjectId, (p) =>
            updateSceneInProject(p, sceneId, (scene) => ({
              ...scene,
              dialogue: scene.dialogue.filter((d) => d.id !== lineId),
            }))
          ),
        }))
      },

      // Brand kits
      saveBrandKit: (kit: BrandKit) => {
        set((s) => ({
          savedBrandKits: [
            ...s.savedBrandKits.filter((k) => k.name !== kit.name),
            kit,
          ],
        }))
      },

      deleteBrandKit: (name: string) => {
        set((s) => ({
          savedBrandKits: s.savedBrandKits.filter((k) => k.name !== name),
        }))
      },

      setStep: (step) => set({ currentStep: step }),
      nextStep: () =>
        set((s) => ({ currentStep: Math.min(6, s.currentStep + 1) as 1 | 2 | 3 | 4 | 5 | 6 })),
      prevStep: () =>
        set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) as 1 | 2 | 3 | 4 | 5 | 6 })),
    }),
    {
      name: 'blackroad-studio-projects',
    }
  )
)
