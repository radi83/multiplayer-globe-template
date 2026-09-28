/**
 * İlk ekrandaki blueprint gemi: Three.js sahnesi sonradan yüklenir.
 * WebGL yoksa ya da yükleme başarısız olursa sabit SVG çizim görünür kalır.
 * Belirip kaybolan yazılar WebGL'den bağımsız çalışır.
 */
import type { ShipColors, ShipHandle } from "./scene.ts";

const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");

function supportsWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}

function readColors(): ShipColors {
  const cs = getComputedStyle(document.body);
  const v = (name: string, fallback: string): string => cs.getPropertyValue(name).trim() || fallback;
  return { accent: v("--color-accent", "#ec3013"), ink: v("--color-text", "#201e1d"), bg: v("--color-bg", "#f3f2f2") };
}

/** Yazılar: aynı anda en fazla iki tanesi, boş bir konumda yavaşça belirip söner. */
function startPhrases(host: HTMLElement): void {
  const slots = Array.from(host.querySelectorAll<HTMLElement>("[data-ship-slot]"));
  let list: string[] = [];
  try {
    list = JSON.parse(host.dataset.phrases ?? "[]") as string[];
  } catch {
    list = [];
  }
  if (!slots.length || !list.length) return;
  if (reducedQuery.matches) {
    slots.slice(0, 2).forEach((s, i) => {
      s.textContent = list[i] ?? "";
      s.classList.add("is-on");
    });
    return;
  }
  let next = 0;
  let slot = 0;
  const show = (): void => {
    if (document.hidden) return;
    const el = slots[slot % slots.length]!;
    slot += 1;
    el.textContent = list[next % list.length] ?? "";
    next += 1;
    el.classList.add("is-on");
    setTimeout(() => el.classList.remove("is-on"), 4600);
  };
  show();
  setTimeout(show, 1500);
  setInterval(show, 3000);
}

export function bootShip(): void {
  const host = document.querySelector<HTMLElement>("[data-ship]");
  if (!host) return;
  startPhrases(host);
  const stage = host.querySelector<HTMLElement>("[data-ship-stage]");
  if (!stage || !supportsWebGL()) return;

  let handle: ShipHandle | null = null;
  const load = (): void => {
    import("./scene.ts")
      .then(({ createShipScene }) => {
        handle = createShipScene(stage, readColors(), !reducedQuery.matches);
        if (!handle) return;
        new MutationObserver(() => handle?.setColors(readColors())).observe(document.body, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
        reducedQuery.addEventListener("change", (e) => handle?.setMotion(!e.matches));
      })
      .catch(() => {
        /* Sabit çizim yerinde kalır. */
      });
  };
  const idle = (): void => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 1200 });
    else setTimeout(load, 150);
  };
  if (document.readyState === "complete") idle();
  else addEventListener("load", idle, { once: true });
}
