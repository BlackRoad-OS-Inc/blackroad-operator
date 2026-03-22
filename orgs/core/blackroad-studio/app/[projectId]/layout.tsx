'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useProjectStore } from '@/stores/project-store'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { BrandKitEditor } from '@/components/brand/BrandKitEditor'
import { CaptionEditor } from '@/components/overlays/CaptionEditor'
import type { AspectRatio } from '@/lib/types'
import { ASPECT_DIMENSIONS } from '@/lib/types'

const STEPS = [
  { num: 1, label: 'Script', path: 'script' },
  { num: 2, label: 'Characters', path: 'characters' },
  { num: 3, label: 'Voice', path: 'voice' },
  { num: 4, label: 'Preview', path: 'preview' },
  { num: 5, label: 'Render', path: 'render' },
  { num: 6, label: 'Share', path: 'share' },
]

const ASPECT_ICONS: Record<AspectRatio, string> = {
  '16:9': '▬',
  '9:16': '▮',
  '1:1': '■',
  '4:3': '▭',
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const { setCurrentProject, getCurrentProject, renameProject, exportProject, updateProjectSettings } = useProjectStore()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [showBrandKit, setShowBrandKit] = useState(false)
  const [showCaptions, setShowCaptions] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const projectId = params.projectId as string

  useEffect(() => {
    setCurrentProject(projectId)
  }, [projectId, setCurrentProject])

  const project = getCurrentProject()
  const currentPath = pathname.split('/').pop() ?? 'script'
  const currentStepIndex = STEPS.findIndex((s) => s.path === currentPath)
  const aspectRatio = project?.settings?.aspectRatio || '16:9'

  function handleExport() {
    const json = exportProject(projectId)
    if (!json) return
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project?.name ?? 'project'}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Project exported', 'success')
  }

  function handleAspectChange(ratio: AspectRatio) {
    const dims = ASPECT_DIMENSIONS[ratio]
    updateProjectSettings(projectId, {
      aspectRatio: ratio,
      width: dims.width,
      height: dims.height,
    })
    toast(`Format: ${ratio} (${dims.label})`, 'success')
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-[#222] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-[#222]">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded bg-gradient-to-br from-[#FF6B2B] via-[#CC00AA] to-[#4488FF] cursor-pointer flex-shrink-0"
              onClick={() => router.push('/')}
              title="Home"
            />
            {editing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  if (editName.trim()) renameProject(projectId, editName.trim())
                  setEditing(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editName.trim()) renameProject(projectId, editName.trim())
                    setEditing(false)
                  }
                }}
                autoFocus
                className="text-sm font-semibold bg-transparent border-b border-[#FF1D6C] outline-none w-full"
              />
            ) : (
              <span
                className="text-sm font-semibold truncate cursor-pointer hover:text-[#FF1D6C] transition-colors"
                onClick={() => { setEditName(project?.name ?? ''); setEditing(true) }}
                title="Click to rename"
              >
                {project?.name ?? 'Loading...'}
              </span>
            )}
          </div>

          {/* Aspect ratio badges */}
          <div className="flex gap-1">
            {(Object.keys(ASPECT_DIMENSIONS) as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => handleAspectChange(ratio)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${
                  aspectRatio === ratio
                    ? 'bg-[#FF1D6C] text-white'
                    : 'bg-[#1a1a1a] text-[#555] hover:text-[#999]'
                }`}
                title={ASPECT_DIMENSIONS[ratio].label}
              >
                {ASPECT_ICONS[ratio]} {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <nav className="flex-1 py-2">
          {STEPS.map((step, i) => {
            const isActive = currentPath === step.path
            const isCompleted = i < currentStepIndex
            return (
              <button
                key={step.num}
                onClick={() => router.push(`/${projectId}/${step.path}`)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-[#1a1a1a] text-white border-r-2 border-[#FF1D6C]'
                    : 'text-[#666] hover:text-[#999] hover:bg-[#111]'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive
                    ? 'bg-[#FF1D6C] text-white'
                    : isCompleted
                      ? 'bg-[#333] text-white'
                      : 'bg-[#222] text-[#555]'
                }`}>
                  {isCompleted ? '✓' : step.num}
                </span>
                <span className="font-medium">{step.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Project tools */}
        <div className="px-4 py-3 border-t border-[#222] space-y-1.5">
          <button
            onClick={() => setShowBrandKit(true)}
            className={`w-full text-left text-xs py-1.5 transition-colors flex items-center gap-2 ${
              project?.brandKit ? 'text-[#FF1D6C]' : 'text-[#555] hover:text-white'
            }`}
          >
            <span className="flex gap-0.5">
              {project?.brandKit ? (
                <>
                  <span className="w-2 h-2 rounded-full" style={{ background: project.brandKit.primaryColor }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: project.brandKit.secondaryColor }} />
                </>
              ) : (
                <span className="w-2 h-2 rounded-full bg-[#333]" />
              )}
            </span>
            Brand Kit {project?.brandKit ? `(${project.brandKit.name})` : ''}
          </button>
          <button
            onClick={() => setShowCaptions(true)}
            className={`w-full text-left text-xs py-1.5 transition-colors ${
              project?.captions?.enabled ? 'text-[#FF1D6C]' : 'text-[#555] hover:text-white'
            }`}
          >
            CC Captions {project?.captions?.enabled ? '(On)' : ''}
          </button>
          <button
            onClick={handleExport}
            className="w-full text-left text-xs text-[#555] hover:text-white transition-colors py-1.5"
          >
            Export JSON
          </button>
        </div>

        {/* Project stats */}
        <div className="px-4 py-4 border-t border-[#222] text-[10px] font-mono text-[#444] space-y-0.5">
          <div>{project?.scenes.length ?? 0} scenes</div>
          <div>{project?.scenes.reduce((sum, s) => sum + s.characters.length, 0) ?? 0} characters</div>
          <div>{project?.scenes.reduce((sum, s) => sum + s.dialogue.length, 0) ?? 0} dialogue lines</div>
          <div>{project?.scenes.reduce((sum, s) => sum + (s.overlays?.length || 0), 0) ?? 0} text overlays</div>
          <div>{project?.scenes.reduce((sum, s) => sum + (s.stickers?.length || 0), 0) ?? 0} stickers</div>
          <div className="pt-1 text-[#555]">{aspectRatio} · {project?.status ?? 'draft'}</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Brand Kit Modal */}
      {showBrandKit && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowBrandKit(false)}
        >
          <div
            className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Brand Kit</h3>
            <BrandKitEditor
              projectId={projectId}
              brandKit={project?.brandKit}
              onClose={() => setShowBrandKit(false)}
            />
          </div>
        </div>
      )}

      {/* Captions Modal */}
      {showCaptions && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowCaptions(false)}
        >
          <div
            className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-lg animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Auto-Captions</h3>
            <CaptionEditor projectId={projectId} captions={project?.captions} />
            <button
              onClick={() => setShowCaptions(false)}
              className="w-full mt-4 py-2.5 border border-[#333] text-[#999] rounded-lg text-sm hover:border-[#555] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
