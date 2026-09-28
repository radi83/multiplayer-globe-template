/**
 * Sitedeki tüm içerik.
 *
 * Kaynak: Murat Can Başkan'ın güncel CV'si (public/cv/Murat_Can_Baskan_CV_EN.pdf).
 * Görev, yıl, gemi, sertifika ve üyelik bilgileri CV'den alınır; CV'de olmayan
 * bir iddia buraya eklenmez. Türkçe metinler CV'nin çevirisidir.
 * Sayılar (yıl, görev, gemi tipi) bu listeden hesaplanır; elle yazılmaz.
 */

export type Lang = "tr" | "en";
export type T = Record<Lang, string>;

export type VesselType = "tanker" | "bulk" | "capesize" | "roro" | "power" | "yard" | "shore";

export interface Photo {
  /** public/img altındaki dosya adı */
  src: string;
  w: number;
  h: number;
  alt: T;
}

export interface Post {
  id: string;
  /** Görünen yıl veya yıl aralığı, "2008–2010" gibi */
  years: string;
  type: VesselType;
  role: T;
  org: T;
  /** Gemi adları veya çalışma yeri. Boş olabilir. */
  vessel: string;
  text: T;
  tags: T[];
  photo?: Photo;
  current?: boolean;
  newBuildDelivery?: boolean;
}

export const PERSON = {
  name: "Murat Can Başkan",
  title: { tr: "Uzakyol Baş Mühendisi", en: "Ocean-Going Chief Engineer" } as T,
  phone: "+90 532 659 1923",
  email: "c@bskn.tr",
  location: { tr: "Kadıköy / İstanbul", en: "Kadıköy / Istanbul" } as T,
  site: "https://bskn.tr",
  projectSite: "https://bskn.net",
  cv: "cv/Murat_Can_Baskan_CV_EN.pdf",
};

export const TYPE_LABEL: Record<VesselType | "all", T> = {
  all: { tr: "Tümü", en: "All" },
  tanker: { tr: "Tanker", en: "Tanker" },
  bulk: { tr: "Dökme yük", en: "Bulk carrier" },
  capesize: { tr: "Capesize", en: "Capesize" },
  roro: { tr: "Ro-Ro", en: "Ro-Ro" },
  power: { tr: "Yüzer santral", en: "Powership" },
  yard: { tr: "Tersane", en: "Shipyard" },
  shore: { tr: "Kara / ofis", en: "Shore / office" },
};

/** Filo bölümünde gösterilen uzun adlar */
export const FLEET_NAME: Record<Exclude<VesselType, "shore">, T> = {
  tanker: { tr: "Ürün ve ham petrol tankeri", en: "Product & crude oil tanker" },
  bulk: { tr: "Dökme yük gemisi", en: "Bulk carrier" },
  capesize: { tr: "Capesize dökme yük", en: "Capesize bulk carrier" },
  roro: { tr: "Ro-Ro", en: "Ro-Ro" },
  power: { tr: "Yüzer enerji santrali", en: "Floating power plant" },
  yard: { tr: "Tersane ve havuz", en: "Shipyard & drydock" },
};

const t = (tr: string, en: string): T => ({ tr, en });
const photo = (src: string, w: number, h: number, tr: string, en: string): Photo => ({
  src,
  w,
  h,
  alt: t(tr, en),
});

/** Kronolojik sıra: en eski görev ilk sırada. */
export const CAREER: Post[] = [
  {
    id: "gan-sure",
    years: "2007",
    type: "tanker",
    role: t("3. Mühendis", "Third Engineer"),
    org: t("Dünya Denizcilik", "Dünya Shipping"),
    vessel: "M/T Gan Sure",
    text: t(
      "FRAMO ve inert gaz operasyonları; tanker ISM ve planlı bakım sistemlerinin hazırlanması ve takibi.",
      "FRAMO and inert-gas operations; preparation and follow-up of tanker ISM and planned-maintenance systems.",
    ),
    tags: [t("FRAMO", "FRAMO"), t("İnert gaz", "Inert gas"), t("ISM", "ISM"), t("Planlı bakım", "PMS")],
    photo: photo("gan-sure.webp", 960, 630, "M/T Gan Sure tankeri", "The tanker M/T Gan Sure"),
  },
  {
    id: "ditas",
    years: "2008–2010",
    type: "tanker",
    role: t("4. Mühendis", "Fourth Engineer"),
    org: t("Ditaş Denizcilik", "Ditaş Shipping"),
    vessel: "Ditaş · Cumhuriyet · T Sevgi",
    text: t(
      "Buhar türbinli kargo pompaları, kazanlar, inert gaz ve balast sistemlerinin işletilmesi; termal yağ kazanları, şaft jeneratörleri ve piç kontrollü pervanelerle deneyim.",
      "Operation of steam-turbine cargo pumps, boilers, inert-gas and ballast systems; experience with thermal-oil boilers, shaft generators and controllable-pitch propellers.",
    ),
    tags: [t("Buhar türbini", "Steam turbine"), t("Kazan", "Boilers"), t("Balast", "Ballast")],
    photo: photo("cumhuriyet.webp", 744, 531, "Cumhuriyet tankeri", "The tanker Cumhuriyet"),
  },
  {
    id: "gan-dignity",
    years: "2011",
    type: "tanker",
    role: t("3. Mühendis", "Third Engineer"),
    org: t("Dünya Denizcilik", "Dünya Shipping"),
    vessel: "M/T Gan Dignity",
    text: t(
      "Yeni inşa bir gemide gelişmiş buhar türbini sistemlerinin işletilmesi.",
      "Operation of advanced steam-turbine systems aboard a new-build vessel.",
    ),
    tags: [t("Yeni inşa", "New-build"), t("Buhar türbini", "Steam turbine")],
    photo: photo("gan-dignity.webp", 791, 469, "M/T Gan Dignity tankeri", "The tanker M/T Gan Dignity"),
  },
  {
    id: "tge",
    years: "2012",
    type: "yard",
    role: t("Pervane ve Şaft Mühendisi", "Propeller & Shaft Engineer"),
    org: t("TGE Tersanesi (Gemak Grubu)", "TGE Shipyard (Gemak Group)"),
    vessel: "",
    text: t(
      "Çift pervaneli, piç kontrollü gemilerde şaft bakımı; tersane iş programı, ekip koordinasyonu ve zaman planlaması.",
      "Shaft maintenance on twin-screw controllable-pitch vessels; yard scheduling, team coordination and time planning.",
    ),
    tags: [t("Şaft", "Shaft"), t("Pervane", "Propeller"), t("Tersane planlama", "Yard scheduling")],
  },
  {
    id: "alfa-laval",
    years: "2013",
    type: "shore",
    role: t("Servis Mühendisi", "Service Engineer"),
    org: t("Alfa Laval", "Alfa Laval"),
    vessel: "",
    text: t(
      "Gemi yardımcı makineleri ve kara tesisi ekipmanlarında saha servisi, bakım ve onarım.",
      "Field service, maintenance and repair of marine auxiliary machinery and land-based equipment.",
    ),
    tags: [t("Saha servisi", "Field service"), t("Yardımcı makineler", "Auxiliary machinery")],
  },
  {
    id: "densa",
    years: "2013–2014",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: t("Densa Denizcilik", "Densa Shipping"),
    vessel: "M/V Densa Sea Lion · Densa Lion",
    text: t(
      "Makine dairesinde ve güvertede bakım, onarım ve personel iş yönetimi.",
      "Maintenance, repair and personnel-work management in the engine room and on deck.",
    ),
    tags: [t("Bakım ve onarım", "Maintenance & repair"), t("İş yönetimi", "Work management")],
    photo: photo("densa-sea-lion.webp", 800, 549, "M/V Densa Sea Lion dökme yük gemisi", "The bulk carrier M/V Densa Sea Lion"),
  },
  {
    id: "dfds",
    years: "2015–2016",
    type: "roro",
    role: t("2. Mühendis", "Second Engineer"),
    org: t("DFDS", "DFDS"),
    vessel: "UN Marmara · UN Pendik · UN Atılım",
    text: t(
      "Çift dört zamanlı ana makineli ve piç kontrollü pervaneli Ro-Ro gemilerinde makine dairesi işletmesi ve manevra deneyimi.",
      "Engine-room operation and manoeuvring experience on Ro-Ro vessels with twin four-stroke main engines and controllable-pitch propellers.",
    ),
    tags: [t("Dört zamanlı", "Four-stroke"), t("Piç kontrollü pervane", "CPP"), t("Manevra", "Manoeuvring")],
    photo: photo("dfds.webp", 640, 356, "DFDS Ro-Ro gemisi", "A DFDS Ro-Ro vessel"),
  },
  {
    id: "karpowership",
    years: "2017",
    type: "power",
    role: t("Bakım Mühendisi", "Maintenance Engineer"),
    org: t("Karpowership", "Karpowership"),
    vessel: "Ayşegül Sultan · Osman Khan",
    text: t(
      "Wärtsilä V tipi jeneratör setleriyle donatılmış yüzer enerji santrallerinde planlı bakım, ekip liderliği, yedek parça koordinasyonu ve işletme.",
      "Planned maintenance, team leadership, spare-parts coordination and operation of floating power plants equipped with Wärtsilä V-type generator sets.",
    ),
    tags: [t("Wärtsilä", "Wärtsilä"), t("Jeneratör setleri", "Generator sets"), t("Yedek parça", "Spare parts")],
    photo: photo("karpowership.webp", 300, 225, "Karpowership yüzer enerji santrali", "A Karpowership floating power plant"),
  },
  {
    id: "sea-pioneer",
    years: "2018",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: t("Ya-Sa Denizcilik", "Ya-Sa Shipping"),
    vessel: "M/V Sea Pioneer",
    text: t(
      "Planlı bakım sistemi kapsamında ana makine bakımları.",
      "Performed main-engine maintenance within the planned-maintenance system.",
    ),
    tags: [t("Ana makine", "Main engine"), t("Planlı bakım", "PMS")],
    photo: photo("yasa.webp", 960, 714, "Ya-Sa filosundan bir dökme yük gemisi", "A bulk carrier of the Ya-Sa fleet"),
  },
  {
    id: "saadet-c",
    years: "2019",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: t("", ""),
    vessel: "M/V Saadet C",
    text: t(
      "Dört güverte vinçli dökme yük gemisinde ana makine ve vinç hidroliği bakımı.",
      "Main-engine and crane-hydraulic maintenance on a geared bulk carrier with four deck cranes.",
    ),
    tags: [t("Vinç hidroliği", "Crane hydraulics"), t("Ana makine", "Main engine")],
  },
  {
    id: "forest-panama",
    years: "2019–2020",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: t("Lider Grup", "Lider Group"),
    vessel: "M/V Forest Panama",
    text: t(
      "Geminin Türk ticaret filosuna girişine destek: devir teslim prosedürleri, belge yenileme ve ISM prosedürlerinin yeniden yapılandırılması.",
      "Supported the vessel’s entry into the Turkish merchant fleet, including handover procedures, document renewal and reconstruction of the ISM procedures.",
    ),
    tags: [t("Devir teslim", "Handover"), t("ISM", "ISM"), t("Belge yenileme", "Document renewal")],
  },
  {
    id: "bskn-net",
    years: "2020",
    type: "shore",
    role: t("Kurucu", "Founder"),
    org: t("BSKN NET", "BSKN NET"),
    vessel: "",
    text: t(
      "Denizcilik yazılımı girişimi; kullanıcı dostu denizcilik uygulamaları için pazar araştırması, rakip analizi ve ürün konumlandırma çalışmaları.",
      "Founded a marine-software initiative; conducted market research, competitor analysis and product-positioning work for user-friendly maritime applications.",
    ),
    tags: [t("Pazar araştırması", "Market research"), t("Ürün konumlandırma", "Product positioning")],
    photo: photo("bskn-net.webp", 960, 960, "BSKN NET logosu", "BSKN NET logo"),
  },
  {
    id: "ssi-providence",
    years: "2021",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: t("Densay Grup", "Densay Group"),
    vessel: "SSI Providence · ME-B",
    text: t(
      "Hyundai tersanesinden teslim alınan yeni inşa gemide makine devir teslimi, şirket ISM prosedürlerinin gemide uygulanması, otomasyon ve PMS işletmesi.",
      "On a new-build delivered from the Hyundai shipyard: machinery handover, shipboard implementation of company ISM procedures, automation and PMS operations.",
    ),
    tags: [t("MAN B&W ME-B", "MAN B&W ME-B"), t("Yeni inşa", "New-build"), t("Otomasyon", "Automation")],
    photo: photo("ssi-providence.webp", 570, 427, "SSI Providence dökme yük gemisi", "The bulk carrier SSI Providence"),
    newBuildDelivery: true,
  },
  {
    id: "beks-leo",
    years: "2022",
    type: "capesize",
    role: t("2. Mühendis", "Second Engineer"),
    org: t("Beks Denizcilik", "Beks Shipping"),
    vessel: "M/V Beks Leo",
    text: t(
      "2012 yapımı Capesize dökme yük gemisinin devralınması; beş yıllık havuzlama dönemi, bakım, sertifikasyon, raporlama ve AMSA liman devleti denetimi hazırlığının koordinasyonu.",
      "Took delivery of a 2012-built Capesize bulk carrier; coordinated the five-year dry-docking period, maintenance, certification, reporting and AMSA Port State preparation.",
    ),
    tags: [t("Capesize", "Capesize"), t("Havuzlama", "Dry-docking"), t("AMSA PSC", "AMSA PSC")],
    photo: photo("beks-leo.webp", 1200, 799, "M/V Beks Leo capesize dökme yük gemisi", "The capesize bulk carrier M/V Beks Leo"),
  },
  {
    id: "katya-atk",
    years: "2023",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: t("Nakkaş Denizcilik", "Nakkaş Shipping"),
    vessel: "Katya ATK",
    text: t(
      "Türk bayraklı bir geminin işletme ve kondisyonunun RightShip çerçevesinde iyileştirilmesi.",
      "Improved the operation and condition of a Turkish-flagged vessel within the RightShip framework.",
    ),
    tags: [t("RightShip", "RightShip"), t("Kondisyon", "Condition")],
    photo: photo("katya-atk.webp", 880, 440, "Katya ATK dökme yük gemisi", "The bulk carrier Katya ATK"),
  },
  {
    id: "yasa-neptune",
    years: "2024",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: t("Ya-Sa Denizcilik", "Ya-Sa Shipping"),
    vessel: "Ya-Sa Neptune · ME-C",
    text: t(
      "ME-C makineli yeni inşa gemi Çinli tersane ekibinden teslim alındı ve filoya entegre edildi.",
      "Took delivery of a new-build ME-C vessel from the Chinese shipyard team and integrated her into the fleet.",
    ),
    tags: [t("MAN B&W ME-C", "MAN B&W ME-C"), t("Yeni inşa", "New-build"), t("Teslim", "Delivery")],
    photo: photo("yasa-neptune.webp", 768, 522, "Ya-Sa Neptune dökme yük gemisi", "The bulk carrier Ya-Sa Neptune"),
    newBuildDelivery: true,
  },
  {
    id: "chief",
    years: "2025–2026",
    type: "bulk",
    role: t("Baş Mühendis", "Chief Engineer"),
    org: t("Türk bayraklı filo", "Turkish-flagged fleet"),
    vessel: "",
    text: t(
      "Makine departmanının yönetimi ve işletmesi; ekip koordinasyonu, planlı bakım, yakıt ve yağlama yağı yönetimi, klas sörveyleri ve bayrak denetimleri.",
      "Leadership and operation of the engine department; coordination of the team, planned maintenance, fuel and lubricating-oil management, class surveys and flag inspections.",
    ),
    tags: [t("Ekip yönetimi", "Team leadership"), t("Yakıt ve yağ", "Fuel & lube oil"), t("Klas / bayrak", "Class / flag")],
    photo: photo("turkish-flag.webp", 789, 524, "Türk bayrağı", "Turkish flag"),
    current: true,
  },
];

export const BMMS = {
  name: t("BMMS — Denizcilik Mühendisliği Bilgi Sistemi", "BMMS — Maritime Engineering Knowledge System"),
  text: t(
    "Paris MoU verilerini kullanan bir denizcilik teknolojisi uygulaması geliştiriliyor. Proje, PRU ARISTTO ön kuluçka programı ve Mentor Geliştirme ve Eğitim Programı ile destekleniyor; sıradaki adımlar kuluçka ve iniş (landing) aşamaları.",
    "Developing a maritime-technology application that uses Paris MoU data, supported by PRU ARISTTO through pre-incubation and the Mentor Development and Training Programme, with incubation and landing stages planned next.",
  ),
  photo: photo(
    "bmms.webp",
    1200,
    675,
    "BMMS tanıtım görseli: makine verisi panelleriyle bir dökme yük gemisi",
    "BMMS visual: a bulk carrier with engine data panels",
  ),
};

export interface SkillGroup {
  title: T;
  items: T[];
}

export const SKILLS: SkillGroup[] = [
  {
    title: t("Ana makine ve tahrik", "Main engine & propulsion"),
    items: [
      t("MAN B&W ME-B", "MAN B&W ME-B"),
      t("MAN B&W ME-C", "MAN B&W ME-C"),
      t("Çift dört zamanlı ana makine", "Twin four-stroke main engines"),
      t("Buhar türbini ve kazanlar", "Steam turbines & boilers"),
      t("Şaft, pervane ve piç kontrollü pervane", "Shaft, propeller & CPP"),
    ],
  },
  {
    title: t("Kargo ve yardımcı sistemler", "Cargo & auxiliary systems"),
    items: [
      t("FRAMO kargo pompaları", "FRAMO cargo pumping"),
      t("İnert gaz ve balast sistemleri", "Inert-gas & ballast systems"),
      t("Wärtsilä V tipi jeneratör setleri", "Wärtsilä V-type generator sets"),
      t("Vinç hidroliği", "Crane hydraulics"),
      t("Gavarnör ve Oil Mist Detector", "Governor & Oil Mist Detector"),
    ],
  },
  {
    title: t("Yönetim ve uygunluk", "Management & compliance"),
    items: [
      t("Makine departmanı yönetimi", "Engine department management"),
      t("Ekip ve kaynak liderliği", "Team & resource leadership"),
      t("Planlı bakım", "Planned maintenance"),
      t("Yakıt ve yağlama yağı yönetimi", "Fuel & lubricating-oil management"),
      t("Yedek parça tedariki", "Spare-parts procurement"),
      t("Tersane ve yeni inşa teslimi", "Shipyard & new-build delivery"),
      t("Klas ve bayrak denetimleri", "Class / flag inspections"),
      t("ISM, RightShip, liman devleti hazırlığı", "ISM, RightShip, port state preparation"),
    ],
  },
];

export interface Credential {
  title: T;
  issuer: T;
  date: T;
  note?: T;
  pending?: boolean;
}

export const CERTIFICATES: Credential[] = [
  {
    title: t("Mentor Geliştirme ve Eğitim Programı", "Mentor Development and Training Programme"),
    issuer: t("PRU ARISTTO", "PRU ARISTTO"),
    date: t("21–25 Eylül 2026", "21–25 September 2026"),
    pending: true,
  },
  {
    title: t("Yüzyılımızda Türkiye’nin Güvenlik Mimarisi", "Türkiye’s Security Architecture in Our Century"),
    issuer: t("Dış Politika Enstitüsü", "Foreign Policy Institute"),
    date: t("14 Eylül 2026", "14 September 2026"),
    pending: true,
  },
  {
    title: t("LSA ve FFE Eğitimi", "LSA & FFE Training"),
    issuer: t("Delmar Academy", "Delmar Academy"),
    date: t("14 Ağustos 2026", "14 August 2026"),
    note: t("DA-BST-M02-1034", "DA-BST-M02-1034"),
  },
  {
    title: t("Karbon Yakalama", "Carbon Capture"),
    issuer: t("GEMİMO", "GEMİMO"),
    date: t("Haziran 2026", "June 2026"),
  },
  {
    title: t("VLSFO Standartları", "VLSFO Standards"),
    issuer: t("İlkfer Grup", "İlkfer Group"),
    date: t("Haziran 2026", "June 2026"),
  },
  {
    title: t("YÖKDİL İngilizce", "YÖKDİL English"),
    issuer: t("ÖSYM", "ÖSYM"),
    date: t("Mayıs 2026", "May 2026"),
  },
  {
    title: t("OPRC Introduction", "OPRC Introduction"),
    issuer: t("IMO", "IMO"),
    date: t("", ""),
  },
  {
    title: t("MARPOL Annex V", "MARPOL Annex V"),
    issuer: t("IMO", "IMO"),
    date: t("", ""),
  },
  {
    title: t("Gavarnör ve OMD Eğitimi", "Governor & OMD Training"),
    issuer: t("GEMİMO / Tamay Corp.", "GEMİMO / Tamay Corp."),
    date: t("", ""),
  },
];

export interface Membership {
  short: string;
  name: T;
  role: T;
  history?: T;
}

export const MEMBERSHIPS: Membership[] = [
  {
    short: "UYBM",
    name: t("Uzakyol Baş Mühendisleri Derneği", "Association of Ocean-Going Chief Engineers"),
    role: t("Genel Kurul Üyesi", "General Assembly Member"),
  },
  {
    short: "GEMİMO",
    name: t("Gemi Makineleri İşletme Mühendisleri Odası · TMMOB", "Chamber of Marine Engineers · TMMOB"),
    role: t("Üye", "Member"),
  },
  {
    short: "DEFAMED",
    name: t("İTÜ Denizcilik Fakültesi Mezunları Derneği", "ITU Maritime Faculty Alumni Association"),
    role: t("Üye", "Member"),
  },
  {
    short: "IMarEST",
    name: t("Institute of Marine Engineering, Science & Technology", "Institute of Marine Engineering, Science & Technology"),
    role: t("MIMarEST · IMarEng · 2026", "MIMarEST · IMarEng · 2026"),
    history: t("Pre-Member · 2024", "Pre-Member · 2024"),
  },
];

export const EDUCATION = [
  {
    school: t("İstanbul Teknik Üniversitesi", "Istanbul Technical University"),
    detail: t("Gemi Makineleri İşletme Mühendisliği · YDO’06", "Marine Engineering · YDO’06"),
    years: "2002–2007",
  },
  {
    school: t("İçel Anadolu Lisesi", "İçel Anatolian High School"),
    detail: t("", ""),
    years: "1999–2001",
  },
];

export const LANGUAGES: T[] = [t("Türkçe", "Turkish"), t("İngilizce", "English")];

/* ---------- Türetilen değerler ---------- */

const firstYear = (p: Post): number => Number(p.years.slice(0, 4));
const lastYear = (p: Post): number => Number(p.years.slice(-4));

export const START_YEAR = Math.min(...CAREER.map(firstYear));
export const END_YEAR = Math.max(...CAREER.map(lastYear));

export interface Stat {
  value: number;
  label: T;
}

export const STATS: Stat[] = [
  { value: END_YEAR - START_YEAR, label: t("Yıl sektörde", "Years in the field") },
  { value: CAREER.length, label: t("Görev", "Posts") },
  {
    value: new Set(CAREER.map((p) => p.type).filter((k) => k !== "shore")).size,
    label: t("Gemi ve tesis tipi", "Vessel & plant types"),
  },
  {
    value: CAREER.filter((p) => p.newBuildDelivery).length,
    label: t("Yeni inşa teslim alma", "New-build deliveries"),
  },
];

/** Her tip için görev yılı aralığı (ör. "2013–2026") */
export function fleetRanges(): { type: Exclude<VesselType, "shore">; range: string }[] {
  const order: Exclude<VesselType, "shore">[] = ["tanker", "bulk", "capesize", "roro", "power", "yard"];
  return order
    .map((type) => {
      const posts = CAREER.filter((p) => p.type === type);
      if (posts.length === 0) return null;
      const a = Math.min(...posts.map(firstYear));
      const b = Math.max(...posts.map(lastYear));
      return { type, range: a === b ? String(a) : `${a}–${b}` };
    })
    .filter((x): x is { type: Exclude<VesselType, "shore">; range: string } => x !== null);
}
