**
 * data.ts + copy.ts → statik HTML (derleme anında).
 *
 * İşaretleme ve satır içi stiller eski bskn.tr sitesiyle (Claude Design, 59d204b7)
 * birebir aynıdır; `data-dc-tpl` öznitelikleri de korunur, çünkü eski sitenin
 * stil dosyaları (styles/page.css) bu özniteliklere göre yazılmıştır.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  CAREER,
  CERTIFICATES,
  FLEET_NAME,
  MEMBERSHIPS,
  PERSON,
  SKILLS,
  START_YEAR,
  STATS,
  TYPE_LABEL,
  fleetRanges,
  type Lang,
  type Post,
  type VesselType,
} from "../data.ts";
import { NUMBER_WORDS, copyFor, type Copy } from "../copy.ts";

export const LANG_PATH: Record<Lang, string> = { tr: "/", en: "/en/" };

const PUBLIC = fileURLToPath(new URL("../../public/", import.meta.url));
const hasUpload = (f?: string): f is string => !!f && existsSync(PUBLIC + "uploads/" + f);

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const i = (s: string): string => `<span class="sc-interp">${esc(s)}</span>`;
const r = (lang: Lang): string => (lang === "tr" ? "" : "../");

/** WebGL yoksa görünen sabit blueprint gemi (yandan). Canlı sahne yüklenince gizlenir. */
const SHIP_SVG = `<svg class="ship__fallback" viewBox="0 0 480 300" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.2">
<path d="M40 170 L412 170 L446 150 L452 136 L60 136 L40 150 Z"/>
<path d="M58 170 L60 196 L410 196 L440 172" stroke-opacity=".45"/>
<path d="M50 160 L430 160" stroke-width="1.8"/>
<g stroke-opacity=".8">${Array.from({ length: 7 }, (_, i) => `<rect x="${130 + i * 40}" y="128" width="28" height="8"/>`).join("")}</g>
<path d="M66 136 L66 96 L104 96 L104 136 M60 96 L112 96 M60 90 L112 90 L112 96 M74 96 L74 72 L88 72 L88 96 M420 136 L420 108 M412 116 L428 116"/>
<g stroke-opacity=".35">${Array.from({ length: 9 }, (_, i) => `<path d="M${10 + i * 8} ${206 + i * 10} Q ${240} ${200 + i * 10 - 6} ${470 - i * 8} ${206 + i * 10}"/>`).join("")}</g>
</svg>`;

/* ---------------- head ---------------- */

export function renderHead(lang: Lang, siteUrl: string, verification: { google: string; bing: string }): string {
  const c = copyFor(lang);
  const url = siteUrl + LANG_PATH[lang];
  const img = `${siteUrl}/og-image.jpg`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl + "/", name: "bskn.tr", inLanguage: ["tr", "en"] },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: PERSON.name,
        jobTitle: lang === "tr" ? "Uzakyol Baş Mühendisi" : "Ocean-Going Chief Engineer",
        url: siteUrl + "/",
        email: `mailto:${PERSON.email}`,
        telephone: PERSON.phone.replace(/\s/g, ""),
        address: { "@type": "PostalAddress", addressLocality: "Kadıköy, İstanbul", addressCountry: "TR" },
        alumniOf: { "@type": "CollegeOrUniversity", name: "Istanbul Technical University" },
        knowsLanguage: ["tr", "en"],
        memberOf: MEMBERSHIPS.map((m) => ({ "@type": "Organization", name: m.short })),
      },
      {
        "@type": "ProfilePage",
        "@id": `${url}#page`,
        url,
        name: c.htmlTitle,
        description: c.description,
        inLanguage: lang,
        isPartOf: { "@id": `${siteUrl}/#website` },
        mainEntity: { "@id": `${siteUrl}/#person` },
      },
    ],
  };
  const verify = [
    verification.google ? `<meta name="google-site-verification" content="${esc(verification.google)}">` : "",
    verification.bing ? `<meta name="msvalidate.01" content="${esc(verification.bing)}">` : "",
  ].join("");
  return `<title>${esc(c.htmlTitle)}</title>
    <meta name="description" content="${esc(c.description)}">
    <meta name="author" content="${esc(PERSON.name)}">
    <link rel="canonical" href="${url}">
    <link rel="alternate" hreflang="tr" href="${siteUrl}/">
    <link rel="alternate" hreflang="en" href="${siteUrl}/en/">
    <link rel="alternate" hreflang="x-default" href="${siteUrl}/">
    <meta property="og:type" content="profile">
    <meta property="og:site_name" content="bskn.tr">
    <meta property="og:locale" content="${lang === "tr" ? "tr_TR" : "en_US"}">
    <meta property="og:title" content="${esc(c.ogTitle)}">
    <meta property="og:description" content="${esc(c.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${img}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(c.ogTitle)}">
    <meta name="twitter:description" content="${esc(c.description)}">
    <meta name="twitter:image" content="${img}">
    ${verify}
    <link rel="icon" href="${r(lang)}favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="${r(lang)}apple-touch-icon.png">
    <link rel="manifest" href="${r(lang)}site.webmanifest">
    <script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

/* ---------------- ortak parçalar ---------------- */

const KICKER =
  "display: block; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: var(--accent-ink); margin-bottom: var(--half);";
const H2 =
  "font-family: var(--font-heading); font-weight: 800; font-size: clamp(28px, 3.2vw, 42px); line-height: 1.08; letter-spacing: -0.025em; margin: 0px 0px 0px -0.04em;";

export function chipStyle(active: boolean): string {
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

const pill = (active: boolean): string =>
  "padding: 7px 9px; line-height: 1; " +
  (active ? "background: var(--accent); color: var(--color-bg);" : "background: none; color: var(--muted);");

/* ---------------- bölümler ---------------- */

function nav(lang: Lang, c: Copy): string {
  const href = (l: Lang): string => (l === lang ? "./" : lang === "tr" ? "en/" : "../");
  const lk = (l: Lang): string =>
    `<a href="${href(l)}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="true"' : ""} style="${pill(
      l === lang,
    )}">${l.toUpperCase()}</a>`;
  return `<div aria-hidden="true" data-dc-tpl="5" style="position: fixed; left: 0px; top: 0px; right: 0px; height: 3px; z-index: 70; pointer-events: none;">
<div data-dc-tpl="6" data-progress="" style="height: 100%; width: 0%; background: var(--accent); transition: width 0.12s linear;"></div></div><nav class="nav" data-dc-tpl="7" style="position: sticky; top: 0px; z-index: 40; background: color-mix(in srgb,var(--paper) 88%,transparent); backdrop-filter: blur(10px); border-bottom: 2px solid var(--rule); padding-inline: var(--edge); gap: clamp(12px, 3vw, 32px);">
<a class="nav-brand" data-dc-tpl="8" href="#hero" style="display: flex; align-items: center; gap: 10px; letter-spacing: -0.01em;">
<span data-dc-tpl="9" style="width: 10px; height: 10px; background: var(--accent); flex: 0 0 auto;"></span>
<span data-dc-tpl="10">${esc(PERSON.name)}</span>
</a>
<span data-dc-tpl="11" data-navlinks="" style="display: flex; align-items: center; gap: clamp(14px, 2.4vw, 28px); font-size: 12px; letter-spacing: 0.09em; text-transform: uppercase; font-weight: 600;">
<a class="scp0" data-dc-tpl="12" href="#kariyer" style="color: var(--muted);">${i(c.navCareer)}</a>
<a class="scp0" data-dc-tpl="13" href="#filo" style="color: var(--muted);">${i(c.navFleet)}</a>
<a class="scp0" data-dc-tpl="14" href="#uzmanlik" style="color: var(--muted);">${i(c.navSkills)}</a>
<a class="scp0" data-dc-tpl="15" href="#belgeler" style="color: var(--muted);">${i(c.navCerts)}</a>
</span>
<span data-dc-tpl="16" style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
<span data-lang-switch="" role="group" aria-label="${c.langTitle}" data-dc-tpl="17" style="display: flex; align-items: center; border: 1px solid var(--rule); background: none; padding: 0px; font-family: var(--font-heading); font-weight: 800; font-size: 11px; letter-spacing: 0.08em;">${lk(
    "tr",
  )}${lk("en")}</span>
<button class="scp1" data-dc-tpl="20" data-theme-toggle="" style="width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid var(--rule); background: none; color: var(--ink); cursor: pointer; font-size: 14px; line-height: 1;" title="${c.theme}" aria-label="${c.theme}" type="button"><span class="sc-interp" data-theme-glyph="">☾</span></button>
<a class="btn btn-primary" data-cv-download="1" data-dc-tpl="21" download="" href="${r(lang)}${${CV_PATH[lang]}}" style="white-space: nowrap;"><span class="sc-interp cv-long">${esc(
    c.ctaCv,
  )}</span><span class="cv-short" aria-hidden="true">CV</span></a>
</span></nav>`;
}

function hero(lang: Lang, c: Copy): string {
  const n = NUMBER_WORDS[lang][CAREER.length] ?? String(CAREER.length);
  return `<section data-dc-tpl="24" id="hero" style="position: relative; max-width: 1440px; margin: 0px auto; padding: calc(var(--leading)*2.5) var(--edge) calc(var(--leading)*2); overflow: hidden;">
<div aria-hidden="true" data-dc-tpl="25" data-par="0.14" style="position: absolute; right: -2vw; top: 8%; font-family: var(--font-heading); font-weight: 800; font-size: clamp(120px, 22vw, 340px); line-height: 0.8; letter-spacing: -0.04em; color: var(--faint); pointer-events: none; white-space: nowrap;">${START_YEAR}</div>
<div data-dc-tpl="26" style="position: relative; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: calc(var(--leading)*1.5) clamp(24px,5vw,72px); align-items: end;">
<div data-dc-tpl="27" style="min-width: 0px;">
<div data-dc-tpl="28" style="display: flex; align-items: center; gap: 12px; margin-bottom: var(--leading);">
<span data-dc-tpl="29" style="width: 56px; height: 2px; background: var(--accent); flex: 0 0 auto; transform-origin: left center; animation: 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) 0.05s both mcbGrowX;"></span>
<span data-dc-tpl="30" style="font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: var(--accent-ink); animation: 0.8s cubic-bezier(0.16, 0.8, 0.24, 1) 0.18s both mcbRise;">${i(
    c.heroKicker,
  )}</span>
</div>
<h1 data-dc-tpl="31" style="font-family: var(--font-heading); font-weight: 800; font-size: clamp(46px, 7.2vw, 104px); line-height: 1.02; letter-spacing: -0.035em; margin: 0 0 var(--leading) -0.058em;">
<span data-dc-tpl="32" style="display: block; overflow: hidden; padding-bottom: 0.04em;"><span data-dc-tpl="33" style="display: block; animation: 1.05s cubic-bezier(0.16, 0.85, 0.25, 1) 0.12s both mcbWipeUp;">Murat Can</span></span>
<span data-dc-tpl="34" style="display: block; overflow: hidden; padding-bottom: 0.04em;"><span data-dc-tpl="35" style="display: block; animation: 1.05s cubic-bezier(0.16, 0.85, 0.25, 1) 0.26s both mcbWipeUp;">Başkan</span></span>
</h1>
<p data-dc-tpl="36" style="font-size: clamp(16px, 1.5vw, 19px); line-height: var(--leading); max-width: 46ch; margin: 0 0 var(--leading); color: var(--ink); animation: 0.9s cubic-bezier(0.16, 0.8, 0.24, 1) 0.46s both mcbRise;">${esc(
    c.heroLead(n),
  )}</p>
<div data-dc-tpl="38" style="animation: 0.9s cubic-bezier(0.16, 0.8, 0.24, 1) 0.58s both mcbRise; display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
<a class="btn btn-primary" data-dc-tpl="39" href="#kariyer">${i(c.ctaCareer)}</a>
<a class="btn btn-secondary" data-cv-download="1" data-dc-tpl="40" download="" href="${r(lang)}${${CV_PATH[lang]}}">${i(
    c.ctaCv,
  )} — PDF</a>
</div>
<div data-dc-tpl="41" style="display: flex; align-items: center; gap: 10px; margin-top: calc(var(--leading)*1.5); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted);">
<span data-dc-tpl="42" style="width: 8px; height: 8px; background: var(--accent); animation: 2.4s ease-in-out infinite mcbPulse; flex: 0 0 auto;"></span>
<span data-dc-tpl="43">${i(c.heroStatus)}</span>
</div>
</div>
<figure data-dc-tpl="44" style="margin: 0px; min-width: 0px; animation: 1s cubic-bezier(0.16, 0.8, 0.24, 1) 0.34s both mcbRise;">
<div class="ship" data-ship="" data-callouts="${esc(JSON.stringify(c.shipCallouts))}">
<div class="ship__stage" data-ship-stage="" role="img" aria-label="${esc(c.shipLabel)}">${SHIP_SVG}</div>
<div class="ship__hud" data-ship-hud=""></div>
<span class="ship__note" aria-hidden="true">${esc(c.shipNote)}</span>
<a class="ship__cta" href="${PERSON.projectSite}${lang === "en" ? "/en/" : "/"}" hreflang="${lang}">${esc(c.shipCta)}</a>
</div>
</figure>
</div>
</section>`;
}

function stats(lang: Lang, c: Copy): string {
  const items = STATS.map(
    (s) => `<div data-dc-tpl="51" style="min-width: 0px;">
<p data-count="${s.value}" data-dc-tpl="52" style="font-family: var(--font-heading); font-weight: 800; font-size: clamp(38px, 4.4vw, 64px); line-height: 1; letter-spacing: -0.04em; color: var(--accent); margin: 0px 0px 12px -0.045em;">${s.value}</p>
<p data-dc-tpl="53" style="font-size: 11px; line-height: var(--half); letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin: 0px; max-width: 22ch;">${i(
      s.label[lang],
    )}</p>
</div>`,
  ).join("\n");
  return `<section aria-label="${c.statsKicker}" data-dc-tpl="47" style="border-top: 2px solid var(--rule); border-bottom: 2px solid var(--rule);">
<div data-dc-tpl="48" style="max-width: 1440px; margin: 0px auto; padding: calc(var(--leading)*1.6) var(--edge);">
<div data-dc-tpl="49" data-reveal="" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(190px, 40%), 1fr)); gap: var(--leading) clamp(20px,4vw,64px);">
${items}
</div>
</div>
</section>`;
}

/** Şirket adı Türkçe mi? (büyük harfte "i/İ" doğru olsun diye) */
const orgLang = (org: string): Lang =>
  /[çğıöşüÇĞİÖŞÜ]|Denizcilik|Tersane|sektör|girişim/.test(org) ? "tr" : "en";

function post(p: Post, lang: Lang, idx: number, c: Copy): string {
  const ship = p.ship;
  // Büyük harfe çevrilen satırlarda doğru "i/İ" için: şirket adı Türkçe, gemi adı İngilizce kuralla.
  const orgLine = [
    p.org ? `<span class="sc-interp" lang="${orgLang(p.org)}">${esc(p.org)}</span>` : "",
    ship ? `<span class="sc-interp" lang="${p.shipLang ?? "en"}">${esc(ship)}</span>` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const yearSize = p.years.length > 5 ? "clamp(16px, 1.7vw, 22px)" : "clamp(23px, 2.5vw, 32px)";
  const media = p.img
    ? `<img alt="${esc(ship || p.org)}" data-dc-tpl="79" src="${r(lang)}img/${p.img}" loading="lazy" decoding="async" style="display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; background: var(--surface); filter: grayscale(1) contrast(1.08); transform: scale(1.12); transition: transform 1.1s cubic-bezier(0.2, 0.7, 0.2, 1), filter 0.5s;"/>`
    : `<span data-dc-tpl="79" data-noimg="" style="display: grid; place-items: center; width: 100%; aspect-ratio: 16 / 10; background: var(--surface); font-family: var(--font-heading); font-weight: 800; font-size: clamp(22px, 2.4vw, 34px); letter-spacing: -0.02em; color: var(--muted);">${esc(
        ship,
      )}</span>`;
  const tags = p.tags
    .map(
      (t) =>
        `<span data-dc-tpl="87" style="display: inline-block; padding: 6px 10px; border: 1px solid var(--rule); font-size: 11px; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted);" lang="tr">${i(
          t,
        )}</span>`,
    )
    .join("\n");
  return `<div data-dc-tpl="66" data-reveal="" data-type="${p.type}" style="transition-delay: ${Math.min(0.5, idx * 0.075)}s;">
<div class="scp2" data-dc-tpl="67" tabindex="0" role="button" aria-expanded="false" style="position: relative; display: block; width: 100%; text-align: left; border-top: 2px solid var(--rule); background: none; padding: calc(var(--leading)*0.9) 0 calc(var(--leading)*0.9) clamp(16px,3vw,40px);">
<span aria-hidden="true" data-dc-tpl="68" style="position: absolute; left: 0px; top: calc(var(--leading)*0.9 + 6px); width: 10px; height: 10px; background: var(--accent); transform: scale(1) rotate(0deg); transition: transform 0.55s cubic-bezier(0.2, 0.7, 0.2, 1);"></span>
<span data-dc-tpl="69" style="display: grid; grid-template-columns: minmax(128px, 13%) minmax(0px, 1fr); gap: clamp(12px, 2.4vw, 36px); align-items: start;">
<span data-dc-tpl="70" style='font-family: var(--font-heading); font-weight: 800; font-size: ${yearSize}; line-height: 1.05; letter-spacing: -0.03em; color: var(--ink); white-space: nowrap; font-feature-settings: "tnum";'>${i(p.years)}</span>
<span data-dc-tpl="71" style="display: block; min-width: 0px;">
<span data-dc-tpl="72" style="display: block; font-family: var(--font-heading); font-weight: 800; font-size: clamp(19px, 1.8vw, 24px); line-height: 1.14; letter-spacing: -0.02em; color: var(--ink);">${i(
    p.role[lang],
  )}</span>
<span data-dc-tpl="73" style="display: block; margin-top: 7px; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent-ink);">${orgLine}</span>
<span data-dc-tpl="74" style="display: block; margin-top: 9px; font-size: 15px; line-height: var(--leading); color: var(--muted); max-width: 62ch;">${i(
    p.short[lang],
  )}</span>
</span>
<span class="peek__plus" aria-hidden="true">+</span>
</span>
<span data-dc-tpl="75" style="display: grid; grid-template-rows: 0fr;">
<span class="peek-close" aria-hidden="true">× ${esc(c.closeCard)}</span>
<span data-dc-tpl="76" style="display: block; overflow: hidden; min-height: 0px;">
<span data-dc-tpl="77" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: var(--leading) clamp(20px,3vw,48px); padding: var(--leading) 0 var(--half);">
<span data-dc-tpl="78" style="display: block; min-width: 0px;">
${media}
<span data-dc-tpl="80" style="display: flex; justify-content: space-between; gap: 12px; margin-top: 10px; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted);">
<span data-dc-tpl="81" lang="${p.shipLang ?? "en"}">${i(ship || p.org)}</span>
<span data-dc-tpl="82">${i(TYPE_LABEL[p.type][lang])}</span>
</span>
</span>
<span data-dc-tpl="83" style="display: block; min-width: 0px;">
<span data-dc-tpl="84" style="display: block; font-size: 16px; line-height: var(--leading); color: var(--ink); max-width: 54ch;">${i(
    p.long[lang],
  )}</span>
<span data-dc-tpl="85" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: var(--leading);">
${tags}
</span>
</span>
</span>
</span>
</span>
</div>
</div>`;
}

function career(lang: Lang, c: Copy): string {
  const used = new Set(CAREER.map((p) => p.type));
  const keys: (VesselType | "all")[] = ["all", "tanker", "bulk", "capesize", "roro", "power", "yard", "shore"];
  const chips = keys
    .filter((k) => k === "all" || used.has(k))
    .map(
      (k) =>
        `<button data-dc-tpl="62" data-filter="${k}" aria-pressed="${k === "all"}" style="${chipStyle(
          k === "all",
        )}" type="button">${i(TYPE_LABEL[k][lang])}</button>`,
    )
    .join("\n");
  return `<section data-dc-tpl="54" id="kariyer" style="max-width: 1440px; margin: 0px auto; padding: calc(var(--leading)*3) var(--edge) calc(var(--leading)*2);">
<div data-dc-tpl="55" data-reveal="" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: var(--leading) clamp(24px,4vw,64px); align-items: end; margin-bottom: calc(var(--leading)*1.5);">
<div data-dc-tpl="56" style="min-width: 0px;">
<span data-dc-tpl="57" style="${KICKER}">${i(c.careerKicker)}</span>
<h2 data-dc-tpl="58" style="font-family: var(--font-heading); font-weight: 800; font-size: clamp(32px, 4vw, 56px); line-height: 1.06; letter-spacing: -0.03em; margin: 0px 0px 0px -0.04em;">${i(
    c.careerTitle,
  )}</h2>
</div>
<p data-dc-tpl="59" style="font-size: 14px; line-height: var(--leading); color: var(--muted); margin: 0px; max-width: 34ch;">${i(
    c.careerHint,
  )}</p>
</div>
<div data-dc-tpl="60" data-reveal="" data-filters="" role="group" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: calc(var(--leading)*1.2);">
${chips}
</div>
<div data-dc-tpl="63" style="position: relative; padding-left: 0px;">
<div aria-hidden="true" data-dc-tpl="64" data-line="" style="position: absolute; left: 4px; top: 0px; bottom: 0px; width: 2px; background: var(--accent); transform-origin: center top; transform: scaleY(0);"></div>
${CAREER.map((p, n) => post(p, lang, n, c)).join("\n")}
<div data-dc-tpl="88" style="border-top: 2px solid var(--rule);"></div>
</div>
<p style="margin: var(--half) 0 0; font-size: 11px; letter-spacing: 0.06em; color: var(--muted);">${esc(c.photoNote)}</p>
</section>`;
}

function fleet(lang: Lang, c: Copy): string {
  const rows = fleetRanges()
    .map(
      (f) => `<div data-dc-tpl="97" style="display: grid; grid-template-columns: 14px minmax(0px, 1fr) auto; gap: clamp(12px, 2vw, 28px); align-items: baseline; padding: var(--half) 0; border-top: 1px solid var(--rule);">
<span aria-hidden="true" data-dc-tpl="98" style="width: 10px; height: 10px; background: var(--accent); align-self: center;"></span>
<span data-dc-tpl="99" style="font-family: var(--font-heading); font-weight: 800; font-size: clamp(16px, 1.6vw, 20px); letter-spacing: -0.015em;">${i(
        FLEET_NAME[f.type][lang],
      )}</span>
<span data-dc-tpl="100" style='font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); font-feature-settings: "tnum"; white-space: nowrap;'>${i(
        f.range,
      )}</span>
</div>`,
    )
    .join("\n");
  return `<section data-dc-tpl="89" id="filo" style="border-top: 2px solid var(--rule);">
<div data-dc-tpl="90" style="max-width: 1440px; margin: 0px auto; padding: calc(var(--leading)*2.4) var(--edge);">
<div data-dc-tpl="91" data-reveal="" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: var(--leading) clamp(24px,5vw,80px); align-items: start;">
<div data-dc-tpl="92" style="min-width: 0px;">
<span data-dc-tpl="93" style="${KICKER}">${i(c.fleetKicker)}</span>
<h2 data-dc-tpl="94" style="${H2} max-width: 16ch;">${i(c.fleetTitle)}</h2>
</div>
<div data-dc-tpl="95" style="min-width: 0px;">
${rows}
<div data-dc-tpl="101" style="border-top: 1px solid var(--rule);"></div>
</div>
</div>
</div>
</section>`;
}

function skills(lang: Lang, c: Copy): string {
  const groups = SKILLS.map(
    (g) => `<div data-dc-tpl="109" data-reveal="" style="min-width: 0px; border-top: 2px solid var(--rule); padding-top: var(--half);">
<h3 data-dc-tpl="110" style="font-family: var(--font-heading); font-weight: 800; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 var(--half); color: var(--ink);">${i(
      g.title[lang],
    )}</h3>
${g.items
  .map(
    (it) => `<p data-dc-tpl="112" style="display: flex; gap: 10px; align-items: baseline; margin: 0px; padding: 9px 0px; border-top: 1px solid var(--rule); font-size: 15px; line-height: var(--leading); color: var(--muted);">
<span aria-hidden="true" data-dc-tpl="113" style="width: 6px; height: 6px; background: var(--accent); flex: 0 0 auto; transform: translateY(-2px);"></span>
<span data-dc-tpl="114">${i(it[lang])}</span>
</p>`,
  )
  .join("\n")}
</div>`,
  ).join("\n");
  return `<section data-dc-tpl="102" id="uzmanlik" style="border-top: 2px solid var(--rule);">
<div data-dc-tpl="103" style="max-width: 1440px; margin: 0px auto; padding: calc(var(--leading)*2.4) var(--edge);">
<div data-dc-tpl="104" data-reveal="" style="margin-bottom: calc(var(--leading)*1.4);">
<span data-dc-tpl="105" style="${KICKER}">${i(c.skillsKicker)}</span>
<h2 data-dc-tpl="106" style="${H2}">${i(c.skillsTitle)}</h2>
</div>
<div data-dc-tpl="107" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr)); gap: calc(var(--leading)*1.2) clamp(24px,4vw,64px);">
${groups}
</div>
</div>
</section>`;
}

function credentials(lang: Lang, c: Copy): string {
  const anyDoc = CERTIFICATES.some((x) => hasUpload(x.img)) || MEMBERSHIPS.some((m) => hasUpload(m.img));
  const certs = CERTIFICATES.map((x) => {
    const doc = hasUpload(x.img);
    const tag = doc ? "button" : "div";
    const attrs = doc
      ? ` type="button" data-doc="${r(lang)}uploads/${esc(x.img ?? "")}" data-doc-title="${esc(x.title)}" data-doc-meta="${esc(
          x.when[lang],
        )}"`
      : "";
    return `<${tag} class="scp2" data-dc-tpl="124" data-reveal=""${attrs} style="appearance: none; cursor: pointer; border: 0px; text-align: left; background: var(--paper); padding: 20px 18px 18px; display: flex; flex-direction: column; gap: 8px; min-height: 172px;">
<span data-dc-tpl="125" style="display: block; font-family: var(--font-heading); font-weight: 800; font-size: 17px; line-height: 1.2; letter-spacing: -0.015em; color: var(--ink);">${i(
      x.title,
    )}</span>
<span data-dc-tpl="126" style="display: block; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent-ink);">${i(
      x.when[lang],
    )}</span>
<span data-dc-tpl="127" style="display: block; font-size: 13.5px; line-height: 1.5; color: var(--muted);">${i(x.desc[lang])}</span>
${
  doc
    ? `<span class="scp0" data-dc-tpl="128" style="display: flex; align-items: center; gap: 8px; margin-top: auto; padding-top: 12px; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); transition: color 0.3s;">
<span aria-hidden="true" data-dc-tpl="129" style="width: 8px; height: 8px; background: var(--accent); flex: 0 0 auto;"></span>
<span data-dc-tpl="130">${i(c.seeDoc)}</span>
</span>`
    : ""
}
</${tag}>`;
  }).join("\n");
  const members = MEMBERSHIPS.map((m) => {
    const doc = hasUpload(m.img);
    const tag = doc ? "button" : "div";
    const attrs = doc
      ? ` type="button" data-doc="${r(lang)}uploads/${esc(m.img ?? "")}" data-doc-title="${esc(m.short)}" data-doc-meta="${esc(
          m.role[lang],
        )}"`
      : "";
    return `<${tag} class="scp2" data-dc-tpl="134" data-reveal=""${attrs} style="appearance: none; cursor: pointer; border: 0px; text-align: left; background: var(--paper); padding: 18px 16px; display: flex; flex-direction: column; gap: 6px;">
<span data-dc-tpl="135" style="display: flex; align-items: center; gap: 9px;">
<span aria-hidden="true" data-dc-tpl="136" style="width: 8px; height: 8px; background: var(--accent); flex: 0 0 auto;"></span>
<span data-dc-tpl="137" style="font-family: var(--font-heading); font-weight: 800; font-size: 16px; letter-spacing: -0.01em; color: var(--ink);">${i(
      m.short,
    )}</span>
</span>
<span data-dc-tpl="138" style="display: block; font-size: 10.5px; letter-spacing: 0.12em; text-transform: ${
      /[a-z][A-Z]/.test(m.role[lang]) ? "none" : "uppercase"
    }; color: var(--accent-ink);">${i(m.role[lang])}</span>
<span data-dc-tpl="139" style="display: block; font-size: 13px; line-height: 1.45; color: var(--muted);">${i(m.name[lang])}</span>
</${tag}>`;
  }).join("\n");
  return `<section data-dc-tpl="115" id="belgeler" style="border-top: 2px solid var(--rule);">
<div data-dc-tpl="116" style="max-width: 1440px; margin: 0px auto; padding: calc(var(--leading)*2.4) var(--edge);">
<div data-dc-tpl="117" data-reveal="" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: end; gap: var(--half) 24px; margin-bottom: calc(var(--leading)*1.2);">
<div data-dc-tpl="118">
<span data-dc-tpl="119" style="${KICKER}">${i(c.certsKicker)}</span>
<h2 data-dc-tpl="120" style="${H2}">${i(c.certsTitle)}</h2>
</div>
${
  anyDoc
    ? `<span data-dc-tpl="121" style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted);">${i(c.zoomHint)}</span>`
    : ""
}
</div>
<div data-dc-tpl="122" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2px; background: var(--rule); border: 2px solid var(--rule);">
${certs}
</div>
<h3 data-dc-tpl="131" data-reveal="" style="font-family: var(--font-heading); font-weight: 800; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; margin: calc(var(--leading)*1.8) 0 var(--half); color: var(--ink);">${i(
    c.memberTitle,
  )}</h3>
<div data-dc-tpl="132" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2px; background: var(--rule); border: 2px solid var(--rule);">
${members}
</div>
</div>
</section>`;
}

function contact(lang: Lang, c: Copy): string {
  const btn =
    "display: inline-flex; align-items: center; padding: 13px 18px; border: 2px solid var(--color-bg); color: var(--color-bg); font-family: var(--font-heading); font-weight: 800; font-size: 14px; letter-spacing: 0.02em; transition: background 0.3s, color 0.3s;";
  return `<section data-dc-tpl="140" id="iletisim" style="background: var(--accent); color: var(--color-bg);">
<div data-dc-tpl="141" style="max-width: 1440px; margin: 0px auto; padding: calc(var(--leading)*3) var(--edge);">
<h2 data-dc-tpl="142" data-reveal="" style="font-family: var(--font-heading); font-weight: 800; font-size: clamp(34px, 5vw, 72px); line-height: 1.05; letter-spacing: -0.03em; margin: 0 0 var(--leading) -0.058em; max-width: 18ch; color: var(--color-bg);">${i(
    c.closeTitle,
  )}</h2>
<p data-dc-tpl="143" data-reveal="" style="transition-delay: 0.06s; font-size: 16px; line-height: var(--leading); margin: 0 0 calc(var(--leading)*1.2); max-width: 44ch; color: var(--color-bg); opacity: 0.92;">${i(
    c.closeSub,
  )}</p>
<div data-dc-tpl="144" data-reveal="" style="transition-delay: 0.12s; display: flex; flex-wrap: wrap; gap: 10px;">
<a class="scp3" data-dc-tpl="145" href="mailto:${PERSON.email}" style="${btn}">${PERSON.email}</a>
<a class="scp3" data-dc-tpl="146" href="tel:${PERSON.phone.replace(/[^\d+]/g, "")}" style="${btn}">${esc(PERSON.phone)}</a>
<a class="scp3" data-dc-tpl="147" href="${PERSON.projectSite}${lang === "en" ? "/en/" : "/"}" style="${btn}">bskn.net</a>
<a data-cv-download="1" data-dc-tpl="148" download="" href="${r(
    lang,
  )}${${CV_PATH[lang]}}" style="display: inline-flex; align-items: center; padding: 13px 18px; background: var(--color-bg); color: var(--accent); font-family: var(--font-heading); font-weight: 800; font-size: 14px; letter-spacing: 0.02em;">${i(
    c.ctaCv,
  )} — PDF</a>
</div>
</div>
</section>`;
}

export function renderBody(lang: Lang): string {
  const c = copyFor(lang);
  return `<div id="dc-root"><div class="sc-host">
${nav(lang, c)}<main data-dc-tpl="23" style="display: block;">
${hero(lang, c)}
${stats(lang, c)}
${career(lang, c)}
${fleet(lang, c)}
${skills(lang, c)}
${credentials(lang, c)}
${contact(lang, c)}
<footer data-dc-tpl="149" style="max-width: 1440px; margin: 0px auto; padding: calc(var(--leading)*1.5) var(--edge); display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted);">
<span data-dc-tpl="150">${i(c.footer)}</span>
<span data-dc-tpl="151">© ${new Date().getFullYear()} · bskn.tr</span>
</footer></main></div></div>
<div data-zoom="" hidden role="dialog" aria-modal="true" aria-label="${c.seeDoc}"><figure><img alt="" src="data:," data-zoom-img=""><figcaption><span data-zoom-title=""></span><button type="button" data-zoom-close="">${
    c.close
  }</button></figcaption></figure></div>`;
}
