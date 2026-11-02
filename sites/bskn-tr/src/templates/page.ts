/**
 * data.ts + copy.ts → statik HTML (derleme anında).
 * BSKN.tr 10-Modüllü Bento Portfolyo Sistemi.
 */
import {
  CAREER,
  CERTIFICATES,
  MEMBERSHIPS,
  PERSON,
  SKILLS,
  STATS,
  TYPE_LABEL,
  type Lang,
  type VesselType,
} from "../data.ts";
import { copyFor, type Copy } from "../copy.ts";

export const LANG_PATH: Record<Lang, string> = { tr: "/", en: "/en/" };

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const r = (lang: Lang): string => (lang === "tr" ? "" : "../");

export function renderHead(lang: Lang, siteUrl: string, verification: { google: string; bing: string }): string {
  const c = copyFor(lang);
  const canonical = `${siteUrl}${LANG_PATH[lang]}`;
    
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: PERSON.name,
        jobTitle: lang === "tr" ? "Uzakyol Gemi Baş Mühendisi" : "Ocean-Going Chief Engineer",
        description: c.description,
        email: `mailto:${PERSON.email}`,
        telephone: PERSON.phone,
        url: siteUrl,
        sameAs: [PERSON.projectSite],
        alumniOf: {
          "@type": "EducationalOrganization",
          name: "İstanbul Teknik Üniversitesi Denizcilik Fakültesi",
        },
      },
      {
        "@type": "ProfilePage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: c.htmlTitle,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#person` },
        inLanguage: lang,
      },
    ],
  };

  return `<title>${esc(c.htmlTitle)}</title>
<meta name="description" content="${esc(c.description)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="tr" href="${siteUrl}/">
<link rel="alternate" hreflang="en" href="${siteUrl}/en/">
<link rel="alternate" hreflang="x-default" href="${siteUrl}/">
<meta property="og:title" content="${esc(c.ogTitle)}">
<meta property="og:description" content="${esc(c.description)}">
<meta property="og:type" content="profile">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${siteUrl}/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(c.ogTitle)}">
<meta name="twitter:description" content="${esc(c.description)}">
<meta name="twitter:image" content="${siteUrl}/og-image.jpg">
${verification?.google ? `<meta name="google-site-verification" content="${esc(verification.google)}">\n` : ""}${verification?.bing ? `<meta name="msvalidate.01" content="${esc(verification.bing)}">\n` : ""}
<link rel="icon" type="image/svg+xml" href="${r(lang)}favicon.svg">
<link rel="apple-touch-icon" href="${r(lang)}apple-touch-icon.png">
<link rel="manifest" href="${r(lang)}site.webmanifest">
<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/* ---------- Header ---------- */

function renderHeader(lang: Lang, c: Copy): string {
  const root = r(lang);
  const cvPath = lang === "tr" ? `${root}cv/Murat_Can_Baskan_CV_Signature_White_TR.pdf` : `${root}cv/Murat_Can_Baskan_CV_EN.pdf`;
  const otherPath = c.langSwitchPath;

  return `<header class="site-header">
  <div class="header-container">
    <div class="header-brand-wrap">
      <a href="${LANG_PATH[lang]}" class="brand-link" aria-label="BSKN.tr">
        <span class="brand-dot" aria-hidden="true"></span>
        <span class="brand-text">BSKN.tr</span>
      </a>
      <div class="header-identity">
        <span class="identity-name">${esc(PERSON.name)}</span>
        <span class="identity-sep" aria-hidden="true">/</span>
        <span class="identity-role">${esc(c.role)}</span>
        <span class="identity-sep" aria-hidden="true">·</span>
        <span class="identity-tagline">${esc(c.tagline)}</span>
      </div>
    </div>
    <div class="header-controls">
      <a href="${otherPath}" class="ctrl-btn" hreflang="${lang === "tr" ? "en" : "tr"}" title="${esc(c.langSwitchTitle)}">
        ${esc(c.langSwitch)}
      </a>
      <button type="button" class="ctrl-btn" data-theme-toggle="" aria-label="${esc(c.themeToggle)}" aria-pressed="false">
        <span data-theme-label="">${esc(c.themeToggle)}</span>
      </button>
      <a href="${cvPath}" class="ctrl-btn ctrl-btn--cv" data-cv-download="" target="_blank" rel="noopener noreferrer">
        ${esc(c.cvBtn)}
      </a>
    </div>
  </div>
</header>`;
}

/* ---------- Closed Bento Cards (Strictly Image-Free) ---------- */

function renderClosedCards(_lang: Lang, c: Copy): string {
  return `<div class="bento-grid" id="bento-grid">
    <!-- 01 PROFILE -->
    <div class="bento-card bento-card--01" data-card="01">
      <button type="button" class="bento-card__trigger" data-open-module="01" aria-expanded="false" aria-controls="detail-layer">
        <div class="bento-card__head">
          <span class="bento-card__num">${esc(c.cards.c01.num)}</span>
          <span class="bento-card__plus" aria-hidden="true">+</span>
        </div>
        <div class="bento-card__body">
          <h2 class="bento-card__title">${esc(c.cards.c01.title)}</h2>
          <p class="bento-card__sub">${esc(c.cards.c01.sub)}</p>
        </div>
      </button>
    </div>

    <!-- 02 CAREER / SEA EXPERIENCE -->
    <div class="bento-card bento-card--02" data-card="02">
      <button type="button" class="bento-card__trigger" data-open-module="02" aria-expanded="false" aria-controls="detail-layer">
        <div class="bento-card__head">
          <span class="bento-card__num">${esc(c.cards.c02.num)}</span>
          <span class="bento-card__plus" aria-hidden="true">+</span>
        </div>
        <div class="bento-card__body">
          <h2 class="bento-card__title">${esc(c.cards.c02.title)}</h2>
          <p class="bento-card__sub">${esc(c.cards.c02.sub)}</p>
        </div>
      </button>
    </div>

    <!-- 03 PROFESSIONAL REGISTRATION -->
    <div class="bento-card bento-card--03" data-card="03">
      <button type="button" class="bento-card__trigger" data-open-module="03" aria-expanded="false" aria-controls="detail-layer">
        <div class="bento-card__head">
          <span class="bento-card__num">${esc(c.cards.c03.num)}</span>
          <span class="bento-card__plus" aria-hidden="true">+</span>
        </div>
        <div class="bento-card__body">
          <h2 class="bento-card__title">${esc(c.cards.c03.title)}</h2>
          <p class="bento-card__sub">${esc(c.cards.c03.sub)}</p>
        </div>
      </button>
    </div>

    <!-- 06 EDUCATION -->
    <div class="bento-card bento-card--06" data-card="06">
      <button type="button" class="bento-card__trigger" data-open-module="06" aria-expanded="false" aria-controls="detail-layer">
        <div class="bento-card__head">
          <span class="bento-card__num">${esc(c.cards.c06.num)}</span>
          <span class="bento-card__plus" aria-hidden="true">+</span>
        </div>
        <div class="bento-card__body">
          <h2 class="bento-card__title">${esc(c.cards.c06.title)}</h2>
          <p class="bento-card__sub">${esc(c.cards.c06.sub)}</p>
        </div>
      </button>
    </div>

    <!-- 08 MEMBERSHIPS -->
    <div class="bento-card bento-card--08" data-card="08">
      <button type="button" class="bento-card__trigger" data-open-module="08" aria-expanded="false" aria-controls="detail-layer">
        <div class="bento-card__head">
          <span class="bento-card__num">${esc(c.cards.c08.num)}</span>
          <span class="bento-card__plus" aria-hidden="true">+</span>
        </div>
        <div class="bento-card__body">
          <h2 class="bento-card__title">${esc(c.cards.c08.title)}</h2>
          <p class="bento-card__sub">${esc(c.cards.c08.sub)}</p>
        </div>
      </button>
    </div>

    <!-- 07 CERTIFICATIONS -->
    <div class="bento-card bento-card--07" data-card="07">
      <button type="button" class="bento-card__trigger" data-open-module="07" aria-expanded="false" aria-controls="detail-layer">
        <div class="bento-card__head">
          <span class="bento-card__num">${esc(c.cards.c07.num)}</span>
          <span class="bento-card__plus" aria-hidden="true">+</span>
        </div>
        <div class="bento-card__body">
          <h2 class="bento-card__title">${esc(c.cards.c07.title)}</h2>
          <p class="bento-card__sub">${esc(c.cards.c07.sub)}</p>
        </div>
      </button>
    </div>

    <!-- 05 BMMS / ENTREPRENEURSHIP -->
    <div class="bento-card bento-card--05" data-card="05">
      <button type="button" class="bento-card__trigger" data-open-module="05" aria-expanded="false" aria-controls="detail-layer">
        <div class="bento-card__head">
          <span class="bento-card__num">${esc(c.cards.c05.num)}</span>
          <span class="bento-card__plus" aria-hidden="true">+</span>
        </div>
        <div class="bento-card__body">
          <h2 class="bento-card__title">${esc(c.cards.c05.title)}</h2>
          <p class="bento-card__sub">${esc(c.cards.c05.sub)}</p>
        </div>
      </button>
    </div>

    <!-- 04 MARINE TECHNOLOGY -->
    <div class="bento-card bento-card--04" data-card="04">
      <button type="button" class="bento-card__trigger" data-open-module="04" aria-expanded="false" aria-controls="detail-layer">
        <div class="bento-card__head">
          <span class="bento-card__num">${esc(c.cards.c04.num)}</span>
          <span class="bento-card__plus" aria-hidden="true">+</span>
        </div>
        <div class="bento-card__body">
          <h2 class="bento-card__title">${esc(c.cards.c04.title)}</h2>
          <p class="bento-card__sub">${esc(c.cards.c04.sub)}</p>
        </div>
      </button>
    </div>

    <!-- 09 PROJECTS & TECHNOLOGY -->
    <div class="bento-card bento-card--09" data-card="09">
      <button type="button" class="bento-card__trigger" data-open-module="09" aria-expanded="false" aria-controls="detail-layer">
        <div class="bento-card__head">
          <span class="bento-card__num">${esc(c.cards.c09.num)}</span>
          <span class="bento-card__plus" aria-hidden="true">+</span>
        </div>
        <div class="bento-card__body">
          <h2 class="bento-card__title">${esc(c.cards.c09.title)}</h2>
          <p class="bento-card__sub">${esc(c.cards.c09.sub)}</p>
        </div>
      </button>
    </div>

    <!-- 10 CONTACT -->
    <div class="bento-card bento-card--10" data-card="10">
      <button type="button" class="bento-card__trigger" data-open-module="10" aria-expanded="false" aria-controls="detail-layer">
        <div class="bento-card__head">
          <span class="bento-card__num">${esc(c.cards.c10.num)}</span>
          <span class="bento-card__plus" aria-hidden="true">+</span>
        </div>
        <div class="bento-card__body">
          <h2 class="bento-card__title">${esc(c.cards.c10.title)}</h2>
          <p class="bento-card__sub">${esc(c.cards.c10.sub)}</p>
        </div>
      </button>
    </div>
  </div>`;
}

/* ---------- Open Module Templates (01 to 10) ---------- */

function renderOpenModule01(_lang: Lang, c: Copy): string {
  return `<section class="module-open-pane" data-pane="01" hidden>
    <div class="profile-open-hero">
      <h2 class="profile-open-title">${esc(PERSON.name)}</h2>
      <p class="profile-open-sub">${esc(c.role)}</p>
      <p class="profile-open-tagline">${esc(c.tagline)}</p>
    </div>

    <div class="profile-narrative-grid">
      <article class="narrative-card">
        <h3>${esc(c.profile.seaTitle)}</h3>
        <p>${esc(c.profile.seaDesc)}</p>
      </article>
      <article class="narrative-card">
        <h3>${esc(c.profile.systemsTitle)}</h3>
        <p>${esc(c.profile.systemsDesc)}</p>
      </article>
      <article class="narrative-card">
        <h3>${esc(c.profile.techTitle)}</h3>
        <p>${esc(c.profile.techDesc)}</p>
      </article>
    </div>

    <div class="profile-highlights-row">
      ${c.profile.highlights
        .map(
          (h) => `<div class="highlight-box">
            <div class="hl-val">${esc(h.val)}</div>
            <div class="hl-lbl">${esc(h.label)}</div>
          </div>`,
        )
        .join("")}
    </div>
  </section>`;
}

function renderOpenModule02(lang: Lang, c: Copy): string {
  const root = r(lang);
  const filterKeys: (VesselType | "all")[] = ["all", "tanker", "bulk", "capesize", "roro", "power", "yard", "shore"];

  return `<section class="module-open-pane" data-pane="02" hidden>
    <div class="career-stats-row">
      <div class="career-stat-card">
        <span class="career-stat-val">${STATS[0]?.value ?? 0}</span>
        <span class="career-stat-lbl">${esc(c.career.statsYears)}</span>
      </div>
      <div class="career-stat-card">
        <span class="career-stat-val">${STATS[1]?.value ?? 0}</span>
        <span class="career-stat-lbl">${esc(c.career.statsPosts)}</span>
      </div>
      <div class="career-stat-card">
        <span class="career-stat-val">${STATS[2]?.value ?? 0}+</span>
        <span class="career-stat-lbl">${esc(c.career.statsCompanies)}</span>
      </div>
      <div class="career-stat-card">
        <span class="career-stat-val">${STATS[3]?.value ?? 0}</span>
        <span class="career-stat-lbl">${esc(c.career.statsTypes)}</span>
      </div>
    </div>

    <div class="career-filters" role="group" aria-label="Filters">
      ${filterKeys
        .map(
          (k, i) => `<button type="button" class="career-chip${i === 0 ? " is-active" : ""}" data-filter="${k}" aria-pressed="${i === 0 ? "true" : "false"}">
            ${esc(TYPE_LABEL[k][lang])}
          </button>`,
        )
        .join("")}
    </div>

    <div class="career-posts-list">
      ${CAREER.map((p) => {
        const imgSrc = p.img ? `${root}img/${p.img}` : "";
        return `<article class="career-post-entry" data-post-type="${p.type}">
          <div class="post-content">
            <div class="post-head">
              <span class="post-year">${esc(p.years)}</span>
              <span class="post-role">${esc(p.role[lang])}</span>
              ${p.current ? `<span class="post-current-badge">${esc(c.career.currentBadge)}</span>` : ""}
            </div>
            <div class="post-org-ship">
              ${p.org ? `<strong>${esc(p.org)}</strong> · ` : ""}
              <span>${esc(p.ship)}</span>
            </div>
            <p class="post-short">${esc(p.short[lang])}</p>
            <p class="post-long">${esc(p.long[lang])}</p>
            <div class="post-tags">
              ${p.tags.map((t) => `<span class="post-tag">${esc(t)}</span>`).join("")}
            </div>
          </div>
          ${
            imgSrc
              ? `<div class="post-media">
                  <img src="${imgSrc}" alt="${esc(p.ship)}" loading="lazy">
                </div>`
              : ""
          }
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderOpenModule03(lang: Lang, c: Copy): string {
  const root = r(lang);
  return `<section class="module-open-pane" data-pane="03" hidden>
    <div class="reg-layout">
      <div class="reg-info">
        <div class="reg-status-pill">${esc(c.reg.statusBadge)} · ${esc(c.reg.statusLabel)}</div>
        <h2 style="font-size: clamp(22px, 2.4vw, 32px); font-weight: 700; color: #ffffff; margin: 0 0 8px;">
          ${esc(c.reg.title)}
        </h2>
        <p style="font-size: 15px; font-weight: 600; color: var(--burgundy-bright); margin: 0 0 16px;">
          ${esc(c.reg.grade)}
        </p>
        <p class="reg-body">${esc(c.reg.body)}</p>
        <ul class="reg-notes-list">
          ${c.reg.notes.map((n) => `<li>${esc(n)}</li>`).join("")}
        </ul>
      </div>
      <div class="reg-asset-box">
        <img src="${root}uploads/imarest.jpg" alt="IMarEST" loading="lazy">
        <p style="font-size: 12px; color: var(--card-text-muted); margin: 0;">
          ${esc(c.reg.institution)}
        </p>
      </div>
    </div>
  </section>`;
}

function renderOpenModule04(lang: Lang, c: Copy): string {
  // Map 13 canonical skills into the 6 progressive disclosure categories
  const categorySkills: Record<string, { title: string; desc: string }[]> = {
    systems: [
      { title: SKILLS[0]!.items[0]!.title[lang], desc: SKILLS[0]!.items[0]!.desc[lang] },
      { title: SKILLS[2]!.items[3]!.title[lang], desc: SKILLS[2]!.items[3]!.desc[lang] },
    ],
    operations: [
      { title: SKILLS[0]!.items[2]!.title[lang], desc: SKILLS[0]!.items[2]!.desc[lang] },
      { title: SKILLS[0]!.items[3]!.title[lang], desc: SKILLS[0]!.items[3]!.desc[lang] },
      { title: SKILLS[0]!.items[4]!.title[lang], desc: SKILLS[0]!.items[4]!.desc[lang] },
    ],
    reliability: [
      { title: SKILLS[0]!.items[1]!.title[lang], desc: SKILLS[0]!.items[1]!.desc[lang] },
      { title: SKILLS[2]!.items[1]!.title[lang], desc: SKILLS[2]!.items[1]!.desc[lang] },
    ],
    energy: [
      { title: SKILLS[1]!.items[0]!.title[lang], desc: SKILLS[1]!.items[0]!.desc[lang] },
      { title: SKILLS[1]!.items[1]!.title[lang], desc: SKILLS[1]!.items[1]!.desc[lang] },
      { title: SKILLS[1]!.items[2]!.title[lang], desc: SKILLS[1]!.items[2]!.desc[lang] },
    ],
    assurance: [
      { title: SKILLS[2]!.items[0]!.title[lang], desc: SKILLS[2]!.items[0]!.desc[lang] },
    ],
    leadership: [
      { title: SKILLS[1]!.items[3]!.title[lang], desc: SKILLS[1]!.items[3]!.desc[lang] },
      { title: SKILLS[2]!.items[2]!.title[lang], desc: SKILLS[2]!.items[2]!.desc[lang] },
    ],
  };

  return `<section class="module-open-pane" data-pane="04" hidden>
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: clamp(22px, 2.4vw, 32px); font-weight: 700; color: #ffffff; margin: 0 0 6px;">
        ${esc(c.skills.title)}
      </h2>
      <p style="font-size: 13px; color: var(--card-text-muted); margin: 0;">
        ${esc(c.skills.sub)}
      </p>
    </div>

    <div class="skills-tabs-bar" role="tablist">
      <button type="button" class="skills-tab-btn is-active" data-skill-tab="systems" role="tab" aria-selected="true">
        ${esc(c.skills.tabs.systems)}
      </button>
      <button type="button" class="skills-tab-btn" data-skill-tab="operations" role="tab" aria-selected="false">
        ${esc(c.skills.tabs.operations)}
      </button>
      <button type="button" class="skills-tab-btn" data-skill-tab="reliability" role="tab" aria-selected="false">
        ${esc(c.skills.tabs.reliability)}
      </button>
      <button type="button" class="skills-tab-btn" data-skill-tab="energy" role="tab" aria-selected="false">
        ${esc(c.skills.tabs.energy)}
      </button>
      <button type="button" class="skills-tab-btn" data-skill-tab="assurance" role="tab" aria-selected="false">
        ${esc(c.skills.tabs.assurance)}
      </button>
      <button type="button" class="skills-tab-btn" data-skill-tab="leadership" role="tab" aria-selected="false">
        ${esc(c.skills.tabs.leadership)}
      </button>
    </div>

    ${Object.entries(categorySkills)
      .map(
        ([tabKey, items]) => `<div class="skills-tab-content${tabKey === "systems" ? " is-active" : ""}" data-skill-content="${tabKey}" ${
          tabKey === "systems" ? "" : 'style="display: none;"'
        }>
          <div class="skills-grid-container">
            ${items
              .map(
                (item) => `<div class="skill-card-item">
                  <h3 class="skill-card-title">${esc(item.title)}</h3>
                  <p class="skill-card-desc">${esc(item.desc)}</p>
                </div>`,
              )
              .join("")}
          </div>
        </div>`,
      )
      .join("")}
  </section>`;
}

function renderOpenModule05(lang: Lang, c: Copy): string {
  const root = r(lang);
  return `<section class="module-open-pane" data-pane="05" hidden>
    <div class="bmms-open-grid">
      <div>
        <div style="display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; background: var(--burgundy); color: #ffffff; border-radius: 4px; margin-bottom: 12px;">
          ${esc(c.bmms.badge)}
        </div>
        <h2 style="font-size: clamp(24px, 2.6vw, 36px); font-weight: 700; color: #ffffff; margin: 0 0 12px;">
          ${esc(c.bmms.title)}
        </h2>
        <p class="bmms-lead">${esc(c.bmms.lead)}</p>
        <p class="bmms-body">${esc(c.bmms.body)}</p>
        <div class="bmms-programs-row">
          ${c.bmms.programs.map((p) => `<span class="bmms-program-tag">${esc(p)}</span>`).join("")}
        </div>
        <div>
          <a href="${c.bmms.ctaUrl}" target="_blank" rel="noopener noreferrer" class="bmms-cta-btn">
            ${esc(c.bmms.cta)}
          </a>
        </div>
      </div>
      <div class="bmms-media-box">
        <img src="${root}img/bskn-net.webp" alt="BMMS Maritime Technology" loading="lazy">
      </div>
    </div>
  </section>`;
}

function renderOpenModule06(_lang: Lang, c: Copy): string {
  return `<section class="module-open-pane" data-pane="06" hidden>
    <div class="edu-container">
      <div>
        <h2 class="edu-inst">${esc(c.edu.institution)}</h2>
        <div class="edu-dept">${esc(c.edu.department)} · ${esc(c.edu.degree)}</div>
        <p style="font-size: 11.5px; color: var(--card-text-dim); margin: 0 0 16px;">
          ${esc(c.edu.facultyOld)}
        </p>
        <p class="edu-desc">${esc(c.edu.details)}</p>
      </div>
      <div class="edu-topics-grid">
        ${c.edu.topics
          .map(
            (t) => `<div class="edu-topic-item">
              ${esc(t)}
            </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>`;
}

function renderOpenModule07(lang: Lang, c: Copy): string {
  const root = r(lang);
  return `<section class="module-open-pane" data-pane="07" hidden>
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: clamp(22px, 2.4vw, 32px); font-weight: 700; color: #ffffff; margin: 0 0 6px;">
        ${esc(c.certs.title)}
      </h2>
      <p style="font-size: 13px; color: var(--card-text-muted); margin: 0;">
        ${esc(c.certs.sub)}
      </p>
    </div>

    <div class="certs-grid">
      ${CERTIFICATES.map((cert) => {
        const thumb = cert.img ? `${root}uploads/${cert.img}` : "";
        return `<div class="cert-card">
          <div>
            <h3 class="cert-card-title">${esc(cert.title)}</h3>
            <div class="cert-card-issuer">${esc(cert.when[lang])}</div>
            <p class="cert-card-desc">${esc(cert.desc[lang])}</p>
          </div>
          ${
            thumb
              ? `<div class="cert-preview-thumb" data-zoom-trigger="${thumb}" data-zoom-title="${esc(cert.title)}" title="${esc(c.zoomHint)}">
                  <img src="${thumb}" alt="${esc(cert.title)}" loading="lazy">
                </div>`
              : ""
          }
        </div>`;
      }).join("")}
    </div>
  </section>`;
}

function renderOpenModule08(lang: Lang, c: Copy): string {
  const root = r(lang);
  return `<section class="module-open-pane" data-pane="08" hidden>
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: clamp(22px, 2.4vw, 32px); font-weight: 700; color: #ffffff; margin: 0 0 6px;">
        ${esc(c.memberships.title)}
      </h2>
      <p style="font-size: 13px; color: var(--card-text-muted); margin: 0;">
        ${esc(c.memberships.sub)}
      </p>
    </div>

    <div class="memberships-grid">
      ${MEMBERSHIPS.map((m) => {
        const logoSrc = m.img ? `${root}uploads/${m.img}` : "";
        return `<div class="member-card">
          <div class="member-logo-wrap">
            ${logoSrc ? `<img src="${logoSrc}" alt="${esc(m.short)}" loading="lazy">` : ""}
          </div>
          <h3 class="member-acronym">${esc(m.short)}</h3>
          <div class="member-role">${esc(m.role[lang])}</div>
          <p class="member-full-name">${esc(m.name[lang])}</p>
        </div>`;
      }).join("")}
    </div>
  </section>`;
}

function renderOpenModule09(_lang: Lang, c: Copy): string {
  return `<section class="module-open-pane" data-pane="09" hidden>
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: clamp(22px, 2.4vw, 32px); font-weight: 700; color: #ffffff; margin: 0 0 6px;">
        ${esc(c.projects.title)}
      </h2>
      <p style="font-size: 13px; color: var(--card-text-muted); margin: 0;">
        ${esc(c.projects.sub)}
      </p>
    </div>

    <div class="projects-grid">
      ${c.projects.items
        .map(
          (p) => `<div class="project-card">
            <div class="project-num">${esc(p.num)}</div>
            <h3 class="project-title">${esc(p.title)}</h3>
            <p class="project-desc">${esc(p.desc)}</p>
          </div>`,
        )
        .join("")}
    </div>
  </section>`;
}

function renderOpenModule10(lang: Lang, c: Copy): string {
  const root = r(lang);
  const cvTr = `${root}cv/Murat_Can_Baskan_CV_Signature_White_TR.pdf`;
  const cvEn = `${root}cv/Murat_Can_Baskan_CV_EN.pdf`;

  return `<section class="module-open-pane" data-pane="10" hidden>
    <div class="contact-layout">
      <div>
        <h2 style="font-size: clamp(22px, 2.4vw, 32px); font-weight: 700; color: #ffffff; margin: 0 0 8px;">
          ${esc(c.contact.title)}
        </h2>
        <p style="font-size: 13px; color: var(--card-text-muted); margin: 0 0 24px;">
          ${esc(c.contact.sub)}
        </p>

        <div class="contact-channels-list">
          <div class="contact-channel-item">
            <div class="channel-label">${esc(c.contact.emailLabel)}</div>
            <div class="channel-val"><a href="mailto:${PERSON.email}">${esc(PERSON.email)}</a></div>
          </div>
          <div class="contact-channel-item">
            <div class="channel-label">${esc(c.contact.phoneLabel)}</div>
            <div class="channel-val"><a href="tel:+905326591923">${esc(PERSON.phone)}</a></div>
          </div>
          <div class="contact-channel-item">
            <div class="channel-label">${esc(c.contact.webLabel)}</div>
            <div class="channel-val">
              <a href="https://bskn.tr" target="_blank" rel="noopener">bskn.tr</a> · 
              <a href="https://bskn.net" target="_blank" rel="noopener">bskn.net</a>
            </div>
          </div>
          <div class="contact-channel-item">
            <div class="channel-label">${esc(c.contact.cvLabel)}</div>
            <div class="contact-cv-links">
              <a href="${cvTr}" target="_blank" rel="noopener" class="cv-download-btn">
                <span>📄</span> ${esc(c.contact.cvTr)}
              </a>
              <a href="${cvEn}" target="_blank" rel="noopener" class="cv-download-btn">
                <span>📄</span> ${esc(c.contact.cvEn)}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-areas-box">
        <h3>${esc(c.contact.areasTitle)}</h3>
        <ul class="contact-areas-list">
          ${c.contact.areas.map((a) => `<li>${esc(a)}</li>`).join("")}
        </ul>
      </div>
    </div>
  </section>`;
}

/* ---------- Master Body Renderer ---------- */

export function renderBody(lang: Lang): string {
  const c = copyFor(lang);

  return `${renderHeader(lang, c)}
<main class="site-main" id="site-main">
  <div class="stage-wrapper" id="stage">
    ${renderClosedCards(lang, c)}

    <!-- Editorial Open Layer -->
    <div class="editorial-overlay" id="detail-layer" hidden role="dialog" aria-modal="true" aria-label="Module Detail">
      <div class="overlay-backdrop" id="overlay-backdrop" aria-hidden="true"></div>
      <div class="overlay-container" id="overlay-container">
        <div class="overlay-header">
          <span class="overlay-kicker" id="overlay-kicker">01 · PROFILE</span>
          <div class="overlay-dismiss-bar" id="overlay-dismiss-btn" role="button" tabindex="0" aria-label="${esc(c.close)}">
            <span>${esc(c.dismissHint)}</span>
            <span class="overlay-dismiss-badge">ESC</span>
          </div>
        </div>
        <div class="overlay-content" id="overlay-content">
          ${renderOpenModule01(lang, c)}
          ${renderOpenModule02(lang, c)}
          ${renderOpenModule03(lang, c)}
          ${renderOpenModule04(lang, c)}
          ${renderOpenModule05(lang, c)}
          ${renderOpenModule06(lang, c)}
          ${renderOpenModule07(lang, c)}
          ${renderOpenModule08(lang, c)}
          ${renderOpenModule09(lang, c)}
          ${renderOpenModule10(lang, c)}
        </div>
      </div>
    </div>
  </div>
</main>

<!-- Certificate & Document Zoom Modal -->
<div class="zoom-modal" id="zoom-modal" hidden role="dialog" aria-modal="true" aria-label="${esc(c.seeDoc)}">
  <figure>
    <img id="zoom-modal-img" src="data:," alt="">
    <figcaption>
      <span id="zoom-modal-title"></span>
      <button type="button" class="zoom-close-btn" id="zoom-modal-close">${esc(c.close)}</button>
    </figcaption>
  </figure>
</div>

<footer class="site-footer">
  <div class="footer-container">
    <span>${esc(c.footerText)}</span>
    <span>© ${new Date().getFullYear()} · bskn.tr</span>
  </div>
</footer>`;
}
