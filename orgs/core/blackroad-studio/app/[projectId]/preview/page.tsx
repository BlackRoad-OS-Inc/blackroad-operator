'use client'

import { useProjectStore } from '@/stores/project-store'
import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { Player } from '@remotion/player'
import { Video } from '@/remotion/Video'
import { calculateTotalDuration, framesToTimecode } from '@/remotion/utils/timing'
import { FPS, VIDEO_WIDTH, VIDEO_HEIGHT } from '@/lib/constants'
import { MUSIC_TRACKS, MUSIC_CATEGORIES } from '@/lib/templates/music'
import { useToast } from '@/components/ui/Toast'
import { SceneThumbnail } from '@/components/ui/SceneThumbnail'

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const { getCurrentProject, updateProjectMusic } = useProjectStore()
  const { toast } = useToast()
  const [showMusic, setShowMusic] = useState(false)
  const [musicCategory, setMusicCategory] = useState<string | null>(null)

  const project = getCurrentProject()
  if (!project) return <div className="p-8 text-[#666]">Loading...</div>

  const totalFrames = Math.max(1, calculateTotalDuration(project.scenes))
  const selectedTrack = project.music ? MUSIC_TRACKS.find((t) => t.id === project.music!.trackId) : null

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Preview</h2>
          <p className="text-sm text-[#666]">
            {project.scenes.length} scenes · {framesToTimecode(totalFrames)} total
          </p>
        </div>
        <button
          onClick={() => setShowMusic(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTrack
              ? 'bg-[#1a1a1a] border border-[#FF1D6C] text-white'
              : 'bg-[#222] hover:bg-[#333] text-[#999]'
          }`}
        >
          {selectedTrack ? `♫ ${selectedTrack.name}` : '+ Background Music'}
        </button>
      </div>

      {project.scenes.length === 0 ? (
        <div className="bg-[#111] border border-[#222] rounded-2xl p-12 text-center">
          <p className="text-[#555] mb-4">No scenes to preview. Add scenes in the Script tab.</p>
          <button
            onClick={() => router.push(`/${params.projectId}/script`)}
            className="px-5 py-2.5 bg-[#222] hover:bg-[#333] rounded-lg text-sm transition-colors"
          >
            Go to Script
          </button>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden">
          <Player
            component={Video}
            inputProps={{ project }}
            durationInFrames={totalFrames}
            fps={FPS}
            compositionWidth={project.settings?.width || VIDEO_WIDTH}
            compositionHeight={project.settings?.height || VIDEO_HEIGHT}
            style={{
              width: '100%',
              aspectRatio: `${project.settings?.width || VIDEO_WIDTH}/${project.settings?.height || VIDEO_HEIGHT}`,
            }}
            controls
            autoPlay={false}
            loop={false}
          />
        </div>
      )}

      {/* Music info bar */}
      {selectedTrack && (
        <div className="mt-4 bg-[#111] border border-[#222] rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">♫</span>
            <div>
              <div className="text-sm font-semibold">{selectedTrack.name}</div>
              <div className="text-[10px] text-[#555]">
                {selectedTrack.category} · {selectedTrack.bpm > 0 ? `${selectedTrack.bpm} BPM · ` : ''}{selectedTrack.durationSeconds}s
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#555]">Vol</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((project.music?.volume ?? 0.5) * 100)}
                onChange={(e) =>
                  updateProjectMusic(project.id, {
                    trackId: selectedTrack.id,
                    volume: parseInt(e.target.value) / 100,
                  })
                }
                className="w-20 accent-[#FF1D6C]"
              />
              <span className="text-[10px] text-[#666] font-mono w-8">
                {Math.round((project.music?.volume ?? 0.5) * 100)}%
              </span>
            </div>
            <button
              onClick={() => {
                updateProjectMusic(project.id, null)
                toast('Music removed', 'info')
              }}
              className="text-xs text-[#555] hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Scene timeline */}
      <div className="mt-8">
        <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider mb-3">
          Scene Timeline
        </h3>

        {/* Visual timeline bar */}
        {project.scenes.length > 0 && (
          <div className="flex gap-0.5 mb-4 h-2 rounded-full overflow-hidden">
            {project.scenes.map((scene, i) => {
              const width = (scene.durationFrames / totalFrames) * 100
              const colors: Record<string, string> = {
                title: '#FF6B2B',
                dialogue: '#FF2255',
                narration: '#8844FF',
                end: '#4488FF',
                transition: '#00D4FF',
              }
              return (
                <div
                  key={scene.id}
                  className="h-full transition-all hover:opacity-80"
                  style={{ width: `${width}%`, background: colors[scene.type] || '#555' }}
                  title={`Scene ${i + 1}: ${scene.type} (${Math.round(scene.durationFrames / FPS)}s)`}
                />
              )
            })}
          </div>
        )}

        <div className="space-y-2">
          {project.scenes.map((scene, i) => (
            <div
              key={scene.id}
              className="flex items-center gap-4 bg-[#111] border border-[#222] rounded-lg px-4 py-3"
            >
              <span className="text-xs font-mono text-[#555] w-8">#{i + 1}</span>
              <SceneThumbnail scene={scene} width={48} height={27} />
              <span className="text-sm flex-1 capitalize">{scene.type}</span>
              <span className="text-xs text-[#666]">
                {scene.characters.length} chars · {scene.dialogue.length} lines
              </span>
              <span className="text-[10px] font-mono text-[#444]">
                {Math.round(scene.durationFrames / FPS)}s · {scene.transition}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-[#222]">
        <button
          onClick={() => router.push(`/${params.projectId}/voice`)}
          className="px-5 py-2.5 border border-[#333] text-[#999] rounded-lg text-sm hover:border-[#555] transition-colors"
        >
          Voice
        </button>
        <button
          onClick={() => router.push(`/${params.projectId}/render`)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#FF6B2B] via-[#FF2255] to-[#8844FF] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Render Video
        </button>
      </div>

      {/* Music picker modal */}
      {showMusic && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowMusic(false)}
        >
          <div
            className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Background Music</h3>

            {/* Category filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setMusicCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !musicCategory ? 'bg-[#FF1D6C] text-white' : 'bg-[#222] text-[#999] hover:bg-[#333]'
                }`}
              >
                All
              </button>
              {MUSIC_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setMusicCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    musicCategory === cat.id ? 'bg-[#FF1D6C] text-white' : 'bg-[#222] text-[#999] hover:bg-[#333]'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Track list */}
            <div className="space-y-2">
              {MUSIC_TRACKS
                .filter((t) => !musicCategory || t.category === musicCategory)
                .map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      updateProjectMusic(project.id, { trackId: track.id, volume: 0.5 })
                      toast(`Music set: ${track.name}`, 'success')
                      setShowMusic(false)
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      project.music?.trackId === track.id
                        ? 'border-[#FF1D6C] bg-[#1a1a1a]'
                        : 'border-[#222] hover:border-[#444] bg-[#0a0a0a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{track.name}</span>
                      <span className="text-[10px] font-mono text-[#555]">
                        {track.bpm > 0 ? `${track.bpm}bpm` : 'ambient'} · {track.durationSeconds}s
                      </span>
                    </div>
                    <p className="text-xs text-[#666]">{track.description}</p>
                    <span className="inline-block mt-1 text-[9px] text-[#444] bg-[#1a1a1a] px-2 py-0.5 rounded capitalize">
                      {track.category}
                    </span>
                  </button>
                ))}
            </div>

            {/* Remove music option */}
            {project.music && (
              <button
                onClick={() => {
                  updateProjectMusic(project.id, null)
                  toast('Music removed', 'info')
                  setShowMusic(false)
                }}
                className="w-full mt-3 py-2.5 border border-[#333] text-[#666] rounded-lg text-sm hover:border-red-900 hover:text-red-400 transition-colors"
              >
                Remove Music
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
