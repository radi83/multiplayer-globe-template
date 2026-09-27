/**
 * Dünyayı ana içerikten sonra yükler.
 *
 * 1. Metin ve sabit yedek çizim ilk HTML ile gelir.
 * 2. Sayfa yüklendikten ve tarayıcı boşa çıktıktan sonra Three.js parçası
 *    ayrı bir dosya olarak indirilir.
 * 3. WebGL yoksa, yükleme başarısız olursa ya da bağlam kaybolursa yedek
 *    çizim görünür kalır.
 */
import { isMotionOn, onMotionChange } from "../../motion/preference";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}

/** Sayfanın dilindeki cümle/kelime listesi, şablonun yazdığı data-* özniteliğinden. */
function readList(raw: string | undefined): string[] {
  try {
    const list: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function bootGlobe(): void {
  const frame = document.getElementById("globe");
  if (!frame || !supportsWebGL()) return;

  const load = (): void => {
    import("./GlobeScene")
      .then(({ createGlobeScene }) => {
        const handle = createGlobeScene(
          frame,
          document.getElementById("bmms"),
          isMotionOn(),
          readList(frame.dataset.phrases),
          readList(frame.dataset.words),
        );
        if (handle) onMotionChange((on) => handle.setMotion(on));
      })
      .catch(() => {
        /* Yedek çizim yerinde kalır. */
      });
  };
  const whenIdle = (): void => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 1500 });
    else setTimeout(load, 200);
  };
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });
}
