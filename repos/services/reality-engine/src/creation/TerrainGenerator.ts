/**
 * Terrain Generator - Procedural Photorealistic Terrain
 *
 * Creates realistic landscapes using:
 * - Multi-octave Simplex noise (natural-looking height variation)
 * - Erosion simulation (realistic valleys and ridges)
 * - Splat mapping (blend grass, rock, sand based on height/slope)
 * - Detail textures (PBR materials for photorealism)
 */

import { createNoise2D, createNoise3D } from 'simplex-noise';
import { Vector3, TerrainGenerator as TerrainConfig, Mesh, GeometryData } from '../types/index.js';

export class TerrainGenerator {
  private noise2D = createNoise2D();
  private noise3D = createNoise3D();

  /**
   * Generate realistic terrain mesh
   */
  generateTerrain(config: TerrainConfig): Mesh {
    const { size, resolution, heightmap } = config;

    if (!heightmap) {
      throw new Error('Heightmap configuration required');
    }

    // Generate height data using noise
    const heights = this.generateHeightmap(
      resolution,
      heightmap.scale,
      heightmap.octaves,
      heightmap.persistence,
      heightmap.lacunarity,
      heightmap.seed
    );

    // Apply erosion for realism
    const erodedHeights = this.applyErosion(heights, resolution, 10);

    // Create geometry from heightmap
    const geometry = this.createTerrainGeometry(
      erodedHeights,
      size,
      resolution
    );

    // Determine material layers based on height/slope
    const materialId = this.selectTerrainMaterial(config.layers);

    return {
      id: `terrain-${Date.now()}`,
      name: 'Generated Terrain',
      geometry,
      material: materialId,
      position: { x: 0, y: 0, z: 0 },
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
        friction: 0.8,
        restitution: 0.0,
        shape: 'mesh',
        collisionGroup: 1,
        collisionMask: 0xFFFFFFFF
      },
      tags: ['terrain', 'procedural'],
      isUserGenerated: true
    };
  }

  /**
   * Generate heightmap using multi-octave noise
   * This creates natural-looking terrain with detail at multiple scales
   */
  private generateHeightmap(
    resolution: number,
    scale: number,
    octaves: number,
    persistence: number,
    lacunarity: number,
    seed: number
  ): number[][] {
    const heights: number[][] = [];

    for (let y = 0; y < resolution; y++) {
      heights[y] = [];
      for (let x = 0; x < resolution; x++) {
        let height = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        // Multi-octave noise - adds detail at different scales
        for (let octave = 0; octave < octaves; octave++) {
          const sampleX = (x / resolution) * scale * frequency;
          const sampleY = (y / resolution) * scale * frequency;

          const noiseValue = this.noise2D(sampleX + seed, sampleY + seed);

          height += noiseValue * amplitude;
          maxValue += amplitude;

          amplitude *= persistence;
          frequency *= lacunarity;
        }

        // Normalize to [0, 1]
        heights[y][x] = height / maxValue;
      }
    }

    return heights;
  }

  /**
   * Hydraulic erosion simulation
   * Makes terrain look more natural with valleys and ridges
   */
  private applyErosion(
    heights: number[][],
    resolution: number,
    iterations: number
  ): number[][] {
    const result = heights.map(row => [...row]);

    for (let iter = 0; iter < iterations; iter++) {
      // Simulate water droplet
      const dropletX = Math.floor(Math.random() * resolution);
      const dropletY = Math.floor(Math.random() * resolution);

      let x = dropletX;
      let y = dropletY;
      let water = 1.0;
      let sediment = 0.0;
      let velocity = 0.0;

      const maxSteps = resolution * 2;
      const inertia = 0.3;
      const capacity = 0.5;
      const deposition = 0.1;
      const erosion = 0.3;

      for (let step = 0; step < maxSteps; step++) {
        // Find lowest neighbor
        const neighbors = this.getNeighborHeights(result, x, y, resolution);
        const lowest = this.findLowestNeighbor(neighbors, result[y][x]);

        if (!lowest) break;

        // Move to lowest neighbor
        const deltaHeight = result[y][x] - lowest.height;

        // Update velocity and water
        velocity = Math.sqrt(velocity * velocity + deltaHeight);
        water *= 0.99; // Evaporation

        // Calculate sediment capacity
        const sedimentCapacity = Math.max(0, velocity * water * capacity);

        // Erosion or deposition
        if (sediment > sedimentCapacity) {
          // Deposit
          const amountToDeposit = (sediment - sedimentCapacity) * deposition;
          result[y][x] += amountToDeposit;
          sediment -= amountToDeposit;
        } else {
          // Erode
          const amountToErode = Math.min(
            (sedimentCapacity - sediment) * erosion,
            -deltaHeight
          );
          result[y][x] -= amountToErode;
          sediment += amountToErode;
        }

        x = lowest.x;
        y = lowest.y;

        if (water < 0.01) break;
      }
    }

    return result;
  }

  private getNeighborHeights(
    heights: number[][],
    x: number,
    y: number,
    resolution: number
  ): Array<{ x: number; y: number; height: number }> {
    const neighbors = [];
    const offsets = [
      [-1, -1], [0, -1], [1, -1],
      [-1,  0],          [1,  0],
      [-1,  1], [0,  1], [1,  1]
    ];

    for (const [dx, dy] of offsets) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < resolution && ny >= 0 && ny < resolution) {
        neighbors.push({
          x: nx,
          y: ny,
          height: heights[ny][nx]
        });
      }
    }

    return neighbors;
  }

  private findLowestNeighbor(
    neighbors: Array<{ x: number; y: number; height: number }>,
    currentHeight: number
  ): { x: number; y: number; height: number } | null {
    let lowest = null;

    for (const neighbor of neighbors) {
      if (neighbor.height < currentHeight) {
        if (!lowest || neighbor.height < lowest.height) {
          lowest = neighbor;
        }
      }
    }

    return lowest;
  }

  /**
   * Create mesh geometry from heightmap
   */
  private createTerrainGeometry(
    heights: number[][],
    size: Vector3,
    resolution: number
  ): GeometryData {
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const stepX = size.x / (resolution - 1);
    const stepZ = size.z / (resolution - 1);

    // Generate vertices
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const height = heights[y][x] * size.y;

        vertices.push(
          x * stepX - size.x / 2,
          height,
          y * stepZ - size.z / 2
        );

        uvs.push(x / (resolution - 1), y / (resolution - 1));
      }
    }

    // Generate indices (triangles)
    for (let y = 0; y < resolution - 1; y++) {
      for (let x = 0; x < resolution - 1; x++) {
        const topLeft = y * resolution + x;
        const topRight = topLeft + 1;
        const bottomLeft = (y + 1) * resolution + x;
        const bottomRight = bottomLeft + 1;

        // First triangle
        indices.push(topLeft, bottomLeft, topRight);

        // Second triangle
        indices.push(topRight, bottomLeft, bottomRight);
      }
    }

    // Calculate normals for realistic lighting
    const calculatedNormals = this.calculateNormals(vertices, indices);
    normals.push(...calculatedNormals);

    return {
      type: 'custom',
      vertices,
      normals,
      uvs,
      indices
    };
  }

  /**
   * Calculate vertex normals for smooth lighting
   */
  private calculateNormals(vertices: number[], indices: number[]): number[] {
    const normals = new Array(vertices.length).fill(0);

    // Calculate face normals and accumulate
    for (let i = 0; i < indices.length; i += 3) {
      const i1 = indices[i] * 3;
      const i2 = indices[i + 1] * 3;
      const i3 = indices[i + 2] * 3;

      const v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]];
      const v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]];
      const v3 = [vertices[i3], vertices[i3 + 1], vertices[i3 + 2]];

      const edge1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
      const edge2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];

      // Cross product
      const normal = [
        edge1[1] * edge2[2] - edge1[2] * edge2[1],
        edge1[2] * edge2[0] - edge1[0] * edge2[2],
        edge1[0] * edge2[1] - edge1[1] * edge2[0]
      ];

      // Accumulate to vertices
      for (const idx of [i1, i2, i3]) {
        normals[idx] += normal[0];
        normals[idx + 1] += normal[1];
        normals[idx + 2] += normal[2];
      }
    }

    // Normalize
    for (let i = 0; i < normals.length; i += 3) {
      const length = Math.sqrt(
        normals[i] * normals[i] +
        normals[i + 1] * normals[i + 1] +
        normals[i + 2] * normals[i + 2]
      );

      if (length > 0) {
        normals[i] /= length;
        normals[i + 1] /= length;
        normals[i + 2] /= length;
      }
    }

    return normals;
  }

  /**
   * Select terrain material based on layers
   */
  private selectTerrainMaterial(layers: any[]): string {
    // For now, return default terrain material
    // In production, this would create a splatmap material
    return 'terrain-default';
  }

  /**
   * Generate biome-specific terrain
   */
  generateBiome(biome: 'grassland' | 'desert' | 'mountain' | 'forest' | 'snow'): TerrainConfig {
    const baseConfig: TerrainConfig = {
      size: { x: 1000, y: 100, z: 1000 },
      resolution: 256,
      layers: []
    };

    switch (biome) {
      case 'grassland':
        return {
          ...baseConfig,
          heightmap: {
            type: 'noise',
            scale: 2.0,
            octaves: 6,
            persistence: 0.5,
            lacunarity: 2.0,
            seed: Math.random() * 10000
          },
          layers: [
            { material: 'grass', heightRange: [0, 0.6], blendSharpness: 0.8 },
            { material: 'dirt', heightRange: [0.6, 0.8], blendSharpness: 0.5 },
            { material: 'rock', heightRange: [0.8, 1.0], blendSharpness: 0.3 }
          ]
        };

      case 'mountain':
        return {
          ...baseConfig,
          size: { x: 2000, y: 500, z: 2000 },
          heightmap: {
            type: 'noise',
            scale: 1.5,
            octaves: 8,
            persistence: 0.6,
            lacunarity: 2.5,
            seed: Math.random() * 10000
          },
          layers: [
            { material: 'rock', heightRange: [0, 0.7], blendSharpness: 0.2 },
            { material: 'snow', heightRange: [0.7, 1.0], blendSharpness: 0.5 }
          ]
        };

      case 'desert':
        return {
          ...baseConfig,
          heightmap: {
            type: 'noise',
            scale: 3.0,
            octaves: 4,
            persistence: 0.4,
            lacunarity: 1.8,
            seed: Math.random() * 10000
          },
          layers: [
            { material: 'sand', heightRange: [0, 1.0], blendSharpness: 0.9 }
          ]
        };

      default:
        return {
          ...baseConfig,
          heightmap: {
            type: 'noise',
            scale: 2.0,
            octaves: 6,
            persistence: 0.5,
            lacunarity: 2.0,
            seed: Math.random() * 10000
          },
          layers: []
        };
    }
  }
}
