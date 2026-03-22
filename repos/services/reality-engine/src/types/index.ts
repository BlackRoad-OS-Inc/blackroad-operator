/**
 * Reality Engine - Core Type Definitions
 * Photorealistic 3D rendering with user-generated content
 */

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * Physically Based Rendering (PBR) Material
 * Simulates real-world light interaction for photorealism
 */
export interface PBRMaterial {
  id: string;
  name: string;

  // Albedo (base color)
  albedo: Color;
  albedoMap?: string; // Texture URL

  // Metallic-Roughness workflow (industry standard)
  metallic: number;      // 0 = dielectric, 1 = metallic
  roughness: number;     // 0 = mirror smooth, 1 = completely rough
  metallicMap?: string;
  roughnessMap?: string;

  // Normal mapping for surface detail
  normalMap?: string;
  normalScale: number;

  // Ambient occlusion for realistic shadows
  aoMap?: string;
  aoIntensity: number;

  // Emissive for self-illumination
  emissive: Color;
  emissiveMap?: string;
  emissiveIntensity: number;

  // Height/displacement for geometry detail
  heightMap?: string;
  heightScale: number;

  // Environmental reflection
  envMapIntensity: number;

  // Transparency
  opacity: number;
  transparent: boolean;
  alphaMap?: string;

  // Advanced properties
  clearcoat?: number;        // Car paint, plastic
  clearcoatRoughness?: number;
  sheen?: Color;             // Fabric, velvet
  sheenRoughness?: number;
  transmission?: number;      // Glass, water
  ior?: number;              // Index of refraction (1.5 for glass)
}

/**
 * Realistic Lighting System
 */
export type LightType = 'directional' | 'point' | 'spot' | 'ambient' | 'hemisphere' | 'area';

export interface Light {
  id: string;
  type: LightType;
  position: Vector3;
  direction?: Vector3;
  color: Color;
  intensity: number;

  // Shadows for realism
  castShadow: boolean;
  shadowMapSize: number;    // 1024, 2048, 4096
  shadowBias: number;
  shadowRadius: number;     // Soft shadows

  // Light-specific properties
  distance?: number;        // Point/Spot lights
  angle?: number;           // Spot lights
  penumbra?: number;        // Spot light softness
  decay?: number;           // Physically correct falloff

  // Area light (for realistic studio lighting)
  width?: number;
  height?: number;
}

/**
 * 3D Mesh/Object
 */
export interface Mesh {
  id: string;
  name: string;
  geometry: GeometryData;
  material: string; // Material ID
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;

  // Physics properties
  physics?: PhysicsProperties;

  // Rendering
  castShadow: boolean;
  receiveShadow: boolean;
  visible: boolean;
  renderOrder: number;

  // LOD (Level of Detail) for performance
  lod?: LODLevel[];

  // Metadata
  createdBy?: string;
  tags: string[];
  isUserGenerated: boolean;
}

export interface GeometryData {
  type: 'box' | 'sphere' | 'cylinder' | 'plane' | 'custom' | 'imported';

  // Procedural geometry params
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
  segments?: number;

  // Custom geometry
  vertices?: number[];
  normals?: number[];
  uvs?: number[];
  indices?: number[];

  // Imported model
  modelUrl?: string;
  format?: 'gltf' | 'glb' | 'fbx' | 'obj';
}

export interface LODLevel {
  distance: number;
  geometry: GeometryData;
}

/**
 * Physics Integration
 */
export interface PhysicsProperties {
  enabled: boolean;
  type: 'static' | 'dynamic' | 'kinematic';
  mass: number;
  friction: number;
  restitution: number; // Bounciness
  shape: 'box' | 'sphere' | 'cylinder' | 'hull' | 'mesh';
  collisionGroup: number;
  collisionMask: number;
}

/**
 * Camera Configuration
 */
export interface Camera {
  id: string;
  type: 'perspective' | 'orthographic';
  position: Vector3;
  target: Vector3;
  fov: number;
  aspect: number;
  near: number;
  far: number;

  // Post-processing effects
  postProcessing: PostProcessingEffects;
}

/**
 * Post-Processing for Photorealism
 */
export interface PostProcessingEffects {
  enabled: boolean;

  // Tone mapping (HDR to screen)
  toneMapping: 'none' | 'linear' | 'reinhard' | 'cineon' | 'aces';
  exposure: number;

  // Anti-aliasing
  antialiasing: 'none' | 'fxaa' | 'smaa' | 'taa';

  // Bloom (glow)
  bloom: {
    enabled: boolean;
    strength: number;
    threshold: number;
    radius: number;
  };

  // Ambient occlusion (SSAO/HBAO)
  ambientOcclusion: {
    enabled: boolean;
    intensity: number;
    radius: number;
    bias: number;
  };

  // Depth of field (realistic camera focus)
  depthOfField: {
    enabled: boolean;
    focusDistance: number;
    focalLength: number;
    bokehScale: number;
  };

  // Color grading
  colorGrading: {
    enabled: boolean;
    contrast: number;
    saturation: number;
    brightness: number;
    temperature: number; // Color temperature
  };

  // God rays (volumetric lighting)
  godRays: {
    enabled: boolean;
    density: number;
    weight: number;
    decay: number;
  };

  // Screen space reflections
  ssr: {
    enabled: boolean;
    intensity: number;
    maxDistance: number;
  };
}

/**
 * Environment/Skybox
 */
export interface Environment {
  skybox: {
    type: 'color' | 'gradient' | 'hdri' | 'procedural';
    color?: Color;
    topColor?: Color;
    bottomColor?: Color;
    hdriUrl?: string;
    rotation: number;
  };

  // Image-based lighting for realism
  environmentMap?: string; // HDRI URL
  environmentIntensity: number;

  // Atmospheric effects
  fog: {
    enabled: boolean;
    type: 'linear' | 'exponential' | 'exponential2';
    color: Color;
    near: number;
    far: number;
    density: number;
  };

  // Weather
  weather?: {
    type: 'clear' | 'rain' | 'snow' | 'fog';
    intensity: number;
  };
}

/**
 * Complete Scene
 */
export interface Scene {
  id: string;
  name: string;
  description: string;

  // Scene graph
  meshes: Mesh[];
  lights: Light[];
  cameras: Camera[];
  materials: Record<string, PBRMaterial>;

  // Environment
  environment: Environment;

  // Physics world
  physics: {
    enabled: boolean;
    gravity: Vector3;
    timestep: number;
  };

  // Metadata
  createdBy: string;
  createdAt: Date;
  modifiedAt: Date;
  isPublic: boolean;
  tags: string[];
  thumbnail?: string;
}

/**
 * User Creation Tools
 */
export interface CreationTool {
  type: 'sculpt' | 'paint' | 'terrain' | 'building' | 'character' | 'vehicle';
  enabled: boolean;
  settings: Record<string, any>;
}

export interface TerrainGenerator {
  size: Vector3;
  resolution: number;

  // Procedural generation
  heightmap?: {
    type: 'noise' | 'image' | 'custom';
    scale: number;
    octaves: number;
    persistence: number;
    lacunarity: number;
    seed: number;
  };

  // Material layers (splat mapping)
  layers: TerrainLayer[];
}

export interface TerrainLayer {
  material: string;
  heightRange: [number, number];
  slopeRange?: [number, number];
  blendSharpness: number;
}

/**
 * Networking/Multiplayer
 */
export interface NetworkUpdate {
  timestamp: number;
  updates: EntityUpdate[];
}

export interface EntityUpdate {
  id: string;
  position?: Vector3;
  rotation?: Quaternion;
  velocity?: Vector3;
  animation?: string;
}

/**
 * Asset Library
 */
export interface Asset {
  id: string;
  name: string;
  type: 'model' | 'material' | 'texture' | 'scene' | 'prefab';
  url: string;
  thumbnail: string;
  author: string;
  downloads: number;
  rating: number;
  tags: string[];
  license: 'free' | 'premium' | 'commercial';
  price?: number;
}

export interface AssetLibrary {
  featured: Asset[];
  categories: Record<string, Asset[]>;
  userAssets: Asset[];
}
