/**
 * Hareket tercihi: tek doğruluk kaynağı.
 *
 * Varsayılan, işletim sisteminin "hareketi azalt" ayarıdır. Ziyaretçi sağ
 * alttaki düğmeyle tercihini değiştirirse bu seçim tarayıcıda saklanır ve
 * işletim sistemi ayarından önce gelir. İlk değer index.html içindeki küçük
 * betik tarafından ilk boyamadan önce <html data-motion> olarak yazılır.
 */
type Listener = (on: boolean) => void;

const STORAGE_KEY = "bmms-motion";
const root = document.documentElement;
const listeners = new Set<Listener>();
const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

let stored = readStored();
let motionOn = root.getAttribute("data-motion") !== "off";

export function isMotionOn(): boolean {
  return motionOn;
}

export function onMotionChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function apply(on: boolean): void {
  if (on === motionOn) return;
  motionOn = on;
  root.setAttribute("data-motion", on ? "on" : "off");
  listeners.forEach((fn) => fn(on));
}

export function setMotion(on: boolean): void {
  stored = on ? "on" : "off";
  try {
    window.localStorage.setItem(STORAGE_KEY, stored);
  } catch {
    /* Depolama kapalıysa tercih yalnızca bu oturum için geçerli olur. */
  }
  apply(on);
}

export function initMotionToggle(): void {
  const button = document.getElementById("motion-toggle");
  const label = document.getElementById("motion-label");
  if (!button || !label) return;
  const pause = button.dataset.pause ?? "";
  const play = button.dataset.play ?? "";
  const render = (on: boolean): void => {
    label.textContent = on ? pause : play;
  };
  render(motionOn);
  onMotionChange(render);
  button.addEventListener("click", () => setMotion(!motionOn));

  reduceQuery.addEventListener("change", (e) => {
    if (!stored) apply(!e.matches);
  });
}
