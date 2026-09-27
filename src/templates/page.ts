/**
 * Derleme anında çalışan statik şablonlar.
 *
 * Vite eklentisi (vite.config.ts) index.html içindeki işaretleri bu
 * fonksiyonların ürettiği HTML ile değiştirir. Böylece tüm metin
 * JavaScript'e ihtiyaç duymadan ilk HTML yanıtında gelir; çalışma
 * zamanındaki kod yalnızca hareket ve etkileşim ekler.
 *
 * Kural: "Html" ile biten içerik alanları güvenilir, elle yazılmış
 * işaretleme içerir; diğer tüm alanlar kaçışlanır.
 */
import type { ContactConfig } from "../config.ts";

export type Content = typeof import("../content/tr.json");
type StatusKind = keyof Content["statusLabels"];

const esc = (value: string): string =>
  value.replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] as string,
  );

const join = (parts: string[]): string => parts.join("\n");

const sheet = (num: string, title?: string): string =>
  `<p class="sheet">${esc(num)}${title ? ` <span class="sheet__sep">/</span> ${esc(title)}` : ""}</p>`;

const chip = (c: Content, kind: StatusKind): string =>
  `<span class="chip chip--${kind}">${esc(c.statusLabels[kind])}</span>`;

const arrow = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6"/></svg>`;

/* ------------------------------------------------------------------ */
/* Dünya: sabit yedek çizim ve çizim katmanı (halka, eksenler)        */
/* ------------------------------------------------------------------ */

/** WebGL yoksa ya da henüz yüklenmediyse görünen sabit dünya çizimi. */
const globeFallback = `
<svg class="globe__fallback" viewBox="0 0 400 400" aria-hidden="true">
  <g fill="none" stroke="rgba(242,242,239,.22)" stroke-width="1">
    <ellipse cx="200" cy="200" rx="49" ry="142"/>
    <ellipse cx="200" cy="200" rx="92" ry="142"/>
    <ellipse cx="200" cy="200" rx="123" ry="142"/>
    <ellipse cx="200" cy="200" rx="140" ry="142"/>
    <ellipse cx="200" cy="200" rx="142" ry="29" stroke="rgba(242,242,239,.42)"/>
    <ellipse cx="200" cy="152" rx="133" ry="27"/>
    <ellipse cx="200" cy="248" rx="133" ry="27"/>
    <ellipse cx="200" cy="109" rx="109" ry="22"/>
    <ellipse cx="200" cy="291" rx="109" ry="22"/>
    <ellipse cx="200" cy="77" rx="71" ry="14"/>
    <ellipse cx="200" cy="323" rx="71" ry="14"/>
    <circle cx="200" cy="200" r="142" stroke="rgba(242,242,239,.5)"/>
  </g>
  <g fill="none" stroke="rgba(226,70,79,.72)" stroke-width="1.2">
    <path d="M128 142 Q 176 78 246 120"/>
    <path d="M246 120 Q 300 170 274 238"/>
    <path d="M150 262 Q 196 214 274 238"/>
    <path d="M128 142 Q 118 206 150 262"/>
  </g>
  <g fill="#E2464F"><circle cx="128" cy="142" r="3"/><circle cx="246" cy="120" r="3"/><circle cx="274" cy="238" r="3"/></g>
  <g fill="rgba(242,242,239,.85)"><circle cx="150" cy="262" r="2"/><circle cx="210" cy="180" r="2"/><circle cx="182" cy="300" r="2"/><circle cx="300" cy="160" r="2"/></g>
</svg>`;

/** Koordinat halkası: her 5°'de bir çentik, 30°'lerde uzun çentik. */
function ringTicks(): string {
  const cx = 200;
  const r = 160;
  const out: string[] = [];
  for (let d = 0; d < 360; d += 5) {
    const len = d % 30 === 0 ? 8 : d % 10 === 0 ? 4.5 : 2;
    const a = (d * Math.PI) / 180 - Math.PI / 2;
    const x1 = cx + Math.cos(a) * r;
    const y1 = cx + Math.sin(a) * r;
    const x2 = cx + Math.cos(a) * (r + len);
    const y2 = cx + Math.sin(a) * (r + len);
    out.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }
  return out.join("");
}

const globeOverlay = `
<svg class="globe__overlay" viewBox="0 0 400 400" aria-hidden="true">
  <path class="globe__axes" d="M200 28v344M34 200h332"/>
  <g class="globe__ring">
    <circle cx="200" cy="200" r="160"/>
    <path d="${ringTicks()}"/>
  </g>
  <g class="globe__labels">
    <text x="200" y="16">000°</text>
    <text x="396" y="200" text-anchor="end">090°</text>
    <text x="200" y="386">180°</text>
    <text x="4" y="200" text-anchor="start">270°</text>
  </g>
</svg>`;

/* ------------------------------------------------------------------ */
/* Bölümler                                                           */
/* ------------------------------------------------------------------ */

function hero(c: Content): string {
  const h = c.hero;
  const nav = c.nav
    .map((n) => `<a href="${esc(n.href)}"${"keep" in n && n.keep ? ' class="topnav__keep"' : ""}>${esc(n.label)}</a>`)
    .join("");
  const legend = h.legend
    .map((l) => `<span><i class="lg lg--${esc(l.kind)}" aria-hidden="true"></i>${esc(l.label)}</span>`)
    .join("");
  return `
<header class="hero on-dark" id="bmms">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="hero__light" aria-hidden="true"></div>
  <div class="wrap">
    <div class="topbar">
      <a class="wordmark" href="#bmms" aria-label="${esc(c.brand.homeAria)}">${esc(c.brand.name)} <small>${esc(c.brand.full)}</small></a>
      <nav class="topnav" aria-label="${esc(c.navAria)}">${nav}</nav>
    </div>
    <div class="hero__inner">
      <div class="hero__copy">
        ${sheet(h.sheet, h.sheetTitle)}
        <h1>${h.titleHtml}</h1>
        <p class="lede">${esc(h.lede)}</p>
        <div class="actions">
          <a class="btn btn--primary" href="${esc(h.ctaPrimary.href)}">${esc(h.ctaPrimary.label)} ${arrow}</a>
          <a class="btn btn--ghost" href="${esc(h.ctaSecondary.href)}">${esc(h.ctaSecondary.label)}</a>
        </div>
        <span class="rule hero__rule" aria-hidden="true"></span>
        <p class="status-line">${esc(h.status)}</p>
      </div>
      <figure class="globe" aria-labelledby="globe-cap">
        <div class="globe__stage">
          <div class="globe__frame" id="globe" role="img" aria-label="${esc(h.globeAria)}">
            ${globeFallback}
            ${globeOverlay}
          </div>
        </div>
        <figcaption id="globe-cap">
          <b>${esc(h.figureTitle)}</b> — ${esc(h.figureNote)}
          <span class="legend">${legend}</span>
        </figcaption>
      </figure>
    </div>
    <div class="titleblock" aria-hidden="true">${h.titleblock.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
  </div>
</header>`;
}

function problem(c: Content): string {
  const p = c.problem;
  const f = p.figure;
  const fields = f.fields.map((x) => `<span>${esc(x)}</span>`).join("");
  const issues = p.issues
    .map(
      (i) => `<li><span class="tag">${esc(i.tag)}</span><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></li>`,
    )
    .join("");
  const frags = f.fragments
    .map(
      (fr) =>
        `<li class="frag" data-scatter="${fr.scatter.join(",")}"><span class="frag__type">${esc(fr.type)}</span><span class="frag__name">${esc(fr.name)}</span><span class="frag__fields" aria-hidden="true">${fields}</span></li>`,
    )
    .join("");
  return `
<section class="sec" id="problem" aria-labelledby="h-problem">
  <div class="wrap">
    <div class="sec-head">
      ${sheet(p.sheet, p.sheetTitle)}
      <h2 id="h-problem">${esc(p.title)}</h2>
      <p>${esc(p.intro)}</p>
    </div>
    <div class="problem sec-body">
      <ul class="issues">${issues}</ul>
      <figure class="frag-stage" data-frags>
        <div class="frag-stage__head">
          <span>${esc(f.title)}</span>
          <span class="frag-state" aria-hidden="true"><span class="frag-state__loose">${esc(f.stateLoose)}</span><span class="frag-state__set">${esc(f.stateSet)}</span></span>
        </div>
        <div class="frags-wrap">
          <span class="frags__rail" aria-hidden="true"></span>
          <ul class="frags">${frags}</ul>
        </div>
        <figcaption class="frag-stage__foot"><b>${esc(f.footLabel)}</b>${esc(f.foot)}</figcaption>
      </figure>
    </div>
  </div>
</section>`;
}

function approach(c: Content): string {
  const a = c.approach;
  const legend = a.legend
    .map((l) => `<div><dt>${chip(c, l.kind as StatusKind)}</dt><dd>${esc(l.text)}</dd></div>`)
    .join("");
  const canon = a.canon.map(esc).join(' <span class="ar">→</span> ');
  const steps = a.steps
    .map((s, i) => {
      const note = "note" in s && s.note ? `<p class="note">${esc(s.note)}</p>` : "";
      return `<li class="step is-reached">
        <span class="step__node" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <div class="step__body">${chip(c, s.status as StatusKind)}<h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>${note}</div>
      </li>`;
    })
    .join("");
  return `
<section class="sec sec--alt" id="yaklasim" aria-labelledby="h-yaklasim">
  <div class="wrap approach">
    <div class="approach__aside">
      <div class="sec-head">
        ${sheet(a.sheet, a.sheetTitle)}
        <h2 id="h-yaklasim">${esc(a.title)}</h2>
        <p>${esc(a.intro)}</p>
      </div>
      <dl class="status-legend">${legend}</dl>
      <p class="canon"><b>${esc(a.canonLabel)}</b>${canon}</p>
    </div>
    <div class="flow-wrap" data-flow>
      <span class="flow__track" aria-hidden="true"></span>
      <span class="flow__fill" aria-hidden="true"></span>
      <ol class="flow">
        ${steps}
        <li class="flow__end">
          <span class="flow__end-mark" aria-hidden="true"></span>
          <p>${chip(c, a.end.status as StatusKind)}${esc(a.end.text)}</p>
        </li>
      </ol>
    </div>
  </div>
</section>`;
}

function demo(c: Content): string {
  const d = c.demo;
  const radios = (name: string, opts: { value: string; label: string }[]): string =>
    opts
      .map(
        (o, i) =>
          `<input type="radio" name="${name}" id="${name}-${esc(o.value)}" value="${esc(o.value)}"${i === 0 ? " checked" : ""}><label for="${name}-${esc(o.value)}">${esc(o.label)}</label>`,
      )
      .join("");
  const card = (id: string, title: string, meta: string): string =>
    `<div class="card" id="${id}"><span class="card__t">${esc(title)}</span><span class="card__m">${esc(meta)}</span><span class="pill" id="${id}-pill"></span></div>`;
  return `
<section class="sec" id="ornek" aria-labelledby="h-ornek">
  <div class="wrap">
    <div class="sec-head">
      ${sheet(d.sheet, d.sheetTitle)}
      <h2 id="h-ornek">${esc(d.title)}</h2>
      <p>${esc(d.intro)}</p>
    </div>
    <div class="demo sec-body" id="demo">
      <div class="demo__bar"><span>${esc(d.bar)}</span><span class="badge">${esc(d.badge)}</span></div>
      <div class="demo__q"><span class="lbl">${esc(d.questionLabel)}</span><p>${esc(d.question)}</p></div>
      <div class="demo__controls">
        <fieldset class="seg">
          <legend>${esc(d.locLegend)}</legend>
          <div class="seg__opts">${radios("loc", d.locOptions)}</div>
          <small>${esc(d.locHint)}</small>
        </fieldset>
        <fieldset class="seg">
          <legend>${esc(d.eviLegend)}</legend>
          <div class="seg__opts">${radios("evi", d.eviOptions)}</div>
        </fieldset>
      </div>
      <div class="board" id="board">
        <div class="col">
          <span class="col__h">${esc(d.cols[0] ?? "")}</span>
          ${card("pa", d.passages.a.title, d.passages.a.meta)}
          ${card("pb", d.passages.b.title, d.passages.b.meta)}
          <span class="col__link" aria-hidden="true"><i></i></span>
        </div>
        <div class="col">
          <span class="col__h">${esc(d.cols[1] ?? "")}</span>
          ${card("ev", d.evidence.title, d.evidence.meta)}
          <span class="col__link" aria-hidden="true"><i></i></span>
        </div>
        <div class="col">
          <span class="col__h">${esc(d.cols[2] ?? "")}</span>
          <div class="result" id="result" data-kind="ready" aria-live="polite">
            <span class="result__state" id="res-state"></span>
            <p class="result__txt" id="res-txt"></p>
            <p class="result__chain" id="res-chain"></p>
          </div>
        </div>
      </div>
      <p class="demo__note">${esc(d.note)}</p>
    </div>
  </div>
</section>`;
}

function principles(c: Content): string {
  const p = c.principles;
  const inv = p.invariant.map((w) => `<span>${esc(w)}</span>`).join('<span class="ne">≠</span>');
  const items = p.items
    .map(
      (i) => `<article class="pr"><span class="k">${esc(i.key)}</span><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></article>`,
    )
    .join("");
  const disc = p.discipline.map((x) => `<span>${esc(x)}</span>`).join("");
  return `
<section class="sec sec--alt" id="ilkeler" aria-labelledby="h-ilkeler">
  <div class="wrap">
    <div class="sec-head">
      ${sheet(p.sheet, p.sheetTitle)}
      <h2 id="h-ilkeler">${esc(p.title)}</h2>
      <p>${esc(p.intro)}</p>
    </div>
    <div class="sec-body">
      <p class="invariant" aria-label="${esc(p.invariantAria)}">${inv}</p>
      <p class="invariant-cap">${esc(p.invariantCaption)}</p>
      <div class="principles">${items}</div>
      <p class="discipline"><b>${esc(p.disciplineLabel)}</b>${disc}</p>
    </div>
  </div>
</section>`;
}

function stages(c: Content): string {
  const s = c.stages;
  const cols = s.columns
    .map((col) => {
      const note = "note" in col && col.note ? `<p class="fn">${esc(col.note)}</p>` : "";
      return `<div class="stage stage--${esc(col.kind)}">
        <span class="stage__rule" aria-hidden="true"></span>
        <span class="k">${esc(col.key)}</span>
        <h3>${esc(col.title)}</h3>
        <ul>${col.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        ${note}
      </div>`;
    })
    .join("");
  return `
<section class="sec" id="asama" aria-labelledby="h-asama">
  <div class="wrap">
    <div class="sec-head">
      ${sheet(s.sheet, s.sheetTitle)}
      <h2 id="h-asama">${esc(s.title)}</h2>
      <p>${esc(s.intro)}</p>
    </div>
    <div class="stages sec-body">${cols}</div>
    <p class="honesty">${esc(s.honesty)}</p>
  </div>
</section>`;
}

function contact(c: Content, cfg: ContactConfig): string {
  const k = c.contact;
  const rows: string[] = [];
  const actions: string[] = [];
  if (cfg.name) {
    rows.push(`<div class="contact__row"><span class="contact__label">${esc(k.fieldName)}</span><span>${esc(cfg.name)}</span></div>`);
  }
  if (cfg.email) {
    rows.push(
      `<div class="contact__row"><span class="contact__label">${esc(k.fieldEmail)}</span><span class="contact__value" id="contact-mail">${esc(cfg.email)}</span></div>`,
    );
    actions.push(
      `<button class="btn btn--primary" type="button" id="copy-mail" data-copied="${esc(k.copied)}" data-selected="${esc(k.selected)}">${esc(k.copy)}</button>`,
    );
    actions.push(`<a class="btn btn--ghost" href="mailto:${esc(cfg.email)}">${esc(k.mail)}</a>`);
  }
  if (cfg.phone) {
    const tel = cfg.phone.replace(/[^\d+]/g, "");
    rows.push(
      `<div class="contact__row"><span class="contact__label">${esc(k.fieldPhone)}</span><span class="contact__value">${esc(cfg.phone)}</span></div>`,
    );
    actions.push(`<a class="btn btn--ghost" href="tel:${esc(tel)}">${esc(k.call)}</a>`);
  }
  if (cfg.url && /^https:\/\//.test(cfg.url)) {
    actions.push(`<a class="btn btn--ghost" href="${esc(cfg.url)}" target="_blank" rel="noopener">${esc(k.open)}</a>`);
  }
  if (actions.length) {
    rows.push(`<div class="contact__actions">${actions.join("")}</div><p class="copy-msg" id="copy-msg" aria-live="polite"></p>`);
  }
  const details = rows.length ? `<div class="contact__details">${join(rows)}</div>` : "";
  const collab = k.collab.map((x) => `<li><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></li>`).join("");
  return `
<section class="contact-sec on-dark" id="iletisim" aria-labelledby="h-iletisim">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap">
    <div class="sec-head">
      ${sheet(k.sheet)}
      <h2 id="h-iletisim">${esc(k.title)}</h2>
      <p>${esc(k.intro)}</p>
    </div>
    <ul class="collab">${collab}</ul>
    <p class="bridge">${esc(k.bridge)}</p>
    <div class="contact" id="contact">
      <span class="contact__k">${esc(k.label)}</span>
      <p class="contact__lead">${esc(k.lead)}</p>
      ${details}
    </div>
  </div>
</section>`;
}

function footer(c: Content): string {
  return `
<footer class="foot on-dark">
  <div class="wrap">
    <span class="wordmark">${esc(c.brand.name)} <small>${esc(c.brand.full)}</small></span>
    ${c.footer.lines.map((l) => `<p>${esc(l)}</p>`).join("")}
  </div>
</footer>
<button class="motion-toggle" type="button" id="motion-toggle" data-pause="${esc(c.motion.pause)}" data-play="${esc(c.motion.play)}"><span class="motion-toggle__icon" aria-hidden="true"></span><span class="motion-toggle__label" id="motion-label">${esc(c.motion.pause)}</span></button>`;
}

/* ------------------------------------------------------------------ */
/* Dışa açık                                                          */
/* ------------------------------------------------------------------ */

export function renderHead(c: Content, siteUrl: string): string {
  const m = c.meta;
  return join([
    `<link rel="canonical" href="${esc(siteUrl)}/">`,
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(m.ogTitle)}">`,
    `<meta property="og:description" content="${esc(m.ogDescription)}">`,
    `<meta property="og:url" content="${esc(siteUrl)}/">`,
    `<meta property="og:image" content="${esc(siteUrl)}/og-image.jpg">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ]);
}

export function renderBody(c: Content, cfg: ContactConfig): string {
  return join([
    `<a class="skip" href="#icerik">${esc(c.skipLink)}</a>`,
    hero(c),
    `<main id="icerik">`,
    problem(c),
    approach(c),
    demo(c),
    principles(c),
    stages(c),
    contact(c, cfg),
    `</main>`,
    footer(c),
  ]);
}
