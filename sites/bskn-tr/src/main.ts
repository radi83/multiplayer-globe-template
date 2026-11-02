import "./styles/bento.css";

declare global {
  interface Window {
    __bskn?: boolean;
  }
}
window.__bskn = true;

const body = document.body;

/* ==========================================================================
   Theme Management (Persists to mcb.prefs, respects system preference)
   ========================================================================== */

function readPrefs(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem("mcb.prefs") ?? "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function initTheme(): void {
  const btn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  const label = document.querySelector<HTMLElement>("[data-theme-label]");
  const isEn = body.dataset.lang === "en";

  const sync = (): void => {
    const isDark = body.getAttribute("data-theme") === "dark";
    if (label) {
      if (isEn) {
        label.textContent = isDark ? "Light" : "Dark";
      } else {
        label.textContent = isDark ? "Açık" : "Koyu";
      }
    }
    btn?.setAttribute("aria-pressed", String(isDark));
  };

  sync();

  btn?.addEventListener("click", () => {
    const currentlyDark = body.getAttribute("data-theme") === "dark";
    const nextDark = !currentlyDark;
    body.setAttribute("data-theme", nextDark ? "dark" : "light");

    try {
      localStorage.setItem("mcb.prefs", JSON.stringify({ ...readPrefs(), dark: nextDark, lang: body.dataset.lang }));
    } catch {
      /* local storage disabled */
    }

    sync();
  });
}

/* ==========================================================================
   Editorial Open Layer Controller (10 Modules)
   ========================================================================== */

function initOverlay(): void {
  const grid = document.querySelector<HTMLElement>("#bento-grid");
  const layer = document.querySelector<HTMLElement>("#detail-layer");
  const container = document.querySelector<HTMLElement>("#overlay-container");
  const backdrop = document.querySelector<HTMLElement>("#overlay-backdrop");
  const dismissBtn = document.querySelector<HTMLElement>("#overlay-dismiss-btn");
  const kicker = document.querySelector<HTMLElement>("#overlay-kicker");
  const triggers = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-open-module]"));
  const panes = Array.from(document.querySelectorAll<HTMLElement>(".module-open-pane"));

  if (!grid || !layer || !container || !backdrop) return;

  let activeTrigger: HTMLButtonElement | null = null;

  const openModule = (modId: string, triggerBtn?: HTMLButtonElement): void => {
    activeTrigger = triggerBtn ?? triggers.find((t) => t.dataset.openModule === modId) ?? null;
    triggers.forEach((t) => t.setAttribute("aria-expanded", t === activeTrigger ? "true" : "false"));

    // Find and update kicker label from trigger card
    const cardNum = activeTrigger?.querySelector<HTMLElement>(".bento-card__num")?.textContent;
    if (kicker && cardNum) kicker.textContent = cardNum;

    // Show selected pane, hide others
    panes.forEach((p) => {
      if (p.dataset.pane === modId) {
        p.hidden = false;
      } else {
        p.hidden = true;
      }
    });

    grid.classList.add("is-receded");
    layer.hidden = false;
    layer.classList.add("is-active");

    // Scroll container to top
    const content = container.querySelector<HTMLElement>("#overlay-content");
    if (content) content.scrollTop = 0;

    container.focus();
  };

  const closeOverlay = (): void => {
    if (layer.hidden) return;

    layer.classList.remove("is-active");
    layer.hidden = true;
    grid.classList.remove("is-receded");

    triggers.forEach((t) => t.setAttribute("aria-expanded", "false"));

    if (activeTrigger) {
      activeTrigger.focus();
      activeTrigger = null;
    }
  };

  triggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modId = btn.dataset.openModule;
      if (modId) openModule(modId, btn);
    });
  });

  backdrop.addEventListener("click", closeOverlay);
  dismissBtn?.addEventListener("click", closeOverlay);
  dismissBtn?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      closeOverlay();
    }
  });

  // Close on Escape anywhere
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !layer.hidden) {
      closeOverlay();
    }
  });
}

/* ==========================================================================
   Career Filters (Module 02)
   ========================================================================== */

function initCareerFilters(): void {
  const chips = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-filter]"));
  const posts = Array.from(document.querySelectorAll<HTMLElement>("[data-post-type]"));

  if (chips.length === 0 || posts.length === 0) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const targetType = chip.dataset.filter ?? "all";

      chips.forEach((c) => {
        const isActive = c === chip;
        c.classList.toggle("is-active", isActive);
        c.setAttribute("aria-pressed", String(isActive));
      });

      posts.forEach((post) => {
        const postType = post.dataset.postType;
        const visible = targetType === "all" || postType === targetType;
        post.style.display = visible ? "grid" : "none";
      });
    });
  });
}

/* ==========================================================================
   Marine Technology Tabs (Module 04)
   ========================================================================== */

function initSkillsTabs(): void {
  const tabBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-skill-tab]"));
  const tabPanes = Array.from(document.querySelectorAll<HTMLElement>("[data-skill-content]"));

  if (tabBtns.length === 0 || tabPanes.length === 0) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetKey = btn.dataset.skillTab;

      tabBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });

      tabPanes.forEach((pane) => {
        const matches = pane.dataset.skillContent === targetKey;
        pane.classList.toggle("is-active", matches);
        pane.style.display = matches ? "block" : "none";
      });
    });
  });
}

/* ==========================================================================
   Document & Certificate Zoom Modal
   ========================================================================== */

function initZoom(): void {
  const modal = document.querySelector<HTMLElement>("#zoom-modal");
  const img = document.querySelector<HTMLImageElement>("#zoom-modal-img");
  const title = document.querySelector<HTMLElement>("#zoom-modal-title");
  const closeBtn = document.querySelector<HTMLButtonElement>("#zoom-modal-close");
  const triggers = Array.from(document.querySelectorAll<HTMLElement>("[data-zoom-trigger]"));

  if (!modal || !img || !title) return;

  const show = (src: string, label: string): void => {
    img.src = src;
    img.alt = label;
    title.textContent = label;
    modal.hidden = false;
    closeBtn?.focus();
  };

  const hide = (): void => {
    modal.hidden = true;
    img.src = "data:,";
  };

  triggers.forEach((t) => {
    t.addEventListener("click", (e) => {
      e.stopPropagation();
      const src = t.dataset.zoomTrigger;
      const label = t.dataset.zoomTitle ?? "";
      if (src) show(src, label);
    });
  });

  closeBtn?.addEventListener("click", hide);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hide();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) hide();
  });
}

/* ==========================================================================
   Bootstrap
   ========================================================================== */

initTheme();
initOverlay();
initCareerFilters();
initSkillsTabs();
initZoom();
