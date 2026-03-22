import type { Material, Primitive, World } from '@/shared/schema';

type EntityConfig = {
  id: string;
  kind: Primitive['kind'];
  name: string;
  position?: Primitive['position'];
  rotation?: Primitive['rotation'];
  scale?: Primitive['scale'];
  visible?: boolean;
  locked?: boolean;
  layer?: string;
  materialId?: string;
  params?: Record<string, unknown>;
  children?: string[];
};

const createEntity = ({
  id,
  kind,
  name,
  position,
  rotation,
  scale,
  visible,
  locked,
  layer,
  materialId,
  params,
  children,
}: EntityConfig): Primitive => ({
  id,
  kind,
  name,
  position: position ?? [0, 0, 0],
  rotation: rotation ?? [0, 0, 0],
  scale: scale ?? [1, 1, 1],
  visible: visible ?? true,
  locked: locked ?? false,
  layer: layer ?? 'default',
  materialId,
  params: params ?? {},
  children: children ?? [],
});

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const createRoadblockWorld = (timestamp: string): World => {
  const rootId = 'root';
  const universeId = 'observable-universe';
  const localGroupId = 'local-group';
  const milkyWayId = 'milky-way-disk';
  const sagittariusAId = 'sagittarius-a';
  const orionArmId = 'orion-arm';
  const solarSystemId = 'sol-system';
  const eclipticId = 'ecliptic-plane';
  const sunId = 'sun';
  const mercuryId = 'mercury';
  const venusId = 'venus';
  const earthSystemId = 'earth-system';
  const earthId = 'earth';
  const moonId = 'moon';
  const issId = 'iss';
  const marsId = 'mars';
  const asteroidBeltId = 'asteroid-belt';
  const jupiterId = 'jupiter';
  const saturnSystemId = 'saturn-system';
  const saturnId = 'saturn';
  const saturnRingsId = 'saturn-rings';
  const uranusId = 'uranus';
  const neptuneId = 'neptune';
  const plutoId = 'pluto';
  const kuiperBeltId = 'kuiper-belt';
  const andromedaId = 'andromeda';
  const triangulumId = 'triangulum';
  const largeMagellanicId = 'large-magellanic-cloud';
  const smallMagellanicId = 'small-magellanic-cloud';

  const materials: Material[] = [
    { id: 'sun-core', type: 'standard', color: '#ffcb47', roughness: 0.4 },
    { id: 'mercury-crust', type: 'standard', color: '#b5b5b5', roughness: 0.8 },
    { id: 'venus-clouds', type: 'standard', color: '#e2c28f', roughness: 0.6 },
    { id: 'earth-oceans', type: 'standard', color: '#2a6ef4', roughness: 0.5 },
    { id: 'moon-regolith', type: 'standard', color: '#d9d9d9', roughness: 0.9 },
    { id: 'mars-dust', type: 'standard', color: '#c1440e', roughness: 0.8 },
    { id: 'jupiter-bands', type: 'standard', color: '#d8b290', roughness: 0.7 },
    { id: 'saturn-bands', type: 'standard', color: '#e8d8a0', roughness: 0.6 },
    { id: 'saturn-rings', type: 'standard', color: '#f2e2c4', roughness: 0.3 },
    { id: 'uranus-atmosphere', type: 'standard', color: '#82d1f5', roughness: 0.6 },
    { id: 'neptune-atmosphere', type: 'standard', color: '#4563c7', roughness: 0.6 },
    { id: 'pluto-surface', type: 'standard', color: '#c8b6a6', roughness: 0.7 },
    { id: 'asteroid-field', type: 'phong', color: '#9c7c5b' },
    { id: 'kuiper-field', type: 'phong', color: '#b5c7d3' },
    { id: 'milkyway-disk', type: 'basic', color: '#42556b' },
    { id: 'andromeda-disk', type: 'basic', color: '#4a5d7a' },
    { id: 'triangulum-disk', type: 'basic', color: '#526789' },
    { id: 'magellanic-cloud', type: 'basic', color: '#6a7c8f' },
    { id: 'station-alloy', type: 'standard', color: '#ced3d8', roughness: 0.4 },
  ];

  const entities: Record<string, Primitive> = {
    [rootId]: createEntity({
      id: rootId,
      kind: 'group',
      name: 'Scene Root',
      locked: true,
      children: [universeId],
    }),
    [universeId]: createEntity({
      id: universeId,
      kind: 'group',
      name: 'Observable Universe',
      children: [localGroupId],
      params: {
        description: 'Top-level container mirroring the observable universe from a human vantage point.',
        scaleReference: 'Distances are normalized for the editor; relationships follow real cosmology.',
      },
    }),
    [localGroupId]: createEntity({
      id: localGroupId,
      kind: 'group',
      name: 'Local Group',
      position: [0, 120, 0],
      children: [milkyWayId, andromedaId, triangulumId, largeMagellanicId, smallMagellanicId],
      params: {
        description: 'Nearest collection of galaxies that includes the Milky Way and satellites.',
      },
    }),
    [milkyWayId]: createEntity({
      id: milkyWayId,
      kind: 'torus',
      name: 'Milky Way Disk',
      rotation: [toRadians(90), 0, toRadians(12)],
      scale: [120, 8, 120],
      materialId: 'milkyway-disk',
      children: [sagittariusAId, orionArmId],
      params: {
        classification: 'galaxy',
        notes: 'Spiral disk of the Milky Way scaled for readability.',
      },
    }),
    [sagittariusAId]: createEntity({
      id: sagittariusAId,
      kind: 'sphere',
      name: 'Sagittarius A*',
      position: [0, 0, 0],
      scale: [6, 6, 6],
      materialId: 'sun-core',
      params: {
        description: 'Galactic center supermassive black hole proxy.',
      },
    }),
    [orionArmId]: createEntity({
      id: orionArmId,
      kind: 'group',
      name: 'Orion Arm',
      position: [0, 0, 80],
      children: [solarSystemId],
      params: {
        description: 'Local spiral arm segment containing the Solar System.',
      },
    }),
    [solarSystemId]: createEntity({
      id: solarSystemId,
      kind: 'group',
      name: 'Solar System',
      position: [0, -30, 0],
      children: [
        eclipticId,
        sunId,
        mercuryId,
        venusId,
        earthSystemId,
        marsId,
        asteroidBeltId,
        jupiterId,
        saturnSystemId,
        uranusId,
        neptuneId,
        plutoId,
        kuiperBeltId,
      ],
      params: {
        description: 'Planets and belts scaled to emphasize relative order from the Sun.',
      },
    }),
    [eclipticId]: createEntity({
      id: eclipticId,
      kind: 'plane',
      name: 'Ecliptic Reference',
      scale: [160, 160, 160],
      position: [0, -0.05, 0],
      materialId: 'milkyway-disk',
      params: {
        description: 'Reference plane for orbital alignment.',
      },
    }),
    [sunId]: createEntity({
      id: sunId,
      kind: 'sphere',
      name: 'Sun',
      scale: [6, 6, 6],
      materialId: 'sun-core',
      params: {
        type: 'star',
        spectralClass: 'G2V',
      },
    }),
    [mercuryId]: createEntity({
      id: mercuryId,
      kind: 'sphere',
      name: 'Mercury',
      position: [10, 0, 0],
      scale: [0.38, 0.38, 0.38],
      materialId: 'mercury-crust',
      params: {
        orbitalRadiusAu: 0.39,
      },
    }),
    [venusId]: createEntity({
      id: venusId,
      kind: 'sphere',
      name: 'Venus',
      position: [14, 0, 0],
      scale: [0.95, 0.95, 0.95],
      materialId: 'venus-clouds',
      params: {
        orbitalRadiusAu: 0.72,
      },
    }),
    [earthSystemId]: createEntity({
      id: earthSystemId,
      kind: 'group',
      name: 'Earth-Moon System',
      position: [18, 0, 0],
      children: [earthId, moonId, issId],
      params: {
        orbitalRadiusAu: 1,
      },
    }),
    [earthId]: createEntity({
      id: earthId,
      kind: 'sphere',
      name: 'Earth',
      scale: [1, 1, 1],
      materialId: 'earth-oceans',
      params: {
        description: 'Blue marble baseline for Roadblock world reference.',
      },
    }),
    [moonId]: createEntity({
      id: moonId,
      kind: 'sphere',
      name: 'Moon',
      position: [1.5, 0, 0],
      scale: [0.27, 0.27, 0.27],
      materialId: 'moon-regolith',
      params: {
        orbitalRadiusKm: 384400,
      },
    }),
    [issId]: createEntity({
      id: issId,
      kind: 'cube',
      name: 'International Space Station',
      position: [0.9, 0.6, 0],
      scale: [0.08, 0.02, 0.2],
      materialId: 'station-alloy',
      params: {
        altitudeKm: 420,
      },
    }),
    [marsId]: createEntity({
      id: marsId,
      kind: 'sphere',
      name: 'Mars',
      position: [24, 0, 0],
      scale: [0.53, 0.53, 0.53],
      materialId: 'mars-dust',
      params: {
        orbitalRadiusAu: 1.52,
      },
    }),
    [asteroidBeltId]: createEntity({
      id: asteroidBeltId,
      kind: 'torus',
      name: 'Main Asteroid Belt',
      scale: [36, 1.4, 36],
      materialId: 'asteroid-field',
      params: {
        innerRadiusAu: 2.2,
        outerRadiusAu: 3.2,
      },
    }),
    [jupiterId]: createEntity({
      id: jupiterId,
      kind: 'sphere',
      name: 'Jupiter',
      position: [38, 0, 0],
      scale: [2.2, 2.2, 2.2],
      materialId: 'jupiter-bands',
      params: {
        orbitalRadiusAu: 5.2,
      },
    }),
    [saturnSystemId]: createEntity({
      id: saturnSystemId,
      kind: 'group',
      name: 'Saturn System',
      position: [48, 0, 0],
      children: [saturnId, saturnRingsId],
      params: {
        orbitalRadiusAu: 9.5,
      },
    }),
    [saturnId]: createEntity({
      id: saturnId,
      kind: 'sphere',
      name: 'Saturn',
      scale: [1.9, 1.9, 1.9],
      materialId: 'saturn-bands',
    }),
    [saturnRingsId]: createEntity({
      id: saturnRingsId,
      kind: 'torus',
      name: 'Saturn Rings',
      rotation: [toRadians(90), toRadians(28), 0],
      scale: [6, 0.6, 6],
      materialId: 'saturn-rings',
      params: {
        description: 'Tilted rings showing axial inclination.',
      },
    }),
    [uranusId]: createEntity({
      id: uranusId,
      kind: 'sphere',
      name: 'Uranus',
      position: [58, 0, 0],
      scale: [1.6, 1.6, 1.6],
      materialId: 'uranus-atmosphere',
      params: {
        orbitalRadiusAu: 19.2,
      },
    }),
    [neptuneId]: createEntity({
      id: neptuneId,
      kind: 'sphere',
      name: 'Neptune',
      position: [66, 0, 0],
      scale: [1.6, 1.6, 1.6],
      materialId: 'neptune-atmosphere',
      params: {
        orbitalRadiusAu: 30.1,
      },
    }),
    [plutoId]: createEntity({
      id: plutoId,
      kind: 'sphere',
      name: 'Pluto',
      position: [74, 0, 0],
      scale: [0.18, 0.18, 0.18],
      materialId: 'pluto-surface',
      params: {
        orbitalRadiusAu: 39.5,
      },
    }),
    [kuiperBeltId]: createEntity({
      id: kuiperBeltId,
      kind: 'torus',
      name: 'Kuiper Belt',
      scale: [86, 1, 86],
      materialId: 'kuiper-field',
      params: {
        innerRadiusAu: 30,
        outerRadiusAu: 50,
      },
    }),
    [andromedaId]: createEntity({
      id: andromedaId,
      kind: 'torus',
      name: 'Andromeda Galaxy',
      position: [320, 40, -220],
      rotation: [toRadians(90), toRadians(15), toRadians(-5)],
      scale: [150, 10, 150],
      materialId: 'andromeda-disk',
      params: {
        distanceMly: 2.5,
      },
    }),
    [triangulumId]: createEntity({
      id: triangulumId,
      kind: 'torus',
      name: 'Triangulum Galaxy',
      position: [-260, 60, -180],
      rotation: [toRadians(90), toRadians(-12), toRadians(8)],
      scale: [90, 7, 90],
      materialId: 'triangulum-disk',
      params: {
        distanceMly: 3,
      },
    }),
    [largeMagellanicId]: createEntity({
      id: largeMagellanicId,
      kind: 'sphere',
      name: 'Large Magellanic Cloud',
      position: [120, -60, 140],
      scale: [18, 18, 18],
      materialId: 'magellanic-cloud',
      params: {
        distanceKly: 163,
      },
    }),
    [smallMagellanicId]: createEntity({
      id: smallMagellanicId,
      kind: 'sphere',
      name: 'Small Magellanic Cloud',
      position: [-150, -40, 180],
      scale: [12, 12, 12],
      materialId: 'magellanic-cloud',
      params: {
        distanceKly: 206,
      },
    }),
  };

  return {
    version: 'rw-1',
    meta: {
      name: 'Roadblock World — Sol Replica',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    settings: {
      gridSize: 50,
      snapTranslate: 1,
      snapRotateDeg: 15,
      snapScale: 0.1,
      unit: 'm',
      background: '#03060f',
      environment: 'sunset',
    },
    materials,
    root: rootId,
    entities,
  };
};
