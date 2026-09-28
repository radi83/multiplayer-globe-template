import type { Lang } from "./data.ts";

/** Arayüz metinleri — eski bskn.tr sitesiyle aynı. */
const COPY = {
  tr: {
    htmlTitle: "Murat Can Başkan — Uzakyol Baş Mühendisi | bskn.tr",
    description:
      "Murat Can Başkan, Uzakyol Baş Mühendisi. 2007’den beri tanker, dökme yük, capesize, Ro-Ro ve yüzer santrallerde makine dairesi; ME-B ve ME-C yeni inşa teslimleri.",
    ogTitle: "Murat Can Başkan — Uzakyol Baş Mühendisi",
    navCareer: "Kariyer",
    navFleet: "Filo",
    navSkills: "Uzmanlık",
    navCerts: "Belgeler",
    ctaCv: "CV indir",
    ctaCareer: "Kariyeri gör",
    heroKicker: "Uzakyol Baş Mühendisi · İTÜ Denizcilik YDO’06",
    heroLead: (n: string) =>
      `2007’den bu yana makine dairesinde. Ürün tankerinden capesize’a, buhar türbininden ME-C’ye — ${n} görev, tek bir disiplin.`,
    heroStatus: "Güncel görev · Baş Mühendis",
    heroAlt: "Dökme yük gemisi — makine ve sefer göstergeleri",
    statsKicker: "Rakamlarla",
    careerKicker: "Sefer defteri",
    careerTitle: "2007’den bugüne",
    careerHint: "Bir göreve dokun — kartın arkasında gemi ve ayrıntılar açılır.",
    closeCard: "Kapat",
    fleetKicker: "Filo",
    fleetTitle: "Çalışılan gemi tipleri",
    skillsKicker: "Uzmanlık",
    skillsTitle: "Makine dairesinde ne yapılır",
    certsKicker: "Belgeler",
    certsTitle: "Sertifikalar ve eğitimler",
    memberTitle: "Üyelikler",
    zoomHint: "Belgeyi görmek için karta tıkla",
    seeDoc: "Belgeyi gör",
    closeTitle: "Bir sonraki sefer için konuşalım.",
    closeSub: "Görev, danışmanlık ve teknik iş birlikleri için ulaşın.",
    footer: "Murat Can Başkan · Uzakyol Baş Mühendisi",
    close: "Kapat",
    theme: "Tema",
    langTitle: "TR / EN",
    photoNote: "Gemi fotoğrafları temsilidir; bazıları üçüncü taraf kaynaklara aittir.",
  },
  en: {
    htmlTitle: "Murat Can Başkan — Ocean-Going Chief Engineer | bskn.tr",
    description:
      "Murat Can Başkan, Ocean-Going Chief Engineer. In the engine room since 2007: tankers, bulk carriers, capesize, Ro-Ro, powerships; ME-B and ME-C new-builds.",
    ogTitle: "Murat Can Başkan — Ocean-Going Chief Engineer",
    navCareer: "Career",
    navFleet: "Fleet",
    navSkills: "Expertise",
    navCerts: "Credentials",
    ctaCv: "Download CV",
    ctaCareer: "See the career",
    heroKicker: "Ocean-going Chief Engineer · ITU Maritime YDO’06",
    heroLead: (n: string) =>
      `In the engine room since 2007. From product tanker to capesize, from steam turbine to ME-C — ${n} posts, one discipline.`,
    heroStatus: "Current post · Chief Engineer",
    heroAlt: "Bulk carrier — engine and voyage indicators",
    statsKicker: "By the numbers",
    careerKicker: "Logbook",
    careerTitle: "From 2007 to today",
    careerHint: "Tap a post — the back of the card shows the vessel and details.",
    closeCard: "Close",
    fleetKicker: "Fleet",
    fleetTitle: "Vessel types worked",
    skillsKicker: "Expertise",
    skillsTitle: "What the engine room asks for",
    certsKicker: "Credentials",
    certsTitle: "Certificates and training",
    memberTitle: "Memberships",
    zoomHint: "Click a card to see the document",
    seeDoc: "View document",
    closeTitle: "Let’s talk about the next voyage.",
    closeSub: "For posts, consultancy and technical collaboration.",
    footer: "Murat Can Başkan · Ocean-going Chief Engineer",
    close: "Close",
    theme: "Theme",
    langTitle: "TR / EN",
    photoNote: "Vessel photos are representative; some belong to third-party sources.",
  },
} as const;

/** Görev sayısının yazıyla hali (kahraman metni için) */
export const NUMBER_WORDS: Record<Lang, Record<number, string>> = {
  tr: { 15: "on beş", 16: "on altı", 17: "on yedi", 18: "on sekiz", 19: "on dokuz", 20: "yirmi" },
  en: { 15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen", 20: "twenty" },
};

export type Copy = (typeof COPY)[Lang];
export const copyFor = (lang: Lang): Copy => COPY[lang];
