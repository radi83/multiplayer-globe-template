/**
 * data.ts + copy.ts → statik HTML. Derleme sırasında (Vite eklentisi) çalışır;
 * tarayıcıya yalnızca sonuç HTML gider. JavaScript kapalı olsa da tüm içerik okunur.
 */
import {
  BMMS,
  CAREER,
  CERTIFICATES,
  EDUCATION,
  FLEET_NAME,
  LANGUAGES,
  MEMBERSHIPS,
  PERSON,
  SKILLS,
  START_YEAR,
  STATS,
  TYPE_LABEL,
  fleetRanges,
  type Lang,
  type Photo,
  type Post,
  type T,
  type VesselType,
} from "../data.ts";
import { copyFor, type Copy } from "../copy.ts";

export const LANG_PATH: Record<Lang, string> = { tr: "/", en: "/en/" };

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Sayfa köküne göre göreli yol (TR: "", EN: "../") */
const rootRel = (lang: Lang): string => (lang === "tr" ? "" : "../");

const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, "")}`;

/* ---------------- head ---------------- */

export function renderHead(lang: Lang, siteUrl: string, verification: { google: string; bing: string }): string {
  const c = copyFor(lang);
  const url = siteUrl + LANG_PATH[lang];
  const img = `${siteUrl}/og-image.jpg`;
  const alt = (["tr", "en"] as const)
    .map((l) => `<link rel="alternate" hreflang="${l}" href="${siteUrl}${LANG_PATH[l]}">`)
    .join("\n    ");

  const person = {
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: PERSON.name,
    jobTitle: PERSON.title[lang],
    url: siteUrl + "/",
    email: `mailto:${PERSON.email}`,
    telephone: PERSON.phone.replace(/\s/g, ""),
    address: { "@type": "PostalAddress", addressLocality: "Kadıköy, İstanbul", addressCountry: "TR" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Istanbul Technical University" },
    knowsLanguage: ["tr", "en"],
    memberOf: MEMBERSHIPS.map((m) => ({ "@type": "Organization", name: m.name.en, alternateName: m.short })),
  };
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl + "/",
        name: "bskn.tr",
        inLanguage: ["tr", "en"],
        publisher: { "@id": `${siteUrl}/#person` },
      },
      person,
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
  const jsonLd = JSON.stringify(data).replace(/</g, "\\u003c");
  const r = rootRel(lang);

  const verify = [
    verification.google ? `<meta name="google-site-verification" content="${esc(verification.google)}">` : "",
    verification.bing ? `<meta name="msvalidate.01" content="${esc(verification.bing)}">` : "",
  ]
    .filter(Boolean)
    .join("\n    ");

  return `<title>${esc(c.htmlTitle)}</title>
    <meta name="description" content="${esc(c.description)}">
    <meta name="author" content="${esc(PERSON.name)}">
    <link rel="canonical" href="${url}">
    ${alt}
    <link rel="alternate" hreflang="x-default" href="${siteUrl}/">
    <meta property="og:type" content="profile">
    <meta property="og:site_name" content="bskn.tr">
    <meta property="og:locale" content="${lang === "tr" ? "tr_TR" : "en_US"}">
    <meta property="og:locale:alternate" content="${lang === "tr" ? "en_US" : "tr_TR"}">
    <meta property="og:title" content="${esc(c.ogTitle)}">
    <meta property="og:description" content="${esc(c.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${img}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${esc(c.ogTitle)}">
    <meta property="profile:first_name" content="Murat Can">
    <meta property="profile:last_name" content="Başkan">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(c.ogTitle)}">
    <meta name="twitter:description" content="${esc(c.description)}">
    <meta name="twitter:image" content="${img}">
    ${verify}
    <link rel="icon" href="${r}favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="${r}apple-touch-icon.png">
    <link rel="manifest" href="${r}site.webmanifest">
    <script type="application/ld+json">${jsonLd}</script>`;
}

/* ---------------- body ---------------- */

function img(p: Photo, lang: Lang, cls: string, eager = false): string {
  return `<img class="${cls}" src="${rootRel(lang)}img/${p.src}" width="${p.w}" height="${p.h}" alt="${esc(
    p.alt[lang],
  )}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function header(lang: Lang, c: Copy): string {
  const href = (l: Lang): string => (l === lang ? "./" : lang === "tr" ? "en/" : "../");
  const langLink = (l: Lang): string =>
    `<a href="${href(l)}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="true"' : ""}>${l.toUpperCase()}</a>`;
  const n = c.nav;
  return `<header class="top" data-top>
  <div class="progress" data-progress aria-hidden="true"></div>
  <div class="top__in">
    <a class="brand" href="#top"><span class="brand__mark" aria-hidden="true"></span><span class="brand__name">${esc(
      PERSON.name,
    )}</span></a>
    <nav class="nav" aria-label="${c.navLabel}">
      <a href="#kariyer">${n.career}</a>
      <a href="#filo">${n.fleet}</a>
      <a href="#uzmanlik">${n.skills}</a>
      <a href="#belgeler">${n.credentials}</a>
      <a href="#iletisim">${n.contact}</a>
    </nav>
    <div class="tools">
      <div class="lang" role="group" aria-label="${c.langLabel}">${langLink("tr")}${langLink("en")}</div>
      <button class="theme" type="button" data-theme-toggle data-label-dark="${esc(c.themeToDark)}" data-label-light="${esc(
        c.themeToLight,
      )}" aria-label="${esc(c.themeToDark)}">
        <svg class="theme__moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>
        <svg class="theme__sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>
      </button>
      <a class="btn btn--solid btn--sm cv" href="${rootRel(lang)}${PERSON.cv}" download><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14"/></svg><span>${c.cv}</span></a>
    </div>
  </div>
</header>`;
}

function hero(lang: Lang, c: Copy): string {
  const current = CAREER.find((p) => p.current);
  const years = STATS[0]?.value ?? 0;
  return `<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="wrap hero__grid">
    <div class="hero__text">
      <p class="kicker kicker--rule" data-reveal>${esc(c.heroKicker)}</p>
      <h1 id="hero-title" class="hero__name" data-reveal><span>Murat Can</span> <span>Başkan</span></h1>
      <p class="hero__lead" data-reveal>${esc(c.heroLead(years, CAREER.length))}</p>
      <div class="hero__cta" data-reveal>
        <a class="btn btn--solid" href="#kariyer">${c.heroCareer}</a>
        <a class="btn btn--line" href="${rootRel(lang)}${PERSON.cv}" download>${c.cvLong}</a>
      </div>
      ${
        current
          ? `<p class="hero__now" data-reveal><span class="dot" aria-hidden="true"></span><span>${c.currentLabel} · ${esc(
              current.role[lang],
            )} · ${esc(current.org[lang])} · <span class="nowrap">${current.years}</span></span></p>`
          : ""
      }
    </div>
    <figure class="hero__fig" data-reveal>
      <span class="hero__year" aria-hidden="true">${START_YEAR}</span>
      <div class="hero__img">${img(
        CAREER.find((p) => p.id === "beks-leo")?.photo ?? BMMS.photo,
        lang,
        "",
        true,
      )}</div>
    </figure>
  </div>
</section>`;
}

function stats(lang: Lang, c: Copy): string {
  const items = STATS.map(
    (s) =>
      `<li data-reveal><span class="stat__v" data-count="${s.value}">${s.value}</span><span class="stat__l">${esc(
        s.label[lang],
      )}</span></li>`,
  ).join("");
  return `<section class="stats" aria-label="${c.statsLabel}"><div class="wrap"><ul class="stats__list">${items}</ul></div></section>`;
}

function bmms(lang: Lang, c: Copy): string {
  return `<section class="bmms" aria-labelledby="bmms-title">
  <div class="wrap bmms__grid">
    <div data-reveal>
      <p class="kicker">${c.bmmsKicker}</p>
      <h2 id="bmms-title" class="h2">${esc(BMMS.name[lang])}</h2>
      <p class="bmms__text">${esc(BMMS.text[lang])}</p>
      <a class="arrow-link" href="${PERSON.projectSite}${lang === "en" ? "/en/" : "/"}" hreflang="${lang}">${
        c.bmmsLink
      } <span aria-hidden="true">→</span> bskn.net</a>
    </div>
    <figure class="bmms__fig" data-reveal>${img(BMMS.photo, lang, "")}</figure>
  </div>
</section>`;
}

function post(p: Post, lang: Lang, c: Copy): string {
  const org = [p.org[lang] ? esc(p.org[lang]) : "", p.vessel ? `<span lang="en">${esc(p.vessel)}</span>` : ""]
    .filter(Boolean)
    .join(" · ");
  const tags = p.tags.map((t: T) => `<li>${esc(t[lang])}</li>`).join("");
  return `<li class="post${p.current ? " post--now" : ""}" data-type="${p.type}" data-reveal>
    <span class="post__mark" aria-hidden="true"></span>
    <p class="post__year${p.years.length > 4 ? " post__year--range" : ""}">${p.years}${
      p.current ? `<span class="post__now">${c.now}</span>` : ""
    }</p>
    <div class="post__body">
      <h3 class="post__role">${esc(p.role[lang])}</h3>
      <p class="post__org">${org}</p>
      <p class="post__text">${esc(p.text[lang])}</p>
      <ul class="tags" aria-label="${lang === "tr" ? "Anahtar konular" : "Key topics"}">${tags}</ul>
    </div>
    ${p.photo ? `<figure class="post__fig">${img(p.photo, lang, "")}</figure>` : `<div class="post__fig post__fig--empty" aria-hidden="true"><span>${esc(TYPE_LABEL[p.type][lang])}</span></div>`}
  </li>`;
}

function career(lang: Lang, c: Copy): string {
  const used = new Set(CAREER.map((p) => p.type));
  const keys: (VesselType | "all")[] = ["all", "tanker", "bulk", "capesize", "roro", "power", "yard", "shore"];
  const filters = keys
    .filter((k) => k === "all" || used.has(k))
    .map(
      (k) =>
        `<button type="button" class="chip" data-filter="${k}" aria-pressed="${k === "all"}">${esc(
          TYPE_LABEL[k][lang],
        )}</button>`,
    )
    .join("");
  return `<section class="section" id="kariyer" aria-labelledby="career-title">
  <div class="wrap">
    <div class="section__head">
      <div>
        <p class="kicker">${c.careerKicker}</p>
        <h2 id="career-title" class="h2">${esc(c.careerTitle(START_YEAR))}</h2>
      </div>
      <p class="section__hint">${c.careerHint}</p>
    </div>
    <div class="filters" role="group" aria-label="${c.filterLabel}" data-filters hidden>${filters}</div>
    <p class="sr-only" aria-live="polite" data-filter-status data-template="${esc(c.shown(0)).replace("0", "{n}")}"></p>
    <div class="log-wrap" data-log>
      <span class="log__line" aria-hidden="true"><span data-line></span></span>
      <ol class="log">
      ${CAREER.map((p) => post(p, lang, c)).join("\n      ")}
      </ol>
    </div>
    <p class="note">${c.photoNote}</p>
  </div>
</section>`;
}

function fleet(lang: Lang, c: Copy): string {
  const rows = fleetRanges()
    .map(
      (f) =>
        `<li data-reveal><span class="sq" aria-hidden="true"></span><span class="fleet__n">${esc(
          FLEET_NAME[f.type][lang],
        )}</span><span class="fleet__y">${f.range}</span></li>`,
    )
    .join("");
  return `<section class="section" id="filo" aria-labelledby="fleet-title">
  <div class="wrap split">
    <div><p class="kicker">${c.fleetKicker}</p><h2 id="fleet-title" class="h2">${c.fleetTitle}</h2></div>
    <ul class="fleet">${rows}</ul>
  </div>
</section>`;
}

function skills(lang: Lang, c: Copy): string {
  const groups = SKILLS.map(
    (g) =>
      `<div class="skill" data-reveal><h3 class="h3">${esc(g.title[lang])}</h3><ul>${g.items
        .map((i) => `<li>${esc(i[lang])}</li>`)
        .join("")}</ul></div>`,
  ).join("");
  return `<section class="section" id="uzmanlik" aria-labelledby="skills-title">
  <div class="wrap">
    <p class="kicker">${c.skillsKicker}</p>
    <h2 id="skills-title" class="h2">${c.skillsTitle}</h2>
    <div class="skills">${groups}</div>
  </div>
</section>`;
}

function credentials(lang: Lang, c: Copy): string {
  const certs = CERTIFICATES.map((x) => {
    const meta = [x.issuer[lang], x.date[lang]].filter(Boolean).map(esc).join(" · ");
    return `<li class="card${x.pending ? " card--pending" : ""}" data-reveal>
      <h3 class="card__t">${esc(x.title[lang])}</h3>
      <p class="card__m">${meta}</p>
      ${x.note ? `<p class="card__n">${esc(x.note[lang])}</p>` : ""}
      ${x.pending ? `<p class="badge">${c.pending}</p>` : ""}
    </li>`;
  }).join("");
  const members = MEMBERSHIPS.map(
    (m) => `<li class="member" data-reveal>
      <p class="member__s">${esc(m.short)}</p>
      <p class="member__r">${esc(m.role[lang])}</p>
      <p class="member__n">${esc(m.name[lang])}</p>
      ${m.history ? `<p class="member__h">${esc(m.history[lang])}</p>` : ""}
    </li>`,
  ).join("");
  const edu = EDUCATION.map(
    (e) =>
      `<li><span class="edu__s">${esc(e.school[lang])}</span>${
        e.detail[lang] ? `<span class="edu__d">${esc(e.detail[lang])}</span>` : ""
      }<span class="edu__y">${e.years}</span></li>`,
  ).join("");
  const langs = LANGUAGES.map((l) => `<li>${esc(l[lang])}</li>`).join("");
  return `<section class="section" id="belgeler" aria-labelledby="cred-title">
  <div class="wrap">
    <p class="kicker">${c.credKicker}</p>
    <h2 id="cred-title" class="h2">${c.credTitle}</h2>
    <ul class="cards">${certs}</ul>
    <h3 class="h3 sub">${c.memberTitle}</h3>
    <ul class="members">${members}</ul>
    <div class="edu-grid">
      <div data-reveal><h3 class="h3 sub">${c.eduTitle}</h3><ul class="edu">${edu}</ul></div>
      <div data-reveal><h3 class="h3 sub">${c.langTitle}</h3><ul class="langs">${langs}</ul></div>
    </div>
  </div>
</section>`;
}

function contact(lang: Lang, c: Copy): string {
  return `<section class="contact" id="iletisim" aria-labelledby="contact-title">
  <div class="wrap">
    <p class="kicker">${c.contactKicker}</p>
    <h2 id="contact-title" class="contact__t">${c.contactTitle}</h2>
    <p class="contact__sub">${c.contactSub}</p>
    <dl class="contact__list">
      <div><dt>${c.phone}</dt><dd><a href="${telHref(PERSON.phone)}">${esc(PERSON.phone)}</a></dd></div>
      <div><dt>${c.email}</dt><dd><a href="mailto:${PERSON.email}">${PERSON.email}</a> <button type="button" class="copy" data-copy="${
        PERSON.email
      }" data-copied="${c.copied}">${c.copy}</button></dd></div>
      <div><dt>${c.location}</dt><dd>${esc(PERSON.location[lang])}</dd></div>
      <div><dt>${c.web}</dt><dd><a href="${PERSON.projectSite}${lang === "en" ? "/en/" : "/"}">bskn.net</a></dd></div>
    </dl>
    <a class="btn btn--solid" href="${rootRel(lang)}${PERSON.cv}" download>${c.cvLong}</a>
  </div>
</section>`;
}

export function renderBody(lang: Lang): string {
  const c = copyFor(lang);
  return `<a class="skip" href="#main">${c.skip}</a>
${header(lang, c)}
<main id="main">
${hero(lang, c)}
${stats(lang, c)}
${career(lang, c)}
${bmms(lang, c)}
${fleet(lang, c)}
${skills(lang, c)}
${credentials(lang, c)}
${contact(lang, c)}
</main>
<footer class="foot"><div class="wrap foot__in"><p>© ${new Date().getFullYear()} ${esc(c.footer)}</p><p><a href="${
    PERSON.projectSite
  }">bskn.net</a> · <a href="mailto:${PERSON.email}">${PERSON.email}</a></p></div></footer>`;
}
