import { describe, it, expect } from 'vitest';
import { getCharacterSprites } from '../office/sprites/defaultCharacters.js';
import { Direction } from '../office/types.js';

describe('character sprite generation', () => {
  it('generates non-empty sprites for palette 0', () => {
    const sprites = getCharacterSprites(0, 0);
    expect(sprites).toBeDefined();
    expect(sprites.walk).toBeDefined();

    const frames = sprites.walk[Direction.DOWN];
    expect(frames).toBeDefined();
    expect(frames.length).toBeGreaterThan(0);

    const frame = frames[0];
    expect(frame.length).toBe(24);
    expect(frame[0].length).toBe(16);

    let nonEmptyCount = 0;
    for (const row of frame) {
      for (const cell of row) {
        if (cell && cell !== '') nonEmptyCount++;
      }
    }
    console.log('Non-empty pixels:', nonEmptyCount, 'out of', 24 * 16);
    expect(nonEmptyCount).toBeGreaterThan(50);
  });

  it('caches sprites on repeated calls', () => {
    const s1 = getCharacterSprites(0, 0);
    const s2 = getCharacterSprites(0, 0);
    expect(s1).toBe(s2);
  });

  it('generates different sprites for different palettes', () => {
    const s0 = getCharacterSprites(0, 0);
    const s1 = getCharacterSprites(1, 0);
    expect(s0).not.toBe(s1);
  });
});
