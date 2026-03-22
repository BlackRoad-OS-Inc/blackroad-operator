import { useEffect, useRef, useState } from 'react';
import type { OfficeState } from '../office/engine/officeState.js';
import { CharacterState } from '../office/types.js';

// Palette shirt colors — must match defaultCharacters.ts palettes
const PALETTE_COLORS = [
  '#4169E1', // blue
  '#DC143C', // red
  '#32CD32', // green
  '#9370DB', // purple
  '#FF8C00', // orange
  '#20B2AA', // teal
];

interface AgentLabelsProps {
  officeState: OfficeState;
  zoom: number;
  panRef: React.RefObject<{ x: number; y: number }>;
  onAgentClick?: (agentId: string, screenX: number, screenY: number) => void;
}

interface LabelPosition {
  agentId: string;
  name: string;
  role: string;
  labelX: number;
  labelY: number;
  avatarX: number;
  avatarY: number;
  isActive: boolean;
  state: string;
  tool: string | undefined;
  bubbleType: 'permission' | 'waiting' | null;
  isSelected: boolean;
  palette: number;
}

export function AgentLabels({ officeState, zoom, panRef, onAgentClick }: AgentLabelsProps) {
  const [labelPositions, setLabelPositions] = useState<LabelPosition[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const updatePositions = () => {
      const positions: LabelPosition[] = [];
      for (const [agentId, char] of officeState.characters) {
        // Use char.x/y for smooth movement tracking
        const px = panRef.current!.x;
        const py = panRef.current!.y;
        const avatarX = char.x * zoom + px - 8 * zoom;
        const avatarY = char.y * zoom + py - 20 * zoom;
        const labelX = char.x * zoom + px;
        const labelY = avatarY - 14;
        positions.push({
          agentId,
          name: char.name || agentId,
          role: char.role || '',
          labelX,
          labelY,
          avatarX,
          avatarY,
          isActive: char.active,
          state: char.state,
          tool: char.tool,
          bubbleType: char.bubbleState.type === 'none' ? null : (char.bubbleState.type as 'permission' | 'waiting'),
          isSelected: officeState.selectedAgentId === agentId,
          palette: char.palette,
        });
      }
      setLabelPositions(positions);
      rafRef.current = requestAnimationFrame(updatePositions);
    };
    rafRef.current = requestAnimationFrame(updatePositions);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [officeState, zoom, panRef]);

  const avatarW = Math.max(14, 16 * zoom);
  const avatarH = Math.max(21, 24 * zoom);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      <style>{`
        @keyframes avatar-typing {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-1px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(1px); }
        }
        @keyframes avatar-walk {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes avatar-active-glow {
          0%, 100% { box-shadow: 0 0 4px rgba(96,165,250,0.4), 0 2px 4px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 10px rgba(96,165,250,0.8), 0 2px 4px rgba(0,0,0,0.5); }
        }
        .avatar-typing { animation: avatar-typing 0.4s ease-in-out infinite; }
        .avatar-walk { animation: avatar-walk 0.35s ease-in-out infinite; }
        .avatar-active-glow { animation: avatar-active-glow 1.5s ease-in-out infinite; }
      `}</style>
      {labelPositions.map((pos) => {
        let dotColor = 'transparent';
        let dotClass = '';
        if (pos.bubbleType === 'waiting') {
          dotColor = '#facc15';
        } else if (pos.isActive) {
          dotColor = '#60a5fa';
          dotClass = 'pixel-agents-pulse';
        }

        const baseColor = PALETTE_COLORS[pos.palette % PALETTE_COLORS.length];
        const isTyping = pos.state === CharacterState.TYPE;
        const isWalking = pos.state === CharacterState.WALK;
        const avatarAnimClass = isTyping ? 'avatar-typing' : isWalking ? 'avatar-walk' : '';
        const glowClass = pos.isActive ? 'avatar-active-glow' : '';

        return (
          <div key={pos.agentId}>
            {/* Colored character avatar */}
            <div
              className={`${avatarAnimClass} ${glowClass}`.trim()}
              onClick={(e) => {
                e.stopPropagation();
                onAgentClick?.(pos.agentId, e.clientX, e.clientY);
              }}
              style={{
                position: 'absolute',
                left: pos.avatarX,
                top: pos.avatarY,
                width: avatarW,
                height: avatarH,
                background: baseColor,
                border: pos.isSelected ? '2px solid #fbbf24'
                  : pos.isActive ? '2px solid #60a5fa'
                  : '2px solid rgba(255,255,255,0.4)',
                borderRadius: `${Math.max(2, avatarW * 0.2)}px ${Math.max(2, avatarW * 0.2)}px 2px 2px`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                cursor: 'pointer',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                overflow: 'hidden',
                transition: 'left 0.08s linear, top 0.08s linear',
              }}
            >
              {/* Head */}
              <div
                style={{
                  width: avatarW * 0.5,
                  height: avatarW * 0.5,
                  borderRadius: '50%',
                  background: '#FDBCB4',
                  marginTop: avatarW * 0.1,
                  border: '1px solid rgba(0,0,0,0.2)',
                }}
              />
              {/* Activity indicator inside body */}
              {isTyping && (
                <div style={{
                  marginTop: 2,
                  fontSize: Math.max(8, avatarW * 0.4),
                  lineHeight: 1,
                }}>⌨️</div>
              )}
            </div>

            {/* Tool bubble */}
            {pos.isActive && pos.tool && (
              <div style={{
                position: 'absolute',
                left: pos.avatarX + avatarW + 4,
                top: pos.avatarY - 2,
                background: 'rgba(0,0,0,0.75)',
                color: '#60a5fa',
                fontSize: '9px',
                fontWeight: 600,
                padding: '2px 5px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}>
                {pos.tool}
              </div>
            )}

            {/* Name label (clickable) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onAgentClick?.(pos.agentId, e.clientX, e.clientY);
              }}
              style={{
                position: 'absolute',
                left: pos.labelX,
                top: pos.labelY,
                transform: 'translateX(-50%)',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 600,
                color: pos.isSelected ? '#fbbf24' : '#fff',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div
                  className={dotClass}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: dotColor,
                    flexShrink: 0,
                  }}
                />
                <span>{pos.name}</span>
              </div>
              {pos.role && <div style={{ fontSize: '9px', opacity: 0.7 }}>{pos.role}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
