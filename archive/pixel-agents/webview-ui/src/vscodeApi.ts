// Standalone mode: mock VS Code API when not running inside VS Code
declare function acquireVsCodeApi(): { postMessage(msg: unknown): void };
const isVSCode = typeof acquireVsCodeApi !== 'undefined';

interface VsCodeApi {
  postMessage(msg: unknown): void;
  getState(): unknown;
  setState(s: unknown): unknown;
}

let _vscode: VsCodeApi;

if (isVSCode) {
  _vscode = acquireVsCodeApi() as VsCodeApi;
} else {
  _vscode = {
    postMessage(msg: unknown) {
      const m = msg as { type: string };
      if (m.type === 'webviewReady') {
        setTimeout(() => standaloneBootstrap(), 200);
      }
    },
    getState() {
      return {};
    },
    setState(s: unknown) {
      return s;
    },
  };
}

export const vscode = _vscode;

// ---- PNG to sprite data (replicates extension's assetLoader) ----
type SpriteRow = (string | null)[];
type SpriteData = SpriteRow[];

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function imageToPixels(img: HTMLImageElement): { data: Uint8ClampedArray; width: number; height: number } {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, img.width, img.height);
  return { data: id.data, width: img.width, height: img.height };
}

function extractRegion(
  data: Uint8ClampedArray,
  imgW: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): SpriteData {
  const rows: SpriteRow[] = [];
  for (let y = 0; y < rh; y++) {
    const row: SpriteRow = [];
    for (let x = 0; x < rw; x++) {
      const idx = ((ry + y) * imgW + (rx + x)) * 4;
      const r = data[idx],
        g = data[idx + 1],
        b = data[idx + 2],
        a = data[idx + 3];
      if (a < 2) {
        row.push(null);
      } else {
        row.push(
          '#' +
            [r, g, b, a]
              .map((v) => v.toString(16).padStart(2, '0'))
              .join(''),
        );
      }
    }
    rows.push(row);
  }
  return rows;
}

// ---- Standalone bootstrap ----
async function standaloneBootstrap() {
  function send(msg: unknown) {
    window.postMessage(msg, '*');
  }

  const FRAME_W = 16,
    FRAME_H = 32,
    FRAMES = 7,
    DIRS = ['down', 'up', 'right'] as const;

  // 1. Load character sprites (6 PNGs → structured sprite data)
  try {
    const characters: Array<{
      down: SpriteData[];
      up: SpriteData[];
      right: SpriteData[];
    }> = [];

    for (let i = 0; i < 6; i++) {
      const img = await loadImage(`./assets/characters/char_${i}.png`);
      const px = imageToPixels(img);
      const charData: Record<string, SpriteData[]> = { down: [], up: [], right: [] };

      for (let dirIdx = 0; dirIdx < DIRS.length; dirIdx++) {
        const dir = DIRS[dirIdx];
        const rowY = dirIdx * FRAME_H;
        for (let f = 0; f < FRAMES; f++) {
          charData[dir].push(extractRegion(px.data, px.width, f * FRAME_W, rowY, FRAME_W, FRAME_H));
        }
      }

      characters.push(charData as (typeof characters)[0]);
    }

    send({ type: 'characterSpritesLoaded', characters });
  } catch (err) {
    console.warn('Failed to load character sprites:', err);
  }

  // 2. Load floor tiles (9 patterns)
  try {
    const sprites: SpriteData[] = [];
    for (let i = 0; i <= 8; i++) {
      try {
        const img = await loadImage(`./assets/floors/floor_${i}.png`);
        const px = imageToPixels(img);
        sprites.push(extractRegion(px.data, px.width, 0, 0, px.width, px.height));
      } catch {
        sprites.push([]);
      }
    }
    send({ type: 'floorTilesLoaded', sprites });
  } catch (err) {
    console.warn('Failed to load floor tiles:', err);
  }

  // 3. Load wall tiles (4x4 grid of 16x32 pieces)
  try {
    const img = await loadImage('./assets/walls/wall_0.png');
    const px = imageToPixels(img);
    // Extract as one large sprite array (the wallTiles module handles slicing)
    const fullSprite = extractRegion(px.data, px.width, 0, 0, px.width, px.height);
    send({ type: 'wallTilesLoaded', sets: [fullSprite] });
  } catch (err) {
    console.warn('Failed to load wall tiles:', err);
  }

  // 4. Load furniture catalog + sprites
  try {
    // Read all manifest.json files from furniture subdirectories
    const furnitureDirs = [
      'BIN', 'BOOKSHELF', 'CACTUS', 'CLOCK', 'COFFEE', 'COFFEE_TABLE',
      'CUSHIONED_BENCH', 'CUSHIONED_CHAIR', 'DESK', 'DOUBLE_BOOKSHELF',
      'HANGING_PLANT', 'LARGE_PAINTING', 'LARGE_PLANT', 'PC', 'PLANT',
      'PLANT_2', 'POT', 'SMALL_PAINTING', 'SMALL_PAINTING_2', 'SMALL_TABLE',
      'SOFA', 'TABLE_FRONT', 'WHITEBOARD', 'WOODEN_BENCH', 'WOODEN_CHAIR',
    ];

    const catalog: Array<Record<string, unknown>> = [];
    const sprites: Record<string, SpriteData> = {};

    for (const dir of furnitureDirs) {
      try {
        const manifestResp = await fetch(`./assets/furniture/${dir}/manifest.json`);
        if (!manifestResp.ok) continue;
        const manifest = await manifestResp.json();
        await processFurnitureManifest(manifest, dir, catalog, sprites);
      } catch {
        // Skip this furniture type
      }
    }

    send({ type: 'furnitureAssetsLoaded', catalog, sprites });
  } catch (err) {
    console.warn('Failed to load furniture:', err);
  }

  // 5. Load default layout
  try {
    const resp = await fetch('./assets/default-layout-1.json');
    if (resp.ok) {
      const layout = await resp.json();
      send({ type: 'layoutLoaded', layout });
    } else {
      send({ type: 'layoutLoaded', layout: null });
    }
  } catch {
    send({ type: 'layoutLoaded', layout: null });
  }

  // 6. Spawn demo agents
  setTimeout(() => {
    send({
      type: 'existingAgents',
      agents: [1, 2, 3, 4, 5, 6],
      agentMeta: {
        1: { palette: 0, hueShift: 0 },
        2: { palette: 1, hueShift: 0 },
        3: { palette: 2, hueShift: 0 },
        4: { palette: 3, hueShift: 0 },
        5: { palette: 4, hueShift: 0 },
        6: { palette: 5, hueShift: 0 },
      },
      folderNames: {
        1: 'Lucidia',
        2: 'Alice',
        3: 'Octavia',
        4: 'Aria',
        5: 'Cecilia',
        6: 'Shellfish',
      },
    });

    // Simulate periodic tool activity
    setInterval(() => {
      const tools = ['Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob', 'WebFetch'];
      const id = Math.floor(Math.random() * 6) + 1;
      const toolName = tools[Math.floor(Math.random() * tools.length)];
      const toolId = 'tool-' + Date.now() + '-' + id;
      send({ type: 'agentToolStart', id, toolId, status: toolName });
      setTimeout(
        () => {
          send({ type: 'agentToolDone', id, toolId });
          send({ type: 'agentStatus', id, status: 'active' });
        },
        3000 + Math.random() * 7000,
      );
    }, 3500);
  }, 800);
}

async function processFurnitureManifest(
  manifest: Record<string, unknown>,
  dir: string,
  catalog: Array<Record<string, unknown>>,
  sprites: Record<string, SpriteData>,
): Promise<void> {
  const parentCategory = (manifest.category as string) || 'misc';
  const parentGroupId = (manifest.id as string) || dir;
  const parentIsDesk = parentCategory === 'desks';
  const parentCanPlaceOnWalls = (manifest.canPlaceOnWalls as boolean) || false;
  const parentCanPlaceOnSurfaces = (manifest.canPlaceOnSurfaces as boolean) || false;
  const parentBgTiles = manifest.backgroundTiles as number | undefined;

  // Collect assets from members (groups) or direct asset
  const assets: Array<Record<string, unknown>> = [];

  if (manifest.members && Array.isArray(manifest.members)) {
    for (const member of manifest.members as Array<Record<string, unknown>>) {
      if (member.type === 'asset') {
        assets.push(member);
      } else if (member.type === 'group' && member.members) {
        for (const sub of member.members as Array<Record<string, unknown>>) {
          if (sub.type === 'asset') {
            assets.push(sub);
          }
        }
      }
    }
  } else if (manifest.file) {
    assets.push(manifest);
  }

  for (const asset of assets) {
    const file = asset.file as string;
    if (!file) continue;
    const id = (asset.id as string) || file.replace('.png', '');

    catalog.push({
      id,
      name: id,
      label: (asset.label as string) || (manifest.name as string) || id,
      category: parentCategory,
      file,
      width: asset.width ?? 16,
      height: asset.height ?? 16,
      footprintW: asset.footprintW ?? 1,
      footprintH: asset.footprintH ?? 1,
      isDesk: parentIsDesk,
      canPlaceOnWalls: parentCanPlaceOnWalls,
      groupId: parentGroupId,
      orientation: asset.orientation as string | undefined,
      state: asset.state as string | undefined,
      canPlaceOnSurfaces: parentCanPlaceOnSurfaces,
      backgroundTiles: parentBgTiles,
    });

    try {
      const img = await loadImage(`./assets/furniture/${dir}/${file}`);
      const px = imageToPixels(img);
      sprites[id] = extractRegion(px.data, px.width, 0, 0, px.width, px.height);
    } catch {
      // Sprite not found
    }
  }
}
