/**
 * İlk ekrandaki blueprint gemi: Three.js sahnesi sayfadan sonra ayrı parça olarak yüklenir.
 * WebGL yoksa ya da yükleme başarısız olursa sabit SVG çizim görünür kalır.
 */
import type { Callout, ShipColors, ShipHandle } from "./scene.ts";

const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");

function supportsWebGL2(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}

function readColors(): ShipColors {
  const cs = getComputedStyle(document.body);
  const v = (name: string, fallback: string): string => cs.getPropertyValue(name).trim() || fallback;
  return {
    accent: v("--color-accent", "#ec3013"),
    hot: v("--color-accent-700", "#ae1800"),
    ink: v("--color-text", "#201e1d"),
    bg: v("--color-bg", "#f3f2f2"),
    dark: document.body.getAttribute("data-theme") === "dark",
  };
}

function readCallouts(raw: string | undefined): Callout[] {
  try {
    const list: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(list)
      ? list.filter((x): x is Callout => typeof x?.at === "string" && typeof x?.text === "string")
      : [];
  } catch {
    return [];
  }
}

export function bootShip(): void {
  const host = document.querySelector<HTMLElement>("[data-ship]");
  const stage = host?.querySelector<HTMLElement>("[data-ship-stage]");
  const hud = host?.querySelector<HTMLElement>("[data-ship-hud]");
  if (!host || !stage || !hud || !supportsWebGL2()) return;

  let handle: ShipHandle | null = null;
  const load = (): void => {
    import("./scene.ts")
      .then(({ createShipScene }) => {
        handle = createShipScene(
          stage,
          hud,
          host.querySelector<HTMLElement>(".ship__cta"),
          readColors(),
          readCallouts(host.dataset.callouts),
          !reducedQuery.matches,
        );
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
