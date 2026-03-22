/**
 * BlackRoad Interactive — World Engine
 * Three.js WebGL world renderer for agent visualization
 */

import * as THREE from 'three'

export interface AgentMesh {
  id: string
  name: string
  type: 'architect' | 'dreamer' | 'operator' | 'interface' | 'hacker'
  mesh: THREE.Mesh
  position: THREE.Vector3
  velocity: THREE.Vector3
}

export interface WorldConfig {
  agentCount: number
  worldSize: number
  backgroundColor: number
  gridColor: number
}

const DEFAULT_CONFIG: WorldConfig = {
  agentCount: 5,
  worldSize: 100,
  backgroundColor: 0x000000,
  gridColor: 0x111111,
}

const AGENT_COLORS: Record<string, number> = {
  architect: 0x9c27b0, // violet - Octavia
  dreamer:   0x00bcd4, // cyan   - Lucidia
  operator:  0x4caf50, // green  - Alice
  interface: 0x2979ff, // blue   - Aria
  hacker:    0xf44336, // red    - Shellfish
}

export class BlackRoadWorldEngine {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private agents: AgentMesh[] = []
  private clock = new THREE.Clock()
  private animFrameId?: number

  constructor(private container: HTMLElement, private config = DEFAULT_CONFIG) {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(config.backgroundColor)
    this.scene.fog = new THREE.Fog(config.backgroundColor, 50, 200)

    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 30, 60)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.shadowMap.enabled = true
    container.appendChild(this.renderer.domElement)

    this._buildWorld()
    this._addLights()
    this._spawnAgents()

    window.addEventListener('resize', this._onResize)
  }

  private _buildWorld() {
    // Grid floor
    const grid = new THREE.GridHelper(
      this.config.worldSize,
      this.config.worldSize / 5,
      this.config.gridColor,
      this.config.gridColor
    )
    this.scene.add(grid)

    // Center marker — the "gateway"
    const geo = new THREE.OctahedronGeometry(2, 0)
    const mat = new THREE.MeshStandardMaterial({
      color: 0xf5a623,
      emissive: 0xf5a623,
      emissiveIntensity: 0.5,
      wireframe: false,
    })
    const gateway = new THREE.Mesh(geo, mat)
    gateway.position.y = 2
    this.scene.add(gateway)
  }

  private _addLights() {
    this.scene.add(new THREE.AmbientLight(0x222222))
    const dir = new THREE.DirectionalLight(0xffffff, 1)
    dir.position.set(10, 30, 20)
    dir.castShadow = true
    this.scene.add(dir)

    // Colored point lights for brand
    const lights: [number, [number, number, number]][] = [
      [0xff1d6c, [-20, 5, -20]], // hot-pink
      [0x2979ff, [20, 5, 20]],   // electric-blue
    ]
    for (const [color, pos] of lights) {
      const pl = new THREE.PointLight(color, 2, 50)
      pl.position.set(...pos)
      this.scene.add(pl)
    }
  }

  private _spawnAgents() {
    const types = Object.keys(AGENT_COLORS) as (keyof typeof AGENT_COLORS)[]
    const names = ['Octavia', 'Lucidia', 'Alice', 'Aria', 'Shellfish']

    for (let i = 0; i < Math.min(this.config.agentCount, 5); i++) {
      const type = types[i] as AgentMesh['type'];
      const geo = new THREE.SphereGeometry(1.5, 16, 16)
      const mat = new THREE.MeshStandardMaterial({
        color: AGENT_COLORS[type],
        emissive: AGENT_COLORS[type],
        emissiveIntensity: 0.3,
      })
      const mesh = new THREE.Mesh(geo, mat)

      const angle = (i / 5) * Math.PI * 2
      const radius = 20
      mesh.position.set(Math.cos(angle) * radius, 2, Math.sin(angle) * radius)
      this.scene.add(mesh)

      this.agents.push({
        id: `${type}-001`,
        name: names[i],
        type,
        mesh,
        position: mesh.position.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          0,
          (Math.random() - 0.5) * 0.05
        ),
      })
    }
  }

  start() {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate)
      const delta = this.clock.getDelta()
      this._update(delta)
      this.renderer.render(this.scene, this.camera)
    }
    animate()
  }

  private _update(delta: number) {
    const t = this.clock.elapsedTime

    for (const agent of this.agents) {
      // Orbit around center with slight wobble
      agent.mesh.position.x += agent.velocity.x
      agent.mesh.position.z += agent.velocity.z
      agent.mesh.position.y = 2 + Math.sin(t + agent.id.length) * 0.5

      // Bounce off world bounds
      const { x, z } = agent.mesh.position
      const bound = this.config.worldSize / 2 - 5
      if (Math.abs(x) > bound) agent.velocity.x *= -1
      if (Math.abs(z) > bound) agent.velocity.z *= -1

      // Pulse emissive
      ;(agent.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.2 + Math.sin(t * 2 + agent.position.x) * 0.15

      agent.mesh.rotation.y += delta
    }
  }

  stop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId)
    window.removeEventListener('resize', this._onResize)
  }

  dispose() {
    this.stop()
    this.renderer.dispose()
    this.container.removeChild(this.renderer.domElement)
  }

  private _onResize = () => {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
  }
}
