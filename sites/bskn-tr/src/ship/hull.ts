/**
 * Blueprint gemi geometrisi: geared dökme yük gemisi (temsili).
 *
 * Birimler sahne birimidir (boy ≈ 10). x boyuna (kıç → baş), y yukarı, z enine.
 * Hiçbir ölçü belirli bir gemiyi temsil etmez; oranlar tipik bir supramax'e yakındır.
 *
 * Her çizgi bir "ağırlık" (görünürlük, 0..1) ve bir "tür" taşır:
 *   tür 0 = dış çizim (vurgu rengi), tür 1 = röntgen/iç yapı (soluk mürekkep).
 */

export type V3 = [number, number, number];

export const D = 0.95; // güverte yüksekliği (ortada)
export const T = 0.6; // dizayn su çekimi
export const B = 1.64; // genişlik
const HB = B / 2;
const PM_F = 1.5; // paralel gövdenin baş ucu
const PM_A = -2.3; // paralel gövdenin kıç ucu

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number): number => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const deckY = (x: number): number => D + 0.03 * Math.pow(x / 5, 2);
export const FC_H = 0.2; // baş kasara yüksekliği
export const POOP_H = 0.16; // kıç kasara yüksekliği
export const FC_X = 4.05; // baş kasaranın kıç ucu
export const POOP_X = -3.45; // kıç kasaranın baş ucu

function stemBase(y: number): number {
  const yy = y / D;
  if (yy < 0.08) return 4.62 - 0.28 * Math.pow(1 - yy / 0.08, 2);
  return 4.62 + 0.38 * Math.pow(Math.min(1.25, Math.max(0, (yy - 0.42) / 0.58)), 1.15);
}
function bulbNose(y: number): number {
  const u = (y / D - 0.24) / 0.2;
  return Math.abs(u) >= 1 ? -1e9 : 4.6 + 0.44 * Math.sqrt(1 - u * u);
}
export const stemX = (y: number): number => Math.max(stemBase(y), bulbNose(y));
export function sternX(y: number): number {
  const yy = y / D;
  if (yy <= 0.42) return -4.0;
  return -4.0 - Math.pow(Math.min(1, (yy - 0.42) / 0.58), 0.6);
}

/** Gövdenin yarı genişliği (x, y noktasında). Gövde dışında 0. */
export function hb(x: number, y: number): number {
  const xs = sternX(y);
  const xb = stemX(y);
  if (x < xs - 1e-6 || x > xb + 1e-6) return 0;
  const yy = Math.min(1.25, Math.max(0, y / D));
  const R = 0.2; // sintine yarıçapı
  let w = y < R ? HB - R + Math.sqrt(Math.max(0, R * R - (R - y) ** 2)) : HB;
  if (x > PM_F) {
    const f = clamp01((x - PM_F) / (xb - PM_F));
    w *= 1 - Math.pow(f, 1.3 + 1.2 * Math.min(1, yy));
  } else if (x < PM_A) {
    const g = clamp01((PM_A - x) / (PM_A - xs));
    const p = 1.25 + 2.6 * Math.pow(Math.min(1, yy), 1.5);
    const k = 1 - 0.62 * smooth(0.5, 0.9, yy);
    w *= 1 - k * Math.pow(g, p);
  }
  return Math.max(0, w);
}

/* ---------------- çizgi toplayıcı ---------------- */

export class Draw {
  pos: number[] = [];
  w: number[] = [];
  k: number[] = [];

  seg(a: V3, b: V3, w: number, k = 0): void {
    this.pos.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    this.w.push(w, w);
    this.k.push(k, k);
  }
  poly(pts: V3[], w: number, k = 0, closed = false): void {
    for (let i = 0; i < pts.length - 1; i++) this.seg(pts[i]!, pts[i + 1]!, w, k);
    if (closed && pts.length > 2) this.seg(pts[pts.length - 1]!, pts[0]!, w, k);
  }
  dashed(a: V3, b: V3, w: number, k = 0, dash = 0.09, gap = 0.06): void {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const n = Math.max(1, Math.floor(d / (dash + gap)));
    for (let i = 0; i < n; i++) {
      const t0 = (i * (dash + gap)) / d;
      const t1 = Math.min(1, (i * (dash + gap) + dash) / d);
      const p = (t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
      this.seg(p(t0), p(t1), w, k);
    }
  }
  /** Eksene dik düzlemde çember. */
  circle(c: V3, r: number, axis: "x" | "y" | "z", w: number, k = 0, n = 28): void {
    const pts: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const u = r * Math.cos(a);
      const v = r * Math.sin(a);
      pts.push(axis === "x" ? [c[0], c[1] + u, c[2] + v] : axis === "y" ? [c[0] + u, c[1], c[2] + v] : [c[0] + u, c[1] + v, c[2]]);
    }
    this.poly(pts, w, k);
  }
  box(cx: number, cy: number, cz: number, sx: number, sy: number, sz: number, w: number, k = 0): void {
    const x0 = cx - sx / 2, x1 = cx + sx / 2, y0 = cy - sy / 2, y1 = cy + sy / 2, z0 = cz - sz / 2, z1 = cz + sz / 2;
    const c: V3[] = [
      [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
      [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
    ];
    const e = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7];
    for (let i = 0; i < e.length; i += 2) this.seg(c[e[i]!]!, c[e[i + 1]!]!, w, k);
  }
  /** Dikey (y eksenli) silindir: alt ve üst halka + yan çizgiler. */
  cylY(x: number, y0: number, z: number, r: number, h: number, w: number, k = 0, n = 12): void {
    this.circle([x, y0, z], r, "y", w, k, n);
    this.circle([x, y0 + h, z], r, "y", w, k, n);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      this.seg([x + r * Math.cos(a), y0, z + r * Math.sin(a)], [x + r * Math.cos(a), y0 + h, z + r * Math.sin(a)], w, k);
    }
  }
  /** Yatay (x eksenli) silindir. */
  cylX(x0: number, x1: number, y: number, z: number, r: number, w: number, k = 0, rings = 2): void {
    for (let i = 0; i < rings; i++) this.circle([x0 + ((x1 - x0) * i) / (rings - 1), y, z], r, "x", w, k, 12);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      this.seg([x0, y + r * Math.cos(a), z + r * Math.sin(a)], [x1, y + r * Math.cos(a), z + r * Math.sin(a)], w, k);
    }
  }
}

/* ---------------- gövde ---------------- */

const FRAME_LEVELS = [0, 0.03, 0.07, 0.12, 0.18, 0.26, 0.34, 0.42, 0.5, T, 0.7, 0.8, 0.88];

function frameAt(d: Draw, x: number, w: number, k: number, top = deckY(x)): void {
  const levels = [...FRAME_LEVELS.filter((y) => y < top - 0.02), top];
  // Geçerli (gövde içi) seviyeleri ardışık gruplara ayır (bulb bölgesinde boşluk olabilir).
  let run: number[] = [];
  const flush = (): void => {
    if (run.length >= 2) {
      const port = run.map((y) => [x, y, hb(x, y)] as V3).reverse();
      const stb = run.map((y) => [x, y, -hb(x, y)] as V3);
      d.poly([...port, ...stb], w, k);
    }
    run = [];
  };
  for (const y of levels) {
    if (x >= sternX(y) - 1e-6 && x <= stemX(y) + 1e-6 && (hb(x, y) > 0.004 || y === 0)) run.push(y);
    else flush();
  }
  flush();
}

function waterline(d: Draw, y: number, w: number, k = 0, n = 150): void {
  const xs = sternX(y);
  const xb = stemX(y);
  for (const s of [1, -1]) {
    const pts: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const x = xs + ((xb - xs) * i) / n;
      pts.push([x, y, s * hb(x, y)]);
    }
    d.poly(pts, w, k);
  }
  const t = hb(xs + 1e-4, y);
  if (t > 0.01) d.seg([xs, y, t], [xs, y, -t], w, k);
}

function buttock(d: Draw, z: number, w: number): void {
  for (const s of [1, -1]) {
    let pts: V3[] = [];
    for (let x = -5; x <= 5.05; x += 0.08) {
      let found = -1;
      for (let j = 0; j <= 48; j++) {
        const y = (D * j) / 48;
        if (hb(x, y) >= z) {
          found = y;
          break;
        }
      }
      if (found >= 0 && found < D - 0.02) pts.push([x, found, s * z]);
      else {
        if (pts.length > 1) d.poly(pts, w);
        pts = [];
      }
    }
    if (pts.length > 1) d.poly(pts, w);
  }
}

/* ---------------- yerleşim ---------------- */

export const HATCHES = [-1.75, -0.49, 0.77, 2.03, 3.29];
const HATCH_L = 0.88;
export const BULKHEADS = [-2.35, -1.12, 0.14, 1.4, 2.66, 3.92];
export const CRANES = [-1.12, 0.14, 1.4, 2.66];

export const ACC = { x0: -4.35, x1: -3.6, hw: 0.62, y0: D + POOP_H, tier: 0.17, tiers: 5 };
const accTop = ACC.y0 + ACC.tier * ACC.tiers;
export const PROP = { x: -4.13, y: 0.23, r: 0.2 };
export const RADAR = { x: -4.05, y: accTop + 0.46 };

export interface ShipGeometry {
  main: Draw;
  prop: Draw;
  radar: Draw;
  anchors: Record<string, V3>;
}

export function buildShip(): ShipGeometry {
  const d = new Draw();

  /* Gövde çizgileri */
  for (let x = -4.95; x <= 4.96; x += 0.25) frameAt(d, x, 0.22, 0);
  for (const y of [0.03, 0.12, 0.26, 0.42, 0.8]) waterline(d, y, 0.3);
  waterline(d, T, 0.95); // dizayn su hattı
  buttock(d, 0.3, 0.16);
  buttock(d, 0.58, 0.16);

  // Güverte kenarı (sheer)
  for (const s of [1, -1]) {
    const pts: V3[] = [];
    for (let x = sternX(D); x <= stemX(D) + 1e-6; x += 0.05) pts.push([x, deckY(x), s * hb(x, D)]);
    d.poly(pts, 1);
  }
  // Omurga, baş bodoslama, kıç profil
  d.seg([sternX(0), 0, 0], [stemX(0), 0, 0], 0.85);
  const stem: V3[] = [];
  for (let i = 0; i <= 60; i++) {
    const y = ((D + FC_H) * i) / 60;
    stem.push([stemX(y), y, 0]);
  }
  d.poly(stem, 1);
  const stern: V3[] = [];
  for (let i = 0; i <= 30; i++) {
    const y = (D + POOP_H) * (i / 30);
    stern.push([sternX(y), y, 0]);
  }
  d.poly(stern, 0.9);
  // Kıç ayna (transom)
  const tr = hb(sternX(D) + 1e-4, D);
  d.poly([[sternX(D), D + POOP_H, tr], [sternX(D), D + POOP_H, -tr], [sternX(0.62), 0.62, -hb(sternX(0.62) + 1e-3, 0.62)], [sternX(0.62), 0.62, hb(sternX(0.62) + 1e-3, 0.62)]], 0.7, 0, true);
  // Güverte orta çizgisi (kesikli)
  d.dashed([POOP_X, D + 0.001, 0], [FC_X, D + 0.001, 0], 0.3);

  /* Baş kasara */
  const fcY = D + FC_H;
  for (const s of [1, -1]) {
    const pts: V3[] = [];
    for (let x = FC_X; x <= stemX(fcY); x += 0.04) pts.push([x, fcY, s * hb(x, fcY)]);
    d.poly(pts, 0.95);
    d.seg([FC_X, deckY(FC_X), s * hb(FC_X, D)], [FC_X, fcY, s * hb(FC_X, fcY)], 0.8);
    for (const x of [4.3, 4.55, 4.8]) d.seg([x, deckY(x), s * hb(x, D)], [x, fcY, s * hb(x, fcY)], 0.3);
  }
  d.seg([FC_X, fcY, hb(FC_X, fcY)], [FC_X, fcY, -hb(FC_X, fcY)], 0.8);
  // Dalgakıran, ırgatlar, babalar, baş direk
  d.poly([[4.28, fcY, 0.5], [4.46, fcY + 0.09, 0], [4.28, fcY, -0.5]], 0.6);
  d.poly([[4.28, fcY + 0.09, 0.5], [4.46, fcY + 0.09, 0]], 0.3);
  for (const s of [1, -1]) {
    d.box(4.62, fcY + 0.05, s * 0.24, 0.14, 0.1, 0.1, 0.55);
    d.circle([4.62, fcY + 0.07, s * 0.33], 0.045, "z", 0.5, 0, 14);
    for (const x of [4.25, 4.85]) {
      d.cylY(x, fcY, s * 0.36, 0.022, 0.06, 0.4, 0, 8);
      d.cylY(x + 0.07, fcY, s * 0.36, 0.022, 0.06, 0.4, 0, 8);
    }
    // Irgat zincir hattı → loça
    d.seg([4.62, fcY + 0.03, s * 0.24], [4.72, fcY, s * 0.45], 0.35);
    // Loça (hawse pipe) gövde yanında
    const hx = 4.62;
    const hy = D - 0.08;
    const pts: V3[] = [];
    for (let i = 0; i <= 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const x = hx + 0.06 * Math.cos(a);
      const y = hy + 0.035 * Math.sin(a);
      pts.push([x, y, s * (hb(x, y) + 0.002)]);
    }
    d.poly(pts, 0.7);
  }
  d.seg([4.72, fcY, 0], [4.72, fcY + 0.58, 0], 0.7);
  d.seg([4.72, fcY + 0.46, -0.12], [4.72, fcY + 0.46, 0.12], 0.6);
  d.circle([4.72, fcY + 0.58, 0], 0.025, "y", 0.6, 0, 10);

  /* Kıç kasara */
  const pY = D + POOP_H;
  for (const s of [1, -1]) {
    const pts: V3[] = [];
    for (let x = sternX(pY) + 1e-4; x <= POOP_X; x += 0.04) pts.push([x, pY, s * hb(x, D)]);
    d.poly(pts, 0.9);
    d.seg([POOP_X, deckY(POOP_X), s * hb(POOP_X, D)], [POOP_X, pY, s * hb(POOP_X, D)], 0.7);
  }
  d.seg([POOP_X, pY, hb(POOP_X, D)], [POOP_X, pY, -hb(POOP_X, D)], 0.7);

  /* Korkuluklar (üst + orta tel + dikmeler) */
  for (const s of [1, -1]) {
    for (const hgt of [0.075, 0.04]) {
      const pts: V3[] = [];
      for (let x = POOP_X + 0.02; x <= FC_X - 0.02; x += 0.1) pts.push([x, deckY(x) + hgt, s * (hb(x, D) - 0.01)]);
      d.poly(pts, hgt > 0.05 ? 0.4 : 0.2);
    }
    for (let x = POOP_X + 0.1; x <= FC_X - 0.05; x += 0.2) d.seg([x, deckY(x), s * (hb(x, D) - 0.01)], [x, deckY(x) + 0.075, s * (hb(x, D) - 0.01)], 0.25);
  }

  /* Ambarlar: mezarnalar ve yana kayar kapaklar */
  HATCHES.forEach((xc) => {
    const hw = Math.min(0.29 * B, hb(xc + HATCH_L / 2, D) * 0.78);
    const y0 = deckY(xc);
    const y1 = y0 + 0.1;
    const x0 = xc - HATCH_L / 2;
    const x1 = xc + HATCH_L / 2;
    d.box(xc, (y0 + y1) / 2, 0, HATCH_L, y1 - y0, hw * 2, 0.75);
    // Mezarna destek braketleri
    for (let x = x0 + 0.11; x < x1 - 0.05; x += 0.15)
      for (const s of [1, -1]) d.seg([x, y1 - 0.02, s * hw], [x, y0, s * (hw + 0.05)], 0.3);
    // Kapaklar: iki panel, orta ek yeri, kamburluk, enine kuşaklar
    const camber = 0.035;
    for (let x = x0 + 0.02; x <= x1 - 0.02 + 1e-6; x += 0.12) d.poly([[x, y1, hw], [x, y1 + camber, 0], [x, y1, -hw]], 0.3);
    d.seg([x0, y1 + camber, 0], [x1, y1 + camber, 0], 0.7);
    for (const s of [1, -1]) d.seg([x0, y1, s * hw], [x1, y1, s * hw], 0.55);
    d.poly([[x0, y1, hw], [x0, y1 + camber, 0], [x0, y1, -hw]], 0.6);
    d.poly([[x1, y1, hw], [x1, y1 + camber, 0], [x1, y1, -hw]], 0.6);
  });

  /* Güverte vinçleri: kaide, kabin, A-çerçeve, kafes bumba, teller, kanca */
  CRANES.forEach((xc) => {
    const y0 = deckY(xc);
    const py = y0 + 0.36;
    const cyl: [number, number][] = [];
    for (let i = 0; i < 8; i++) cyl.push([Math.cos((i / 8) * Math.PI * 2 + Math.PI / 8), Math.sin((i / 8) * Math.PI * 2 + Math.PI / 8)]);
    const r = 0.085;
    for (const yy of [y0, py - 0.04, py]) d.poly([...cyl, cyl[0]!].map(([c, s]) => [xc + r * c, yy, r * s] as V3), 0.55);
    cyl.forEach(([c, s]) => d.seg([xc + r * c, y0, r * s], [xc + r * c, py, r * s], 0.35));
    d.box(xc - 0.02, py + 0.09, 0, 0.26, 0.18, 0.2, 0.7);
    d.box(xc + 0.13, py + 0.08, 0.07, 0.07, 0.08, 0.06, 0.45); // operatör kabini
    const ax = xc - 0.06;
    const ay = py + 0.36;
    for (const s of [1, -1]) d.seg([xc - 0.12, py + 0.18, s * 0.08], [ax, ay, 0], 0.6);
    // Bumba: kökten başa doğru, dinlenme yerine yatık
    const root: V3 = [xc + 0.08, py + 0.12, 0];
    const tip: V3 = [xc + 1.18, deckY(xc + 1.18) + 0.42, 0];
    const wR = 0.06;
    const wT = 0.028;
    const edge = (sy: number, sz: number): V3[] => [
      [root[0], root[1] + sy * wR, sz * wR],
      [tip[0], tip[1] + sy * wT, sz * wT],
    ];
    const edges = [edge(1, 1), edge(1, -1), edge(-1, 1), edge(-1, -1)];
    edges.forEach((e) => d.seg(e[0]!, e[1]!, 0.6));
    const seg = 9;
    for (let i = 0; i < seg; i++) {
      const t0 = i / seg;
      const t1 = (i + 1) / seg;
      const lerp = (e: V3[], t: number): V3 => [e[0]![0] + (e[1]![0] - e[0]![0]) * t, e[0]![1] + (e[1]![1] - e[0]![1]) * t, e[0]![2] + (e[1]![2] - e[0]![2]) * t];
      // Kafes: iki yanda zikzak
      d.seg(lerp(edges[0]!, t0), lerp(edges[2]!, t1), 0.28);
      d.seg(lerp(edges[1]!, t0), lerp(edges[3]!, t1), 0.28);
      d.seg(lerp(edges[0]!, t1), lerp(edges[1]!, t1), 0.22);
    }
    // Luff ve yük telleri, kanca bloğu
    d.seg([ax, ay, 0], tip, 0.45);
    d.seg([ax + 0.02, ay - 0.02, 0], [tip[0] - 0.05, tip[1], 0], 0.3);
    d.seg(tip, [tip[0], tip[1] - 0.16, 0], 0.4);
    d.poly([[tip[0] - 0.025, tip[1] - 0.16, 0], [tip[0] + 0.025, tip[1] - 0.16, 0], [tip[0], tip[1] - 0.21, 0]], 0.5, 0, true);
    // Bumba dinlenme ayağı
    d.seg([tip[0] - 0.04, deckY(tip[0]) + 0.1, 0.18], [tip[0] - 0.04, tip[1] - 0.03, 0.02], 0.35);
    d.seg([tip[0] - 0.04, deckY(tip[0]) + 0.1, -0.18], [tip[0] - 0.04, tip[1] - 0.03, -0.02], 0.35);
  });

  /* Yaşam mahalli (5 kat), köprüüstü, kanatlar, pencereler */
  const { x0, x1, hw, y0: ay0, tier } = ACC;
  for (let i = 0; i < ACC.tiers; i++) {
    const yb = ay0 + i * tier;
    const inset = i === ACC.tiers - 1 ? 0 : 0.015 * i;
    d.box((x0 + x1) / 2 - inset / 2, yb + tier / 2, 0, x1 - x0 - inset, tier, hw * 2, 0.8);
    const wy = yb + tier * 0.55;
    if (i < ACC.tiers - 1) {
      // Ön cephe pencereleri
      for (let z = -hw + 0.09; z <= hw - 0.08; z += 0.1) {
        const fx = x1 - inset + 0.001;
        d.poly([[fx, wy - 0.02, z], [fx, wy - 0.02, z + 0.05], [fx, wy + 0.02, z + 0.05], [fx, wy + 0.02, z]], 0.4, 0, true);
      }
      // Yan pencereler
      for (const s of [1, -1])
        for (let x = x0 + 0.08; x <= x1 - inset - 0.08; x += 0.12)
          d.poly([[x, wy - 0.02, s * hw], [x + 0.06, wy - 0.02, s * hw], [x + 0.06, wy + 0.02, s * hw], [x, wy + 0.02, s * hw]], 0.35, 0, true);
    } else {
      // Köprüüstü: sürekli pencere bandı ve kayıtlar
      const fx = x1 + 0.001;
      d.poly([[fx, yb + 0.06, -hw], [fx, yb + 0.06, hw], [fx + 0.025, yb + 0.14, hw], [fx + 0.025, yb + 0.14, -hw]], 0.75, 0, true);
      for (let z = -hw; z <= hw + 1e-6; z += 0.1) d.seg([fx, yb + 0.06, z], [fx + 0.025, yb + 0.14, z], 0.4);
      // Köprü kanatları
      for (const s of [1, -1]) {
        const zo = s * (HB + 0.04);
        d.poly([[x1 - 0.32, yb, s * hw], [x1 - 0.32, yb, zo], [x1 + 0.02, yb, zo], [x1 + 0.02, yb, s * hw]], 0.7);
        d.poly([[x1 - 0.32, yb + 0.07, s * hw], [x1 - 0.32, yb + 0.07, zo], [x1 + 0.02, yb + 0.07, zo], [x1 + 0.02, yb + 0.07, s * hw]], 0.35);
        d.seg([x1 + 0.02, yb, zo], [x1 + 0.02, yb + 0.07, zo], 0.5);
        d.seg([x1 - 0.32, yb, zo], [x1 - 0.32, yb + 0.07, zo], 0.5);
        d.seg([x1 - 0.3, yb, zo], [x1 - 0.12, yb - 0.14, s * hw], 0.3); // kanat desteği
      }
    }
  }
  // Pusula güvertesi korkuluğu, uydu anteni kubbesi
  d.poly([[x0, accTop + 0.05, -hw], [x1, accTop + 0.05, -hw], [x1, accTop + 0.05, hw], [x0, accTop + 0.05, hw]], 0.3, 0, true);
  d.circle([x0 + 0.12, accTop + 0.07, hw - 0.12], 0.05, "y", 0.45, 0, 14);
  d.circle([x0 + 0.12, accTop + 0.07, hw - 0.12], 0.05, "x", 0.45, 0, 14);
  // Radar direği (tripod) ve platformlar
  d.seg([RADAR.x, accTop, 0], [RADAR.x, RADAR.y, 0], 0.75);
  for (const s of [1, -1]) d.seg([RADAR.x - 0.16, accTop, s * 0.16], [RADAR.x, RADAR.y - 0.12, 0], 0.5);
  d.poly([[RADAR.x - 0.08, RADAR.y - 0.2, -0.1], [RADAR.x + 0.08, RADAR.y - 0.2, -0.1], [RADAR.x + 0.08, RADAR.y - 0.2, 0.1], [RADAR.x - 0.08, RADAR.y - 0.2, 0.1]], 0.4, 0, true);
  d.seg([RADAR.x + 0.08, RADAR.y - 0.2, 0.1], [RADAR.x + 0.2, RADAR.y - 0.2, 0.1], 0.5); // ikinci radar (sabit)
  d.seg([RADAR.x, RADAR.y, 0], [RADAR.x, RADAR.y + 0.14, 0], 0.4); // anten
  d.seg([RADAR.x - 0.1, RADAR.y + 0.1, 0], [RADAR.x + 0.1, RADAR.y + 0.1, 0], 0.35);

  /* Baca: konik gövde, şirket bandı, egzoz boruları */
  const fb = { x0: -4.8, x1: -4.42, z: 0.2, y: pY };
  const ft = { x0: -4.9, x1: -4.58, z: 0.16, y: accTop + 0.3 };
  const ring = (xa: number, xb: number, z: number, y: number, w: number): void =>
    d.poly([[xa, y, -z], [xb, y, -z], [xb, y, z], [xa, y, z]], w, 0, true);
  ring(fb.x0, fb.x1, fb.z, fb.y, 0.7);
  ring(ft.x0, ft.x1, ft.z, ft.y, 0.85);
  for (const [xa, xb] of [[fb.x0, ft.x0], [fb.x1, ft.x1]] as const)
    for (const s of [1, -1]) d.seg([xa, fb.y, s * fb.z], [xb, ft.y, s * ft.z], 0.7);
  for (const t of [0.72, 0.84]) {
    const y = fb.y + (ft.y - fb.y) * t;
    ring(fb.x0 + (ft.x0 - fb.x0) * t, fb.x1 + (ft.x1 - fb.x1) * t, fb.z + (ft.z - fb.z) * t, y, 0.95);
  }
  for (const [ex, ez] of [[-4.78, 0.06], [-4.7, -0.06], [-4.64, 0.05]] as const) d.cylY(ex, ft.y - 0.02, ez, 0.03, 0.14, 0.55, 0, 10);

  /* Serbest düşmeli filika ve kızak */
  const lb0: V3 = [-5.14, pY + 0.1, 0];
  const lb1: V3 = [-4.84, pY + 0.22, 0];
  for (const s of [1, -1]) d.seg([lb0[0] - 0.02, lb0[1] - 0.06, s * 0.09], [lb1[0] + 0.06, lb1[1] - 0.06, s * 0.09], 0.5);
  const lbPts = (s: number): V3[] => {
    const pts: V3[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const x = lb0[0] + (lb1[0] - lb0[0]) * t;
      const y = lb0[1] + (lb1[1] - lb0[1]) * t;
      const wdt = 0.075 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.02));
      pts.push([x, y, s * wdt]);
    }
    return pts;
  };
  d.poly(lbPts(1), 0.7);
  d.poly(lbPts(-1), 0.7);
  d.seg(lb0, [lb0[0], lb0[1] + 0.05, 0], 0.4);
  d.seg([(lb0[0] + lb1[0]) / 2, (lb0[1] + lb1[1]) / 2 + 0.08, 0], [lb1[0], lb1[1] + 0.07, 0], 0.5);
  // Kurtarma botu ve matafora (sancak)
  d.box(-3.95, pY + 0.12, HB - 0.12, 0.26, 0.08, 0.12, 0.45);
  d.poly([[-3.85, pY, HB - 0.02], [-3.85, pY + 0.34, HB - 0.02], [-3.95, pY + 0.34, HB - 0.12]], 0.4);

  /* Dümen (yarı balanslı) ve pervane diski */
  for (const s of [1, -1])
    d.poly([[-4.32, 0.56, s * 0.028], [-4.3, 0.1, s * 0.03], [-4.36, 0.035, s * 0.02], [-4.6, 0.045, s * 0.015], [-4.63, 0.5, s * 0.015], [-4.52, 0.58, s * 0.02]], 0.75, 0, true);
  d.seg([-4.48, 0.58, 0], [-4.48, 0.78, 0], 0.4, 1); // dümen rodu (röntgen)
  d.circle([PROP.x, PROP.y, 0], PROP.r + 0.01, "x", 0.18, 0, 40);

  /* Gövde işaretleri (sancak/izleyici tarafı): plimsol, yükleme hattı, draft markaları */
  const zs = (x: number, y: number): number => hb(x, y) + 0.003;
  {
    const cx = 0;
    const pts: V3[] = [];
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const x = cx + 0.075 * Math.cos(a);
      const y = T + 0.075 * Math.sin(a);
      pts.push([x, y, zs(x, y)]);
    }
    d.poly(pts, 0.9);
    d.seg([cx - 0.12, T, zs(cx, T)], [cx + 0.12, T, zs(cx, T)], 0.9);
    d.seg([cx - 0.1, deckY(0) - 0.03, zs(0, D)], [cx + 0.1, deckY(0) - 0.03, zs(0, D)], 0.9); // güverte hattı
    const lx = 0.22;
    d.seg([lx, T - 0.07, zs(lx, T)], [lx, T + 0.07, zs(lx, T)], 0.8);
    [-0.06, -0.035, -0.01, 0.015, 0.04, 0.065].forEach((o, i) => {
      const x2 = lx + (i % 2 === 0 ? 0.07 : -0.07);
      d.seg([lx, T + o, zs(lx, T + o)], [x2, T + o, zs(x2, T + o)], 0.7);
    });
  }
  for (const mx of [4.38, -0.35, -3.92]) {
    for (let y = 0.1; y <= 0.86; y += 0.05) {
      const major = Math.round(y * 100) % 20 === 0;
      const l = major ? 0.07 : 0.035;
      d.seg([mx, y, zs(mx, y)], [mx + l, y, zs(mx + l, y)], major ? 0.75 : 0.45);
    }
    d.seg([mx, 0.1, zs(mx, 0.1)], [mx, 0.86, zs(mx, 0.86)], 0.25);
  }
  // Bulb ve baş iticisi sembolleri
  d.circle([4.28, T + 0.07, zs(4.28, T + 0.07)], 0.035, "z", 0.8, 0, 16);
  d.seg([4.28, T + 0.035, zs(4.28, T)], [4.28, T - 0.03, zs(4.28, T - 0.03)], 0.8);
  {
    const tx = 4.2;
    const ty = 0.3;
    d.circle([tx, ty, zs(tx, ty)], 0.05, "z", 0.75, 0, 18);
    d.seg([tx - 0.035, ty - 0.035, zs(tx, ty)], [tx + 0.035, ty + 0.035, zs(tx, ty)], 0.75);
    d.seg([tx - 0.035, ty + 0.035, zs(tx, ty)], [tx + 0.035, ty - 0.035, zs(tx, ty)], 0.75);
  }

  /* ---------- Röntgen: iç yapı ve makine dairesi (tür 1) ---------- */
  const X = 1;
  // Perdeler ve tipik dökme yük kesiti (dip tank, hopper, üst yan tank)
  BULKHEADS.forEach((bx) => {
    frameAt(d, bx, 0.55, X);
    if (bx > -2.4 && bx < 3.95) {
      const hk = (y: number): number => hb(bx, y) - 0.005;
      for (const s of [1, -1]) {
        d.poly([[bx, 0.13, s * 0.4], [bx, 0.32, s * hk(0.32)]], 0.5, X);
        d.poly([[bx, deckY(bx), s * 0.5], [bx, 0.74, s * hk(0.74)]], 0.5, X);
      }
      d.seg([bx, 0.13, 0.4], [bx, 0.13, -0.4], 0.5, X);
    }
  });
  for (const s of [1, -1]) {
    const k1: V3[] = [];
    const k2: V3[] = [];
    const k3: V3[] = [];
    for (let x = -2.35; x <= 3.92; x += 0.1) {
      k1.push([x, 0.32, s * (hb(x, 0.32) - 0.005)]);
      k2.push([x, 0.74, s * (hb(x, 0.74) - 0.005)]);
      k3.push([x, 0.13, s * Math.min(0.4, hb(x, 0.13) * 0.7)]);
    }
    d.poly(k1, 0.32, X);
    d.poly(k2, 0.32, X);
    d.poly(k3, 0.28, X);
  }
  frameAt(d, -3.95, 0.5, X); // kıç pik perdesi
  // Ana makine: 6 silindirli iki zamanlı, karter, sütunlar, silindir kapakları
  const me = { x0: -3.55, x1: -2.62, y0: 0.14 };
  d.box((me.x0 + me.x1) / 2, me.y0 + 0.1, 0, me.x1 - me.x0, 0.2, 0.44, 0.7, X);
  d.box((me.x0 + me.x1) / 2, me.y0 + 0.34, 0, me.x1 - me.x0 - 0.04, 0.28, 0.34, 0.7, X);
  for (let i = 0; i < 6; i++) {
    const cx = me.x0 + 0.1 + i * ((me.x1 - me.x0 - 0.2) / 5);
    d.cylY(cx, me.y0 + 0.48, 0, 0.055, 0.08, 0.6, X, 12);
    d.seg([cx, me.y0 + 0.2, 0.17], [cx, me.y0 + 0.48, 0.17], 0.3, X);
  }
  d.cylX(me.x0 + 0.02, me.x1 - 0.02, me.y0 + 0.6, -0.13, 0.045, 0.55, X, 6); // egzoz kollektörü
  d.cylX(me.x0 + 0.05, me.x1 - 0.05, me.y0 + 0.38, 0.2, 0.03, 0.4, X, 3); // süpürme havası
  d.circle([me.x0 - 0.08, me.y0 + 0.56, -0.05], 0.075, "z", 0.6, X, 18); // turboşarj
  d.circle([me.x0 - 0.08, me.y0 + 0.56, 0.05], 0.075, "z", 0.6, X, 18);
  d.seg([me.x0 - 0.08, me.y0 + 0.63, -0.05], [me.x0 - 0.08, me.y0 + 0.63, 0.05], 0.4, X);
  d.seg([me.x0 - 0.08, me.y0 + 0.49, -0.05], [me.x0 - 0.08, me.y0 + 0.49, 0.05], 0.4, X);
  // Şaft hattı ve yataklar
  d.seg([me.x0, 0.25, 0], [PROP.x, PROP.y, 0], 0.7, X);
  for (const bx of [-3.66, -3.82]) d.box(bx, 0.21, 0, 0.06, 0.07, 0.1, 0.5, X);
  d.dashed([me.x0 + 0.1, 0.25, 0], [me.x0 + 0.1, 0.62, 0], 0.3, X);
  // Jeneratörler, kazan, egzoz kazanı, makine şaftı (casing)
  for (let i = 0; i < 3; i++) {
    const gx = -3.3 + i * 0.26;
    d.box(gx, 0.5, 0.48, 0.2, 0.12, 0.13, 0.55, X);
    d.circle([gx + 0.12, 0.5, 0.48], 0.045, "x", 0.5, X, 14);
  }
  d.cylY(-2.95, 0.42, -0.5, 0.075, 0.34, 0.55, X, 14);
  d.cylY(-4.62, D + 0.5, 0, 0.07, 0.3, 0.45, X, 12);
  for (const s of [1, -1]) d.dashed([-4.1, 0.78, s * 0.28], [-4.55, pY, s * 0.2], 0.3, X);

  /* ---------- Dönen parçalar ---------- */
  const prop = new Draw();
  const rh = 0.045;
  for (let b = 0; b < 4; b++) {
    const base = (b / 4) * Math.PI * 2;
    const lead: V3[] = [];
    const trail: V3[] = [];
    for (let i = 0; i <= 12; i++) {
      const rr = rh + ((PROP.r - rh) * i) / 12;
      const u = (rr - rh) / (PROP.r - rh);
      const half = 0.12 + 0.34 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.92 + 0.08)), 0.7);
      const skew = 0.35 * u * u;
      const a1 = base + skew + half;
      const a2 = base + skew - half * 0.8;
      lead.push([0.02 * u, rr * Math.cos(a1), rr * Math.sin(a1)]);
      trail.push([-0.02 * u, rr * Math.cos(a2), rr * Math.sin(a2)]);
    }
    prop.poly([...lead, ...trail.reverse()], 0.85);
  }
  prop.circle([0.03, 0, 0], rh, "x", 0.8, 0, 14);
  prop.circle([-0.05, 0, 0], rh * 0.8, "x", 0.6, 0, 14);
  prop.seg([0.03, 0, 0], [0.09, 0, 0], 0.7);

  const radar = new Draw();
  radar.poly([[-0.14, 0, -0.02], [0.14, 0, -0.02], [0.14, 0.03, -0.02], [-0.14, 0.03, -0.02]], 0.85, 0, true);
  radar.seg([0, -0.04, 0], [0, 0, 0], 0.7);
  radar.box(0, -0.06, 0, 0.06, 0.04, 0.06, 0.6);

  return {
    main: d,
    prop,
    radar,
    anchors: {
      engine: [-3.05, 0.72, 0.05],
      prop: [PROP.x, PROP.y + PROP.r, 0],
      cranes: [0.14, deckY(0.14) + 0.6, 0],
      holds: [0.77, deckY(0.77) + 0.15, 0.1],
      hull: [0, T, hb(0, T)],
      bow: [5.0, 0.23, 0],
      gens: [-2.8, 0.5, 0.5],
      boiler: [-2.95, 0.76, -0.5],
      bridge: [ACC.x1, ACC.y0 + ACC.tier * 4.6, 0.3],
      tanks: [-1.2, 0.13, 0.4],
      mast: [RADAR.x, RADAR.y + 0.12, 0],
      center: [0.2, 0.8, 0],
    },
  };
}
