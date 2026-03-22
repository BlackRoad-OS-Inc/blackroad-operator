/**
 * BlackRoad World Visualizer — Three.js + WebGL
 * Renders world artifacts as floating orbs in 3D space
 * Connects to /api/worlds endpoint for live data
 */
import * as THREE from "three";

interface WorldArtifact {
  id: string;
  type: "world" | "lore" | "code";
  name: string;
  date: string;
  url: string;
}

const TYPE_COLOR: Record<string, number> = {
  world: 0xf5a623,
  lore:  0x9c27b0,
  code:  0x2979ff,
};

export class WorldVisualizer {
  private scene:    THREE.Scene;
  private camera:   THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private orbs:     Map<string, THREE.Mesh> = new Map();
  private clock = new THREE.Clock();

  constructor(private container: HTMLElement) {
    this.scene    = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050505);
    this.scene.fog = new THREE.Fog(0x050505, 20, 100);

    this.camera = new THREE.PerspectiveCamera(
      60, container.clientWidth / container.clientHeight, 0.1, 1000
    );
    this.camera.position.set(0, 5, 20);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Ambient + point lights
    this.scene.add(new THREE.AmbientLight(0x222222));
    const pt = new THREE.PointLight(0xff1d6c, 2, 50);
    pt.position.set(0, 10, 0);
    this.scene.add(pt);

    // Grid
    const grid = new THREE.GridHelper(40, 40, 0x1a1a1a, 0x111111);
    this.scene.add(grid);

    window.addEventListener("resize", this.onResize.bind(this));
    this.animate();
  }

  updateArtifacts(artifacts: WorldArtifact[]): void {
    const seen = new Set<string>();
    artifacts.forEach((a, i) => {
      seen.add(a.id);
      if (!this.orbs.has(a.id)) {
        const color = TYPE_COLOR[a.type] ?? 0xff1d6c;
        const geo  = new THREE.SphereGeometry(0.4 + Math.random() * 0.2, 16, 16);
        const mat  = new THREE.MeshPhongMaterial({
          color, emissive: color, emissiveIntensity: 0.4, shininess: 80,
        });
        const mesh = new THREE.Mesh(geo, mat);
        // Arrange in spiral
        const angle = (i / artifacts.length) * Math.PI * 4;
        const radius = 3 + i * 0.5;
        mesh.position.set(
          Math.cos(angle) * radius,
          1 + Math.random() * 3,
          Math.sin(angle) * radius,
        );
        mesh.userData = { artifact: a, phase: Math.random() * Math.PI * 2 };
        this.scene.add(mesh);
        this.orbs.set(a.id, mesh);
      }
    });
    // Remove stale
    for (const [id, mesh] of this.orbs) {
      if (!seen.has(id)) {
        this.scene.remove(mesh);
        this.orbs.delete(id);
      }
    }
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    const t = this.clock.getElapsedTime();
    // Camera orbit
    this.camera.position.x = Math.sin(t * 0.1) * 20;
    this.camera.position.z = Math.cos(t * 0.1) * 20;
    this.camera.lookAt(0, 2, 0);
    // Orb float
    for (const mesh of this.orbs.values()) {
      const { phase } = mesh.userData;
      mesh.position.y += Math.sin(t + phase) * 0.003;
      mesh.rotation.y += 0.005;
    }
    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose(): void {
    this.renderer.dispose();
    window.removeEventListener("resize", this.onResize.bind(this));
  }
}
