/**
 * Yumuşak kaydırma (Lenis), yalnızca masaüstünde ve hareket açıkken.
 * Dokunmatik cihazlarda tarayıcının kendi kaydırması korunur.
 */
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMotionOn, onMotionChange } from "./preference";

let lenis: Lenis | null = null;
const tick = (time: number): void => {
  lenis?.raf(time * 1000);
};

function enable(): void {
  if (lenis) return;
  lenis = new Lenis({ duration: 1.15, anchors: { offset: 0 }, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}

function disable(): void {
  if (!lenis) return;
  gsap.ticker.remove(tick);
  lenis.destroy();
  lenis = null;
}

export function initSmoothScroll(): void {
  const finePointer = window.matchMedia("(pointer: fine)");
  const sync = (): void => {
    if (isMotionOn() && finePointer.matches) enable();
    else disable();
  };
  sync();
  onMotionChange(sync);
  finePointer.addEventListener("change", sync);
}
