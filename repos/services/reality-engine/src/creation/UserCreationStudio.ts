/**
 * User Creation Studio - Roblox-like Content Creation
 *
 * Enables users to create:
 * - Buildings (Cities Skylines style)
 * - Characters (The Sims style)
 * - Vehicles
 * - Interactive objects
 * - Complete games/experiences
 *
 * All with photorealistic graphics!
 */

import { Mesh, Vector3, PBRMaterial, Asset } from '../types/index.js';
import { TerrainGenerator } from './TerrainGenerator.js';
import { v4 as uuidv4 } from 'uuid';

export interface BuildingTemplate {
  name: string;
  floors: number;
  width: number;
  depth: number;
  height: number;
  style: 'modern' | 'classical' | 'industrial' | 'residential' | 'commercial';
  materials: {
    walls: string;
    roof: string;
    windows: string;
    doors: string;
  };
}

export interface CharacterTemplate {
  name: string;
  bodyType: 'male' | 'female' | 'custom';
  height: number;
  proportions: {
    head: number;
    torso: number;
    arms: number;
    legs: number;
  };
  customization: {
    skinTone: string;
    hairStyle: string;
    clothing: string[];
    accessories: string[];
  };
}

export class UserCreationStudio {
  private terrainGenerator: TerrainGenerator;
  private userAssets: Map<string, Asset> = new Map();

  constructor() {
    this.terrainGenerator = new TerrainGenerator();
  }

  /**
   * Create a building with procedural details
   */
  createBuilding(template: BuildingTemplate, position: Vector3): Mesh[] {
    const meshes: Mesh[] = [];
    const floorHeight = template.height / template.floors;

    // Generate building structure
    for (let floor = 0; floor < template.floors; floor++) {
      // Floor base
      const floorMesh = this.createFloorMesh(
        template,
        floor,
        floorHeight,
        position
      );
      meshes.push(floorMesh);

      // Windows
      const windowMeshes = this.createWindowsForFloor(
        template,
        floor,
        floorHeight,
        position
      );
      meshes.push(...windowMeshes);
    }

    // Roof
    const roofMesh = this.createRoof(template, position);
    meshes.push(roofMesh);

    // Doors (ground floor only)
    const doorMeshes = this.createDoors(template, position);
    meshes.push(...doorMeshes);

    return meshes;
  }

  private createFloorMesh(
    template: BuildingTemplate,
    floorNumber: number,
    floorHeight: number,
    basePosition: Vector3
  ): Mesh {
    return {
      id: uuidv4(),
      name: `${template.name}-floor-${floorNumber}`,
      geometry: {
        type: 'box',
        width: template.width,
        height: floorHeight,
        depth: template.depth
      },
      material: template.materials.walls,
      position: {
        x: basePosition.x,
        y: basePosition.y + floorNumber * floorHeight + floorHeight / 2,
        z: basePosition.z
      },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 1, y: 1, z: 1 },
      castShadow: true,
      receiveShadow: true,
      visible: true,
      renderOrder: 0,
      physics: {
        enabled: true,
        type: 'static',
        mass: 0,
        friction: 0.7,
        restitution: 0.0,
        shape: 'box',
        collisionGroup: 2,
        collisionMask: 0xFFFFFFFF
      },
      tags: ['building', 'floor', template.style],
      isUserGenerated: true
    };
  }

  private createWindowsForFloor(
    template: BuildingTemplate,
    floorNumber: number,
    floorHeight: number,
    basePosition: Vector3
  ): Mesh[] {
    const windows: Mesh[] = [];
    const windowWidth = 1.5;
    const windowHeight = 2.0;
    const spacing = 3.0;

    // Front and back walls
    for (let side of ['front', 'back']) {
      const zOffset = side === 'front' ? template.depth / 2 : -template.depth / 2;
      const numWindows = Math.floor(template.width / spacing);

      for (let i = 0; i < numWindows; i++) {
        const xOffset = (i - numWindows / 2) * spacing;

        windows.push({
          id: uuidv4(),
          name: `window-${floorNumber}-${side}-${i}`,
          geometry: {
            type: 'box',
            width: windowWidth,
            height: windowHeight,
            depth: 0.2
          },
          material: template.materials.windows,
          position: {
            x: basePosition.x + xOffset,
            y: basePosition.y + floorNumber * floorHeight + floorHeight / 2,
            z: basePosition.z + zOffset
          },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 },
          castShadow: true,
          receiveShadow: false,
          visible: true,
          renderOrder: 1,
          tags: ['window', 'transparent'],
          isUserGenerated: true
        });
      }
    }

    return windows;
  }

  private createRoof(template: BuildingTemplate, basePosition: Vector3): Mesh {
    const roofHeight = 1.0;

    return {
      id: uuidv4(),
      name: `${template.name}-roof`,
      geometry: {
        type: 'box',
        width: template.width + 0.5,
        height: roofHeight,
        depth: template.depth + 0.5
      },
      material: template.materials.roof,
      position: {
        x: basePosition.x,
        y: basePosition.y + template.height + roofHeight / 2,
        z: basePosition.z
      },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 1, y: 1, z: 1 },
      castShadow: true,
      receiveShadow: true,
      visible: true,
      renderOrder: 0,
      physics: {
        enabled: true,
        type: 'static',
        mass: 0,
        friction: 0.5,
        restitution: 0.0,
        shape: 'box',
        collisionGroup: 2,
        collisionMask: 0xFFFFFFFF
      },
      tags: ['roof', 'building'],
      isUserGenerated: true
    };
  }

  private createDoors(template: BuildingTemplate, basePosition: Vector3): Mesh[] {
    const doors: Mesh[] = [];
    const doorWidth = 1.2;
    const doorHeight = 2.5;

    doors.push({
      id: uuidv4(),
      name: `${template.name}-door-main`,
      geometry: {
        type: 'box',
        width: doorWidth,
        height: doorHeight,
        depth: 0.15
      },
      material: template.materials.doors,
      position: {
        x: basePosition.x,
        y: basePosition.y + doorHeight / 2,
        z: basePosition.z + template.depth / 2
      },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 1, y: 1, z: 1 },
      castShadow: true,
      receiveShadow: true,
      visible: true,
      renderOrder: 1,
      physics: {
        enabled: true,
        type: 'dynamic', // Can open/close
        mass: 20,
        friction: 0.6,
        restitution: 0.0,
        shape: 'box',
        collisionGroup: 2,
        collisionMask: 0xFFFFFFFF
      },
      tags: ['door', 'interactive'],
      isUserGenerated: true
    });

    return doors;
  }

  /**
   * Create a character with realistic proportions
   */
  createCharacter(template: CharacterTemplate, position: Vector3): Mesh[] {
    const meshes: Mesh[] = [];
    const scale = template.height / 1.8; // Normalize to 1.8m average height

    // Head
    meshes.push({
      id: uuidv4(),
      name: `${template.name}-head`,
      geometry: {
        type: 'sphere',
        radius: 0.15 * template.proportions.head * scale
      },
      material: 'skin-' + template.customization.skinTone,
      position: {
        x: position.x,
        y: position.y + 1.65 * scale,
        z: position.z
      },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 1, y: 1, z: 1 },
      castShadow: true,
      receiveShadow: true,
      visible: true,
      renderOrder: 0,
      physics: {
        enabled: true,
        type: 'dynamic',
        mass: 5,
        friction: 0.5,
        restitution: 0.1,
        shape: 'sphere',
        collisionGroup: 4,
        collisionMask: 0xFFFFFFFF
      },
      tags: ['character', 'head'],
      isUserGenerated: true
    });

    // Torso
    meshes.push({
      id: uuidv4(),
      name: `${template.name}-torso`,
      geometry: {
        type: 'box',
        width: 0.4 * scale,
        height: 0.6 * template.proportions.torso * scale,
        depth: 0.25 * scale
      },
      material: template.customization.clothing[0] || 'cloth-default',
      position: {
        x: position.x,
        y: position.y + 1.2 * scale,
        z: position.z
      },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 1, y: 1, z: 1 },
      castShadow: true,
      receiveShadow: true,
      visible: true,
      renderOrder: 0,
      physics: {
        enabled: true,
        type: 'dynamic',
        mass: 30,
        friction: 0.5,
        restitution: 0.1,
        shape: 'box',
        collisionGroup: 4,
        collisionMask: 0xFFFFFFFF
      },
      tags: ['character', 'torso'],
      isUserGenerated: true
    });

    // Arms (simplified)
    for (const side of ['left', 'right']) {
      const xOffset = side === 'left' ? -0.3 * scale : 0.3 * scale;

      meshes.push({
        id: uuidv4(),
        name: `${template.name}-arm-${side}`,
        geometry: {
          type: 'box',
          width: 0.12 * scale,
          height: 0.6 * template.proportions.arms * scale,
          depth: 0.12 * scale
        },
        material: 'skin-' + template.customization.skinTone,
        position: {
          x: position.x + xOffset,
          y: position.y + 1.1 * scale,
          z: position.z
        },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        visible: true,
        renderOrder: 0,
        physics: {
          enabled: true,
          type: 'dynamic',
          mass: 3,
          friction: 0.5,
          restitution: 0.1,
          shape: 'box',
          collisionGroup: 4,
          collisionMask: 0xFFFFFFFF
        },
        tags: ['character', 'arm'],
        isUserGenerated: true
      });
    }

    // Legs
    for (const side of ['left', 'right']) {
      const xOffset = side === 'left' ? -0.15 * scale : 0.15 * scale;

      meshes.push({
        id: uuidv4(),
        name: `${template.name}-leg-${side}`,
        geometry: {
          type: 'box',
          width: 0.15 * scale,
          height: 0.9 * template.proportions.legs * scale,
          depth: 0.15 * scale
        },
        material: template.customization.clothing[1] || 'cloth-default',
        position: {
          x: position.x + xOffset,
          y: position.y + 0.45 * scale,
          z: position.z
        },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        visible: true,
        renderOrder: 0,
        physics: {
          enabled: true,
          type: 'dynamic',
          mass: 8,
          friction: 0.8,
          restitution: 0.1,
          shape: 'box',
          collisionGroup: 4,
          collisionMask: 0xFFFFFFFF
        },
        tags: ['character', 'leg'],
        isUserGenerated: true
      });
    }

    return meshes;
  }

  /**
   * Create a vehicle
   */
  createVehicle(
    type: 'car' | 'truck' | 'motorcycle' | 'bicycle',
    position: Vector3
  ): Mesh[] {
    const meshes: Mesh[] = [];

    if (type === 'car') {
      // Car body
      meshes.push({
        id: uuidv4(),
        name: 'car-body',
        geometry: {
          type: 'box',
          width: 2.0,
          height: 1.5,
          depth: 4.5
        },
        material: 'car-paint-red',
        position: { ...position, y: position.y + 0.75 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        visible: true,
        renderOrder: 0,
        physics: {
          enabled: true,
          type: 'dynamic',
          mass: 1500,
          friction: 0.7,
          restitution: 0.2,
          shape: 'box',
          collisionGroup: 8,
          collisionMask: 0xFFFFFFFF
        },
        tags: ['vehicle', 'car'],
        isUserGenerated: true
      });

      // Wheels
      const wheelPositions = [
        { x: -0.8, z: -1.2 }, // Front left
        { x: 0.8, z: -1.2 },  // Front right
        { x: -0.8, z: 1.2 },  // Rear left
        { x: 0.8, z: 1.2 }    // Rear right
      ];

      for (const wheelPos of wheelPositions) {
        meshes.push({
          id: uuidv4(),
          name: 'car-wheel',
          geometry: {
            type: 'cylinder',
            radius: 0.4,
            height: 0.3
          },
          material: 'rubber-tire',
          position: {
            x: position.x + wheelPos.x,
            y: position.y + 0.4,
            z: position.z + wheelPos.z
          },
          rotation: { x: 0, y: 0, z: Math.PI / 2, w: 1 },
          scale: { x: 1, y: 1, z: 1 },
          castShadow: true,
          receiveShadow: true,
          visible: true,
          renderOrder: 0,
          physics: {
            enabled: true,
            type: 'dynamic',
            mass: 20,
            friction: 1.2, // High friction for traction
            restitution: 0.3,
            shape: 'cylinder',
            collisionGroup: 8,
            collisionMask: 0xFFFFFFFF
          },
          tags: ['vehicle', 'wheel'],
          isUserGenerated: true
        });
      }
    }

    return meshes;
  }

  /**
   * Save user-created asset to library
   */
  saveAsset(asset: Asset): void {
    this.userAssets.set(asset.id, asset);
  }

  /**
   * Load asset from library
   */
  loadAsset(assetId: string): Asset | undefined {
    return this.userAssets.get(assetId);
  }

  /**
   * Get terrain generator
   */
  getTerrainGenerator(): TerrainGenerator {
    return this.terrainGenerator;
  }

  /**
   * Create a complete city block
   */
  createCityBlock(
    gridSize: number,
    blockSize: number,
    basePosition: Vector3
  ): Mesh[] {
    const meshes: Mesh[] = [];

    const buildingStyles: BuildingTemplate['style'][] = [
      'modern',
      'classical',
      'industrial',
      'residential',
      'commercial'
    ];

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        // Random building
        const style = buildingStyles[Math.floor(Math.random() * buildingStyles.length)];
        const floors = Math.floor(Math.random() * 10) + 3;

        const template: BuildingTemplate = {
          name: `building-${x}-${z}`,
          floors,
          width: blockSize * 0.8,
          depth: blockSize * 0.8,
          height: floors * 3.5,
          style,
          materials: {
            walls: 'concrete',
            roof: 'roofing-tiles',
            windows: 'glass',
            doors: 'wood-oak'
          }
        };

        const position: Vector3 = {
          x: basePosition.x + x * blockSize,
          y: basePosition.y,
          z: basePosition.z + z * blockSize
        };

        const building = this.createBuilding(template, position);
        meshes.push(...building);
      }
    }

    return meshes;
  }
}
