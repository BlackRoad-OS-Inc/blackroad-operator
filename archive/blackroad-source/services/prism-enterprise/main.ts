/**
 * Reality Engine Client - Photorealistic 3D Viewer
 *
 * This is where the magic happens! Connect to Reality Engine backend
 * and render everything in stunning photorealistic quality.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import GUI from 'lil-gui';
import Stats from 'stats.js';

// Configuration
const CONFIG = {
  ENGINE_URL: 'http://localhost:4500',
  WS_URL: 'ws://localhost:4500',
  ENABLE_SHADOWS: true,
  ENABLE_POST_PROCESSING: true,
  ENABLE_PHYSICS: true
};

class RealityEngineClient {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private composer: EffectComposer;
  private stats: Stats;
  private gui: GUI;
  private ws: WebSocket | null = null;

  private clock: THREE.Clock;
  private meshes: Map<string, THREE.Object3D> = new Map();
  private materials: Map<string, THREE.Material> = new Map();

  constructor() {
    this.clock = new THREE.Clock();
    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.initControls();
    this.initLights();
    this.initPostProcessing();
    this.initStats();
    this.initGUI();
    this.initEventListeners();

    this.connectToBackend();
    this.animate();

    this.hideLoading();
  }

  /**
   * Initialize Three.js scene
   */
  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
    this.scene.fog = new THREE.Fog(0x87ceeb, 100, 1000);

    // Add environment map for reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
  }

  /**
   * Initialize WebGL renderer with photorealistic settings
   */
  private initRenderer(): void {
    const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Enable physically accurate lighting
    this.renderer.physicallyCorrectLights = true;

    // Enable shadows for realism
    this.renderer.shadowMap.enabled = CONFIG.ENABLE_SHADOWS;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Enable tone mapping (HDR to screen)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Output encoding for correct colors
    this.renderer.outputEncoding = THREE.sRGBEncoding;
  }

  /**
   * Initialize camera with realistic FOV
   */
  private initCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      50, // FOV - mimics 35mm lens
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );

    this.camera.position.set(50, 30, 50);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Initialize orbit controls for camera movement
   */
  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 500;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground
  }

  /**
   * Initialize photorealistic lighting
   * Three-point lighting setup (key, fill, rim)
   */
  private initLights(): void {
    // Ambient light (base illumination)
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambient);

    // Key light (main directional light - sun)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
    keyLight.position.set(50, 100, 50);
    keyLight.castShadow = true;

    // High-res shadows
    keyLight.shadow.mapSize.width = 4096;
    keyLight.shadow.mapSize.height = 4096;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 500;
    keyLight.shadow.camera.left = -200;
    keyLight.shadow.camera.right = 200;
    keyLight.shadow.camera.top = 200;
    keyLight.shadow.camera.bottom = -200;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.radius = 2; // Soft shadows

    this.scene.add(keyLight);

    // Fill light (hemisphere - sky/ground)
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.5);
    this.scene.add(hemiLight);

    // Rim light (back lighting for depth)
    const rimLight = new THREE.DirectionalLight(0x9fc5e8, 0.8);
    rimLight.position.set(-30, 50, -50);
    this.scene.add(rimLight);
  }

  /**
   * Initialize post-processing for photorealism
   */
  private initPostProcessing(): void {
    if (!CONFIG.ENABLE_POST_PROCESSING) return;

    this.composer = new EffectComposer(this.renderer);

    // Base render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom (glow on bright objects)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.3,  // strength
      0.5,  // radius
      0.85  // threshold
    );
    this.composer.addPass(bloomPass);

    // SSAO (ambient occlusion)
    const ssaoPass = new SSAOPass(
      this.scene,
      this.camera,
      window.innerWidth,
      window.innerHeight
    );
    ssaoPass.kernelRadius = 16;
    ssaoPass.minDistance = 0.001;
    ssaoPass.maxDistance = 0.1;
    this.composer.addPass(ssaoPass);

    // Anti-aliasing (SMAA - better than FXAA)
    const smaaPass = new SMAAPass(
      window.innerWidth * this.renderer.getPixelRatio(),
      window.innerHeight * this.renderer.getPixelRatio()
    );
    this.composer.addPass(smaaPass);
  }

  /**
   * Initialize performance stats
   */
  private initStats(): void {
    this.stats = new Stats();
    this.stats.showPanel(0); // FPS
    document.body.appendChild(this.stats.dom);
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.top = '80px';
    this.stats.dom.style.right = '20px';
    this.stats.dom.style.left = 'auto';
  }

  /**
   * Initialize debug GUI
   */
  private initGUI(): void {
    this.gui = new GUI();
    this.gui.close();

    const renderFolder = this.gui.addFolder('Rendering');
    renderFolder.add(this.renderer, 'toneMappingExposure', 0, 2, 0.1).name('Exposure');
    renderFolder.add(this.scene.fog, 'near', 0, 500).name('Fog Near');
    renderFolder.add(this.scene.fog, 'far', 0, 2000).name('Fog Far');

    const cameraFolder = this.gui.addFolder('Camera');
    cameraFolder.add(this.camera, 'fov', 20, 120, 1).onChange(() => {
      this.camera.updateProjectionMatrix();
    });
  }

  /**
   * Initialize event listeners
   */
  private initEventListeners(): void {
    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Toolbar buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tool = (e.currentTarget as HTMLElement).dataset.tool;
        this.handleToolClick(tool);
      });
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case ' ':
          // Toggle UI
          const hud = document.getElementById('hud');
          hud.style.display = hud.style.display === 'none' ? 'block' : 'none';
          break;
        case 'g':
          // Toggle GUI
          this.gui._hidden ? this.gui.open() : this.gui.close();
          break;
      }
    });
  }

  /**
   * Connect to Reality Engine backend
   */
  private async connectToBackend(): Promise<void> {
    try {
      // Load initial scene
      const response = await fetch(`${CONFIG.ENGINE_URL}/api/scene`);
      const scene = await response.json();
      this.loadScene(scene);

      // Connect WebSocket for real-time updates
      this.ws = new WebSocket(CONFIG.WS_URL);

      this.ws.onopen = () => {
        console.log('Connected to Reality Engine!');
        this.showNotification('Connected to Reality Engine', 'success');
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.showNotification('Connection error', 'error');
      };

      this.ws.onclose = () => {
        console.log('Disconnected from Reality Engine');
        this.showNotification('Disconnected from Reality Engine', 'warning');
      };

    } catch (error) {
      console.error('Failed to connect to backend:', error);
      this.showNotification('Failed to connect to backend', 'error');
    }
  }

  /**
   * Load scene from backend
   */
  private loadScene(sceneData: any): void {
    console.log('Loading scene:', sceneData);

    // Clear existing meshes
    this.meshes.forEach(mesh => this.scene.remove(mesh));
    this.meshes.clear();

    // Load materials
    if (sceneData.materials) {
      Object.values(sceneData.materials).forEach((mat: any) => {
        this.loadMaterial(mat);
      });
    }

    // Load meshes
    if (sceneData.meshes) {
      sceneData.meshes.forEach((meshData: any) => {
        this.loadMesh(meshData);
      });
    }

    this.updateStats();
  }

  /**
   * Load PBR material
   */
  private loadMaterial(materialData: any): void {
    const material = new THREE.MeshStandardMaterial({
      name: materialData.name,
      color: new THREE.Color(
        materialData.albedo.r,
        materialData.albedo.g,
        materialData.albedo.b
      ),
      metalness: materialData.metallic,
      roughness: materialData.roughness,
      transparent: materialData.transparent,
      opacity: materialData.opacity,
      emissive: new THREE.Color(
        materialData.emissive.r,
        materialData.emissive.g,
        materialData.emissive.b
      ),
      emissiveIntensity: materialData.emissiveIntensity,
      envMapIntensity: materialData.envMapIntensity
    });

    this.materials.set(materialData.id, material);
  }

  /**
   * Load mesh from data
   */
  private loadMesh(meshData: any): void {
    let geometry: THREE.BufferGeometry;

    // Create geometry based on type
    switch (meshData.geometry.type) {
      case 'box':
        geometry = new THREE.BoxGeometry(
          meshData.geometry.width,
          meshData.geometry.height,
          meshData.geometry.depth
        );
        break;

      case 'sphere':
        geometry = new THREE.SphereGeometry(
          meshData.geometry.radius,
          32, 32
        );
        break;

      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          meshData.geometry.radius,
          meshData.geometry.radius,
          meshData.geometry.height,
          32
        );
        break;

      case 'plane':
        geometry = new THREE.PlaneGeometry(
          meshData.geometry.width,
          meshData.geometry.depth,
          meshData.geometry.segments || 1,
          meshData.geometry.segments || 1
        );
        break;

      case 'custom':
        geometry = new THREE.BufferGeometry();
        if (meshData.geometry.vertices) {
          geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(meshData.geometry.vertices, 3)
          );
        }
        if (meshData.geometry.normals) {
          geometry.setAttribute(
            'normal',
            new THREE.Float32BufferAttribute(meshData.geometry.normals, 3)
          );
        }
        if (meshData.geometry.uvs) {
          geometry.setAttribute(
            'uv',
            new THREE.Float32BufferAttribute(meshData.geometry.uvs, 2)
          );
        }
        if (meshData.geometry.indices) {
          geometry.setIndex(meshData.geometry.indices);
        }
        geometry.computeVertexNormals();
        break;

      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    // Get material
    const material = this.materials.get(meshData.material) ||
                     new THREE.MeshStandardMaterial({ color: 0x888888 });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = meshData.name;
    mesh.position.set(
      meshData.position.x,
      meshData.position.y,
      meshData.position.z
    );
    mesh.quaternion.set(
      meshData.rotation.x,
      meshData.rotation.y,
      meshData.rotation.z,
      meshData.rotation.w
    );
    mesh.scale.set(
      meshData.scale.x,
      meshData.scale.y,
      meshData.scale.z
    );

    mesh.castShadow = meshData.castShadow;
    mesh.receiveShadow = meshData.receiveShadow;

    this.scene.add(mesh);
    this.meshes.set(meshData.id, mesh);
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    console.log('WebSocket message:', data);

    switch (data.type) {
      case 'welcome':
        this.loadScene(data.scene);
        break;

      case 'mesh-added':
        this.loadMesh(data.mesh);
        this.updateStats();
        this.showNotification(`Added: ${data.mesh.name}`, 'success');
        break;

      case 'mesh-removed':
        const mesh = this.meshes.get(data.meshId);
        if (mesh) {
          this.scene.remove(mesh);
          this.meshes.delete(data.meshId);
          this.updateStats();
        }
        break;

      case 'mesh-updated':
        // Update mesh transform
        const updateMesh = this.meshes.get(data.meshId);
        if (updateMesh && data.updates) {
          if (data.updates.position) {
            updateMesh.position.set(
              data.updates.position.x,
              data.updates.position.y,
              data.updates.position.z
            );
          }
          if (data.updates.rotation) {
            updateMesh.quaternion.set(
              data.updates.rotation.x,
              data.updates.rotation.y,
              data.updates.rotation.z,
              data.updates.rotation.w
            );
          }
        }
        break;

      case 'terrain-generated':
      case 'building-created':
      case 'character-created':
      case 'vehicle-created':
      case 'city-block-created':
        // Reload entire scene
        setTimeout(() => this.refreshScene(), 500);
        break;
    }
  }

  /**
   * Handle toolbar button clicks
   */
  private async handleToolClick(tool: string): Promise<void> {
    console.log('Tool clicked:', tool);

    // Highlight active button
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${tool}"]`)?.classList.add('active');

    try {
      let endpoint = '';
      let body: any = {};

      switch (tool) {
        case 'terrain':
          endpoint = '/api/create/terrain';
          const biomes = ['grassland', 'mountain', 'desert', 'forest', 'snow'];
          body = { biome: biomes[Math.floor(Math.random() * biomes.length)] };
          break;

        case 'building':
          endpoint = '/api/create/building';
          body = {
            template: {
              name: `Building-${Date.now()}`,
              floors: Math.floor(Math.random() * 20) + 5,
              width: 20 + Math.random() * 20,
              depth: 20 + Math.random() * 20,
              height: 70,
              style: ['modern', 'classical', 'industrial'][Math.floor(Math.random() * 3)],
              materials: {
                walls: 'concrete',
                roof: 'chrome',
                windows: 'glass',
                doors: 'wood-oak'
              }
            },
            position: {
              x: (Math.random() - 0.5) * 100,
              y: 0,
              z: (Math.random() - 0.5) * 100
            }
          };
          break;

        case 'character':
          endpoint = '/api/create/character';
          body = {
            template: {
              name: `Character-${Date.now()}`,
              bodyType: Math.random() > 0.5 ? 'male' : 'female',
              height: 1.6 + Math.random() * 0.4,
              proportions: { head: 1.0, torso: 1.0, arms: 1.0, legs: 1.0 },
              customization: {
                skinTone: ['light', 'medium', 'dark'][Math.floor(Math.random() * 3)],
                hairStyle: 'short',
                clothing: ['shirt-blue', 'pants-jeans'],
                accessories: []
              }
            },
            position: {
              x: (Math.random() - 0.5) * 50,
              y: 0,
              z: (Math.random() - 0.5) * 50
            }
          };
          break;

        case 'vehicle':
          endpoint = '/api/create/vehicle';
          body = {
            type: 'car',
            position: {
              x: (Math.random() - 0.5) * 50,
              y: 0,
              z: (Math.random() - 0.5) * 50
            }
          };
          break;

        case 'city':
          endpoint = '/api/create/city-block';
          body = {
            gridSize: 5,
            blockSize: 50,
            position: { x: 0, y: 0, z: 0 }
          };
          break;
      }

      if (endpoint) {
        this.showNotification(`Creating ${tool}...`, 'success');

        const response = await fetch(`${CONFIG.ENGINE_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const result = await response.json();
        console.log('Created:', result);
      }

    } catch (error) {
      console.error('Tool error:', error);
      this.showNotification(`Error creating ${tool}`, 'error');
    }

    // Remove active state
    setTimeout(() => {
      document.querySelector(`[data-tool="${tool}"]`)?.classList.remove('active');
    }, 1000);
  }

  /**
   * Refresh scene from backend
   */
  private async refreshScene(): Promise<void> {
    try {
      const response = await fetch(`${CONFIG.ENGINE_URL}/api/scene`);
      const scene = await response.json();
      this.loadScene(scene);
    } catch (error) {
      console.error('Failed to refresh scene:', error);
    }
  }

  /**
   * Update stats display
   */
  private updateStats(): void {
    const objectCount = this.meshes.size;
    let triangleCount = 0;

    this.meshes.forEach(mesh => {
      if (mesh instanceof THREE.Mesh && mesh.geometry) {
        const geo = mesh.geometry;
        if (geo.index) {
          triangleCount += geo.index.count / 3;
        } else if (geo.attributes.position) {
          triangleCount += geo.attributes.position.count / 3;
        }
      }
    });

    document.getElementById('object-count')!.textContent = objectCount.toString();
    document.getElementById('triangle-count')!.textContent = Math.floor(triangleCount).toLocaleString();
  }

  /**
   * Show notification
   */
  private showNotification(message: string, type: 'success' | 'warning' | 'error' = 'success'): void {
    const container = document.getElementById('notifications')!;
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Window resize handler
   */
  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.composer) {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  /**
   * Hide loading screen
   */
  private hideLoading(): void {
    setTimeout(() => {
      const loading = document.getElementById('loading')!;
      loading.classList.add('hidden');
    }, 1000);
  }

  /**
   * Main animation loop
   */
  private animate = (): void => {
    requestAnimationFrame(this.animate);

    this.stats.begin();

    const delta = this.clock.getDelta();

    // Update controls
    this.controls.update();

    // Render
    if (this.composer && CONFIG.ENABLE_POST_PROCESSING) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // Update FPS display
    const fps = Math.round(1 / delta);
    document.getElementById('fps')!.textContent = fps.toString();

    this.stats.end();
  };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new RealityEngineClient();
});
