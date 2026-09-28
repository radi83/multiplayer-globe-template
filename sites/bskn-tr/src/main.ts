import "@fontsource-variable/archivo/wght.css";
import "./styles/base.css";
import "./styles/sections.css";

const root = document.documentElement;
const reduced = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Tema ---------- */

function initTheme(): void {
  const btn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!btn) return;
  const sync = (): void => {
    const dark = root.dataset.theme === "dark";
    btn.setAttribute("aria-pressed", String(dark));
    btn.setAttribute("aria-label", (dark ? btn.dataset.labelLight : btn.dataset.labelDark) ?? "");
  };
  sync();
  btn.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("bskn-theme", root.dataset.theme);
    } catch {
      /* depolama kapalıysa tercih yalnızca bu sayfada geçerli */
    }
    sync();
  });
}

/* ---------- Kariyer süzgeci ---------- */

function initFilters(): void {
  const bar = document.querySelector<HTMLElement>("[data-filters]");
  const status = document.querySelector<HTMLElement>("[data-filter-status]");
  if (!bar) return;
  bar.hidden = false;
  const posts = Array.from(document.querySelectorAll<HTMLElement>(".post[data-type]"));
  const chips = Array.from(bar.querySelectorAll<HTMLButtonElement>("[data-filter]"));
  bar.addEventListener("click", (e) => {
    const chip = (e.target as Element).closest<HTMLButtonElement>("[data-filter]");
    if (!chip) return;
    const key = chip.dataset.filter ?? "all";
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    let shown = 0;
    posts.forEach((p) => {
      const on = key === "all" || p.dataset.type === key;
      p.hidden = !on;
      if (on) {
        shown += 1;
        p.classList.add("is-in");
      }
    });
    if (status) status.textContent = (status.dataset.template ?? "").replace("{n}", String(shown));
    updateScroll();
  });
}

/* ---------- Görünür olunca belirme + sayaçlar ---------- */

function countUp(el: HTMLElement): void {
  const to = Number(el.dataset.count ?? "0");
  if (reduced() || !Number.isFinite(to)) return;
  const t0 = performance.now();
  const dur = 900;
  const step = (t: number): void => {
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initReveal(): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (reduced() || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  root.classList.add("reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        el.classList.add("is-in");
        el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
        io.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- İlerleme çubuğu + zaman çizgisi ---------- */

const bar = document.querySelector<HTMLElement>("[data-progress]");
const line = document.querySelector<HTMLElement>("[data-line]");
const log = document.querySelector<HTMLElement>("[data-log]");
const top = document.querySelector<HTMLElement>("[data-top]");
let queued = false;

function updateScroll(): void {
  queued = false;
  const vh = innerHeight;
  if (bar) {
    const max = Math.max(1, root.scrollHeight - vh);
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollY / max)).toFixed(4)})`;
  }
  if (line && log) {
    const r = log.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / Math.max(1, r.height)));
    line.style.transform = `scaleY(${p.toFixed(4)})`;
  }
  top?.classList.toggle("is-scrolled", scrollY > 8);
}

function onScroll(): void {
  if (queued) return;
  queued = true;
  requestAnimationFrame(updateScroll);
}

/* ---------- E-posta kopyalama ---------- */

function initCopy(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((btn) => {
    const label = btn.textContent ?? "";
    btn.addEventListener("click", () => {
      void navigator.clipboard
        ?.writeText(btn.dataset.copy ?? "")
        .then(() => {
          btn.textContent = btn.dataset.copied ?? label;
          setTimeout(() => (btn.textContent = label), 1800);
        })
        .catch(() => undefined);
    });
  });
}

initTheme();
initFilters();
initReveal();
initCopy();
updateScroll();
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll, { passive: true });
