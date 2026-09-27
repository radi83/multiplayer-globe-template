/**
 * Küre içinde beliren kilit cümleler.
 *
 * Her cümle, kürenin içinde (yarıçap < 1) kavisli bir şeride çizilir ve
 * küreyle birlikte döner: soldan girer, öne geldiğinde okunur, sağa
 * kıvrılırken söner. Aynı anda en fazla iki cümle görünür.
 * Metinler sayfanın dilinden gelir (index.html'deki data-phrases).
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

const SETTINGS = {
  radius: 0.9, // kürenin içinde
  lineHeight: 0.13, // dünya birimi
  maxCharsPerLine: 20,
  slots: 2,
  enterAngle: -0.95, // rad; kameraya göre sol taraftan girer
  exitAngle: 0.95, // rad; sağ tarafta biter
  fadeIn: 1.1, // sn
  fadeOut: 1.6, // sn
  firstDelay: 2.6, // sn; dünya belirdikten sonra
  stagger: 5.5, // sn; iki cümle arasındaki aralık
  bands: [0.26, -0.24], // yuva başına dikey konum
};

const FONT_PX = 96;
const FONT = `600 ${FONT_PX}px "IBM Plex Sans Condensed", "Arial Narrow", Arial, sans-serif`;
const INK = "#F2F2EF";
const ACCENT = "#E2464F"; // → ve ≠ işaretleri
const ACCENT_CHARS = /([→≠])/;

/**
 * Satırlara böler. Metinde "\n" varsa yazarın kırılımı kullanılır;
 * yoksa kısa cümle tek satır kalır, uzun cümle kelime sınırından ikiye bölünür.
 */
export function wrap(text: string, max = SETTINGS.maxCharsPerLine): string[] {
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

function drawLine(ctx: CanvasRenderingContext2D, line: string, x: number, y: number): void {
  let cursor = x;
  for (const part of line.split(ACCENT_CHARS)) {
    if (!part) continue;
    ctx.fillStyle = ACCENT_CHARS.test(part) ? ACCENT : INK;
    ctx.fillText(part, cursor, y);
    cursor += ctx.measureText(part).width;
  }
}

interface Phrase {
  mesh: Mesh<BufferGeometry, ShaderMaterial>;
  arc: number;
}

function buildPhrase(text: string, renderer: WebGLRenderer): Phrase {
  const lines = wrap(text);
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) throw new Error("2D bağlam yok");
  measure.font = FONT;
  const pad = FONT_PX * 0.45;
  const lineGap = FONT_PX * 1.18;
  const textWidth = Math.max(...lines.map((l) => measure.measureText(l).width));
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(textWidth + pad * 2);
  canvas.height = Math.ceil(lineGap * lines.length + pad * 2);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D bağlam yok");
  ctx.font = FONT;
  ctx.textBaseline = "middle";
  // Koyu hâle: arkadaki ızgara çizgilerinin üzerinde okunurluk.
  ctx.shadowColor = "rgba(15,16,17,0.95)";
  ctx.shadowBlur = FONT_PX * 0.35;
  lines.forEach((line, i) => {
    const w = ctx.measureText(line).width;
    const x = (canvas.width - w) / 2;
    const y = pad + lineGap * (i + 0.5);
    drawLine(ctx, line, x, y);
    drawLine(ctx, line, x, y);
  });

  const texture = new CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // Silindir şeridi: genişlik yazının en/boy oranından.
  const height = SETTINGS.lineHeight * lines.length + (SETTINGS.lineHeight * 2 * pad) / lineGap;
  const width = (height * canvas.width) / canvas.height;
  const arc = width / SETTINGS.radius;
  const cols = Math.max(12, Math.ceil(arc * 24));
  const pos: number[] = [];
  const uv: number[] = [];
  const index: number[] = [];
  for (let i = 0; i <= cols; i++) {
    const u = i / cols;
    const a = -arc / 2 + u * arc;
    const x = Math.sin(a) * SETTINGS.radius;
    const z = Math.cos(a) * SETTINGS.radius;
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
  mesh.renderOrder = 10;
  return { mesh, arc };
}

interface Active {
  phrase: Phrase;
  started: number;
  duration: number;
}

export interface PhraseLayer {
  /** @param elapsed sahne zamanı (sn) @param spin kürenin anlık dönüş açısı (rad) @param speed rad/sn */
  update(elapsed: number, spin: number, speed: number, introDone: boolean): void;
  /** Hareket kapalıyken tek bir cümleyi sabit ve önde gösterir. */
  showStatic(spin: number): void;
  dispose(): void;
}

export async function createPhraseLayer(
  parent: Group,
  renderer: WebGLRenderer,
  texts: string[],
): Promise<PhraseLayer | null> {
  if (!texts.length) return null;
  // Yazı tipi (Türkçe karakterler için latin-ext dahil) yüklenmeden çizme.
  try {
    await Promise.race([
      Promise.all(texts.map((t) => document.fonts.load(FONT, t))),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch {
    /* Yedek yazı tipiyle devam edilir. */
  }

  const phrases = texts.map((t) => buildPhrase(t, renderer));
  phrases.forEach((p) => parent.add(p.mesh));

  const slots: (Active | null)[] = Array.from({ length: SETTINGS.slots }, () => null);
  const nextStart = slots.map((_, i) => SETTINGS.firstDelay + i * SETTINGS.stagger);
  let cursor = 0;
  let clock0 = -1;
  let staticShown = false;

  const place = (p: Phrase, worldAngle: number, spin: number, band: number): void => {
    // Grup küreyle birlikte döndüğü için yerel açı = dünya açısı − dönüş.
    p.mesh.rotation.y = worldAngle - spin;
    p.mesh.position.y = band;
  };

  const pick = (): Phrase | null => {
    for (let n = 0; n < phrases.length; n++) {
      const candidate = phrases[(cursor + n) % phrases.length];
      if (candidate && !slots.some((s) => s?.phrase === candidate)) {
        cursor = (cursor + n + 1) % phrases.length;
        return candidate;
      }
    }
    return null;
  };

  return {
    update(elapsed, spin, speed, introDone) {
      if (staticShown) {
        phrases.forEach((p) => (p.mesh.visible = false));
        staticShown = false;
      }
      if (clock0 < 0) clock0 = elapsed;
      const t = elapsed - clock0;
      slots.forEach((slot, i) => {
        if (slot) {
          const age = elapsed - slot.started;
          if (age >= slot.duration) {
            slot.phrase.mesh.visible = false;
            slots[i] = null;
            nextStart[i] = t + 0.8;
            return;
          }
          const fadeIn = Math.min(1, age / SETTINGS.fadeIn);
          const fadeOut = Math.min(1, (slot.duration - age) / SETTINGS.fadeOut);
          slot.phrase.mesh.material.uniforms["uOpacity"]!.value = Math.min(fadeIn, fadeOut);
          return;
        }
        if (!introDone || t < (nextStart[i] ?? 0)) return;
        const phrase = pick();
        if (!phrase) return;
        // Şerit, sol kenarı giriş açısında olacak şekilde yerleştirilir.
        place(phrase, SETTINGS.enterAngle + phrase.arc / 2, spin, SETTINGS.bands[i] ?? 0);
        const travel = SETTINGS.exitAngle - SETTINGS.enterAngle;
        phrase.mesh.material.uniforms["uOpacity"]!.value = 0;
        phrase.mesh.visible = true;
        slots[i] = { phrase, started: elapsed, duration: travel / Math.max(0.01, speed) };
      });
    },
    showStatic(spin) {
      phrases.forEach((p) => (p.mesh.visible = false));
      slots.fill(null);
      const first = phrases[0];
      if (!first) return;
      place(first, 0, spin, SETTINGS.bands[0] ?? 0);
      first.mesh.material.uniforms["uOpacity"]!.value = 1;
      first.mesh.visible = true;
      staticShown = true;
    },
    dispose() {
      phrases.forEach((p) => {
        p.mesh.geometry.dispose();
        (p.mesh.material.uniforms["uMap"]!.value as CanvasTexture).dispose();
        p.mesh.material.dispose();
        p.mesh.removeFromParent();
      });
    },
  };
}
