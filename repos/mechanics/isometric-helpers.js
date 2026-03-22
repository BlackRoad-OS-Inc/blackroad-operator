function toScreen(gx, gy) {
  return { x: (gx - gy) * ISO_W / 2, y: (gx + gy) * ISO_H / 2 };
}
function toGrid(sx, sy) {
  const gx = (sx / (ISO_W/2) + sy / (ISO_H/2)) / 2;
  const gy = (sy / (ISO_H/2) - sx / (ISO_W/2)) / 2;
  return { x: Math.floor(gx), y: Math.floor(gy) };
}

// ── MAP (100 tiles tall = Minneapolis to Lakeville, 40 wide) ──
const MAP_W = 40, MAP_H = 100;

// Terrain: 0=grass, 1=road, 2=water, 3=building, 4=park, 5=highway, 6=suburb
const terrain = new Uint8Array(MAP_W * MAP_H);

// Cities along the corridor (grid Y ranges)
const CITIES = [
  { name:'DOWNTOWN MPLS', yStart:0, yEnd:12, color:P.pink },
  { name:'UPTOWN', yStart:12, yEnd:22, color:P.blue },
  { name:'SOUTH MPLS', yStart:22, yEnd:32, color:P.violet },
  { name:'RICHFIELD', yStart:32, yEnd:42, color:P.amber },
  { name:'BLOOMINGTON', yStart:42, yEnd:56, color:P.green },
  { name:'BURNSVILLE', yStart:56, yEnd:72, color:P.pink },
  { name:'APPLE VALLEY', yStart:72, yEnd:86, color:P.blue },
