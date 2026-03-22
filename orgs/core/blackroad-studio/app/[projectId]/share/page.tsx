'use client'

import { useProjectStore } from '@/stores/project-store'
import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'

export default function SharePage() {
  const params = useParams()
  const router = useRouter()
  const { getCurrentProject, exportProject } = useProjectStore()
  const { toast } = useToast()
  const [copied, setCopied] = useState<string | null>(null)

  const project = getCurrentProject()
  if (!project) return <div className="p-8 text-[#666]">Loading...</div>

  const projectUrl = `https://studio.blackroad.io/${params.projectId}`
  const embedCode = `<iframe src="${projectUrl}/embed" width="${project.settings?.width || 1920}" height="${project.settings?.height || 1080}" frameborder="0" allowfullscreen></iframe>`
  const embedResponsive = `<div style="position:relative;padding-bottom:${Math.round((project.settings?.height || 1080) / (project.settings?.width || 1920) * 100)}%;height:0;overflow:hidden;"><iframe src="${projectUrl}/embed" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe></div>`

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast(`${label} copied!`, 'success')
    setTimeout(() => setCopied(null), 2000)
  }

  function handleExportJSON() {
    const json = exportProject(project!.id)
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

  const aspectRatio = project.settings?.aspectRatio || '16:9'
  const dialogueLines = project.scenes.reduce((sum, s) => sum + s.dialogue.length, 0)
  const hasAudio = project.scenes.some((s) => s.dialogue.some((d) => d.audioUrl))

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-xl font-bold mb-2">Share & Publish</h2>
      <p className="text-sm text-[#666] mb-8">
        Share your video, embed it on websites, or export the project.
      </p>

      {/* Project card preview */}
      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-[#FF6B2B] via-[#FF2255] to-[#8844FF] flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{project.name}</div>
            <div className="text-sm text-white/60 mt-1">
              {project.scenes.length} scenes · {dialogueLines} lines · {aspectRatio}
            </div>
          </div>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B2B] to-[#FF2255]" />
            <div>
              <div className="text-sm font-semibold">BlackRoad Studio</div>
              <div className="text-[10px] text-[#555]">studio.blackroad.io</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasAudio && (
              <span className="text-[9px] font-mono bg-green-900/30 text-green-400 px-2 py-0.5 rounded">
                Audio
              </span>
            )}
            <span className="text-[9px] font-mono bg-[#1a1a1a] text-[#666] px-2 py-0.5 rounded">
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {/* Share links */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider">Share Link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={projectUrl}
            className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-sm text-white font-mono"
          />
          <button
            onClick={() => copyToClipboard(projectUrl, 'Link')}
            className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors ${
              copied === 'Link'
                ? 'bg-green-600 text-white'
                : 'bg-white text-black hover:opacity-90'
            }`}
          >
            {copied === 'Link' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Embed codes */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider">Embed Code</h3>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#999]">Fixed Size</span>
            <button
              onClick={() => copyToClipboard(embedCode, 'Embed')}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                copied === 'Embed'
                  ? 'bg-green-600 text-white'
                  : 'bg-[#222] text-[#999] hover:bg-[#333]'
              }`}
            >
              {copied === 'Embed' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <code className="text-[10px] font-mono text-[#888] break-all">
            {embedCode}
          </code>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#999]">Responsive</span>
            <button
              onClick={() => copyToClipboard(embedResponsive, 'Responsive')}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                copied === 'Responsive'
                  ? 'bg-green-600 text-white'
                  : 'bg-[#222] text-[#999] hover:bg-[#333]'
              }`}
            >
              {copied === 'Responsive' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <code className="text-[10px] font-mono text-[#888] break-all">
            {embedResponsive}
          </code>
        </div>
      </div>

      {/* Social sharing */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider">Share On</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: 'Twitter / X', color: '#1DA1F2', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${project.name}" — made with BlackRoad Studio`)}&url=${encodeURIComponent(projectUrl)}` },
            { name: 'LinkedIn', color: '#0077B5', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}` },
            { name: 'Reddit', color: '#FF4500', url: `https://reddit.com/submit?url=${encodeURIComponent(projectUrl)}&title=${encodeURIComponent(project.name)}` },
            { name: 'Email', color: '#666', url: `mailto:?subject=${encodeURIComponent(project.name)}&body=${encodeURIComponent(`Check out this video: ${projectUrl}`)}` },
          ].map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#111] border border-[#222] rounded-xl text-center hover:border-[#444] transition-colors"
            >
              <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ background: platform.color }} />
              <div className="text-[10px] text-[#999]">{platform.name}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Export options */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider">Export</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportJSON}
            className="p-4 bg-[#111] border border-[#222] rounded-xl text-left hover:border-[#444] transition-colors"
          >
            <div className="text-sm font-semibold mb-1">Project JSON</div>
            <div className="text-[10px] text-[#555]">Full project data — import into any BlackRoad Studio</div>
          </button>
          <button
            onClick={() => router.push(`/${params.projectId}/render`)}
            className="p-4 bg-[#111] border border-[#222] rounded-xl text-left hover:border-[#FF1D6C] transition-colors"
          >
            <div className="text-sm font-semibold mb-1">Video File</div>
            <div className="text-[10px] text-[#555]">Render and download as WebM/MP4</div>
          </button>
        </div>
      </div>

      {/* Project metadata */}
      <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-4">
        <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider mb-3">Project Info</h3>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="text-[#555]">ID</div>
          <div className="text-[#999]">{project.id}</div>
          <div className="text-[#555]">Created</div>
          <div className="text-[#999]">{new Date(project.createdAt).toLocaleString()}</div>
          <div className="text-[#555]">Updated</div>
          <div className="text-[#999]">{new Date(project.updatedAt).toLocaleString()}</div>
          <div className="text-[#555]">Format</div>
          <div className="text-[#999]">{aspectRatio} ({project.settings?.width}x{project.settings?.height})</div>
          <div className="text-[#555]">Scenes</div>
          <div className="text-[#999]">{project.scenes.length}</div>
          <div className="text-[#555]">Music</div>
          <div className="text-[#999]">{project.music?.trackId || 'None'}</div>
          <div className="text-[#555]">Brand Kit</div>
          <div className="text-[#999]">{project.brandKit?.name || 'None'}</div>
          <div className="text-[#555]">Captions</div>
          <div className="text-[#999]">{project.captions?.enabled ? project.captions.style : 'Off'}</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-[#222]">
        <button
          onClick={() => router.push(`/${params.projectId}/render`)}
          className="px-5 py-2.5 border border-[#333] text-[#999] rounded-lg text-sm hover:border-[#555] transition-colors"
        >
          Render
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2.5 border border-[#333] text-[#999] rounded-lg text-sm hover:border-[#555] transition-colors"
        >
          All Projects
        </button>
      </div>
    </div>
  )
}
