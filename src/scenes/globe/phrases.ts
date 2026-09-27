/**
 * Küre içinde beliren yazılar: kilit cümleler ve anahtar kelimeler.
 *
 * Her yazı, kürenin içinde (yarıçap < 1) kavisli bir şeride çizilir ve
 * katmanıyla birlikte döner: soldan girer, öne geldiğinde okunur, sağa
 * kıvrılırken söner. İki katman kullanılır:
 *   - cümleler: dış şerit (r = 0,9), daha büyük, aynı anda en fazla iki,
 *   - kelimeler: iç şerit (r = 0,62), küçük, soluk, büyük harfli etiketler.
 * Metinler sayfanın dilinden gelir (index.html'deki data-phrases / data-words).
 */
import {
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  NormalBlending,
  ShaderMaterial,
  type WebGLRenderer,
} from "three";
import phraseVert from "./shaders/phrase.vert?raw";
import phraseFrag from "./shaders/phrase.frag?raw";

export interface TextStyle {
  /** CSS yazı tipi, örn. `600 96px "IBM Plex Sans Condensed", sans-serif` */
  font: string;
  color: string;
  accent: string;
  uppercase: boolean;
  letterSpacingEm: number;
  /** Silindir şeridin yarıçapı (küre = 1) */
  radius: number;
  /** Satır yüksekliği, dünya birimi */
  lineHeight: number;
  maxCharsPerLine: number;
  /** Aynı anda görünebilecek en fazla yazı */
  slots: number;
  enterAngle: number;
  exitAngle: number;
  fadeIn: number;
  fadeOut: number;
  firstDelay: number;
  stagger: number;
  /** Dikey konum seçenekleri; iki yazı aynı anda aynı konumu kullanmaz. */
  bands: number[];
  maxOpacity: number;
  haloAlpha: number;
  renderOrder: number;
}

const DISPLAY = `"IBM Plex Sans Condensed", "Arial Narrow", Arial, sans-serif`;
const MONO = `"IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace`;

/** Kilit cümleler: kürenin çizgi tonunda, hafif saydam. */
export const PHRASE_STYLE: TextStyle = {
  font: `600 96px ${DISPLAY}`,
  color: "#D6D7D2",
  accent: "#E2464F",
  uppercase: false,
  letterSpacingEm: 0,
  radius: 0.9,
  lineHeight: 0.13,
  maxCharsPerLine: 20,
  slots: 2,
  enterAngle: -0.95,
  exitAngle: 0.95,
  fadeIn: 0.8,
  fadeOut: 1.1,
  firstDelay: 2.4,
  stagger: 3.2,
  bands: [0.26, -0.24],
  maxOpacity: 0.74,
  haloAlpha: 0.55,
  renderOrder: 11,
};

/** Anahtar kelimeler: daha derinde, küçük, soluk teknik etiketler. */
export const WORD_STYLE: TextStyle = {
  font: `500 72px ${MONO}`,
  color: "#C4C5C0",
  accent: "#E2464F",
  uppercase: true,
  letterSpacingEm: 0.14,
  radius: 0.62,
  lineHeight: 0.07,
  maxCharsPerLine: 40,
  slots: 4,
  enterAngle: -1.0,
  exitAngle: 1.0,
  fadeIn: 0.6,
  fadeOut: 0.9,
  firstDelay: 1.6,
  stagger: 1.3,
  bands: [0.54, 0.36, 0.1, -0.08, -0.34, -0.52],
  maxOpacity: 0.62,
  haloAlpha: 0.4,
  renderOrder: 10,
};

const ACCENT_CHARS = /([→≠])/;

/**
 * Satırlara böler. Metinde "\n" varsa yazarın kırılımı kullanılır;
 * yoksa kısa metin tek satır kalır, uzun metin kelime sınırından ikiye bölünür.
 */
export function wrap(text: string, max: number): string[] {
  if (text.includes("\n")) return text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (text.length <= max) return [text];
  const words = text.split(" ");
  let best: [string, string] = [text, ""];
  let bestScore = Number.POSITIVE_INFINITY;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const score = Math.max(a.length, b.length);
    if (score < bestScore) {
      bestScore = score;
      best = [a, b];
    }
  }
  return best[1] ? best : [best[0]];
}

function fontPx(font: string): number {
  return Number(/(\d+)px/.exec(font)?.[1] ?? 96);
}

function applyFont(ctx: CanvasRenderingContext2D, style: TextStyle): void {
  ctx.font = style.font;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${style.letterSpacingEm * fontPx(style.font)}px`;
}

function drawLine(ctx: CanvasRenderingContext2D, style: TextStyle, line: string, x: number, y: number): void {
  let cursor = x;
  for (const part of line.split(ACCENT_CHARS)) {
    if (!part) continue;
    ctx.fillStyle = ACCENT_CHARS.test(part) ? style.accent : style.color;
    ctx.fillText(part, cursor, y);
    cursor += ctx.measureText(part).width;
  }
}

interface Item {
  mesh: Mesh<BufferGeometry, ShaderMaterial>;
  arc: number;
}

function buildItem(raw: string, style: TextStyle, renderer: WebGLRenderer): Item {
  const text = style.uppercase ? raw.toLocaleUpperCase(document.documentElement.lang || "tr") : raw;
  const lines = wrap(text, style.maxCharsPerLine);
  const px = fontPx(style.font);
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) throw new Error("2D bağlam yok");
  applyFont(measure, style);
  const pad = px * 0.45;
  const lineGap = px * 1.18;
  const textWidth = Math.max(...lines.map((l) => measure.measureText(l).width));
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(textWidth + pad * 2);
  canvas.height = Math.ceil(lineGap * lines.length + pad * 2);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D bağlam yok");
  applyFont(ctx, style);
  ctx.textBaseline = "middle";
  // Hafif koyu hâle: arkadaki ızgara çizgilerinin üzerinde okunurluk.
  ctx.shadowColor = `rgba(15,16,17,${style.haloAlpha})`;
  ctx.shadowBlur = px * 0.35;
  lines.forEach((line, i) => {
    const w = ctx.measureText(line).width;
    const x = (canvas.width - w) / 2;
    const y = pad + lineGap * (i + 0.5);
    drawLine(ctx, style, line, x, y);
  });

  const texture = new CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // Silindir şeridi: genişlik yazının en/boy oranından.
  const height = style.lineHeight * lines.length + (style.lineHeight * 2 * pad) / lineGap;
  const width = (height * canvas.width) / canvas.height;
  const arc = width / style.radius;
  const cols = Math.max(12, Math.ceil(arc * 24));
  const pos: number[] = [];
  const uv: number[] = [];
  const index: number[] = [];
  for (let i = 0; i <= cols; i++) {
    const u = i / cols;
    const a = -arc / 2 + u * arc;
    const x = Math.sin(a) * style.radius;
    const z = Math.cos(a) * style.radius;
    pos.push(x, height / 2, z, x, -height / 2, z);
    uv.push(u, 1, u, 0);
    if (i < cols) {
      const k = i * 2;
      index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(pos, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geometry.setIndex(index);

  const material = new ShaderMaterial({
    vertexShader: phraseVert,
    fragmentShader: phraseFrag,
    uniforms: { uMap: { value: texture }, uOpacity: { value: 0 } },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: NormalBlending,
  });
  const mesh = new Mesh(geometry, material);
  mesh.visible = false;
  mesh.renderOrder = style.renderOrder;
  return { mesh, arc };
}

interface Active {
  item: Item;
  band: number;
  started: number;
  duration: number;
}

export interface TextLayer {
  /** @param elapsed sahne zamanı (sn) @param spin katmanın anlık dönüş açısı (rad) @param speed rad/sn */
  update(elapsed: number, spin: number, speed: number, introDone: boolean): void;
  /** Hareket kapalıyken: showFirst ise ilk yazı sabit ve önde, değilse hiçbiri. */
  showStatic(spin: number, showFirst: boolean): void;
  dispose(): void;
}

export async function createTextLayer(
  parent: Group,
  renderer: WebGLRenderer,
  texts: string[],
  style: TextStyle,
): Promise<TextLayer | null> {
  if (!texts.length) return null;
  // Yazı tipi (Türkçe karakterler için latin-ext dahil) yüklenmeden çizme.
  try {
    await Promise.race([
      Promise.all(texts.map((t) => document.fonts.load(style.font, t))),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch {
    /* Yedek yazı tipiyle devam edilir. */
  }

  const items = texts.map((t) => buildItem(t, style, renderer));
  items.forEach((it) => parent.add(it.mesh));

  const slots: (Active | null)[] = Array.from({ length: style.slots }, () => null);
  const nextStart = slots.map((_, i) => style.firstDelay + i * style.stagger);
  let cursor = 0;
  let clock0 = -1;
  let staticShown = false;

  const place = (it: Item, worldAngle: number, spin: number, band: number): void => {
    // Katman döndüğü için yerel açı = dünya açısı − dönüş.
    it.mesh.rotation.y = worldAngle - spin;
    it.mesh.position.y = band;
  };

  const pickItem = (): Item | null => {
    for (let n = 0; n < items.length; n++) {
      const candidate = items[(cursor + n) % items.length];
      if (candidate && !slots.some((s) => s?.item === candidate)) {
        cursor = (cursor + n + 1) % items.length;
        return candidate;
      }
    }
    return null;
  };

  const pickBand = (slotIndex: number): number => {
    if (style.bands.length <= style.slots) return style.bands[slotIndex % style.bands.length] ?? 0;
    const used = new Set(slots.filter((s): s is Active => s !== null).map((s) => s.band));
    const free = style.bands.filter((b) => !used.has(b));
    return free[Math.floor(Math.random() * free.length)] ?? 0;
  };

  return {
    update(elapsed, spin, speed, introDone) {
      if (staticShown) {
        items.forEach((it) => (it.mesh.visible = false));
        staticShown = false;
      }
      if (clock0 < 0) clock0 = elapsed;
      const t = elapsed - clock0;
      slots.forEach((slot, i) => {
        if (slot) {
          const age = elapsed - slot.started;
          if (age >= slot.duration) {
            slot.item.mesh.visible = false;
            slots[i] = null;
            nextStart[i] = t + 0.4;
            return;
          }
          const fadeIn = Math.min(1, age / style.fadeIn);
          const fadeOut = Math.min(1, (slot.duration - age) / style.fadeOut);
          slot.item.mesh.material.uniforms["uOpacity"]!.value = Math.min(fadeIn, fadeOut) * style.maxOpacity;
          return;
        }
        if (!introDone || t < (nextStart[i] ?? 0)) return;
        const item = pickItem();
        if (!item) return;
        const band = pickBand(i);
        // Şerit, sol kenarı giriş açısında olacak şekilde yerleştirilir.
        place(item, style.enterAngle + item.arc / 2, spin, band);
        const travel = style.exitAngle - style.enterAngle;
        item.mesh.material.uniforms["uOpacity"]!.value = 0;
        item.mesh.visible = true;
        slots[i] = { item, band, started: elapsed, duration: travel / Math.max(0.01, speed) };
      });
    },
    showStatic(spin, showFirst) {
      items.forEach((it) => (it.mesh.visible = false));
      slots.fill(null);
      staticShown = true;
      const first = items[0];
      if (!first || !showFirst) return;
      place(first, 0, spin, style.bands[0] ?? 0);
      first.mesh.material.uniforms["uOpacity"]!.value = style.maxOpacity;
      first.mesh.visible = true;
    },
    dispose() {
      items.forEach((it) => {
        it.mesh.geometry.dispose();
        (it.mesh.material.uniforms["uMap"]!.value as CanvasTexture).dispose();
        it.mesh.material.dispose();
        it.mesh.removeFromParent();
      });
    },
  };
}
