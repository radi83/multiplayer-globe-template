/**
 * Sitedeki tüm içerik.
 *
 * Görünüm ve metinler eski bskn.tr sitesinden (Claude Design, 59d204b7) alınmıştır.
 * Görev yılları, gemiler, sertifikalar ve üyelikler güncel CV'ye göre düzeltilmiştir
 * (public/cv/Murat_Can_Baskan_CV_EN.pdf). CV'de olmayan yeni bir iddia eklenmez.
 * Sayılar (yıl, görev, şirket, gemi tipi) bu listeden hesaplanır.
 */

export type Lang = "tr" | "en";
export type T = Record<Lang, string>;

export type VesselType = "tanker" | "bulk" | "capesize" | "roro" | "power" | "yard" | "shore";

export interface Post {
  id: string;
  /** Görünen yıl veya yıl aralığı, "2008–2010" gibi */
  years: string;
  type: VesselType;
  role: T;
  /** Şirket adı; boşsa gösterilmez */
  org: string;
  /** "Armatör & şirket" sayısında kullanılan anahtar. Adı bilinmeyen işveren için boş. */
  orgKey: string;
  /** Gemi adları veya çalışma yeri */
  ship: string;
  /** Gemi/yer adı Türkçe bir ifadeyse "tr" (büyük harf dönüşümü için) */
  shipLang?: Lang;
  /** Kartın ön yüzündeki kısa özet */
  short: T;
  /** Kartın arka yüzündeki açıklama */
  long: T;
  tags: string[];
  /** public/img altındaki görsel */
  img?: string;
  current?: boolean;
}

export const PERSON = {
  name: "Murat Can Başkan",
  phone: "+90 532 659 1923",
  email: "c@bskn.tr",
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

export const FLEET_NAME: Record<Exclude<VesselType, "shore">, T> = {
  tanker: { tr: "Ürün & ham petrol tankeri", en: "Product & crude oil tanker" },
  bulk: { tr: "Dökme yük gemisi", en: "Bulk carrier" },
  capesize: { tr: "Capesize", en: "Capesize" },
  roro: { tr: "Ro-Ro", en: "Ro-Ro" },
  power: { tr: "Yüzer enerji santrali", en: "Powership" },
  yard: { tr: "Tersane & havuz", en: "Shipyard & drydock" },
};

const t = (tr: string, en: string): T => ({ tr, en });

/** Kronolojik sıra: en eski görev ilk sırada. */
export const CAREER: Post[] = [
  {
    id: "gansure",
    years: "2007",
    type: "tanker",
    role: t("3. Mühendis", "Third Engineer"),
    org: "Dünya Denizcilik",
    orgKey: "dunya",
    ship: "Gan Sure",
    short: t("FRAMO kargo pompaları, inert gaz sistemi, ISM hazırlığı.", "FRAMO cargo pumps, inert gas system, ISM preparation."),
    long: t(
      "Denizdeki ilk görev, bir ürün tankerinde. FRAMO hidrolik kargo pompa sistemi, inert gaz jeneratörü ve yardımcı makinelerin işletmesi; ISM denetimine hazırlık sürecinde ekiple birlikte çalışma.",
      "First seagoing post, on a product tanker. Operating the FRAMO hydraulic cargo pumping system, the inert gas generator and the auxiliaries; working with the team through ISM audit preparation.",
    ),
    tags: ["FRAMO", "İnert gaz", "ISM"],
    img: "gan-sure.webp",
  },
  {
    id: "cumhuriyet",
    years: "2008–2010",
    type: "tanker",
    role: t("4. Mühendis", "Fourth Engineer"),
    org: "Ditaş Denizcilik",
    orgKey: "ditas",
    ship: "Ditaş · Cumhuriyet · T Sevgi",
    short: t("Buhar türbini kargo pompası, kazan bakımı.", "Steam turbine cargo pumps, boiler maintenance."),
    long: t(
      "Ham petrol tankerlerinde iki yıllık dönem. Buhar türbini tahrikli kargo pompaları, kazanlar, inert gaz ve balast sistemlerinin işletmesi; termal yağ kazanı, şaft jeneratörü ve piç kontrollü pervane deneyimi.",
      "Two years on crude oil tankers: steam-turbine driven cargo pumps, boilers, inert-gas and ballast systems; experience with thermal-oil boilers, shaft generators and controllable-pitch propellers.",
    ),
    tags: ["Buhar türbini", "Ana kazan", "Kargo pompası"],
    img: "cumhuriyet.webp",
  },
  {
    id: "gandignity",
    years: "2011",
    type: "tanker",
    role: t("3. Mühendis", "Third Engineer"),
    org: "Dünya Denizcilik",
    orgKey: "dunya",
    ship: "Gan Dignity",
    short: t("Yeni yapım buhar türbini operasyonu.", "New-build steam turbine operation."),
    long: t(
      "Yeni inşa tankerin buhar türbini sisteminin devreye alınması ve garanti dönemi operasyonu; tersane teslim listesinin makine dairesi tarafındaki takibi.",
      "Commissioning the steam turbine system of a new-build tanker and running it through the guarantee period; following the yard’s delivery list on the engine-room side.",
    ),
    tags: ["Yeni inşa", "Buhar türbini", "Garanti dönemi"],
    img: "gan-dignity.webp",
  },
  {
    id: "gemak",
    years: "2012",
    type: "yard",
    role: t("Pervane / Şaft Mühendisi", "Propeller / Shaft Engineer"),
    org: "TGE",
    orgKey: "tge",
    ship: "Gemak Tersanesi", shipLang: "tr",
    short: t("Çift pervaneli gemide şaft ve pervane bakımı.", "Shaft and propeller work on a twin-screw vessel."),
    long: t(
      "Havuzlama sürecinde çift pervaneli, piç kontrollü gemilerde şaft bakımı; tersane iş programı, ekip koordinasyonu ve zaman planlaması. Karadan bakıldığında makine dairesinin nasıl göründüğünü öğreten dönem.",
      "Drydock period on twin-screw controllable-pitch vessels: shaft maintenance, yard scheduling, team coordination and time planning. The period that showed what the engine room looks like from the yard side.",
    ),
    tags: ["Havuzlama", "Şaft", "Pervane"],
    img: "gemak.webp",
  },
  {
    id: "alfalaval",
    years: "2013",
    type: "shore",
    role: t("Servis Mühendisi", "Service Engineer"),
    org: "Alfa Laval",
    orgKey: "alfalaval",
    ship: "Saha servisi", shipLang: "tr",
    short: t("Gemi yardımcı makinelerinde saha servisi.", "Field service on marine auxiliaries."),
    long: t(
      "Gemi yardımcı makineleri ve kara tesisi ekipmanlarında saha servisi, bakım ve onarım. Farklı armatörlerin makine dairelerini tek bir üretici gözüyle görmek.",
      "Field service, maintenance and repair of marine auxiliary machinery and land-based equipment — seeing many owners’ engine rooms through one maker’s eyes.",
    ),
    tags: ["Separatör", "Devreye alma", "Arıza tespiti"],
    img: "alfa-laval.webp",
  },
  {
    id: "densa",
    years: "2013–2014",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: "Densa Denizcilik",
    orgKey: "densa",
    ship: "Densa Sea Lion · Densa Lion",
    short: t("Makine dairesi planlı bakım ve onarım süreçleri.", "Planned maintenance and repair in the engine room."),
    long: t(
      "Dökme yük filosunda ikinci mühendis: makine dairesinde ve güvertede bakım, onarım ve personel iş yönetimi.",
      "Second engineer in a bulk fleet: maintenance, repair and personnel-work management in the engine room and on deck.",
    ),
    tags: ["Planlı bakım", "Onarım", "İş yönetimi"],
    img: "densa-sea-lion.webp",
  },
  {
    id: "dfds",
    years: "2015–2016",
    type: "roro",
    role: t("2. Mühendis", "Second Engineer"),
    org: "DFDS",
    orgKey: "dfds",
    ship: "UN Marmara · UN Pendik · UN Atılım",
    short: t("Dört zamanlı ana makine, yoğun ro-ro hattı.", "Four-stroke main engines, dense ro-ro schedule."),
    long: t(
      "Çift dört zamanlı ana makineli ve piç kontrollü pervaneli Ro-Ro gemilerinde ikinci mühendis. Kısa liman aralıklarına sığan bakım planlaması ve manevra deneyimi.",
      "Second engineer on Ro-Ro vessels with twin four-stroke main engines and controllable-pitch propellers. Maintenance planned to fit short port windows; manoeuvring experience.",
    ),
    tags: ["Dört zamanlı", "Piç kontrollü pervane", "Hat operasyonu"],
    img: "dfds.webp",
  },
  {
    id: "karpower",
    years: "2017",
    type: "power",
    role: t("Bakım Mühendisi", "Maintenance Engineer"),
    org: "Karpowership",
    orgKey: "karpower",
    ship: "Ayşegül Sultan · Osman Khan",
    short: t("Yüzer enerji santralinde jeneratör bakımı.", "Generator maintenance on a floating power plant."),
    long: t(
      "Wärtsilä V tipi jeneratör setleriyle donatılmış yüzer santrallerde planlı bakım, ekip liderliği, yedek parça koordinasyonu ve işletme. Gemi değil santral disiplini: süreklilik esas.",
      "Planned maintenance, team leadership, spare-parts coordination and operation of floating power plants with Wärtsilä V-type generator sets. Not a ship’s discipline but a power plant’s: continuity first.",
    ),
    tags: ["Wärtsilä", "Jeneratör", "Süreklilik"],
    img: "karpowership.webp",
  },
  {
    id: "seapioneer",
    years: "2018",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: "Ya-Sa Denizcilik",
    orgKey: "yasa",
    ship: "Sea Pioneer",
    short: t("Planlı bakım sistemi içinde ana makine bakımı.", "Main-engine maintenance within the PMS."),
    long: t(
      "Dökme yük gemisinde ikinci mühendis: planlı bakım sistemi kapsamında ana makine bakımlarının yürütülmesi.",
      "Second engineer on a bulk carrier: main-engine maintenance carried out within the planned-maintenance system.",
    ),
    tags: ["Ana makine", "Planlı bakım"],
    img: "yasa.webp",
  },
  {
    id: "saadetc",
    years: "2019",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: "",
    orgKey: "",
    ship: "Saadet C",
    short: t("Vinçli dökme yük gemisinde ana makine ve vinç hidroliği.", "Main engine and crane hydraulics on a geared bulker."),
    long: t(
      "Dört güverte vinçli dökme yük gemisinde ana makine ve vinç hidrolik sistemlerinin bakımı.",
      "Main-engine and crane-hydraulic maintenance on a geared bulk carrier with four deck cranes.",
    ),
    tags: ["Vinç hidroliği", "Ana makine"],
  },
  {
    id: "forestpanama",
    years: "2019–2020",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: "Lider Denizcilik",
    orgKey: "lider",
    ship: "Forest Panama",
    short: t("Türk bayrağına geçiş, ISM prosedürleri, belge yenileme.", "Entry into the Turkish fleet, ISM procedures, documents."),
    long: t(
      "Geminin Türk ticaret filosuna girişine destek: devir teslim prosedürleri, belge yenileme ve ISM prosedürlerinin yeniden yapılandırılması.",
      "Supported the vessel’s entry into the Turkish merchant fleet: handover procedures, document renewal and reconstruction of the ISM procedures.",
    ),
    tags: ["Devir teslim", "ISM", "Belge yenileme"],
  },
  {
    id: "bskn",
    years: "2020",
    type: "shore",
    role: t("Kurucu", "Founder"),
    org: "Kendi girişimi",
    orgKey: "bskn",
    ship: "BSKN NET",
    short: t("Denizcilik yazılımları girişimi.", "Maritime software venture."),
    long: t(
      "Kullanıcı dostu denizcilik uygulamaları için pazar araştırması, rakip analizi ve ürün konumlandırma. Makine dairesinde tutulan kaydın karada işe yarar hale gelmesi üzerine kurulu bir fikir.",
      "Market research, competitor analysis and product positioning for user-friendly maritime applications — built on the idea that the record kept in the engine room should be useful ashore.",
    ),
    tags: ["Pazar araştırması", "Ürün konumlandırma"],
    img: "bskn-net.webp",
  },
  {
    id: "densay",
    years: "2021",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: "Densay Shipping",
    orgKey: "densay",
    ship: "SSI Providence · Hyundai",
    short: t("ME-B makineli yeni inşa geminin devralınması.", "Taking over an ME-B powered new-build."),
    long: t(
      "Hyundai tersanesinden teslim alınan yeni inşa gemide makine devir teslimi, şirket ISM prosedürlerinin gemide uygulanması, otomasyon ve PMS işletmesi.",
      "On a new-build delivered from the Hyundai shipyard: machinery handover, shipboard implementation of company ISM procedures, automation and PMS operations.",
    ),
    tags: ["ME-B", "Yeni inşa", "Otomasyon"],
    img: "ssi-providence.webp",
  },
  {
    id: "beks",
    years: "2022",
    type: "capesize",
    role: t("2. Mühendis", "Second Engineer"),
    org: "Beks Denizcilik",
    orgKey: "beks",
    ship: "Beks Leo",
    short: t("Capesize devralımı, beş yıllık klas yenileme.", "Capesize takeover, five-year class renewal."),
    long: t(
      "2012 yapımı capesize dökme yük gemisinin devralınması; beş yıllık havuzlama dönemi, bakım, sertifikasyon, raporlama ve AMSA liman devleti denetimine hazırlık.",
      "Taking over a 2012-built capesize bulk carrier; coordinating the five-year dry-docking period, maintenance, certification, reporting and AMSA Port State preparation.",
    ),
    tags: ["Capesize", "Klas yenileme", "AMSA"],
    img: "beks-leo.webp",
  },
  {
    id: "nakkas",
    years: "2023",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: "Nakkaş Denizcilik",
    orgKey: "nakkas",
    ship: "Katya ATK",
    short: t("RightShip standartlarında operasyon iyileştirme.", "Operations lifted to RightShip standards."),
    long: t(
      "Türk bayraklı bir geminin işletme ve kondisyonunun RightShip çerçevesinde iyileştirilmesi.",
      "Improving the operation and condition of a Turkish-flagged vessel within the RightShip framework.",
    ),
    tags: ["RightShip", "Denetim", "İyileştirme"],
    img: "katya-atk.webp",
  },
  {
    id: "yasaneptune",
    years: "2024",
    type: "bulk",
    role: t("2. Mühendis", "Second Engineer"),
    org: "Ya-Sa Denizcilik",
    orgKey: "yasa",
    ship: "Yasa Neptune",
    short: t("ME-C makineli yeni inşa geminin teslim alınması.", "Delivery of an ME-C powered new-build."),
    long: t(
      "MAN B&W ME-C elektronik kontrollü ana makineli yeni inşa geminin Çinli tersane ekibinden teslim alınması ve filoya entegrasyonu.",
      "Taking delivery of a new-build with a MAN B&W ME-C electronically controlled main engine from the Chinese shipyard team, and integrating her into the fleet.",
    ),
    tags: ["ME-C", "Yeni inşa", "Teslim"],
    img: "yasa-neptune.webp",
  },
  {
    id: "chief",
    years: "2025–2026",
    type: "bulk",
    role: t("Baş Mühendis", "Chief Engineer"),
    org: "Denizcilik sektörü",
    orgKey: "",
    ship: "Türk bayrağı altında", shipLang: "tr",
    short: t("Makine dairesinin sevk ve idaresi.", "Command of the engine department."),
    long: t(
      "Ekip yönetimi, planlı bakım, yakıt ve yağ yönetimi, klas ve bayrak denetimleri — on dokuz yılın toplandığı yer.",
      "Team leadership, planned maintenance, fuel and lube management, class and flag inspections — where nineteen years come together.",
    ),
    tags: ["Ekip yönetimi", "Yakıt yönetimi", "Denetim"],
    img: "turkish-flag.webp",
    current: true,
  },
];

export interface SkillGroup {
  title: T;
  items: T[];
}

export const SKILLS: SkillGroup[] = [
  {
    title: t("Ana makine & tahrik", "Main engine & propulsion"),
    items: [
      t("MAN B&W ME-B", "MAN B&W ME-B"),
      t("MAN B&W ME-C", "MAN B&W ME-C"),
      t("Dört zamanlı ana makine", "Four-stroke main engine"),
      t("Buhar türbini & ana kazan", "Steam turbine & main boiler"),
      t("Şaft & pervane bakımı", "Shaft & propeller work"),
    ],
  },
  {
    title: t("Kargo & yardımcı sistemler", "Cargo & auxiliary systems"),
    items: [
      t("FRAMO kargo pompa sistemi", "FRAMO cargo pumping"),
      t("İnert gaz sistemi", "Inert gas system"),
      t("Alfa Laval separatör", "Alfa Laval separators"),
      t("Vinç hidroliği", "Crane hydraulics"),
      t("Gavarnör & Oil Mist Detector", "Governor & Oil Mist Detector"),
    ],
  },
  {
    title: t("Yönetim & uygunluk", "Management & compliance"),
    items: [
      t("ISM & klas sörveyleri", "ISM & class surveys"),
      t("RightShip denetimi", "RightShip inspection"),
      t("Yeni inşa devralma", "New-build takeover"),
      t("VLSFO yakıt yönetimi", "VLSFO fuel management"),
      t("MARPOL Annex V", "MARPOL Annex V"),
      t("Karbon yakalama", "Carbon capture"),
    ],
  },
];

export interface Credential {
  title: string;
  when: T;
  desc: T;
  /** public/uploads altındaki belge görseli; yoksa "Belgeyi gör" gösterilmez */
  img?: string;
}

export const CERTIFICATES: Credential[] = [
  {
    title: "Mentor Development and Training Programme",
    when: t("PRU ARISTTO · Eylül 2026", "PRU ARISTTO · September 2026"),
    desc: t("21–25 Eylül 2026. Sertifika bekleniyor.", "21–25 September 2026. Certificate pending."),
  },
  {
    title: "Türkiye’s Security Architecture in Our Century",
    when: t("Dış Politika Enstitüsü · Eylül 2026", "Foreign Policy Institute · September 2026"),
    desc: t("14 Eylül 2026. Sertifika bekleniyor.", "14 September 2026. Certificate pending."),
  },
  {
    title: "LSA & FFE Training",
    when: t("Delmar Academy · Ağustos 2026", "Delmar Academy · August 2026"),
    desc: t("Can kurtarma ve yangınla mücadele donanımı. Belge no DA-BST-M02-1034.", "Life-saving and fire-fighting equipment. Certificate DA-BST-M02-1034."),
  },
  {
    title: "YÖKDİL İngilizce",
    when: t("ÖSYM · Mayıs 2026", "ÖSYM · May 2026"),
    desc: t("Bakanlığın istediği puanla başarıyla geçildi.", "Passed with the score required by the ministry."),
    img: "yokdil.jpg",
  },
  {
    title: "Carbon Capture",
    when: t("GEMİMO · Haziran 2026", "GEMİMO · June 2026"),
    desc: t("Gemilerde karbon yakalama sistemleri sertifikası.", "Onboard carbon capture systems certificate."),
    img: "gemimo.png",
  },
  {
    title: "VLSFO Standartları",
    when: t("İlkfer Grup · Haziran 2026", "İlkfer Group · June 2026"),
    desc: t("Yakıtlarda standartlar ve uygulama eğitimi.", "Fuel standards and application training."),
    img: "ilkfer.jpg",
  },
  {
    title: "OPRC Introduction",
    when: t("IMO onaylı", "IMO approved"),
    desc: t("Oil Pollution Preparedness, Response and Cooperation.", "Oil Pollution Preparedness, Response and Cooperation."),
    img: "imo.jpeg",
  },
  {
    title: "MARPOL Annex V",
    when: t("IMO onaylı", "IMO approved"),
    desc: t("Gemilerden kaynaklanan kirliliğin önlenmesi.", "Prevention of pollution from ships."),
    img: "imo.jpeg",
  },
  {
    title: "Gavarnör & OMD",
    when: t("GEMİMO / Tamay Corp.", "GEMİMO / Tamay Corp."),
    desc: t("Gavarnör arıza tespiti ve Oil Mist Detector kursu.", "Governor fault diagnosis and Oil Mist Detector course."),
    img: "gemimo.png",
  },
];

export interface Membership {
  short: string;
  role: T;
  name: T;
  img?: string;
}

export const MEMBERSHIPS: Membership[] = [
  {
    short: "UYBM",
    role: t("Genel Kurul Üyesi", "General Assembly Member"),
    name: t("Uzakyol Baş Mühendisler Derneği", "Association of Ocean-Going Chief Engineers"),
    img: "uybm.png",
  },
  {
    short: "GEMİMO",
    role: t("Üye", "Member"),
    name: t("Gemi Makineleri İşletme Mühendisleri Odası · TMMOB", "Chamber of Marine Engineers · TMMOB"),
    img: "gemimo2.png",
  },
  {
    short: "DEFAMED",
    role: t("Üye", "Member"),
    name: t("İTÜ Denizcilik Fakültesi Mezunları Derneği", "ITU Maritime Faculty Alumni Association"),
    img: "defamed.jpg",
  },
  {
    short: "IMarEST",
    role: t("MIMarEST · IMarEng · 2026", "MIMarEST · IMarEng · 2026"),
    name: t(
      "Institute of Marine Engineering, Science & Technology · Pre-Member 2024",
      "Institute of Marine Engineering, Science & Technology · Pre-Member 2024",
    ),
    img: "imarest.jpg",
  },
];

/* ---------- Türetilen değerler ---------- */

const firstYear = (p: Post): number => Number(p.years.slice(0, 4));
const lastYear = (p: Post): number => Number(p.years.slice(-4));

export const START_YEAR = Math.min(...CAREER.map(firstYear));
export const END_YEAR = Math.max(...CAREER.map(lastYear));

export const STATS: { value: number; label: T }[] = [
  { value: END_YEAR - START_YEAR, label: t("Yıl sektörde", "Years in the field") },
  { value: CAREER.length, label: t("Görev", "Posts") },
  {
    value: new Set(CAREER.map((p) => p.orgKey).filter(Boolean)).size,
    label: t("Armatör & şirket", "Owners & companies"),
  },
  {
    value: new Set(CAREER.map((p) => p.type).filter((k) => k !== "shore")).size,
    label: t("Gemi tipi", "Vessel types"),
  },
];

/** Her tip için görev yılı aralığı (ör. "2013–2026") */
export function fleetRanges(): { type: Exclude<VesselType, "shore">; range: string }[] {
  const order: Exclude<VesselType, "shore">[] = ["tanker", "bulk", "capesize", "roro", "power", "yard"];
  const out: { type: Exclude<VesselType, "shore">; range: string }[] = [];
  for (const type of order) {
    const posts = CAREER.filter((p) => p.type === type);
    if (posts.length === 0) continue;
    const a = Math.min(...posts.map(firstYear));
    const b = Math.max(...posts.map(lastYear));
    out.push({ type, range: a === b ? String(a) : `${a}–${b}` });
  }
  return out;
}
