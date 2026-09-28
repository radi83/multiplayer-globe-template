/**
 * Blueprint gemi sahnesi (Three.js).
 *
 * Tel kafes bir dökme yük gemisi, şeffaf dalgalı bir denizde sol üstten
 * ~45° görülür. Baş taraf dalgaya çarpıyormuş gibi yavaşça kalkıp iner;
 * çevresinde dönen bir pusula halkası, yükselen küçük veri kareleri ve
 * baş dalgası çizgileri vardır.
 *
 * Hareket bilerek küçük ve yavaştır (kullanıcı geri bildirimi: kartlardaki
 * dönme mide bulandırıyordu). "Hareketi azalt" açıksa tek bir sabit kare çizilir.
 *
 * Gemi genel bir çizimdir; belirli bir geminin gerçek ölçülerini göstermez.
 */
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Fog,
  Group,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  type BufferAttribute,
} from "three";

export interface ShipColors {
  accent: string;
  ink: string;
  bg: string;
}

export interface ShipHandle {
  setColors(c: ShipColors): void;
  setMotion(on: boolean): void;
  dispose(): void;
}

/* ---------------- ölçüler (sahne birimi) ---------------- */

const D = 1.0; // güverte yüksekliği
const T = 0.62; // su çekimi
const B = 1.7; // genişlik
const MID_FWD = 2.4; // paralel gövdenin baş ucu
const MID_AFT = -3.0; // paralel gövdenin kıç ucu

const xBow = (y: number): number => 4.75 + 0.32 * (y / D);
const xStern = (y: number): number => -4.3 - 0.6 * Math.min(1, y / (0.45 * D));

/** Gövdenin yarı genişliği: x boyuna, y yükseklik. */
function halfBreadth(x: number, y: number): number {
  const yy = Math.max(0, Math.min(1, y / D));
  let hb = B / 2;
  if (x > MID_FWD) {
    const f = Math.min(1, (x - MID_FWD) / (xBow(y) - MID_FWD));
    hb *= (1 - Math.pow(f, 1.7)) * (1 - f * (1 - yy) * 0.45);
  } else if (x < MID_AFT) {
    const g = Math.min(1, (MID_AFT - x) / (MID_AFT - xStern(y)));
    hb *= (1 - 0.22 * g * g) * (1 - g * Math.pow(1 - yy, 2) * 0.85);
  }
  const bilge = yy < 0.12 ? 0.8 + 0.2 * (yy / 0.12) : 1;
  return Math.max(0, hb * bilge);
}

/* ---------------- çizgi toplama ---------------- */

/** Konum + "ıslak mı" bilgisi taşıyan çizgi listesi (LineSegments için çiftler). */
class Lines {
  pos: number[] = [];
  wet: number[] = []; // her köşe için 0..1 (1 = su altında, soluk)
  seg(a: [number, number, number], b: [number, number, number], wetA = 0, wetB = wetA): void {
    this.pos.push(...a, ...b);
    this.wet.push(wetA, wetB);
  }
  poly(pts: [number, number, number][], wetOf: (p: [number, number, number]) => number): void {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]!;
      const b = pts[i + 1]!;
      this.seg(a, b, wetOf(a), wetOf(b));
    }
  }
  box(cx: number, cy: number, cz: number, sx: number, sy: number, sz: number): void {
    const x0 = cx - sx / 2;
    const x1 = cx + sx / 2;
    const y0 = cy - sy / 2;
    const y1 = cy + sy / 2;
    const z0 = cz - sz / 2;
    const z1 = cz + sz / 2;
    const c: [number, number, number][] = [
      [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
      [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
    ];
    const e = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7];
    for (let i = 0; i < e.length; i += 2) this.seg(c[e[i]!]!, c[e[i + 1]!]!);
  }
}

const wetY = (p: [number, number, number]): number => (p[1] < T - 0.01 ? 1 : 0);

function buildHull(): Lines {
  const L = new Lines();
  const levels = [0, 0.06, 0.16, 0.3, 0.46, T, 0.8, D];

  // Postalar (enine kesitler)
  for (let x = -4.6; x <= 4.8; x += 0.4) {
    const side = (s: 1 | -1): [number, number, number][] =>
      levels
        .filter((y) => x >= xStern(y) && x <= xBow(y))
        .map((y) => [x, y, s * halfBreadth(x, y)] as [number, number, number]);
    const port = side(1).reverse();
    const stb = side(-1);
    if (port.length < 2) continue;
    L.poly([...port, ...stb], wetY);
  }

  // Su hatları ve güverte kenarı
  for (const y of [0.06, 0.3, T, 0.82, D]) {
    for (const s of [1, -1] as const) {
      const pts: [number, number, number][] = [];
      const x0 = xStern(y);
      const x1 = xBow(y);
      for (let i = 0; i <= 64; i++) {
        const x = x0 + ((x1 - x0) * i) / 64;
        pts.push([x, y, s * halfBreadth(x, y)]);
      }
      L.poly(pts, wetY);
    }
  }

  // Omurga, baş bodoslama, kıç ayna
  L.poly(
    [
      [xStern(0), 0, 0],
      [xBow(0), 0, 0],
    ],
    () => 1,
  );
  const stem: [number, number, number][] = [];
  const stern: [number, number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const y = (D * i) / 10;
    stem.push([xBow(y), y, 0]);
    stern.push([xStern(y), y, 0]);
  }
  L.poly(stem, wetY);
  L.poly(stern, wetY);
  // Ayna (transom) kenarı
  L.seg([xStern(D), D, halfBreadth(xStern(D) + 0.001, D)], [xStern(D), D, -halfBreadth(xStern(D) + 0.001, D)]);

  // Ambar kapakları
  for (let i = 0; i < 7; i++) L.box(-2.2 + i * 0.93, D + 0.07, 0, 0.62, 0.14, B * 0.62);
  // Baş kasara ve direk
  L.box(4.35, D + 0.09, 0, 0.55, 0.18, B * 0.55);
  L.seg([4.2, D + 0.18, 0], [4.2, D + 0.8, 0]);
  L.seg([4.2, D + 0.62, -0.14], [4.2, D + 0.62, 0.14]);
  // Köprüüstü, kaptan köşkü kanatları, baca
  L.box(-4.1, D + 0.45, 0, 0.85, 0.9, B * 0.78);
  L.box(-3.95, D + 0.94, 0, 0.45, 0.08, B * 1.04);
  for (let k = 1; k <= 3; k++) {
    const y = D + (0.9 * k) / 4;
    L.seg([-3.675, y, -B * 0.39], [-3.675, y, B * 0.39]);
  }
  L.box(-4.55, D + 1.12, 0, 0.3, 0.45, 0.36);
  L.seg([-4.0, D + 0.98, 0], [-4.0, D + 1.35, 0]);
  return L;
}

function toGeometry(L: Lines): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(L.pos, 3));
  g.setAttribute("color", new Float32BufferAttribute(new Array(L.wet.length * 3).fill(1), 3));
  g.userData.wet = L.wet;
  return g;
}

function paint(g: BufferGeometry, dry: Color, wet: Color): void {
  const w = g.userData.wet as number[];
  const col = g.getAttribute("color") as BufferAttribute;
  const c = new Color();
  for (let i = 0; i < w.length; i++) {
    c.copy(dry).lerp(wet, w[i]!);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  col.needsUpdate = true;
}

/* ---------------- deniz ---------------- */

const SEA = { extent: 9, step: 0.45 };

function buildSea(): { geo: BufferGeometry; update: (t: number) => void } {
  const n = Math.round((SEA.extent * 2) / SEA.step);
  const pos: number[] = [];
  const coord = (i: number): number => -SEA.extent + i * SEA.step;
  // x yönü çizgileri
  for (let j = 0; j <= n; j++)
    for (let i = 0; i < n; i++) pos.push(coord(i), 0, coord(j), coord(i + 1), 0, coord(j));
  // z yönü çizgileri
  for (let i = 0; i <= n; i++)
    for (let j = 0; j < n; j++) pos.push(coord(i), 0, coord(j), coord(i), 0, coord(j + 1));
  const geo = new BufferGeometry();
  const attr = new Float32BufferAttribute(pos, 3);
  geo.setAttribute("position", attr);
  const base = Float32Array.from(pos);
  const update = (t: number): void => {
    const a = attr.array as Float32Array;
    for (let k = 0; k < a.length; k += 3) {
      const x = base[k]!;
      const z = base[k + 2]!;
      a[k + 1] = 0.05 * Math.sin(0.9 * x + 1.05 * t) + 0.035 * Math.sin(1.25 * z - 0.8 * t);
    }
    attr.needsUpdate = true;
  };
  return { geo, update };
}

/* ---------------- çevre şekilleri ---------------- */

function buildRing(): BufferGeometry {
  const pos: number[] = [];
  const R = 6.4;
  const seg = 160;
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2;
    const a1 = ((i + 1) / seg) * Math.PI * 2;
    pos.push(R * Math.cos(a0), 0, R * Math.sin(a0), R * Math.cos(a1), 0, R * Math.sin(a1));
  }
  for (let d = 0; d < 360; d += 5) {
    const a = (d * Math.PI) / 180;
    const len = d % 30 === 0 ? 0.42 : 0.18;
    pos.push(R * Math.cos(a), 0, R * Math.sin(a), (R - len) * Math.cos(a), 0, (R - len) * Math.sin(a));
  }
  // kesikli iç halka
  const r = 5.7;
  for (let i = 0; i < 90; i += 2) {
    const a0 = (i / 90) * Math.PI * 2;
    const a1 = ((i + 1) / 90) * Math.PI * 2;
    pos.push(r * Math.cos(a0), 0, r * Math.sin(a0), r * Math.cos(a1), 0, r * Math.sin(a1));
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  return g;
}

/** Geminin yanında boy ölçü çizgisi (sayı yok, sadece çizim dili). */
function buildDimension(): BufferGeometry {
  const z = B / 2 + 0.75;
  const pos = [
    xStern(D), 0.02, z, -0.35, 0.02, z,
    0.35, 0.02, z, xBow(D), 0.02, z,
    xStern(D), 0.02, z - 0.15, xStern(D), 0.02, z + 0.15,
    xBow(D), 0.02, z - 0.15, xBow(D), 0.02, z + 0.15,
  ];
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  return g;
}

/** Baş dalgası: pruvadan iki yana açılan kısa çizgiler. */
function buildBowWave(): BufferGeometry {
  const pos: number[] = [];
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const o = k * 0.22;
      pos.push(xBow(T) - 0.1 - o, T, s * (0.05 + o * 0.9), xBow(T) - 0.9 - o * 1.6, T, s * (0.55 + o * 1.4));
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  return g;
}

interface Floater {
  line: LineSegments;
  mat: LineBasicMaterial;
  x: number;
  z: number;
  phase: number;
}

function square(size: number): BufferGeometry {
  const h = size / 2;
  const pos = [-h, -h, 0, h, -h, 0, h, -h, 0, h, h, 0, h, h, 0, -h, h, 0, -h, h, 0, -h, -h, 0];
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  return g;
}

/* ---------------- sahne ---------------- */

export function createShipScene(host: HTMLElement, colors: ShipColors, motion: boolean): ShipHandle | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const scene = new Scene();
  const fog = new Fog(0xffffff, 12, 24);
  scene.fog = fog;

  const camera = new PerspectiveCamera(26, 1, 0.1, 100);
  // Sol üstten ~45° bakış; baş sağ alta, izleyiciye doğru.
  camera.position.set(8, 9, 12);
  camera.lookAt(0, 0, 0);
  camera.fov = 25;

  const world = new Group();
  world.rotation.y = -0.35;
  scene.add(world);

  // Gemi
  const ship = new Group();
  const hullGeo = toGeometry(buildHull());
  const hullMat = new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95, fog: true });
  ship.add(new LineSegments(hullGeo, hullMat));
  const waveGeo = buildBowWave();
  const waveMat = new LineBasicMaterial({ transparent: true, opacity: 0, fog: true });
  ship.add(new LineSegments(waveGeo, waveMat));
  world.add(ship);

  // Deniz
  const sea = buildSea();
  const seaMat = new LineBasicMaterial({ transparent: true, opacity: 0.5, fog: true });
  world.add(new LineSegments(sea.geo, seaMat));

  // Pusula halkası ve ölçü çizgisi
  const ringGeo = buildRing();
  const ringMat = new LineBasicMaterial({ transparent: true, opacity: 0.55, fog: true });
  const ring = new LineSegments(ringGeo, ringMat);
  ring.position.y = 0.02;
  world.add(ring);
  const dimGeo = buildDimension();
  const dimMat = new LineBasicMaterial({ transparent: true, opacity: 0.5, fog: true });
  world.add(new LineSegments(dimGeo, dimMat));

  // Yükselen veri kareleri
  const sqGeo = square(0.2);
  const floaters: Floater[] = [];
  const seeds = [
    [-2.6, 2.2], [1.4, 2.6], [3.6, -2.1], [-1.2, -2.8], [4.8, 1.3], [-4.2, -1.4], [0.6, -3.6],
  ] as const;
  seeds.forEach(([x, z], i) => {
    const mat = new LineBasicMaterial({ transparent: true, opacity: 0, fog: true });
    const line = new LineSegments(sqGeo, mat);
    line.position.set(x, 0, z);
    world.add(line);
    floaters.push({ line, mat, x, z, phase: i / seeds.length });
  });

  const applyColors = (c: ShipColors): void => {
    const accent = new Color().setStyle(c.accent);
    const ink = new Color().setStyle(c.ink);
    const bg = new Color().setStyle(c.bg);
    fog.color.copy(bg);
    paint(hullGeo, accent, accent.clone().lerp(bg, 0.62));
    waveMat.color.copy(accent);
    seaMat.color.copy(ink).lerp(bg, 0.72);
    ringMat.color.copy(ink).lerp(bg, 0.55);
    dimMat.color.copy(accent).lerp(bg, 0.35);
    floaters.forEach((f) => f.mat.color.copy(accent));
  };
  applyColors(colors);

  /* boyut */
  const resize = (): void => {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Dar kutuda geminin tamamı sığsın.
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  /* kare */
  const draw = (t: number): void => {
    // Yavaş ve küçük hareket: baş kalkıp iner, gemi hafif yükselir/alçalır.
    const pitch = 0.034 * Math.sin(0.62 * t);
    ship.rotation.z = pitch;
    ship.rotation.x = 0.01 * Math.sin(0.41 * t);
    ship.position.y = -T + 0.028 * Math.sin(0.62 * t + 1.1);
    // Baş aşağı inerken baş dalgası belirir.
    const dip = Math.max(0, -pitch / 0.034);
    waveMat.opacity = 0.15 + 0.7 * dip;
    sea.update(t);
    ring.rotation.y = t * 0.04;
    floaters.forEach((f) => {
      const p = (t / 9 + f.phase) % 1;
      f.line.position.y = 0.15 + p * 2.4;
      f.line.rotation.y = -world.rotation.y; // izleyiciye dönük
      f.mat.opacity = Math.sin(p * Math.PI) * 0.75;
    });
    renderer.render(scene, camera);
  };

  let raf = 0;
  let running = false;
  let visible = true;
  const t0 = performance.now();
  const loop = (now: number): void => {
    if (!running) return;
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  };
  const start = (): void => {
    if (running || !motion || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const stop = (): void => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const io = new IntersectionObserver((e) => {
    visible = e.some((x) => x.isIntersecting);
    if (visible) start();
    else stop();
  });
  io.observe(host);
  const onVis = (): void => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);

  const onLost = (e: Event): void => {
    e.preventDefault();
    stop();
    host.classList.remove("is-live");
  };
  canvas.addEventListener("webglcontextlost", onLost);

  draw(1.6); // ilk kare (hareket kapalıysa sabit kalır)
  host.classList.add("is-live");
  start();

  return {
    setColors(c) {
      applyColors(c);
      if (!running) draw(1.6);
    },
    setMotion(on) {
      motion = on;
      if (on) start();
      else {
        stop();
        draw(1.6);
      }
    },
    dispose() {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      [hullGeo, waveGeo, sea.geo, ringGeo, dimGeo, sqGeo].forEach((g) => g.dispose());
      [hullMat, waveMat, seaMat, ringMat, dimMat, ...floaters.map((f) => f.mat)].forEach((m) => m.dispose());
      renderer.dispose();
      canvas.remove();
    },
  };
}
