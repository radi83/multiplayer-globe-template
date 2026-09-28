/**
 * Blueprint gemi sahnesi (Three.js).
 *
 * - Gemi: hull.ts'deki çizgiler; su altında kalan kısım soluklaşır (dalgayla birlikte),
 *   boyuna ilerleyen bir tarama düzlemi geçtiği kesiti parlatır, iç yapı (makine
 *   dairesi, perdeler) soluk "röntgen" tonunda görünür.
 * - Deniz: çizgi ızgarası + dalga eş-yükselti çizgileri; geminin ilerleyişine göre
 *   kayar, kıçta Kelvin izi, başta baş dalgası vardır.
 * - Yazılar: geminin ilgili parçasına ince bir çizgiyle bağlı etiketler belirip söner.
 *
 * Hareket bilerek küçük ve yavaştır. "Hareketi azalt" açıksa tek sabit kare çizilir.
 * Gemi temsili bir çizimdir; belirli bir geminin ölçülerini göstermez.
 */
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  LineSegments,
  Mesh,
  NormalBlending,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";
import { B, D, T, PROP, RADAR, buildShip, sternX, stemX, type Draw, type V3 } from "./hull.ts";

export interface ShipColors {
  accent: string;
  hot: string;
  ink: string;
  bg: string;
  dark: boolean;
}

export interface Callout {
  at: string;
  text: string;
  /** Büyük harf dönüşümü için (ör. İngilizce marka adı Türkçe sayfada) */
  lang?: string;
}

export interface ShipHandle {
  setColors(c: ShipColors): void;
  setMotion(on: boolean): void;
  dispose(): void;
}

/* ---------------- gölgelendiriciler ---------------- */

const WAVE = /* glsl */ `
float wave(vec2 p, float t) {
  return 0.045 * sin(0.85 * p.x + 1.0 * t)
       + 0.03 * sin(1.3 * p.y - 0.75 * t + 1.3)
       + 0.016 * sin(2.1 * (0.6 * p.x + 0.8 * p.y) + 1.7 * t);
}`;

const LINE_VERT = /* glsl */ `
attribute float aW;
attribute float aK;
uniform float uTime;
uniform float uScan;
uniform float uOffX;
uniform float uScanOn;
varying float vA;
varying float vK;
varying float vScan;
varying float vWet;
varying float vFade;
${WAVE}
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float h = wave(wp.xz, uTime);
  vWet = smoothstep(0.015, -0.05, wp.y - h);
  float sx = position.x + uOffX;
  vScan = uScanOn * exp(-pow((sx - uScan) / 0.3, 2.0));
  vA = aW;
  vK = aK;
  vec4 mv = viewMatrix * wp;
  vFade = smoothstep(30.0, 15.0, -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const LINE_FRAG = /* glsl */ `
uniform vec3 uAccent;
uniform vec3 uHot;
uniform vec3 uGhost;
uniform float uAlpha;
varying float vA;
varying float vK;
varying float vScan;
varying float vWet;
varying float vFade;
void main() {
  vec3 base = mix(uAccent, uGhost, vK);
  float a = vA * mix(1.0, 0.3, vWet) * vFade;
  float s = vScan * (1.0 - 0.4 * vK);
  vec3 col = mix(base, uHot, clamp(s, 0.0, 1.0));
  a = min(1.0, a + s * 0.55 * (0.35 + vA));
  gl_FragColor = vec4(col, a * uAlpha);
}`;

const SEA_VERT = /* glsl */ `
uniform float uTime;
varying vec2 vP;
varying float vH;
${WAVE}
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float h = wave(wp.xz, uTime);
  wp.y += h;
  vP = position.xz;
  vH = h;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const SEA_FRAG = /* glsl */ `
uniform vec3 uLine;
uniform vec3 uAccent;
uniform float uTime;
uniform float uDip;
uniform float uAlpha;
uniform float uStern;
uniform float uBow;
varying vec2 vP;
varying float vH;
float gridLine(vec2 p, float cell) {
  vec2 q = p / cell;
  vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
  return 1.0 - min(min(g.x, g.y), 1.0);
}
float thin(float d, float wpx) {
  return 1.0 - min(d / (fwidth(d) * wpx + 1e-5), 1.0);
}
void main() {
  vec2 p = vP;
  vec2 ps = p + vec2(uTime * 0.28, 0.0);
  float r = length(p * vec2(0.8, 1.15));
  float fade = smoothstep(8.8, 2.6, r);
  float g = gridLine(ps, 0.5) * 0.45 + gridLine(ps, 2.5) * 0.55;
  float hq = vH * 26.0;
  float contour = (1.0 - min(abs(fract(hq) - 0.5) / fwidth(hq), 1.0)) * 0.3;
  // Kelvin izi (kıçtan)
  float dx = uStern - p.x;
  float wake = 0.0;
  if (dx > 0.0) {
    float edge = abs(abs(p.y) - (0.28 + dx * 0.36));
    wake = thin(edge, 1.4) * smoothstep(7.5, 0.4, dx);
    float inside = 1.0 - smoothstep(0.0, 0.05, abs(p.y) - (0.28 + dx * 0.36));
    float cr = (p.x + uTime * 0.9) / 0.5;
    float crest = 1.0 - min(abs(fract(cr) - 0.5) / fwidth(cr), 1.0);
    wake += crest * inside * 0.4 * smoothstep(6.0, 0.3, dx) * smoothstep(0.0, 0.8, dx);
    wake += thin(abs(p.y), 1.2) * smoothstep(5.0, 0.0, dx) * 0.5;
  }
  // Baş dalgası
  float bx = uBow - p.x;
  float bow = 0.0;
  if (bx > -0.05) {
    for (int i = 0; i < 3; i++) {
      float o = float(i) * 0.22;
      float e = abs(abs(p.y) - (0.08 + (bx - o) * 0.5));
      bow += thin(e, 1.3) * step(o, bx) * smoothstep(3.6, 0.2, bx - o) * (1.0 - float(i) * 0.25);
    }
    bow *= 0.35 + 0.65 * uDip;
  }
  float foam = clamp(wake * 0.75 + bow, 0.0, 1.0) * fade;
  float a = (g + contour) * fade * 0.55;
  vec3 col = mix(uLine, uAccent, foam);
  gl_FragColor = vec4(col, max(a, foam * 0.85) * uAlpha);
}`;

/* ---------------- yardımcılar ---------------- */

function toGeometry(dr: Draw): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(dr.pos, 3));
  g.setAttribute("aW", new Float32BufferAttribute(dr.w, 1));
  g.setAttribute("aK", new Float32BufferAttribute(dr.k, 1));
  return g;
}

function lineGeometry(pos: number[], w: number[], kind: number): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("aW", new Float32BufferAttribute(w, 1));
  g.setAttribute("aK", new Float32BufferAttribute(new Array(w.length).fill(kind), 1));
  return g;
}

/** Pusula halkası, pruva işareti, boy cetveli (posta aralıkları) ve genişlik ölçüsü. */
function ringGeometry(): BufferGeometry {
  const pos: number[] = [];
  const w: number[] = [];
  const add = (a: V3, b: V3, wt: number): void => {
    pos.push(...a, ...b);
    w.push(wt, wt);
  };
  const R = 6.9;
  for (let i = 0; i < 180; i++) {
    const a0 = (i / 180) * Math.PI * 2;
    const a1 = ((i + 1) / 180) * Math.PI * 2;
    add([R * Math.cos(a0), 0, R * Math.sin(a0)], [R * Math.cos(a1), 0, R * Math.sin(a1)], 0.5);
  }
  for (let deg = 0; deg < 360; deg += 5) {
    const a = (deg * Math.PI) / 180;
    const len = deg % 90 === 0 ? 0.5 : deg % 30 === 0 ? 0.32 : 0.14;
    add([R * Math.cos(a), 0, R * Math.sin(a)], [(R - len) * Math.cos(a), 0, (R - len) * Math.sin(a)], deg % 30 === 0 ? 0.6 : 0.35);
  }
  add([R + 0.05, 0, 0], [R + 0.4, 0, -0.14], 0.8);
  add([R + 0.05, 0, 0], [R + 0.4, 0, 0.14], 0.8);
  const z = B / 2 + 0.95;
  const xs = sternX(D);
  const xb = stemX(D);
  add([xs, 0, z], [xb, 0, z], 0.5);
  for (let x = Math.ceil(xs * 4) / 4; x <= xb; x += 0.25) {
    const major = Math.abs(x - Math.round(x)) < 1e-3;
    add([x, 0, z], [x, 0, z + (major ? 0.18 : 0.08)], major ? 0.55 : 0.3);
  }
  for (const x of [xs, xb]) add([x, 0, z - 0.15], [x, 0, z + 0.25], 0.6);
  const bx = xb + 0.8;
  add([bx, 0, -B / 2], [bx, 0, B / 2], 0.5);
  for (const zz of [-B / 2, B / 2]) add([bx - 0.12, 0, zz], [bx + 0.12, 0, zz], 0.6);
  return lineGeometry(pos, w, 1);
}

/** Tarama düzlemi: gemi kesitini saran çerçeve + köşe işaretleri. */
function scanGeometry(): BufferGeometry {
  const y0 = -0.25;
  const y1 = D + 1.75;
  const z = B / 2 + 0.35;
  const c = 0.14;
  const pos: number[] = [];
  const w: number[] = [];
  const add = (a: V3, b: V3, wt: number): void => {
    pos.push(...a, ...b);
    w.push(wt, wt);
  };
  add([0, y0, -z], [0, y0, z], 0.35);
  add([0, y1, -z], [0, y1, z], 0.35);
  add([0, y0, -z], [0, y1, -z], 0.2);
  add([0, y0, z], [0, y1, z], 0.2);
  for (const [yy, dy] of [[y0, c], [y1, -c]] as const)
    for (const [zz, dz] of [[-z, c], [z, -c]] as const) {
      add([0, yy, zz], [0, yy + dy, zz], 0.9);
      add([0, yy, zz], [0, yy, zz + dz], 0.9);
    }
  add([0, T, -z - 0.2], [0, T, z + 0.2], 0.5);
  return lineGeometry(pos, w, 0);
}

const SVG_NS = "http://www.w3.org/2000/svg";

/* ---------------- sahne ---------------- */

export function createShipScene(
  stage: HTMLElement,
  hud: HTMLElement,
  cta: HTMLElement | null,
  colors: ShipColors,
  callouts: Callout[],
  motionOn: boolean,
): ShipHandle | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch {
    return null;
  }
  let motion = motionOn;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  stage.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(24, 1, 0.1, 100);
  camera.position.set(8, 9, 12);
  camera.lookAt(0, 0.35, 0);

  const world = new Group();
  world.rotation.y = -0.35;
  scene.add(world);

  const geo = buildShip();
  const shared = {
    uTime: { value: 0 },
    uScan: { value: -3 },
    uScanOn: { value: 1 },
    uAccent: { value: new Color() },
    uHot: { value: new Color() },
    uGhost: { value: new Color() },
    uAlpha: { value: 0 },
  };
  const lineMat = (offX: number, own: Record<string, { value: number }> = {}): ShaderMaterial =>
    new ShaderMaterial({
      uniforms: { ...shared, uOffX: { value: offX }, ...own },
      vertexShader: LINE_VERT,
      fragmentShader: LINE_FRAG,
      transparent: true,
      depthWrite: false,
    });

  const ship = new Group();
  world.add(ship);
  const mainGeo = toGeometry(geo.main);
  const mainMat = lineMat(0);
  ship.add(new LineSegments(mainGeo, mainMat));

  const propGroup = new Group();
  propGroup.position.set(PROP.x, PROP.y, 0);
  const propGeo = toGeometry(geo.prop);
  const propMat = lineMat(PROP.x);
  propGroup.add(new LineSegments(propGeo, propMat));
  ship.add(propGroup);

  const radarGroup = new Group();
  radarGroup.position.set(RADAR.x, RADAR.y + 0.02, 0);
  const radarGeo = toGeometry(geo.radar);
  const radarMat = lineMat(RADAR.x);
  radarGroup.add(new LineSegments(radarGeo, radarMat));
  ship.add(radarGroup);

  const scanAlpha = { value: 0 };
  const scanGeo = scanGeometry();
  const scanMat = lineMat(0, { uScanOn: { value: 0 }, uAlpha: scanAlpha });
  const scan = new LineSegments(scanGeo, scanMat);
  ship.add(scan);

  const ringGeo = ringGeometry();
  const ringMat = lineMat(0, { uScanOn: { value: 0 } });
  const ring = new LineSegments(ringGeo, ringMat);
  ring.position.y = 0.01;
  world.add(ring);

  const seaGeo = new PlaneGeometry(22, 22, 200, 200);
  seaGeo.rotateX(-Math.PI / 2);
  const seaDip = { value: 0 };
  const seaLine = { value: new Color() };
  const seaMat = new ShaderMaterial({
    uniforms: {
      uTime: shared.uTime,
      uAlpha: shared.uAlpha,
      uAccent: shared.uAccent,
      uLine: seaLine,
      uDip: seaDip,
      uStern: { value: -4.1 },
      uBow: { value: stemX(T) },
    },
    vertexShader: SEA_VERT,
    fragmentShader: SEA_FRAG,
    transparent: true,
    depthWrite: false,
  });
  const sea = new Mesh(seaGeo, seaMat);
  sea.renderOrder = -1;
  world.add(sea);

  const applyColors = (c: ShipColors): void => {
    const accent = new Color().setStyle(c.accent);
    const ink = new Color().setStyle(c.ink);
    const bg = new Color().setStyle(c.bg);
    shared.uAccent.value.copy(accent);
    shared.uHot.value.setStyle(c.hot);
    shared.uGhost.value.copy(ink).lerp(bg, c.dark ? 0.35 : 0.45);
    seaLine.value.copy(ink).lerp(bg, c.dark ? 0.6 : 0.68);
    const blend = c.dark ? AdditiveBlending : NormalBlending;
    [mainMat, propMat, radarMat, scanMat, ringMat].forEach((m) => {
      m.blending = blend;
      m.needsUpdate = true;
    });
  };
  applyColors(colors);

  /* ---------- etiketler (HTML + SVG çizgiler) ---------- */
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "ship__leaders");
  svg.setAttribute("aria-hidden", "true");
  hud.appendChild(svg);

  interface Label {
    anchor: Vector3;
    el: HTMLSpanElement;
    path: SVGPathElement;
    dot: SVGCircleElement;
    halo: SVGCircleElement;
    born: number;
    on: boolean;
  }
  const labels: Label[] = callouts
    .filter((c) => geo.anchors[c.at])
    .map((c) => {
      const el = document.createElement("span");
      el.className = "ship__label";
      el.textContent = c.text;
      if (c.lang) el.lang = c.lang;
      el.setAttribute("aria-hidden", "true");
      hud.appendChild(el);
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("class", "ship__lead");
      const halo = document.createElementNS(SVG_NS, "circle");
      halo.setAttribute("r", "7");
      halo.setAttribute("class", "ship__halo");
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("r", "2.5");
      dot.setAttribute("class", "ship__dot");
      svg.append(path, halo, dot);
      const a = geo.anchors[c.at]!;
      return { anchor: new Vector3(a[0], a[1], a[2]), el, path, dot, halo, born: -1e9, on: false };
    });
  const sternPt = new Vector3(-5, 0.9, 0);
  const bowPt = new Vector3(5, 0.9, 0);

  let W = 1;
  let H = 1;
  const tmp = new Vector3();
  const project = (v: Vector3): [number, number] => {
    tmp.copy(v).applyMatrix4(ship.matrixWorld).project(camera);
    return [((tmp.x + 1) / 2) * W, ((1 - tmp.y) / 2) * H];
  };

  const setLabelVisible = (l: Label, on: boolean): void => {
    l.on = on;
    const m = on ? "add" : "remove";
    l.el.classList[m]("is-on");
    l.path.classList[m]("is-on");
    l.dot.classList[m]("is-on");
    l.halo.classList[m]("is-on");
  };

  /**
   * Etiketler geminin iki yanındaki boş üçgenlere yerleşir: gemi ekseninin (kıç→baş)
   * normali yönünde, ankraj noktasının bulunduğu tarafa itilir; alt köşedeki
   * "Proje" düğmesinin üstünde kalır.
   */
  const placeLabels = (): void => {
    const [sx, sy] = project(sternPt);
    const [bx, by] = project(bowPt);
    let ax = bx - sx;
    let ay = by - sy;
    const al = Math.hypot(ax, ay) || 1;
    ax /= al;
    ay /= al;
    const nx = -ay;
    const ny = ax;
    const small = W < 420;
    const ctaTop = cta ? cta.offsetTop - 8 : H - 12;
    const ctaRight = cta ? cta.offsetLeft + cta.offsetWidth + 8 : 0;
    const placed: [number, number, number, number][] = [];
    labels.forEach((l, i) => {
      if (!l.on && !l.el.classList.contains("is-on")) return;
      const [px, py] = project(l.anchor);
      const side0 = (px - sx) * nx + (py - sy) * ny;
      const side = Math.abs(side0) < 6 ? (i % 2 ? 1 : -1) : Math.sign(side0);
      const reach = (small ? 46 : 74) + Math.max(0, 30 - Math.abs(side0));
      const ex = px + nx * side * reach;
      let ey = py + ny * side * reach;
      const hdir = nx * side >= 0 ? 1 : -1;
      const lw = l.el.offsetWidth;
      const lh = l.el.offsetHeight;
      const hx = ex + hdir * 12;
      let lx = hdir > 0 ? hx + 3 : hx - 3 - lw;
      lx = Math.min(W - lw - 4, Math.max(4, lx));
      const maxY = lx < ctaRight ? ctaTop - lh / 2 : H - lh / 2 - 18;
      ey = Math.min(maxY, Math.max(lh / 2 + 6, ey));
      // Başka bir etiketle çakışıyorsa dikeyde kaydır.
      for (const [ox, oy, ow, oh] of placed) {
        if (lx < ox + ow + 6 && lx + lw + 6 > ox && Math.abs(ey - oy) < (lh + oh) / 2 + 6) {
          const down = ey >= oy ? 1 : -1;
          const ny2 = oy + down * ((lh + oh) / 2 + 8);
          ey = ny2 > maxY || ny2 < lh / 2 + 6 ? oy - down * ((lh + oh) / 2 + 8) : ny2;
        }
      }
      placed.push([lx, ey, lw, lh]);
      l.el.style.transform = `translate(${lx.toFixed(1)}px, ${(ey - lh / 2).toFixed(1)}px)`;
      l.path.setAttribute("d", `M${px.toFixed(1)} ${py.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}L${hx.toFixed(1)} ${ey.toFixed(1)}`);
      for (const c of [l.dot, l.halo]) {
        c.setAttribute("cx", px.toFixed(1));
        c.setAttribute("cy", py.toFixed(1));
      }
    });
  };

  // Aynı anda en fazla iki etiket; her biri ~4,4 sn görünür.
  let order = 0;
  let lastSpawn = -1e9;
  const LIFE = 4.4;
  const GAP = 2.3;
  const cycleLabels = (t: number): void => {
    labels.forEach((l) => {
      if (l.on && t - l.born > LIFE) setLabelVisible(l, false);
    });
    if (t - lastSpawn >= GAP && labels.length && labels.filter((l) => l.on).length < 2) {
      for (let i = 0; i < labels.length; i++) {
        const l = labels[order % labels.length]!;
        order += 1;
        if (!l.on) {
          l.born = t;
          setLabelVisible(l, true);
          break;
        }
      }
      lastSpawn = t;
    }
  };

  /* ---------- kare ---------- */
  let lastT = 1.6;
  const pose = (t: number): void => {
    shared.uTime.value = t;
    // Baş kalkıp iner (~1,7°, ~10 sn), hafif dalıp çıkma ve yalpa.
    const pitch = 0.03 * Math.sin(0.62 * t);
    ship.rotation.z = pitch;
    ship.rotation.x = 0.012 * Math.sin(0.41 * t + 0.6);
    ship.position.y = -T + 0.03 * Math.sin(0.62 * t + 1.2);
    seaDip.value = Math.max(0, -pitch / 0.03);
    propGroup.rotation.x = -t * 2.2;
    radarGroup.rotation.y = t * 0.9;
    ring.rotation.y = t * 0.015;
  };
  const setScan = (x: number, on: number): void => {
    shared.uScan.value = x;
    shared.uScanOn.value = on;
    scan.position.x = x;
    scan.visible = on > 0.01;
    scanAlpha.value = shared.uAlpha.value * on;
  };
  const render = (): void => {
    renderer.render(scene, camera);
    placeLabels();
  };
  const draw = (t: number): void => {
    lastT = t;
    pose(t);
    // Tarama düzlemi kıçtan başa (~11 sn), 2 sn ara
    const cyc = (t % 13) / 11;
    const u = Math.min(1, cyc);
    setScan(-5.4 + 10.9 * (u * u * (3 - 2 * u)), cyc <= 1 ? Math.pow(Math.sin(Math.PI * u), 0.4) : 0);
    render();
  };
  const still = (): void => {
    shared.uAlpha.value = 1;
    labels.forEach((l, i) => setLabelVisible(l, i < 2));
    pose(1.6);
    setScan(-3.05, 1); // makine dairesi vurgulu
    render();
  };

  /* ---------- boyut ---------- */
  let running = false;
  const resize = (): void => {
    W = Math.max(1, stage.clientWidth);
    H = Math.max(1, stage.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    // Geminin tamamı (kıçtaki radar direğinden bulb başa) kadraja sığsın.
    camera.fov = camera.aspect < 1.25 ? 33 : 26;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(() => {
    resize();
    if (!running) {
      if (motion) draw(lastT);
      else still();
    }
  });
  ro.observe(stage);

  let raf = 0;
  let visible = true;
  const t0 = performance.now() - 1600;
  const loop = (now: number): void => {
    if (!running) return;
    const t = (now - t0) / 1000;
    shared.uAlpha.value = Math.min(1, (t - 1.6) / 1.2);
    cycleLabels(t);
    draw(t);
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
  io.observe(stage);
  const onVis = (): void => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);
  const onLost = (e: Event): void => {
    e.preventDefault();
    stop();
    stage.classList.remove("is-live");
    hud.classList.remove("is-live");
  };
  canvas.addEventListener("webglcontextlost", onLost);

  stage.classList.add("is-live");
  hud.classList.add("is-live");
  if (motion) start();
  else still();

  return {
    setColors(c) {
      applyColors(c);
      if (!running) {
        if (motion) draw(lastT);
        else still();
      }
    },
    setMotion(on) {
      motion = on;
      if (on) start();
      else {
        stop();
        still();
      }
    },
    dispose() {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      [mainGeo, propGeo, radarGeo, scanGeo, ringGeo, seaGeo].forEach((g) => g.dispose());
      [mainMat, propMat, radarMat, scanMat, ringMat, seaMat].forEach((m) => m.dispose());
      renderer.dispose();
      canvas.remove();
      svg.remove();
      labels.forEach((l) => l.el.remove());
    },
  };
}
