/**
 * Sinematik zaman çizelgeleri (GSAP + ScrollTrigger).
 *
 * İlke: sayfanın "dinlenme" hâli CSS'te tanımlıdır ve her zaman okunabilir,
 * tamamlanmış durumdur. Buradaki animasyonlar yalnızca o duruma giden yolu
 * çizer. Metnin opaklığı hiçbir zaman sıfırlanmaz; ziyaretçi animasyonun
 * bitmesini beklemeden okuyabilir. Hareket kapatıldığında tüm zaman
 * çizelgeleri geri alınır ve sayfa dinlenme hâline döner.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMotionOn, onMotionChange } from "./preference";

gsap.registerPlugin(ScrollTrigger);

const $ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document): T | null =>
  scope.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document): T[] =>
  Array.from(scope.querySelectorAll<T>(sel));

/* ---------------- 01 · İlk ekran ---------------- */
function heroIntro(): void {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".hero__copy > :not(.hero__rule)", { y: 14, duration: 0.9, stagger: 0.06, clearProps: "transform" }, 0)
    .from(".hero__rule", { scaleX: 0, duration: 1.2, ease: "power2.inOut" }, 0.25)
    .from(".globe__overlay", { scale: 0.94, rotate: -8, duration: 2, transformOrigin: "50% 50%", ease: "expo.out" }, 0.1)
    .from(".titleblock span", { y: 8, duration: 0.7, stagger: 0.12 }, 0.5);
}

function heroDepth(): void {
  // Aşağı inildikçe dünya hafifçe geri çekilir; arka plan ızgarası yavaş kayar.
  gsap.to(".globe__stage", {
    yPercent: 10,
    scale: 0.94,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  for (const bg of $$(".grid-bg")) {
    const host = bg.parentElement;
    if (!host) continue;
    gsap.fromTo(
      bg,
      { y: -40 },
      { y: 80, ease: "none", scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: true } },
    );
  }
}

/* ---------------- 02 · Kaynak parçaları birleşir ---------------- */
function problemAssembly(): () => void {
  const stage = $("[data-frags]");
  if (!stage) return () => undefined;
  const frags = $$("[data-scatter]", stage);
  const scale = Math.min(1, stage.clientWidth / 560);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: "top 90%",
      end: "top 35%",
      scrub: 0.7,
      onUpdate: (self) => stage.classList.toggle("is-loose", self.progress < 0.92),
      onRefresh: (self) => stage.classList.toggle("is-loose", self.progress < 0.92),
    },
  });
  frags.forEach((frag, i) => {
    const [x = 0, y = 0, r = 0] = (frag.dataset.scatter ?? "").split(",").map(Number);
    tl.from(frag, { x: x * scale, y: y * scale, rotation: r, ease: "power2.out", duration: 1 }, i * 0.04);
  });
  tl.from(".frags__rail", { scaleY: 0, ease: "none", duration: 0.7 }, 0.35);
  stage.classList.toggle("is-loose", (tl.scrollTrigger?.progress ?? 0) < 0.92);

  return () => stage.classList.remove("is-loose");
}

/* ---------------- 03 · Akış çizilir, adım vurgulanır ---------------- */
function approachFlow(): () => void {
  const wrap = $("[data-flow]");
  if (!wrap) return () => undefined;
  const steps = $$(".step", wrap);

  gsap.fromTo(
    ".flow__fill",
    { scaleY: 0 },
    { scaleY: 1, ease: "none", scrollTrigger: { trigger: wrap, start: "top 55%", end: "bottom 55%", scrub: true } },
  );

  steps.forEach((step) => {
    step.classList.remove("is-reached");
    ScrollTrigger.create({
      trigger: step,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => step.classList.toggle("is-active", self.isActive),
      onEnter: () => step.classList.add("is-reached"),
      onLeaveBack: () => step.classList.remove("is-reached"),
    });
    const body = $(".step__body", step);
    if (body) {
      gsap.from(body, { x: 18, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: step, start: "top 82%" } });
    }
  });

  return () => {
    steps.forEach((s) => {
      s.classList.add("is-reached");
      s.classList.remove("is-active");
    });
  };
}

/* ---------------- 05 · İlkeler ---------------- */
function principlesReveal(): void {
  gsap.from(".invariant .ne", {
    scale: 0.4,
    color: "#B8B8B4",
    duration: 0.6,
    stagger: 0.14,
    ease: "back.out(2)",
    scrollTrigger: { trigger: ".invariant", start: "top 80%" },
  });
  gsap.from(".pr", {
    y: 22,
    duration: 0.8,
    stagger: 0.07,
    ease: "power3.out",
    scrollTrigger: { trigger: ".principles", start: "top 82%" },
  });
}

/* ---------------- 06 · Aşama ---------------- */
function stagesReveal(): void {
  gsap.from(".stage__rule", {
    scaleX: 0,
    duration: 1,
    stagger: 0.18,
    ease: "power2.inOut",
    scrollTrigger: { trigger: ".stages", start: "top 82%" },
  });
}

/* ---------------- İletişim ---------------- */
function contactReveal(): void {
  gsap.from(".collab li", {
    y: 18,
    duration: 0.8,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: { trigger: ".collab", start: "top 85%" },
  });
}

/* ---------------- Yönetim ---------------- */
let mm: gsap.MatchMedia | null = null;

function build(): void {
  mm = gsap.matchMedia();
  mm.add("all", () => {
    heroIntro();
    heroDepth();
    const undoProblem = problemAssembly();
    const undoFlow = approachFlow();
    principlesReveal();
    stagesReveal();
    contactReveal();
    return () => {
      undoProblem();
      undoFlow();
    };
  });
}

function sync(on: boolean): void {
  mm?.revert();
  mm = null;
  if (on) build();
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

export function initTimelines(): void {
  sync(isMotionOn());
  onMotionChange(sync);
  // Web fontları yüklendiğinde satır kırılımları değişir; tetik noktalarını yenile.
  document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => undefined);
}

/** Senaryo bölümünde durum değişince bağlantı çizgilerinden ışık geçirir. */
export function flowLinks(board: HTMLElement): void {
  if (!isMotionOn()) return;
  const beams = $$(".col__link i", board);
  const vertical = window.matchMedia("(max-width: 900px)").matches;
  gsap.killTweensOf(beams);
  gsap.fromTo(
    beams,
    vertical ? { yPercent: -100, xPercent: 0, opacity: 1 } : { xPercent: -100, yPercent: 0, opacity: 1 },
    {
      ...(vertical ? { yPercent: 100 } : { xPercent: 100 }),
      duration: 0.9,
      stagger: 0.22,
      ease: "power2.inOut",
      onComplete: () => gsap.set(beams, { opacity: 0 }),
    },
  );
}
