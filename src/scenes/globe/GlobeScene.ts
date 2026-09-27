/**
 * Kavramsal bilgi ağı: WebGL tel kafes dünya.
 *
 * Bu modül ana paketten ayrı bir parça olarak, sayfa açıldıktan sonra
 * yüklenir (bkz. boot.ts). Görünen her şey kavramsaldır: düğümler ve yaylar
 * sabit tohumla üretilir, gerçek veri ya da konum içermez.
 */
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Line,
  LineSegments,
  Mesh,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  type Blending,
  type IUniform,
} from "three";
import { graticule, network, shell, type LineSet, type Vec3 } from "./geometry";
import { createTextLayer, PHRASE_STYLE, WORD_STYLE, type TextLayer } from "./phrases";
import facingChunk from "./shaders/facing.glsl?raw";
import graticuleVert from "./shaders/graticule.vert?raw";
import graticuleFrag from "./shaders/graticule.frag?raw";
import arcVert from "./shaders/arc.vert?raw";
import arcFrag from "./shaders/arc.frag?raw";
import nodesVert from "./shaders/nodes.vert?raw";
import nodesFrag from "./shaders/nodes.frag?raw";
import pulseVert from "./shaders/pulse.vert?raw";
import pulseFrag from "./shaders/pulse.frag?raw";
import atmosphereVert from "./shaders/atmosphere.vert?raw";
import atmosphereFrag from "./shaders/atmosphere.frag?raw";

(ShaderChunk as unknown as Record<string, string>)["facing"] = facingChunk;

export interface GlobeHandle {
  setMotion(on: boolean): void;
  dispose(): void;
}

const COLOR = {
  line: new Color(0xf2f2ef),
  red: new Color(0xe2464f),
  hot: new Color(0xffeded),
};

/** Görsel ayarlar tek yerde. */
const TUNING = {
  tilt: 0.36,
  spin: 0.28, // rad/sn (bir tur ≈ 22 sn)
  phraseSpin: 0.28, // cümle ve kelime katmanı (küreyle aynı hız)
  cameraDistance: 4.9,
  fov: 32,
  revealSeconds: 2.4,
  drawDelay: 0.8,
  drawSeconds: 1.8,
  maxPulses: 4,
  pulseGap: [0.22, 0.6] as const,
  pulseDuration: [0.55, 0.85] as const,
};

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

function material(
  vertexShader: string,
  fragmentShader: string,
  uniforms: Record<string, IUniform>,
  blending: Blending = NormalBlending,
): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending,
  });
}

function lineGeometry(set: LineSet): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(set.positions, 3));
  g.setAttribute("aLat", new Float32BufferAttribute(set.lat, 1));
  return g;
}

export function createGlobeScene(
  frame: HTMLElement,
  hero: HTMLElement | null,
  initialMotion: boolean,
  phraseTexts: string[] = [],
  wordTexts: string[] = [],
): GlobeHandle | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  frame.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(TUNING.fov, 1, 0.1, 20);
  camera.position.set(0, 0, TUNING.cameraDistance);

  const tilt = new Group();
  const globe = new Group();
  tilt.rotation.x = TUNING.tilt;
  tilt.add(globe);
  scene.add(tilt);

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T): T => {
    disposables.push(x);
    return x;
  };

  /* ---- Izgara ---- */
  const time = { value: 0 };
  const reveal = { value: 0 };
  const grid = graticule();
  const gridNormal = track(
    material(graticuleVert, graticuleFrag, {
      uColor: { value: COLOR.line }, uFront: { value: 0.26 }, uBack: { value: 0.06 },
      uReveal: reveal, uScan: { value: 0.22 }, uTime: time,
    }),
  );
  const gridStrong = track(
    material(graticuleVert, graticuleFrag, {
      uColor: { value: COLOR.line }, uFront: { value: 0.5 }, uBack: { value: 0.09 },
      uReveal: reveal, uScan: { value: 0.25 }, uTime: time,
    }),
  );
  globe.add(new LineSegments(track(lineGeometry(grid.normal)), gridNormal));
  globe.add(new LineSegments(track(lineGeometry(grid.strong)), gridStrong));

  /* ---- Açılıp kapanan dış katman ---- */
  const shellOpacity = { value: 0.1 };
  const shellMat = track(
    material(graticuleVert, graticuleFrag, {
      uColor: { value: COLOR.line }, uFront: shellOpacity, uBack: { value: 0.03 },
      uReveal: reveal, uScan: { value: 0 }, uTime: time,
    }),
  );
  const shellLines = new LineSegments(track(lineGeometry(shell())), shellMat);
  tilt.add(shellLines);

  /* ---- Atmosfer: kenar parıltısı ve sol üst dolgu ışığı ---- */
  const atmosphere = new Mesh(
    track(new SphereGeometry(1.02, 64, 48)),
    track(
      material(
        atmosphereVert,
        atmosphereFrag,
        { uLightDir: { value: new Vector3(-0.6, 0.7, 0.9) }, uStrength: { value: 0 } },
        AdditiveBlending,
      ),
    ),
  );
  tilt.add(atmosphere);

  /* ---- Ağ: düğümler ve yaylar ---- */
  const net = network();
  const pixelRatio = { value: 1 };

  const nodeGeom = track(new BufferGeometry());
  nodeGeom.setAttribute("position", new Float32BufferAttribute(net.nodes.flatMap((n) => n.position), 3));
  nodeGeom.setAttribute("aSelected", new Float32BufferAttribute(net.nodes.map((n) => (n.selected ? 1 : 0)), 1));
  const flash = new Float32BufferAttribute(new Float32Array(net.nodes.length), 1);
  nodeGeom.setAttribute("aFlash", flash);
  const nodeReveal = { value: 0 };
  const nodeMat = track(
    material(nodesVert, nodesFrag, {
      uRed: { value: COLOR.red }, uInk: { value: COLOR.line },
      uSize: { value: 4 }, uPixelRatio: pixelRatio, uReveal: nodeReveal,
    }),
  );
  globe.add(new Points(nodeGeom, nodeMat));

  const draw = { value: 0 };
  const arcs = net.arcs.map((spec) => {
    const g = track(new BufferGeometry());
    g.setAttribute("position", new Float32BufferAttribute(spec.points.flat(), 3));
    g.setAttribute("aT", new Float32BufferAttribute(spec.points.map((_, i) => i / (spec.points.length - 1)), 1));
    const pulse = { value: -1 };
    const mat = track(
      material(arcVert, arcFrag, {
        uColor: { value: COLOR.red }, uHot: { value: COLOR.hot },
        uFront: { value: 0.72 }, uBack: { value: 0.12 }, uDraw: draw, uPulse: pulse,
      }),
    );
    globe.add(new Line(g, mat));
    return { spec, pulse };
  });

  /* ---- Işık darbelerinin başları ---- */
  const headPositions = new Float32Array(TUNING.maxPulses * 3);
  const headGeom = track(new BufferGeometry());
  const headAttr = new Float32BufferAttribute(headPositions, 3);
  headGeom.setAttribute("position", headAttr);
  headGeom.setDrawRange(0, 0);
  const headMat = track(
    material(pulseVert, pulseFrag, { uRed: { value: COLOR.red }, uSize: { value: 18 }, uPixelRatio: pixelRatio }, AdditiveBlending),
  );
  globe.add(new Points(headGeom, headMat));

  interface Pulse { arc: number; start: number; duration: number }
  let pulses: Pulse[] = [];
  let nextPulse = 0;
  const rand = (range: readonly [number, number]): number => lerp(range[0], range[1], Math.random());

  function pointOnArc(points: Vec3[], t: number, out: Float32Array, offset: number): void {
    const f = t * (points.length - 1);
    const i = Math.min(points.length - 2, Math.floor(f));
    const k = f - i;
    const a = points[i] as Vec3;
    const b = points[i + 1] as Vec3;
    out[offset] = lerp(a[0], b[0], k);
    out[offset + 1] = lerp(a[1], b[1], k);
    out[offset + 2] = lerp(a[2], b[2], k);
  }

  function updatePulses(now: number, dt: number): void {
    if (now > nextPulse && pulses.length < TUNING.maxPulses && arcs.length) {
      pulses.push({ arc: Math.floor(Math.random() * arcs.length), start: now, duration: rand(TUNING.pulseDuration) });
      nextPulse = now + rand(TUNING.pulseGap);
    }
    for (const a of arcs) a.pulse.value = -1;
    const alive: Pulse[] = [];
    for (const p of pulses) {
      const t = (now - p.start) / p.duration;
      const target = arcs[p.arc];
      if (!target) continue;
      if (t >= 1) {
        flash.setX(target.spec.to, 1);
        continue;
      }
      target.pulse.value = Math.max(target.pulse.value, t);
      pointOnArc(target.spec.points, t, headPositions, alive.length * 3);
      alive.push(p);
    }
    pulses = alive;
    headGeom.setDrawRange(0, alive.length);
    headAttr.needsUpdate = true;

    for (let i = 0; i < flash.count; i++) {
      const v = flash.getX(i);
      if (v > 0) flash.setX(i, Math.max(0, v - dt / 0.9));
    }
    flash.needsUpdate = true;
  }

  function clearPulses(): void {
    pulses = [];
    for (const a of arcs) a.pulse.value = -1;
    headGeom.setDrawRange(0, 0);
    for (let i = 0; i < flash.count; i++) flash.setX(i, 0);
    flash.needsUpdate = true;
  }

  /* ---- Durum ---- */
  let motion = initialMotion;
  let visible = true;
  let running = false;
  let elapsed = 0;
  let last = 0;
  let introStart = -1;
  let pointerYaw = 0;
  let pointerTilt = 0;
  let targetYaw = 0;
  let targetTilt = 0;
  let live = false;

  function applyIntro(t: number): void {
    const r = motion ? easeOutCubic(t / TUNING.revealSeconds) : 1;
    reveal.value = lerp(0, 1.1, r);
    nodeReveal.value = r;
    (atmosphere.material as ShaderMaterial).uniforms["uStrength"]!.value = r;
    draw.value = motion ? easeOutCubic((t - TUNING.drawDelay) / TUNING.drawSeconds) : 1;
  }

  function renderFrame(): void {
    renderer.render(scene, camera);
    if (!live) {
      live = true;
      frame.classList.add("is-live");
    }
  }

  function loop(ms: number): void {
    const now = ms / 1000;
    const dt = last ? Math.min(0.064, now - last) : 0.016;
    last = now;
    elapsed += dt;
    time.value = elapsed;
    if (introStart < 0) introStart = elapsed;
    applyIntro(elapsed - introStart);

    globe.rotation.y += dt * TUNING.spin;
    pointerYaw += (targetYaw - pointerYaw) * 0.05;
    pointerTilt += (targetTilt - pointerTilt) * 0.05;
    tilt.rotation.y = pointerYaw;
    tilt.rotation.x = TUNING.tilt + pointerTilt;
    shellOpacity.value = 0.05 + 0.2 * (0.5 + 0.5 * Math.sin(elapsed / 4.2));
    shellLines.rotation.y = -elapsed * 0.09;
    phraseGroup.rotation.y += dt * TUNING.phraseSpin;
    for (const layer of textLayers) layer.update(elapsed, phraseGroup.rotation.y, TUNING.phraseSpin, draw.value >= 1);

    if (draw.value >= 1) updatePulses(elapsed, dt);
    renderFrame();
  }

  function start(): void {
    if (running) return;
    running = true;
    last = 0;
    renderer.setAnimationLoop(loop);
  }

  function stop(): void {
    running = false;
    renderer.setAnimationLoop(null);
    if (!motion) {
      applyIntro(Number.POSITIVE_INFINITY);
      clearPulses();
      textLayers.forEach((layer, i) => layer.showStatic(phraseGroup.rotation.y, i === 0));
      shellOpacity.value = 0.12;
    }
    renderFrame();
  }

  function sync(): void {
    if (motion && visible && !document.hidden) start();
    else stop();
  }

  /* ---- Boyut ---- */
  function resize(): void {
    const size = Math.round(frame.clientWidth);
    if (!size) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setSize(size, size, false);
    pixelRatio.value = dpr;
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    if (!running) renderFrame();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(frame);
  const intersection = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      sync();
    },
    { rootMargin: "80px" },
  );
  intersection.observe(frame);
  const onVisibility = (): void => sync();
  document.addEventListener("visibilitychange", onVisibility);

  /* ---- Fareye küçük derinlik tepkisi (dokunmatikte yok) ---- */
  const onPointerMove = (e: PointerEvent): void => {
    if (e.pointerType !== "mouse" || !motion || !hero) return;
    const r = hero.getBoundingClientRect();
    targetYaw = ((e.clientX - r.left) / r.width - 0.5) * 0.18;
    targetTilt = ((e.clientY - r.top) / r.height - 0.5) * 0.12;
  };
  const onPointerLeave = (): void => {
    targetYaw = 0;
    targetTilt = 0;
  };
  hero?.addEventListener("pointermove", onPointerMove);
  hero?.addEventListener("pointerleave", onPointerLeave);

  /* ---- Bağlam kaybı: yedek çizime dön ---- */
  const onContextLost = (e: Event): void => {
    e.preventDefault();
    renderer.setAnimationLoop(null);
    running = false;
    live = false;
    frame.classList.remove("is-live");
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  /* ---- Küre içindeki cümleler ve kelimeler (yazı tipi yüklenince eklenir) ---- */
  // Yazılar küreyle aynı eğimde, kendi dönüş katmanlarında.
  const phraseGroup = new Group();
  tilt.add(phraseGroup);
  // Sıra önemli: 0 = cümleler (hareket kapalıyken ilk cümle gösterilir), 1 = kelimeler.
  const textLayers: TextLayer[] = [];
  let disposed = false;
  Promise.all([
    createTextLayer(phraseGroup, renderer, phraseTexts, PHRASE_STYLE),
    createTextLayer(phraseGroup, renderer, wordTexts, WORD_STYLE),
  ])
    .then((layers) => {
      const ready = layers.filter((l): l is TextLayer => l !== null);
      if (disposed) {
        ready.forEach((l) => l.dispose());
        return;
      }
      textLayers.push(...ready);
      if (!running) {
        if (!motion) textLayers.forEach((layer, i) => layer.showStatic(phraseGroup.rotation.y, i === 0));
        renderFrame();
      }
    })
    .catch(() => {
      /* Yazılar olmadan da sahne çalışır. */
    });

  resize();
  if (!motion) applyIntro(Number.POSITIVE_INFINITY);
  sync();

  return {
    setMotion(on: boolean): void {
      motion = on;
      if (on) {
        pointerYaw = pointerTilt = targetYaw = targetTilt = 0;
      }
      sync();
    },
    dispose(): void {
      disposed = true;
      textLayers.forEach((l) => l.dispose());
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      hero?.removeEventListener("pointermove", onPointerMove);
      hero?.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      canvas.remove();
      frame.classList.remove("is-live");
    },
  };
}
