/**
 * BlackRoad Agent Mesh — Three.js Real-Time Visualization
 * Shows 6 core agents as glowing spheres with animated communication lines.
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ── Agent data ────────────────────────────────────────────────────────────────

const AGENTS = [
  { id: "LUCIDIA", color: 0xff3b5c, pos: [0, 2, 0] as [number, number, number], role: "Philosopher" },
  { id: "ALICE",   color: 0x00e676, pos: [2, 0, 1] as [number, number, number], role: "Executor" },
  { id: "OCTAVIA", color: 0x9c27b0, pos: [-2, 0, 1] as [number, number, number], role: "Operator" },
  { id: "PRISM",   color: 0xffd740, pos: [1, -2, 0] as [number, number, number], role: "Analyst" },
  { id: "ECHO",    color: 0x2979ff, pos: [-1, -2, 0] as [number, number, number], role: "Librarian" },
  { id: "CIPHER",  color: 0xb0bec5, pos: [0, 0, -2] as [number, number, number], role: "Guardian" },
] as const;

const CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4],   // LUCIDIA connects to all
  [1, 2], [1, 5], [2, 5], [3, 4],   // Working relationships
];

// ── Scene setup ───────────────────────────────────────────────────────────────

export class AgentMesh {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private agentMeshes: THREE.Mesh[] = [];
  private communicationLines: THREE.Line[] = [];
  private pulseOffset = 0;

  constructor(container: HTMLElement) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.05);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 8);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;

    // Lights
    const ambient = new THREE.AmbientLight(0x111111);
    this.scene.add(ambient);

    // Grid
    const grid = new THREE.GridHelper(10, 10, 0x222222, 0x111111);
    this.scene.add(grid);

    this._buildAgents();
    this._buildConnections();
    this._animate();

    // Responsive
    window.addEventListener("resize", () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  private _buildAgents() {
    AGENTS.forEach((agent) => {
      const geo = new THREE.SphereGeometry(0.3, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: agent.color,
        emissive: agent.color,
        emissiveIntensity: 0.4,
        roughness: 0.1,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...agent.pos);
      mesh.userData = { agentId: agent.id, baseY: agent.pos[1] };

      // Point light per agent
      const light = new THREE.PointLight(agent.color, 1.5, 3);
      light.position.set(0, 0, 0);
      mesh.add(light);

      this.scene.add(mesh);
      this.agentMeshes.push(mesh);
    });
  }

  private _buildConnections() {
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.4,
    });

    CONNECTIONS.forEach(([a, b]) => {
      const points = [
        this.agentMeshes[a].position.clone(),
        this.agentMeshes[b].position.clone(),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, lineMat.clone());
      this.scene.add(line);
      this.communicationLines.push(line);
    });
  }

  /** Simulate a message flash between two agents */
  flash(fromId: string, toId: string): void {
    const fromIdx = AGENTS.findIndex((a) => a.id === fromId);
    const toIdx = AGENTS.findIndex((a) => a.id === toId);
    const connIdx = CONNECTIONS.findIndex(
      ([a, b]) => (a === fromIdx && b === toIdx) || (a === toIdx && b === fromIdx)
    );
    if (connIdx === -1) return;

    const line = this.communicationLines[connIdx];
    const mat = line.material as THREE.LineBasicMaterial;
    mat.color.set(AGENTS[fromIdx].color);
    mat.opacity = 1;
    setTimeout(() => {
      mat.color.set(0x444444);
      mat.opacity = 0.4;
    }, 500);
  }

  private _animate() {
    requestAnimationFrame(() => this._animate());
    this.pulseOffset += 0.02;

    // Pulse each agent sphere
    this.agentMeshes.forEach((mesh, i) => {
      const scale = 1 + 0.05 * Math.sin(this.pulseOffset + i * 1.2);
      mesh.scale.setScalar(scale);
      mesh.position.y = mesh.userData.baseY + 0.05 * Math.sin(this.pulseOffset * 0.7 + i);
    });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }
}
