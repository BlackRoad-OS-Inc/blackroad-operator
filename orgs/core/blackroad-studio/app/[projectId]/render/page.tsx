'use client'

import { useProjectStore } from '@/stores/project-store'
import { useRouter, useParams } from 'next/navigation'
import { useState, useRef, useCallback } from 'react'
import { Player } from '@remotion/player'
import { Video } from '@/remotion/Video'
import { calculateTotalDuration, framesToTimecode } from '@/remotion/utils/timing'
import { FPS, VIDEO_WIDTH, VIDEO_HEIGHT } from '@/lib/constants'
import { exportVideoFromPlayer, downloadBlob, getExportDimensions } from '@/lib/video-export'
import { uploadRender } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

export default function RenderPage() {
  const params = useParams()
  const router = useRouter()
  const { getCurrentProject } = useProjectStore()
  const { toast } = useToast()
  const playerRef = useRef<HTMLDivElement>(null)
  const [rendering, setRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'recording' | 'encoding' | 'uploading' | 'complete'>('idle')
  const [quality, setQuality] = useState<'720p' | '1080p' | '4k'>('1080p')
  const [format, setFormat] = useState<'mp4' | 'webm'>('webm')
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)

  const project = getCurrentProject()
  if (!project) return <div className="p-8 text-[#666]">Loading...</div>

  const totalFrames = calculateTotalDuration(project.scenes)
  const duration = framesToTimecode(totalFrames)
  const dims = getExportDimensions(quality)
  const aspectRatio = project.settings?.aspectRatio || '16:9'
  const projectWidth = project.settings?.width || VIDEO_WIDTH
  const projectHeight = project.settings?.height || VIDEO_HEIGHT
  const estimatedSize = Math.round((totalFrames / FPS) * (quality === '4k' ? 2 : quality === '1080p' ? 1 : 0.5) * 1.2)
  const overlayCount = project.scenes.reduce((sum, s) => sum + (s.overlays?.length || 0), 0)
  const stickerCount = project.scenes.reduce((sum, s) => sum + (s.stickers?.length || 0), 0)
  const sfxCount = project.scenes.reduce((sum, s) => sum + (s.sfx?.length || 0), 0)

  async function startRender() {
    if (!playerRef.current) return
    setRendering(true)
    setProgress(0)
    setPhase('recording')
    setOutputBlob(null)
    setOutputUrl(null)

    try {
      const blob = await exportVideoFromPlayer(
        playerRef.current,
        totalFrames,
        {
          width: dims.width,
          height: dims.height,
          fps: FPS,
          format,
          quality,
          onProgress: (p) => setProgress(p),
          onComplete: () => setPhase('encoding'),
        }
      )

      setPhase('uploading')
      setOutputBlob(blob)
      toast('Video recorded! Uploading...', 'success')

      try {
        const result = await uploadRender(project!.id, blob)
        setOutputUrl(result.url)
        toast('Uploaded to cloud!', 'success')
      } catch {
        toast('Upload skipped — download available locally', 'info')
      }

      setPhase('complete')
      setProgress(100)
    } catch (err: any) {
      toast(err.message || 'Render failed', 'error')
      setPhase('idle')
      setRendering(false)
    }
  }

  function handleDownload() {
    if (!outputBlob) return
    const ext = format === 'mp4' ? 'webm' : 'webm' // browsers record as webm
    downloadBlob(outputBlob, `${(project?.name ?? 'video').replace(/\s+/g, '-').toLowerCase()}-${quality}.${ext}`)
    toast('Downloading video...', 'success')
  }

  function handleReset() {
    setRendering(false)
    setProgress(0)
    setPhase('idle')
    setOutputBlob(null)
    setOutputUrl(null)
  }

  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-xl font-bold mb-2">Render Video</h2>
      <p className="text-sm text-[#666] mb-8">
        Export your animated video as a downloadable file.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        <div className="bg-[#111] border border-[#222] rounded-xl p-3 text-center">
          <div className="text-xl font-bold font-mono">{project.scenes.length}</div>
          <div className="text-[10px] text-[#666]">Scenes</div>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-3 text-center">
          <div className="text-xl font-bold font-mono">{duration}</div>
          <div className="text-[10px] text-[#666]">Duration</div>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-3 text-center">
          <div className="text-xl font-bold font-mono">
            {project.scenes.reduce((sum, s) => sum + s.dialogue.length, 0)}
          </div>
          <div className="text-[10px] text-[#666]">Lines</div>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-3 text-center">
          <div className="text-xl font-bold font-mono">{overlayCount + stickerCount}</div>
          <div className="text-[10px] text-[#666]">Overlays</div>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-3 text-center">
          <div className="text-xl font-bold font-mono">{aspectRatio}</div>
          <div className="text-[10px] text-[#666]">Format</div>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-3 text-center">
          <div className="text-xl font-bold font-mono">~{estimatedSize}MB</div>
          <div className="text-[10px] text-[#666]">Est. Size</div>
        </div>
      </div>

      {/* Quality & format settings */}
      {phase === 'idle' && (
        <>
          <div className="mb-6">
            <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-3">
              Quality
            </label>
            <div className="flex gap-3">
              {([
                { q: '720p' as const, res: '1280×720', label: 'HD' },
                { q: '1080p' as const, res: '1920×1080', label: 'Full HD' },
                { q: '4k' as const, res: '3840×2160', label: '4K Ultra' },
              ]).map(({ q, res, label }) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 p-4 rounded-xl border text-left transition-all ${
                    quality === q
                      ? 'border-[#FF1D6C] bg-[#1a1a1a]'
                      : 'border-[#333] hover:border-[#555]'
                  }`}
                >
                  <div className="font-semibold text-sm">{label}</div>
                  <div className="text-[10px] text-[#555] font-mono mt-0.5">{res}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="text-xs font-mono text-[#666] uppercase tracking-wider block mb-3">
              Format
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('webm')}
                className={`px-6 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  format === 'webm' ? 'border-[#FF1D6C] text-white bg-[#1a1a1a]' : 'border-[#333] text-[#666] hover:border-[#555]'
                }`}
              >
                WebM
                <span className="block text-[10px] text-[#555] mt-0.5">Recommended</span>
              </button>
              <button
                onClick={() => setFormat('mp4')}
                className={`px-6 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  format === 'mp4' ? 'border-[#FF1D6C] text-white bg-[#1a1a1a]' : 'border-[#333] text-[#666] hover:border-[#555]'
                }`}
              >
                MP4
                <span className="block text-[10px] text-[#555] mt-0.5">Wider compatibility</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Hidden player for capture */}
      {rendering && (
        <div ref={playerRef} className="mb-6 rounded-xl overflow-hidden border border-[#222]">
          <Player
            component={Video}
            inputProps={{ project }}
            durationInFrames={Math.max(1, totalFrames)}
            fps={FPS}
            compositionWidth={projectWidth}
            compositionHeight={projectHeight}
            style={{ width: '100%', aspectRatio: `${projectWidth}/${projectHeight}` }}
            controls={false}
            autoPlay
            loop={false}
          />
        </div>
      )}

      {/* Render progress */}
      {rendering && phase !== 'idle' && (
        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">
              {phase === 'recording' && 'Recording video...'}
              {phase === 'encoding' && 'Encoding...'}
              {phase === 'uploading' && 'Uploading to cloud...'}
              {phase === 'complete' && 'Complete!'}
            </span>
            <span className="text-sm font-mono text-[#666]">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>
          <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B2B] via-[#FF2255] to-[#8844FF] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] text-[#555] font-mono">
            {dims.width}×{dims.height} · {FPS}fps · {format.toUpperCase()}
          </div>

          {phase === 'complete' && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 bg-white text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Download Video ({outputBlob ? `${(outputBlob.size / 1024 / 1024).toFixed(1)}MB` : ''})
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-3 border border-[#333] text-[#999] rounded-lg hover:border-[#555] transition-colors"
              >
                New Render
              </button>
            </div>
          )}
          {outputUrl && (
            <div className="mt-3 text-xs text-[#555] font-mono break-all">
              Cloud URL: {outputUrl}
            </div>
          )}
        </div>
      )}

      {/* Start render button */}
      {phase === 'idle' && (
        <button
          onClick={startRender}
          disabled={project.scenes.length === 0}
          className="w-full py-4 bg-gradient-to-r from-[#FF6B2B] via-[#FF2255] to-[#8844FF] text-white font-bold rounded-xl text-lg hover:opacity-90 transition-opacity disabled:opacity-40 animate-pulse-glow"
        >
          Start Rendering
        </button>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-[#222]">
        <button
          onClick={() => router.push(`/${params.projectId}/preview`)}
          className="px-5 py-2.5 border border-[#333] text-[#999] rounded-lg text-sm hover:border-[#555] transition-colors"
        >
          Preview
        </button>
        <button
          onClick={() => router.push(`/${params.projectId}/share`)}
          className="px-5 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Next: Share
        </button>
      </div>
    </div>
  )
}
