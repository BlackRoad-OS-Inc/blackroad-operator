import { createRoadblockWorld } from '@/lib/presets/roadblockWorld';
import { worldSchema, type World } from '@/shared/schema';

const STORAGE_KEY = 'roadworld:last';

const nowIso = () => new Date().toISOString();

export const createDefaultWorld = (): World => {
  return createRoadblockWorld(nowIso());
};

export const exportWorld = (world: World): Blob => {
  const stamped: World = {
    ...world,
    meta: {
      ...world.meta,
      updatedAt: nowIso(),
    },
  };
  const parsed = worldSchema.parse(stamped);
  const json = JSON.stringify(parsed, null, 2);
  return new Blob([json], { type: 'application/json' });
};

export const serializeWorld = async (world: World): Promise<string> => {
  const blob = exportWorld(world);
  const text = await blobToString(blob);
  return JSON.stringify(JSON.parse(text), null, 2);
};

const blobToString = async (blob: Blob): Promise<string> => {
  if ('text' in blob) {
    return blob.text();
  }
  throw new Error('Blob text() not supported in this environment');
};

export const parseWorld = async (file: File | Blob): Promise<World> => {
  const text = await file.text();
  const json = JSON.parse(text);
  return worldSchema.parse(json);
};

export const importWorld = async (file: File | Blob): Promise<World> => {
  const parsed = await parseWorld(file);
  return {
    ...parsed,
    meta: {
      ...parsed.meta,
      updatedAt: nowIso(),
    },
  };
};

export const autosaveWorld = (world: World) => {
  if (typeof window === 'undefined') return;
  const serialized = JSON.stringify(world);
  window.localStorage.setItem(STORAGE_KEY, serialized);
};

export const loadAutosave = (): World | undefined => {
  if (typeof window === 'undefined') return undefined;
  const serialized = window.localStorage.getItem(STORAGE_KEY);
  if (!serialized) return undefined;
  try {
    const parsed = worldSchema.parse(JSON.parse(serialized));
    return parsed;
  } catch (error) {
    console.warn('Failed to parse autosave', error);
    return undefined;
  }
};
