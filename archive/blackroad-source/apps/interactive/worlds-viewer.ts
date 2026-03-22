/**
 * BlackRoad OS — Worlds Viewer
 * Three.js spinning orb visualization for world artifacts
 */

import * as THREE from 'three';

export interface WorldArtifact {
  id: string;
  title: string;
  type: 'world' | 'lore' | 'code';
  node: string;
  preview?: string;
  timestamp: string;
}

const TYPE_COLORS: Record<string, number> = {
  world: 0x2979ff,  // electric blue
  lore: 0x9c27b0,   // violet
  code: 0xff1d6c,   // hot pink
};

const NODE_COLORS: Record<string, number> = {
  aria64: 0xf5a623,  // amber
  alice: 0x00e5ff,   // cyan
};

export function createWorldOrb(artifact: WorldArtifact, container: HTMLElement): {
  renderer: THREE.WebGLRenderer;
  dispose: () => void;
} {
  const color = TYPE_COLORS[artifact.type] ?? 0xffffff;
  const nodeColor = NODE_COLORS[artifact.node] ?? 0x888888;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Main orb
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhongMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.15,
    shininess: 80,
    wireframe: false,
  });
  const orb = new THREE.Mesh(geometry, material);
  scene.add(orb);

  // Wireframe overlay
  const wireGeo = new THREE.SphereGeometry(1.01, 24, 24);
  const wireMat = new THREE.MeshBasicMaterial({ color: nodeColor, wireframe: true, opacity: 0.12, transparent: true });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wire);

  // Outer glow ring
  const ringGeo = new THREE.TorusGeometry(1.4, 0.02, 8, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: nodeColor });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  scene.add(ring);

  // Lights
  const ambient = new THREE.AmbientLight(0x333333);
  scene.add(ambient);
  const point = new THREE.PointLight(color, 2, 10);
  point.position.set(2, 2, 2);
  scene.add(point);
  const point2 = new THREE.PointLight(nodeColor, 1, 8);
  point2.position.set(-2, -1, -2);
  scene.add(point2);

  // Animate
  let animId: number;
  const animate = () => {
    animId = requestAnimationFrame(animate);
    orb.rotation.y += 0.005;
    orb.rotation.x += 0.001;
    wire.rotation.y += 0.007;
    ring.rotation.z += 0.003;
    renderer.render(scene, camera);
  };
  animate();

  // Resize
  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', onResize);

  return {
    renderer,
    dispose: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      container.removeChild(renderer.domElement);
    },
  };
}

/** Standalone demo: mount a rotating world orb into `#world-orb` */
export async function mountDemo(containerId = 'world-orb'): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Container #${containerId} not found`);

  // Fetch latest world from GitHub API
  let artifact: WorldArtifact = {
    id: 'demo',
    title: 'Demo World',
    type: 'world',
    node: 'aria64',
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch('https://blackroadwebapp.vercel.app/api/worlds?limit=1');
    if (res.ok) {
      const data = await res.json();
      if (data.worlds?.length) artifact = data.worlds[0];
    }
  } catch {
    // Use default artifact
  }

  createWorldOrb(artifact, container);
}
