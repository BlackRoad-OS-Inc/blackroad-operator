/**
 * Earth Metaverse Component
 *
 * React Three Fiber component for rendering the Earth replica metaverse
 * with real-time agent avatars, formations, and celestial bodies.
 */

'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Sphere,
  Stars,
  OrbitControls,
  PerspectiveCamera,
  useTexture,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { AgentAvatar } from '../agent-avatar-system';

// ==================== Types ====================

interface EarthMetaverseProps {
  agents: AgentAvatar[];
  onAgentClick?: (agentId: string) => void;
}

// ==================== Earth Component ====================

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);

  // Load textures (use placeholder colors if textures not available)
  const earthRadius = 100;

  useFrame((state, delta) => {
    if (earthRef.current) {
      // Rotate Earth for day/night cycle
      earthRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Earth sphere */}
      <Sphere ref={earthRef} args={[earthRadius, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#2b5f9e"
          roughness={0.7}
          metalness={0.1}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[earthRadius + 8, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#88ccff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Cloud layer */}
      <Sphere args={[earthRadius + 2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.9}
        />
      </Sphere>
    </group>
  );
}

// ==================== Moon Component ====================

function Moon() {
  const moonRef = useRef<THREE.Group>(null);
  const moonRadius = 27;
  const orbitalDistance = 384;
  const orbitalPeriod = 27.3;

  useFrame((state) => {
    if (moonRef.current) {
      const time = state.clock.getElapsedTime();
      const angle = (time / orbitalPeriod) * Math.PI * 2;

      moonRef.current.position.x = Math.cos(angle) * orbitalDistance;
      moonRef.current.position.z = Math.sin(angle) * orbitalDistance;
    }
  });

  return (
    <group ref={moonRef}>
      <Sphere args={[moonRadius, 32, 32]}>
        <meshStandardMaterial
          color="#888888"
          roughness={1.0}
        />
      </Sphere>
    </group>
  );
}

// ==================== Agent Avatar Component ====================

interface AgentAvatarMeshProps {
  avatar: AgentAvatar;
  onClick?: (agentId: string) => void;
}

function AgentAvatarMesh({ avatar, onClick }: AgentAvatarMeshProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  useFrame(() => {
    if (meshRef.current) {
      // Smooth interpolation to target position
      meshRef.current.position.lerp(
        new THREE.Vector3(
          avatar.transform.position.x,
          avatar.transform.position.y,
          avatar.transform.position.z
        ),
        0.1
      );

      // Gentle floating animation
      meshRef.current.position.y += Math.sin(Date.now() * 0.001) * 0.01;
    }
  });

  const color = new THREE.Color(
    avatar.avatarConfig.colorScheme.r,
    avatar.avatarConfig.colorScheme.g,
    avatar.avatarConfig.colorScheme.b
  );

  return (
    <group
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onClick?.(avatar.agentId)}
    >
      {/* Avatar body - simple capsule for now */}
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>

      {/* Glow effect */}
      {avatar.avatarConfig.customization?.glow && (
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Label */}
      <Html distanceFactor={10} position={[0, 2.5, 0]} center>
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            visibility: hovered ? 'visible' : 'hidden'
          }}
        >
          {avatar.profile.name}
          <br />
          <span style={{ fontSize: '10px', opacity: 0.8 }}>
            {avatar.currentZone}
          </span>
        </div>
      </Html>
    </group>
  );
}

// ==================== Zone Markers ====================

const ZONE_POSITIONS: Record<string, [number, number, number]> = {
  'north-america': [40, 50, -100],
  'europe': [75, 50, 30],
  'asia': [50, 30, 120],
  'africa': [20, 0, 40],
  'south-america': [-30, -15, -60],
  'oceania': [-40, -25, 135],
  'antarctica': [-80, -80, 0],
  'pacific-hub': [-160, 0, 0],
  'atlantic-hub': [-40, 30, 0],
  'orbital-station': [0, 250, 0]
};

function ZoneMarkers() {
  return (
    <>
      {Object.entries(ZONE_POSITIONS).map(([zone, [lon, lat, alt]]) => {
        // Convert lat/lon to Cartesian for sphere surface
        const earthRadius = 100;
        const radius = earthRadius + (alt || 5);

        const latRad = (lat * Math.PI) / 180;
        const lonRad = (lon * Math.PI) / 180;

        const x = radius * Math.cos(latRad) * Math.cos(lonRad);
        const y = radius * Math.sin(latRad);
        const z = radius * Math.cos(latRad) * Math.sin(lonRad);

        return (
          <mesh key={zone} position={[x, y, z]}>
            <sphereGeometry args={[2, 16, 16]} />
            <meshBasicMaterial
              color="#ffaa00"
              transparent
              opacity={0.5}
            />
          </mesh>
        );
      })}
    </>
  );
}

// ==================== Milky Way Background ====================

function MilkyWay() {
  return (
    <>
      <Stars
        radius={5000}
        depth={1000}
        count={10000}
        factor={4}
        saturation={0.5}
        fade
        speed={0.5}
      />

      {/* Background sphere with galaxy texture */}
      <Sphere args={[8000, 32, 32]}>
        <meshBasicMaterial
          color="#0a0a1a"
          side={THREE.BackSide}
        />
      </Sphere>
    </>
  );
}

// ==================== Main Earth Metaverse Component ====================

export default function EarthMetaverse({ agents, onAgentClick }: EarthMetaverseProps) {
  const sunRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    // Animate sun position for realistic lighting
    if (sunRef.current) {
      const time = state.clock.getElapsedTime();
      const distance = 1500;
      sunRef.current.position.x = Math.cos(time * 0.05) * distance;
      sunRef.current.position.y = Math.sin(time * 0.05) * distance * 0.5;
      sunRef.current.position.z = Math.sin(time * 0.05) * distance;
    }
  });

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 150, 300]} fov={60} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={120}
        maxDistance={2000}
      />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight
        ref={sunRef}
        intensity={1.5}
        color="#fff8e7"
        castShadow
      />

      {/* Space background */}
      <MilkyWay />

      {/* Celestial bodies */}
      <Earth />
      <Moon />

      {/* Zone markers */}
      <ZoneMarkers />

      {/* Agent avatars */}
      {agents.map((avatar) => (
        <AgentAvatarMesh
          key={avatar.agentId}
          avatar={avatar}
          onClick={onAgentClick}
        />
      ))}

      {/* Grid helper (optional, for development) */}
      {process.env.NODE_ENV === 'development' && (
        <gridHelper args={[500, 50]} position={[0, 0, 0]} />
      )}
    </>
  );
}

// ==================== Metaverse Container with WebSocket ====================

export function EarthMetaverseContainer() {
  const [agents, setAgents] = useState<AgentAvatar[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const wsUrl = process.env.NEXT_PUBLIC_METAVERSE_WS_URL || 'ws://localhost:8081';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[EarthMetaverse] WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'initial_state':
            setAgents(message.data.agents);
            break;

          case 'state_sync':
            setAgents(message.data.agents);
            break;

          case 'agent_spawned':
            // Fetch updated agent list
            break;

          case 'agent_despawned':
            setAgents(prev => prev.filter(a => a.agentId !== message.data.agentId));
            break;

          default:
            console.log('[EarthMetaverse] Unknown message:', message.type);
        }
      } catch (err) {
        console.error('[EarthMetaverse] WebSocket message error:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('[EarthMetaverse] WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('[EarthMetaverse] WebSocket disconnected');
      setConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const handleAgentClick = (agentId: string) => {
    console.log('[EarthMetaverse] Agent clicked:', agentId);
    // Future: Show agent details panel
  };

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000' }}>
      {/* Connection status */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: connected ? '#00ff00' : '#ff0000',
          color: '#000',
          padding: '8px 16px',
          borderRadius: '4px',
          fontWeight: 'bold',
          zIndex: 1000
        }}
      >
        {connected ? 'CONNECTED' : 'DISCONNECTED'}
      </div>

      {/* Agent count */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          right: 10,
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '4px',
          zIndex: 1000
        }}
      >
        Active Agents: {agents.length}
      </div>

      {/* 3D Canvas */}
      <EarthMetaverse agents={agents} onAgentClick={handleAgentClick} />
    </div>
  );
}
