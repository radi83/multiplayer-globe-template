/**
 * Dünya geometrisi: saf matematik, Three.js'ten bağımsız.
 * Tüm noktalar birim küre (yarıçap 1) üzerindedir.
 */
export type Vec3 = [number, number, number];

const DEG = Math.PI / 180;

export function sph(latDeg: number, lonDeg: number, radius = 1): Vec3 {
  const a = latDeg * DEG;
  const b = lonDeg * DEG;
  return [Math.cos(a) * Math.sin(b) * radius, Math.sin(a) * radius, Math.cos(a) * Math.cos(b) * radius];
}

export interface LineSet {
  /** LineSegments için çiftler hâlinde konumlar (x,y,z,x,y,z,...) */
  positions: number[];
  /** Her tepe için enlem, -1..1 (ortaya çıkma animasyonu için) */
  lat: number[];
}

function pushSegment(set: LineSet, a: Vec3, b: Vec3, latA: number, latB: number): void {
  set.positions.push(...a, ...b);
  set.lat.push(latA / 90, latB / 90);
}

/** Meridyenler ve paraleller. `strong` ekvator ve başlangıç meridyenini ayırır. */
export function graticule(stepDeg = 20): { normal: LineSet; strong: LineSet } {
  const normal: LineSet = { positions: [], lat: [] };
  const strong: LineSet = { positions: [], lat: [] };
  for (let lon = 0; lon < 360; lon += stepDeg) {
    const target = lon % 180 === 0 ? strong : normal;
    for (let lat = -90; lat < 90; lat += 5) pushSegment(target, sph(lat, lon), sph(lat + 5, lon), lat, lat + 5);
  }
  for (let lat = -60; lat <= 60; lat += stepDeg) {
    const target = lat === 0 ? strong : normal;
    for (let lon = 0; lon < 360; lon += 4) pushSegment(target, sph(lat, lon), sph(lat, lon + 4), lat, lat);
  }
  return { normal, strong };
}

/** Açılıp kapanan dış katman: kesikli paraleller. */
export function shell(radius = 1.075): LineSet {
  const set: LineSet = { positions: [], lat: [] };
  for (const lat of [-30, 0, 30]) {
    for (let lon = 0; lon < 360; lon += 6) pushSegment(set, sph(lat, lon, radius), sph(lat, lon + 3, radius), lat, lat);
  }
  return set;
}

/** Tohumlu sözde rastgele üreteç: her açılışta aynı düzen. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export interface NodeSpec {
  position: Vec3;
  selected: boolean;
}

export function nodes(count: number, selected: number, rnd: () => number): NodeSpec[] {
  const out: NodeSpec[] = [];
  for (let i = 0; i < count; i++) {
    out.push({ position: sph(-50 + rnd() * 112, rnd() * 360), selected: i < selected });
  }
  return out;
}

export interface ArcSpec {
  from: number;
  to: number;
  /** Yay boyunca noktalar (yerden yükseltilmiş) */
  points: Vec3[];
}

/** İki düğüm arasında küresel doğrusal ara değerleme ile yükselen yay. */
export function arc(all: NodeSpec[], from: number, to: number, segments = 48): ArcSpec | null {
  const A = all[from]?.position;
  const B = all[to]?.position;
  if (!A || !B) return null;
  const dot = Math.min(1, Math.max(-1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
  const omega = Math.acos(dot);
  if (omega < 0.3 || omega > 2.3) return null;
  const s = Math.sin(omega);
  const height = 0.05 + (0.17 * omega) / Math.PI;
  const points: Vec3[] = [];
  for (let k = 0; k <= segments; k++) {
    const t = k / segments;
    const f1 = Math.sin((1 - t) * omega) / s;
    const f2 = Math.sin(t * omega) / s;
    const lift = 1 + height * Math.sin(Math.PI * t);
    points.push([(A[0] * f1 + B[0] * f2) * lift, (A[1] * f1 + B[1] * f2) * lift, (A[2] * f1 + B[2] * f2) * lift]);
  }
  return { from, to, points };
}

export function network(seed = 20260927): { nodes: NodeSpec[]; arcs: ArcSpec[] } {
  const rnd = seeded(seed);
  const list = nodes(26, 6, rnd);
  const arcs: ArcSpec[] = [];
  const add = (a: number, b: number): void => {
    const spec = arc(list, a, b);
    if (spec) arcs.push(spec);
  };
  for (let s = 0; s < 6; s++) {
    add(s, 6 + Math.floor(rnd() * 20));
    add(s, 6 + Math.floor(rnd() * 20));
  }
  for (let e = 0; e < 6; e++) add(6 + Math.floor(rnd() * 20), 6 + Math.floor(rnd() * 20));
  add(0, 3);
  add(1, 4);
  add(2, 5);
  return { nodes: list, arcs };
}
