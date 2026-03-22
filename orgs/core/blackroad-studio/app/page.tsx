'use client'

import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/stores/project-store'
import { useState, useRef } from 'react'
import { HigglyCharacter } from '@/components/characters/HigglyCharacter'
import { CHARACTER_TEMPLATES } from '@/lib/templates/characters'
import { PROJECT_TEMPLATES } from '@/lib/templates/project-templates'
import { useToast } from '@/components/ui/Toast'
import type { AspectRatio } from '@/lib/types'
import { ASPECT_DIMENSIONS } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const { projects, createProject, createProjectFromTemplate, importProject, deleteProject, duplicateProject, setCurrentProject } = useProjectStore()
  const { toast } = useToast()
  const [newName, setNewName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState<'projects' | 'templates'>('projects')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleCreate() {
    const name = newName.trim() || 'Untitled Video'
    const id = createProject(name, aspectRatio)
    setNewName('')
    setShowCreate(false)
    toast(`Created "${name}" (${aspectRatio})`, 'success')
    router.push(`/${id}/script`)
  }

  function handleOpen(id: string) {
    setCurrentProject(id)
    router.push(`/${id}/script`)
  }

  function handleTemplate(template: typeof PROJECT_TEMPLATES[0]) {
    const id = createProjectFromTemplate(template.name, template.scenes)
    toast(`Created from "${template.name}" template`, 'success')
    router.push(`/${id}/script`)
  }

  function handleDuplicate(e: React.MouseEvent, id: string, name: string) {
    e.stopPropagation()
    duplicateProject(id)
    toast(`Duplicated "${name}"`, 'success')
  }

  function handleDelete(e: React.MouseEvent, id: string, name: string) {
    e.stopPropagation()
    deleteProject(id)
    toast(`Deleted "${name}"`, 'info')
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const id = importProject(reader.result as string)
      if (id) {
        toast('Project imported!', 'success')
        router.push(`/${id}/script`)
      } else {
        toast('Invalid project file', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const showcaseChars = CHARACTER_TEMPLATES.slice(0, 7)

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-[#222] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B2B] via-[#CC00AA] to-[#4488FF]" />
          <h1 className="text-xl font-bold tracking-tight">BlackRoad Studio</h1>
          <span className="text-[10px] font-mono text-[#555] bg-[#1a1a1a] px-2 py-0.5 rounded">BETA</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 border border-[#333] text-[#666] rounded-lg text-sm hover:border-[#555] transition-colors"
          >
            Import
          </button>
          <button
            onClick={() => router.push('/wizard')}
            className="px-5 py-2.5 border border-[#333] text-[#999] font-medium rounded-lg text-sm hover:border-[#555] transition-colors"
          >
            AI Wizard
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            + New Video
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="px-8 py-16 max-w-5xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          {showcaseChars.map((c, i) => (
            <div
              key={c.id}
              className="transform hover:scale-125 transition-all duration-300 hover:-translate-y-2"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <HigglyCharacter
                bodyColor={c.bodyColor}
                accentColor={c.accentColor}
                faceColor={c.faceColor}
                eyeColor={c.eyeColor}
                accessory={c.accessory}
                expression={i === 3 ? 'surprised' : i === 5 ? 'neutral' : 'happy'}
                width={72}
                height={100}
              />
            </div>
          ))}
        </div>
        <h2 className="text-5xl font-extrabold mb-4 tracking-tight">
          Make Animated Videos{' '}
          <span className="gradient-text">
            in Minutes
          </span>
        </h2>
        <p className="text-[#888] text-lg max-w-2xl mx-auto mb-8">
          Pick characters, write your script, choose voices, and render full-length
          animated movies, shows, explainers, and more. No video editing skills needed.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setShowCreate(true)}
            className="px-8 py-3.5 bg-gradient-to-r from-[#FF6B2B] via-[#FF2255] to-[#8844FF] text-white font-bold rounded-xl text-lg hover:opacity-90 transition-opacity animate-pulse-glow"
          >
            Start Creating
          </button>
          <button
            onClick={() => router.push('/wizard')}
            className="px-8 py-3.5 border border-[#333] text-white font-semibold rounded-xl text-lg hover:border-[#555] transition-colors"
          >
            Use AI Wizard
          </button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-8 pb-16 max-w-6xl mx-auto">
        <div className="flex items-center gap-6 mb-6 border-b border-[#222] pb-3">
          <button
            onClick={() => setActiveTab('projects')}
            className={`text-sm font-semibold pb-3 border-b-2 transition-colors ${
              activeTab === 'projects' ? 'border-[#FF1D6C] text-white' : 'border-transparent text-[#666] hover:text-[#999]'
            }`}
          >
            Your Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`text-sm font-semibold pb-3 border-b-2 transition-colors ${
              activeTab === 'templates' ? 'border-[#FF1D6C] text-white' : 'border-transparent text-[#666] hover:text-[#999]'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <>
            {projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex items-center justify-center gap-2 mb-4">
                  {CHARACTER_TEMPLATES.slice(0, 3).map((c) => (
                    <HigglyCharacter
                      key={c.id}
                      bodyColor={c.bodyColor}
                      accentColor={c.accentColor}
                      faceColor={c.faceColor}
                      eyeColor={c.eyeColor}
                      accessory={c.accessory}
                      expression="neutral"
                      width={48}
                      height={67}
                    />
                  ))}
                </div>
                <p className="text-[#555] text-sm mb-4">No projects yet. Create one or start from a template.</p>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="text-sm text-[#FF1D6C] hover:underline"
                >
                  Browse templates
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-[#111] border border-[#222] rounded-xl p-5 hover:border-[#444] transition-all cursor-pointer group hover:-translate-y-0.5"
                    onClick={() => handleOpen(project.id)}
                  >
                    {/* Mini scene preview */}
                    <div className="flex gap-1 mb-3">
                      {project.scenes.slice(0, 5).map((scene) => {
                        const colors: Record<string, string> = {
                          title: '#FF6B2B',
                          dialogue: '#4488FF',
                          narration: '#CC00AA',
                          end: '#636E72',
                          transition: '#00D4FF',
                        }
                        return (
                          <div
                            key={scene.id}
                            className="flex-1 h-2 rounded-full"
                            style={{ background: colors[scene.type] ?? '#333' }}
                          />
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold truncate">{project.name}</h4>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        project.status === 'complete' ? 'bg-green-900/30 text-green-400' : 'bg-[#1a1a1a] text-[#666]'
                      }`}>
                        {project.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#555] mb-3">
                      {project.scenes.length} scenes · {project.scenes.reduce((sum, s) => sum + s.dialogue.length, 0)} lines · {project.scenes.reduce((sum, s) => sum + s.characters.length, 0)} characters
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#444]">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDuplicate(e, project.id, project.name)}
                          className="text-[10px] text-[#555] hover:text-white"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, project.id, project.name)}
                          className="text-[10px] text-[#555] hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
            {PROJECT_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-[#444] transition-all group hover:-translate-y-0.5"
              >
                {/* Template preview */}
                <div
                  className="h-32 relative"
                  style={{
                    background: `linear-gradient(180deg, ${template.thumbnail.sky} 60%, ${template.thumbnail.ground} 100%)`,
                  }}
                >
                  <div className="absolute bottom-3 left-4 flex gap-2">
                    {template.characterIds.map((charId) => {
                      const char = CHARACTER_TEMPLATES.find((c) => c.id === charId)
                      if (!char) return null
                      return (
                        <HigglyCharacter
                          key={charId}
                          bodyColor={char.bodyColor}
                          accentColor={char.accentColor}
                          faceColor={char.faceColor}
                          eyeColor={char.eyeColor}
                          accessory={char.accessory}
                          expression="happy"
                          width={40}
                          height={56}
                        />
                      )
                    })}
                  </div>
                  <span className="absolute top-3 right-3 text-[10px] font-mono bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md capitalize">
                    {template.category}
                  </span>
                </div>

                <div className="p-5">
                  <h4 className="font-semibold mb-1">{template.name}</h4>
                  <p className="text-xs text-[#666] mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#555]">
                      {template.scenes.length} scenes · {template.characterIds.length} characters
                    </span>
                    <button
                      onClick={() => handleTemplate(template)}
                      className="px-4 py-2 bg-white text-black font-semibold rounded-lg text-xs hover:opacity-90 transition-opacity"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="px-8 py-16 max-w-5xl mx-auto border-t border-[#222]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Voice-First', desc: 'Describe your idea, answer 7 questions, get a full project generated automatically.' },
            { title: '16+ Characters', desc: 'Little Miss / Mr. Men style. Create custom characters with your own colors and accessories.' },
            { title: 'Up to 40 Minutes', desc: 'Movies, shows, podcasts, explainers, ads — render at 720p, 1080p, or 4K.' },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-[#666]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#222] px-8 py-6 text-center">
        <p className="text-xs text-[#444]">
          BlackRoad OS — Pave Tomorrow.
        </p>
      </footer>

      {/* Create Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-[#111] border border-[#333] rounded-2xl p-8 w-full max-w-md animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-6">New Video Project</h3>
            <input
              type="text"
              placeholder="My Animated Story..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF1D6C] transition-colors mb-4"
            />
            {/* Aspect ratio picker */}
            <div className="mb-4">
              <span className="text-[10px] font-mono text-[#666] uppercase tracking-wider">Format</span>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(Object.entries(ASPECT_DIMENSIONS) as [AspectRatio, typeof ASPECT_DIMENSIONS['16:9']][]).map(([ratio, dims]) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      aspectRatio === ratio
                        ? 'border-[#FF1D6C] bg-[#1a1a1a]'
                        : 'border-[#333] hover:border-[#555]'
                    }`}
                  >
                    <div className="text-sm font-bold">{ratio}</div>
                    <div className="text-[8px] text-[#555]">{dims.width}x{dims.height}</div>
                    <div className="text-[7px] text-[#444] mt-0.5">{dims.label.split('(')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-[#555] mb-6">
              Or use the <button onClick={() => { setShowCreate(false); router.push('/wizard') }} className="text-[#FF1D6C] hover:underline">AI Wizard</button> to generate a full project from a description.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2.5 border border-[#333] text-[#999] rounded-lg hover:border-[#555] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2.5 bg-white text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
