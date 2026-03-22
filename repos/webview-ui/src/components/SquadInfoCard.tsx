import { useEffect, useRef, useCallback } from 'react';

export interface SquadInfoData {
  teamName: string | null;
  description: string | null;
  members: Array<{
    name: string;
    role: string;
    status: string;
    isActive: boolean;
    currentTask: string | null;
  }>;
  hiddenMembers: Array<{ name: string; role: string; status: string }>;
  projectContext: string | null;
  totalAgents: number;
  activeAgents: number;
}

interface SquadInfoCardProps {
  info: SquadInfoData | null;
  onClose: () => void;
}

function statusDot(isActive: boolean): string {
  return isActive ? '🟢' : '⚪';
}

function roleEmoji(role: string): string {
  const r = role.toLowerCase();
  if (r.includes('lead') || r.includes('architect')) return '🏗️';
  if (r.includes('frontend') || r.includes('ui') || r.includes('design')) return '⚛️';
  if (r.includes('backend') || r.includes('api') || r.includes('server')) return '🔧';
  if (r.includes('test') || r.includes('qa') || r.includes('quality')) return '🧪';
  if (r.includes('devops') || r.includes('infra')) return '⚙️';
  if (r.includes('docs') || r.includes('devrel') || r.includes('writer')) return '📝';
  if (r.includes('scribe')) return '📋';
  if (r.includes('monitor')) return '🔄';
  return '👤';
}

export function SquadInfoCard({ info, onClose }: SquadInfoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (info) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [info, handleClickOutside, handleEscape]);

  if (!info) return null;

  const accentColor = '#4a9eff';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 200,
      pointerEvents: 'auto',
    }}>
      <div
        ref={cardRef}
        style={{
          width: '400px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          background: 'rgba(26, 26, 46, 0.97)',
          border: `2px solid ${accentColor}`,
          borderRadius: '12px',
          padding: '20px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#e0e0e0',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '22px',
            cursor: 'pointer',
            padding: '0',
            width: '28px',
            height: '28px',
            lineHeight: '24px',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: '16px', paddingRight: '32px' }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '16px',
            color: accentColor,
            marginBottom: '6px',
          }}>
            {info.teamName || 'Squad Team'}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            color: '#aaa',
          }}>
            <span>👥 {info.totalAgents} agent{info.totalAgents !== 1 ? 's' : ''}</span>
            <span>🟢 {info.activeAgents} active</span>
          </div>
        </div>

        {/* Project Context */}
        {info.projectContext && (
          <div style={{
            marginBottom: '16px',
            padding: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>
              📂 Project
            </div>
            <div style={{ fontSize: '11px', lineHeight: '1.5', color: '#ccc' }}>
              {info.projectContext}
            </div>
          </div>
        )}

        {/* Members */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>
            🏢 Team Members
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {info.members.map((m) => (
              <div
                key={m.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  background: m.isActive
                    ? 'rgba(74, 158, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px',
                  border: m.isActive
                    ? '1px solid rgba(74, 158, 255, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span style={{ fontSize: '14px', flexShrink: 0 }}>
                  {roleEmoji(m.role)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '2px',
                  }}>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '12px',
                      color: m.isActive ? accentColor : '#e0e0e0',
                    }}>
                      {m.name}
                    </span>
                    <span style={{ fontSize: '10px', color: '#888' }}>
                      {m.role}
                    </span>
                  </div>
                  {m.currentTask && (
                    <div style={{
                      fontSize: '10px',
                      color: '#60a5fa',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      🔧 {m.currentTask}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '11px', flexShrink: 0 }}>
                  {statusDot(m.isActive)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden members */}
        {info.hiddenMembers.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '6px' }}>
              🔇 Background Services
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {info.hiddenMembers.map((m) => (
                <span
                  key={m.name}
                  style={{
                    fontSize: '10px',
                    color: '#666',
                    padding: '3px 8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {roleEmoji(m.role)} {m.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* No members fallback */}
        {info.members.length === 0 && !info.projectContext && (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            color: '#888',
            fontSize: '11px',
          }}>
            {info.description || 'No squad configuration found. Set up a .squad/team.md to see your team here.'}
          </div>
        )}
      </div>
    </div>
  );
}
