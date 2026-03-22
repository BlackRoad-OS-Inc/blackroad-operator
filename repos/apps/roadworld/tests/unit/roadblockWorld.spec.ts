import { describe, expect, it } from 'vitest';
import { createDefaultWorld } from '@/lib/worldIO';

const keyIds = {
  milkyWay: 'milky-way-disk',
  solarSystem: 'sol-system',
  earthSystem: 'earth-system',
  earth: 'earth',
  moon: 'moon',
  sun: 'sun',
};

describe('roadblock world preset', () => {
  const world = createDefaultWorld();

  it('names the preset world after the Roadblock replica', () => {
    expect(world.meta.name).toBe('Roadblock World — Sol Replica');
  });

  it('contains the expected cosmic hierarchy', () => {
    expect(world.entities[world.root].children).toContain('observable-universe');
    expect(Object.keys(world.entities)).toEqual(expect.arrayContaining(Object.values(keyIds)));
  });

  it('links earth and moon inside the solar system', () => {
    const solarSystem = world.entities[keyIds.solarSystem];
    const earthSystem = world.entities[keyIds.earthSystem];
    expect(solarSystem?.children).toContain(keyIds.earthSystem);
    expect(earthSystem?.children).toContain(keyIds.earth);
    expect(earthSystem?.children).toContain(keyIds.moon);
  });

  it('provides material references for major bodies', () => {
    const materialIds = new Set(world.materials.map((material) => material.id));
    expect(materialIds.has('sun-core')).toBe(true);
    expect(materialIds.has('earth-oceans')).toBe(true);
    expect(materialIds.has('milkyway-disk')).toBe(true);
  });
});
