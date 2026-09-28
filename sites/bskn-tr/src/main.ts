import "./styles/modernist.css";
import "./styles/page.css";
import "./styles/fixes.css";
import { bootShip } from "./ship/boot.ts";

/*
 * Eski sitenin (Claude Design) davranışları, React çalışma zamanı olmadan:
 * tema, kariyer süzgeci, tıklayınca açılan kartlar, belirme, sayaçlar,
 * ilerleme çubuğu, paralaks, zaman çizgisi ve belge büyütme.
 */

declare global {
  interface Window {
    __bskn?: boolean;
  }
}
window.__bskn = true;

const body = document.body;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Tema (eski sitedeki "mcb.prefs" anahtarı korunur) ---------- */

function readPrefs(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem("mcb.prefs") ?? "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function initTheme(): void {
  const btn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  const glyph = document.querySelector<HTMLElement>("[data-theme-glyph]");
  const sync = (): void => {
    const dark = body.getAttribute("data-theme") === "dark";
    if (glyph) glyph.textContent = dark ? "☀" : "☾";
    btn?.setAttribute("aria-pressed", String(dark));
  };
  sync();
  btn?.addEventListener("click", () => {
    const dark = body.getAttribute("data-theme") !== "dark";
    body.setAttribute("data-theme", dark ? "dark" : "light");
    try {
      localStorage.setItem("mcb.prefs", JSON.stringify({ ...readPrefs(), dark, lang: body.dataset.lang }));
    } catch {
      /* depolama kapalı */
    }
    sync();
  });
}

/* ---------- Kariyer süzgeci ---------- */

function chipStyle(active: boolean): string {
  return (
    "appearance: none; cursor: pointer; font-family: var(--font-heading); font-weight: 800; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; padding: 9px 14px; border: 1px solid " +
    (active ? "var(--accent)" : "var(--rule)") +
    "; background: " +
    (active ? "var(--accent)" : "none") +
    "; color: " +
    (active ? "var(--color-bg)" : "var(--muted)") +
    "; transition: 0.25s;"
  );
}

function initFilters(): void {
  const bar = document.querySelector<HTMLElement>("[data-filters]");
  if (!bar) return;
  const rows = Array.from(document.querySelectorAll<HTMLElement>("#kariyer [data-type]"));
  const chips = Array.from(bar.querySelectorAll<HTMLButtonElement>("[data-filter]"));
  bar.addEventListener("click", (e) => {
    const chip = (e.target as Element).closest<HTMLButtonElement>("[data-filter]");
    if (!chip) return;
    const key = chip.dataset.filter ?? "all";
    chips.forEach((c) => {
      const on = c === chip;
      c.setAttribute("aria-pressed", String(on));
      c.setAttribute("style", chipStyle(on));
    });
    rows.forEach((row) => {
      const show = key === "all" || row.dataset.type === key;
      row.hidden = !show;
      if (show) reveal(row);
    });
    frame();
  });
}

/* ---------- Belirme + sayaçlar ---------- */

function countUp(node: HTMLElement): void {
  if (node.dataset.done) return;
  node.dataset.done = "1";
  const to = Number(node.dataset.count ?? "0");
  if (reduced) {
    node.textContent = String(to);
    return;
  }
  const t0 = performance.now();
  const step = (t: number): void => {
    const p = Math.min(1, (t - t0) / 900);
    node.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function reveal(el: HTMLElement): void {
  el.style.opacity = "1";
  el.style.transform = "none";
  el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
}

function initReveal(): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (reduced || !("IntersectionObserver" in window)) {
    els.forEach(reveal);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        reveal(e.target as HTMLElement);
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Kaydırmaya bağlı: ilerleme, paralaks, çizgi ---------- */

const bar = document.querySelector<HTMLElement>("[data-progress]");
const pars = Array.from(document.querySelectorAll<HTMLElement>("[data-par]"));
const cards = Array.from(document.querySelectorAll<HTMLElement>('#kariyer [data-dc-tpl="67"]'));
const line = document.querySelector<HTMLElement>("[data-line]");
let queued = false;

function frame(): void {
  queued = false;
  const vh = innerHeight;
  if (bar) {
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    bar.style.width = Math.max(0, Math.min(100, (scrollY / max) * 100)).toFixed(2) + "%";
  }
  if (!reduced) {
    pars.forEach((el) => {
      const f = parseFloat(el.dataset.par ?? "0") || 0;
      const rc = el.getBoundingClientRect();
      const off = rc.top + rc.height / 2 - vh / 2;
      el.style.transform = `translate3d(0,${(-off * f).toFixed(1)}px,0)`;
    });
  }
  if (line?.parentElement) {
    const rc = line.parentElement.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (vh * 0.72 - rc.top) / Math.max(1, rc.height)));
    line.style.transform = `scaleY(${p.toFixed(3)})`;
  }
}

function onScroll(): void {
  if (queued) return;
  queued = true;
  requestAnimationFrame(frame);
}

/* ---------- Deneyim kartları: tıklayınca arka yüz (dönme yok) ---------- */

function initCards(): void {
  const toggle = (card: HTMLElement): void => {
    const open = card.getAttribute("data-open") !== "1";
    card.setAttribute("data-open", open ? "1" : "0");
    card.setAttribute("aria-expanded", String(open));
  };
  cards.forEach((card) => {
    card.addEventListener("click", () => toggle(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle(card);
      } else if (e.key === "Escape" && card.getAttribute("data-open") === "1") {
        toggle(card);
      }
    });
  });
  // Bir kez ipucu: ilk kart göründüğünde "+" iki kez hafif halka yayar.
  const first = cards[0]?.querySelector<HTMLElement>(".peek__plus");
  if (!first || reduced || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      setTimeout(() => first.classList.add("is-nudge"), 600);
    },
    { threshold: 0.6 },
  );
  io.observe(first);
}

/* ---------- Belge büyütme ---------- */

function initZoom(): void {
  const box = document.querySelector<HTMLElement>("[data-zoom]");
  const img = document.querySelector<HTMLImageElement>("[data-zoom-img]");
  const title = document.querySelector<HTMLElement>("[data-zoom-title]");
  const close = document.querySelector<HTMLButtonElement>("[data-zoom-close]");
  if (!box || !img || !title || !close) return;
  let opener: HTMLElement | null = null;
  const hide = (): void => {
    box.hidden = true;
    opener?.focus();
  };
  document.querySelectorAll<HTMLElement>("[data-doc]").forEach((el) => {
    el.addEventListener("click", () => {
      opener = el;
      img.src = el.dataset.doc ?? "";
      img.alt = el.dataset.docTitle ?? "";
      title.textContent = [el.dataset.docTitle, el.dataset.docMeta].filter(Boolean).join(" · ");
      box.hidden = false;
      close.focus();
    });
  });
  close.addEventListener("click", hide);
  box.addEventListener("click", (e) => {
    if (e.target === box) hide();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !box.hidden) hide();
  });
}

initTheme();
initFilters();
initReveal();
initCards();
initZoom();
bootShip();
frame();
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll, { passive: true });
addEventListener("load", onScroll, { once: true });
addEventListener("orientationchange", () => setTimeout(onScroll, 180), { passive: true });
