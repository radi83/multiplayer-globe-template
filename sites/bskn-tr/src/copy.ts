import type { Lang } from "./data.ts";

/** Arayüz metinleri — BSKN.tr modüler portfolyo sistemi. */
const COPY = {
  tr: {
    htmlTitle: "Murat Can Başkan — Uzakyol Gemi Baş Mühendisi · Denizcilik Teknolojisti",
    description:
      "Murat Can Başkan, Uzakyol Gemi Baş Mühendisi ve Denizcilik Teknolojisti. 20 yıllık makine dairesi liderliği, BMMS denizcilik teknolojileri ve kanıta dayalı mühendislik karar sistemleri.",
    ogTitle: "Murat Can Başkan — Uzakyol Gemi Baş Mühendisi",
    
    // Header
    brand: "BSKN.tr",
    name: "Murat Can Başkan",
    role: "Uzakyol Gemi Baş Mühendisi",
    tagline: "Denizcilik Teknolojisti · Maritime Technology Entrepreneur",
    cvBtn: "CV",
    themeToggle: "Tema değiştir",
    langSwitch: "EN",
    langSwitchTitle: "English version",
    langSwitchPath: "/en/",

    // Dismiss & UI
    dismissHint: "ESC veya dışarı tıklayarak kapatın",
    close: "Kapat",
    seeDoc: "Belgeyi Gör",
    zoomHint: "Büyütmek için tıklayın",
    footerText: "Murat Can Başkan · Uzakyol Gemi Baş Mühendisi · Denizcilik Teknolojisti",

    // 10 Modül Başlık ve Açıklamaları (Kapalı Kartlar)
    cards: {
      c01: {
        num: "01 · PROFİL",
        title: "Sistem bakışıyla mühendislik.",
        sub: "Sistemler, güvenilirlik ve teknolojiyle şekillenen deniz tecrübesi.",
      },
      c02: {
        num: "02 · DENİZ TECRÜBESİ",
        title: "Denizde yirmi yıllık mühendislik.",
        sub: "Tanker makinelerinden Baş Mühendis liderliğine.",
      },
      c03: {
        num: "03 · MESLEKİ KAYIT",
        title: "Mesleki tanınırlık.",
        sub: "IMarEST · IEng / IMarEng",
      },
      c04: {
        num: "04 · DENİZCİLİK TEKNOLOJİSİ",
        title: "Sistemler. Operasyonlar. Güvenilirlik.",
        sub: "Saha gerçekleriyle şekillenen mühendislik teknolojisi.",
      },
      c05: {
        num: "05 · BMMS / GİRİŞİMCİLİK",
        title: "Kanıta dayalı denizcilik teknolojisi.",
        sub: "Karar zekâsına dönüşen mühendislik tecrübesi.",
      },
      c06: {
        num: "06 · EĞİTİM",
        title: "Mühendislik temelleri.",
        sub: "İTÜ Denizcilik Fakültesi",
      },
      c07: {
        num: "07 · BELGELER & EĞİTİMLER",
        title: "Sürekli mesleki gelişim.",
        sub: "Teknik eğitim · Emniyet · Teknoloji",
      },
      c08: {
        num: "08 · ÜYELİKLER",
        title: "Mesleki ağ.",
        sub: "UYBM · GEMİMO · DEFAMED · IMarEST",
      },
      c09: {
        num: "09 · PROJELER & TEKNOLOJİ",
        title: "Uygulamalı sistemler ve teknoloji.",
        sub: "Denizcilik sistemleri · Kanıt · Karar desteği",
      },
      c10: {
        num: "10 · İLETİŞİM",
        title: "Nitelikli bir görüşme başlatın.",
        sub: "Mühendislik · Teknoloji · İş birliği",
      },
    },

    // Açık Modül Metinleri
    profile: {
      seaTitle: "SEA · Deniz & Saha Operasyonları",
      seaDesc:
        "2007'den bu yana küresel deniz ticaretinde; ürün tankerlerinden capesize dökme yük gemilerine, Ro-Ro'lardan yüzer enerji santrallerine (Powership) ve tersane havuzlamalarına uzanan 20 yıllık makine dairesi operasyonu ve Baş Mühendis liderliği.",
      systemsTitle: "SYSTEMS · Makineler, Güvenilirlik & Yönetim",
      systemsDesc:
        "MAN B&W ME-B ve ME-C iki zamanlı elektronik ana makineler, dört zamanlı dizel jeneratörler, buhar kazanları, FRAMO kargo hidroliği, şaft ve sevk sistemleri, planlı bakım sistemleri (PMS), arıza analizi ve sıfır duruş hedefli güvenilirlik yönetimi.",
      techTitle: "TECHNOLOGY · Denizcilik Teknolojisi & Karar Destek",
      techDesc:
        "Gemi makineleri işletme disiplinini kanıta dayalı karar destek mimarilerine, dijital ikiz yaklaşımlarına ve operasyonel bilgi sistemlerine dönüştüren teknoloji girişimciliği ve Ar-Ge çalışmaları.",
      highlights: [
        { label: "Sektör Tecrübesi", val: "20 Yıl (2007–2026)" },
        { label: "Sefer & Görev Sayısı", val: "17 Deniz / Tersane Görevi" },
        { label: "Mezuniyet & Fakülte", val: "İTÜ Denizcilik Fakültesi YDO'06" },
        { label: "Mesleki Tanınırlık", val: "IMarEST · IEng / IMarEng Sürecinde" },
      ],
    },

    career: {
      title: "Denizde Yirmi Yıllık Mühendislik",
      sub: "2007'den günümüze uzanan operasyonel sefer defteri ve Baş Mühendislik liderliği.",
      filterAll: "Tümü",
      statsYears: "Yıl Sektörde",
      statsPosts: "Görev",
      statsCompanies: "Armatör & Şirket",
      statsTypes: "Gemi Tipi",
      selectPrompt: "Ayrıntılı teknik kayıt ve açıklamalar için bir göreve tıklayın.",
      currentBadge: "GÜNCEL GÖREV",
    },

    reg: {
      title: "Profesyonel Tanınırlık & Uluslararası Kayıt",
      institution: "Institute of Marine Engineering, Science and Technology (IMarEST) & Engineering Council UK",
      grade: "IEng / IMarEng — Incorporated Engineer & Incorporated Marine Engineer",
      statusLabel: "Resmî Değerlendirme Sürecinde",
      statusBadge: "IN PROGRESS",
      body:
        "Murat Can Başkan'ın IMarEST üyeliği kapsamında yürüttüğü IEng / IMarEng profesyonel tescil başvurusu resmî değerlendirme sürecindedir. Bireysel Değerlendirme (Individual Case Procedure - ICP) Paneli 20 Kasım 2026 için planlanmış olup, panel onayının ardından Professional Review Interview (PRI) mülakat aşamasına geçilecektir.",
      notes: [
        "IMarEST Pre-Member tescili (2024)",
        "MIMarEST & IEng / IMarEng değerlendirme akışı",
        "UK Engineering Council standartlarına tam uyum",
      ],
    },

    skills: {
      title: "Makine Dairesi ve Denizcilik Teknolojileri Yetkinlikleri",
      sub: "Saha gerçekleriyle şekillenen 13 temel mühendislik uzmanlığı.",
      tabs: {
        systems: "Sistemler",
        operations: "Operasyonlar",
        reliability: "Güvenilirlik",
        energy: "Enerji",
        assurance: "Klas & Uyum",
        leadership: "Liderlik",
      },
    },

    bmms: {
      title: "Kanıta Dayalı Denizcilik Teknolojisi",
      badge: "GİRİŞİMCİLİK & AR-GE",
      sub: "Denizcilik tecrübesini doğrulanabilir karar zekâsına dönüştüren teknoloji girişimi.",
      lead:
        "BMMS, Uzakyol Baş Mühendisliği ve gemi makineleri işletme tecrübesini kanıta dayalı mühendislik karar sistemlerine dönüştürmek amacıyla geliştirilmektedir.",
      body:
        "İTÜ Çekirdek BİGG ve Piri Reis Üniversitesi PRU ARISTTO Ön Kuluçka programlarına kabul edilen girişim, TÜBİTAK BİGG 1812 süreci doğrultusunda Ar-Ge ve ürün doğrulama adımlarını sürdürmektedir. Sistem; operasyonel teknik dokümantasyon, üretici bültenleri ve klas kurallarını kriptografik kanıt zinciriyle birbirine bağlayarak makine dairesi kararlarına doğrudan destek sağlar.",
      programs: ["TÜBİTAK BİGG 1812", "İTÜ Çekirdek BİGG", "PRU ARISTTO Ön Kuluçka"],
      cta: "Explore BMMS →",
      ctaUrl: "https://bskn.net",
    },

    edu: {
      title: "Mühendislik Temelleri",
      institution: "İstanbul Teknik Üniversitesi Denizcilik Fakültesi",
      facultyOld: "Yüksek Denizcilik Okulu (YDO) Geleneği",
      department: "Gemi Makineleri İşletme Mühendisliği",
      degree: "Lisans / B.Sc. (2002–2006)",
      details:
        "İTÜ Denizcilik Fakültesi Tuzla yerleşkesinde; iki ve dört zamanlı deniz makineleri termodinamiği, akışkanlar mekaniği, buhar türbinleri ve kazan sistemleri, elektrik/otomasyon ve denizcilik hukuku/emniyeti üzerine kapsamlı mühendislik eğitimi.",
      topics: [
        "Gemi Sevk Makineleri & Termodinamik",
        "Buhar Sistemleri, Kazanlar & Isı Eşanjörleri",
        "Gemi Yardımcı Makineleri & Kargo Hidroliği",
        "Elektrik Dağıtım, Otomasyon & Güç Yönetimi",
        "Gemi İnşa, Stabilite & Mukavemet Esasları",
        "STCW / IMO Emniyet & Yönetim Standartları",
      ],
    },

    certs: {
      title: "Sürekli Mesleki Gelişim (CPD) & Sertifikalar",
      sub: "Uluslararası standartlar, siber güvenlik, yapay zekâ ve teknik uzmanlık eğitimleri.",
    },

    memberships: {
      title: "Mesleki Kuruluşlar & Temsil",
      sub: "Sektörel dernekler, odalar ve uluslararası mühendislik enstitüleri.",
    },

    projects: {
      title: "Uygulamalı Sistemler & Denizcilik Teknolojisi",
      sub: "Gemi makineleri mühendisliği ve dijital karar destek sistemleri kesişiminde yürütülen çalışmalar.",
      items: [
        {
          num: "01",
          title: "BMMS Karar Destek Mimarisi",
          desc: "Makine dairesi operasyonel kayıtları, üretici servis kılavuzları ve IMO/klas kurallarını bağlayan kanıt odaklı karar destek sistemi.",
        },
        {
          num: "02",
          title: "Makine Güvenilirliği & Arıza Önleme",
          desc: "Kritik ana ve yardımcı makinelerde plansız duruşları önleyen aşınma eğilimleri, yağ analizleri ve tolerans takip çerçevesi.",
        },
        {
          num: "03",
          title: "Çevresel Uyum & Enerji Verimliliği",
          desc: "CII, EEXI, SEEMP Part III ve VLSFO yakıt değişim süreçlerinin denetime hazır, doğrulanabilir dijital kayıt modelleri.",
        },
        {
          num: "04",
          title: "Yapılandırılmış Mühendislik Bilgi Grafı",
          desc: "Statik ve dağınık teknik dokümanları ilişkilendirerek baş mühendis ve teknik müfettişlerin karar süreçlerine anlık referans sunan sistem.",
        },
      ],
    },

    contact: {
      title: "Nitelikli Bir Görüşme Başlatın",
      sub: "Teknik liderlik, denizcilik teknolojileri, BMMS ve Ar-Ge iş birlikleri için doğrudan iletişim kanalları.",
      emailLabel: "E-Posta",
      phoneLabel: "Telefon",
      webLabel: "Web Platformları",
      cvLabel: "Özgeçmiş Dosyaları",
      cvTr: "Türkçe CV İndir (PDF)",
      cvEn: "İngilizce CV İndir (PDF)",
      areasTitle: "İş Birliği & Görüşme Alanları",
      areas: [
        "Uzakyol Baş Mühendisliği & Filo Teknik Yönetimi",
        "BMMS Denizcilik Teknolojileri & Karar Destek Sistemleri",
        "Tersane, Havuzlama & Yeni İnşa Teknik Danışmanlığı",
        "Ar-Ge, Pilot Uygulamalar & Kurumsal Ortaklıklar",
      ],
    },
  },

  en: {
    htmlTitle: "Murat Can Başkan — Ocean-Going Chief Engineer · Maritime Technology Entrepreneur",
    description:
      "Murat Can Başkan, Ocean-Going Chief Engineer and Maritime Technology Entrepreneur. 20 years of engine-room leadership, BMMS maritime technologies and evidence-based decision systems.",
    ogTitle: "Murat Can Başkan — Ocean-Going Chief Engineer",
    
    // Header
    brand: "BSKN.tr",
    name: "Murat Can Başkan",
    role: "Ocean-Going Chief Engineer",
    tagline: "Maritime Technology Entrepreneur",
    cvBtn: "CV",
    themeToggle: "Toggle theme",
    langSwitch: "TR",
    langSwitchTitle: "Türkçe versiyon",
    langSwitchPath: "/",

    // Dismiss & UI
    dismissHint: "Press ESC or click outside to dismiss",
    close: "Close",
    seeDoc: "View Document",
    zoomHint: "Click to preview document",
    footerText: "Murat Can Başkan · Ocean-Going Chief Engineer · Maritime Technology Entrepreneur",

    // 10 Modules Headings & Descriptions (Closed Cards)
    cards: {
      c01: {
        num: "01 · PROFILE",
        title: "Engineering with a systems view.",
        sub: "Sea-going experience shaped by systems, reliability and technology.",
      },
      c02: {
        num: "02 · SEA EXPERIENCE",
        title: "Twenty years of engineering at sea.",
        sub: "From tanker machinery to Chief Engineer leadership.",
      },
      c03: {
        num: "03 · PROFESSIONAL REGISTRATION",
        title: "Professional recognition.",
        sub: "IMarEST · IEng / IMarEng",
      },
      c04: {
        num: "04 · MARINE TECHNOLOGY",
        title: "Systems. Operations. Reliability.",
        sub: "Engineering technology shaped by operating reality.",
      },
      c05: {
        num: "05 · BMMS / ENTREPRENEURSHIP",
        title: "Evidence-first maritime technology.",
        sub: "Engineering experience evolving into decision intelligence.",
      },
      c06: {
        num: "06 · EDUCATION",
        title: "Engineering foundations.",
        sub: "İTÜ Denizcilik Fakültesi",
      },
      c07: {
        num: "07 · CERTIFICATIONS",
        title: "Continuous professional development.",
        sub: "Technical training · Safety · Technology",
      },
      c08: {
        num: "08 · MEMBERSHIPS",
        title: "Professional network.",
        sub: "UYBM · GEMİMO · DEFAMED · IMarEST",
      },
      c09: {
        num: "09 · PROJECTS & TECHNOLOGY",
        title: "Applied systems & technology.",
        sub: "Maritime systems · Evidence · Decision support",
      },
      c10: {
        num: "10 · CONTACT",
        title: "Start a useful conversation.",
        sub: "Engineering · Technology · Collaboration",
      },
    },

    // Open Modules
    profile: {
      seaTitle: "SEA · Operational Sea Experience",
      seaDesc:
        "Twenty years of engine-room operations and Chief Engineer leadership in international trade since 2007: product tankers, capesize bulk carriers, Ro-Ros, powerships and shipyard drydockings.",
      systemsTitle: "SYSTEMS · Machinery, Reliability & Technical Leadership",
      systemsDesc:
        "MAN B&W ME-B and ME-C two-stroke electronic engines, four-stroke auxiliary generators, steam boilers, FRAMO hydraulic cargo systems, shafting and propulsion, planned maintenance systems (PMS), failure analysis and zero-downtime reliability management.",
      techTitle: "TECHNOLOGY · Maritime Technology & Decision Support",
      techDesc:
        "Maritime technology entrepreneurship and applied R&D translating operating marine engineering discipline into evidence-based decision intelligence, digital twin perspectives and verified information architectures.",
      highlights: [
        { label: "Operational Experience", val: "20 Years (2007–2026)" },
        { label: "Sea & Yard Posts", val: "17 Recorded Posts across 6 Vessel Classes" },
        { label: "Education & Institution", val: "ITU Maritime Faculty (YDO '06)" },
        { label: "Professional Standing", val: "IMarEST · IEng / IMarEng in Assessment" },
      ],
    },

    career: {
      title: "Twenty Years of Engineering at Sea",
      sub: "Operational logbook and Chief Engineer leadership from 2007 to today.",
      filterAll: "All",
      statsYears: "Years in the Field",
      statsPosts: "Posts",
      statsCompanies: "Owners & Companies",
      statsTypes: "Vessel Types",
      selectPrompt: "Click any entry to inspect complete canonical engineering records and technical notes.",
      currentBadge: "CURRENT POST",
    },

    reg: {
      title: "Professional Recognition & International Registration",
      institution: "Institute of Marine Engineering, Science and Technology (IMarEST) & Engineering Council UK",
      grade: "IEng / IMarEng — Incorporated Engineer & Incorporated Marine Engineer",
      statusLabel: "In Formal Assessment",
      statusBadge: "IN PROGRESS",
      body:
        "Murat Can Başkan's professional registration application under IMarEST membership for IEng / IMarEng is currently undergoing formal assessment with the Engineering Council UK. The Individual Case Procedure (ICP) Panel is scheduled for 20 November 2026, followed by the Professional Review Interview (PRI).",
      notes: [
        "IMarEST Pre-Member registration (2024)",
        "MIMarEST & IEng / IMarEng formal assessment pipeline",
        "Strict adherence to UK Engineering Council professional criteria",
      ],
    },

    skills: {
      title: "Marine Engineering & Maritime Technology Competencies",
      sub: "13 core technical capabilities grounded in engine-room operating reality.",
      tabs: {
        systems: "Systems",
        operations: "Operations",
        reliability: "Reliability",
        energy: "Energy",
        assurance: "Assurance",
        leadership: "Leadership",
      },
    },

    bmms: {
      title: "Evidence-First Maritime Technology",
      badge: "VENTURE & R&D",
      sub: "Transforming marine engineering experience into dependable decision intelligence.",
      lead:
        "BMMS is being developed to turn Ocean-Going Chief Engineer expertise and engine-room discipline into evidence-based engineering decision systems.",
      body:
        "Admitted to İTÜ Çekirdek BİGG and Piri Reis University PRU ARISTTO Pre-Incubation programmes, the venture is actively advancing through the TÜBİTAK BİGG 1812 pipeline. The platform connects operational machinery logs, manufacturer service bulletins, and classification society requirements through verifiable evidence graphs to assist critical decisions.",
      programs: ["TÜBİTAK BİGG 1812", "İTÜ Çekirdek BİGG", "PRU ARISTTO Pre-Incubation"],
      cta: "Explore BMMS →",
      ctaUrl: "https://bskn.net",
    },

    edu: {
      title: "Engineering Foundations",
      institution: "Istanbul Technical University Maritime Faculty",
      facultyOld: "Heritage of the YDO (Higher Maritime School)",
      department: "Marine Engineering (Gemi Makineleri İşletme Mühendisliği)",
      degree: "Bachelor of Science / B.Sc. (2002–2006)",
      details:
        "Comprehensive engineering curriculum at ITU Tuzla campus encompassing 2-stroke and 4-stroke marine diesel thermodynamics, fluid mechanics, steam propulsion and boilers, electrical automation, and maritime safety governance.",
      topics: [
        "Marine Propulsion Systems & Thermodynamics",
        "Steam Plants, Boilers & Heat Exchangers",
        "Auxiliary Machinery & Cargo Hydraulics",
        "Electrical Distribution, Automation & Power Management",
        "Naval Architecture, Ship Stability & Hull Strength",
        "STCW / IMO Safety & Engine-Room Management",
      ],
    },

    certs: {
      title: "Continuous Professional Development (CPD) & Credentials",
      sub: "International standards, cyber security, artificial intelligence and engineering certifications.",
    },

    memberships: {
      title: "Professional Network & Institutional Standing",
      sub: "Professional chambers, alumni associations, and international engineering institutes.",
    },

    projects: {
      title: "Applied Systems & Maritime Technology",
      sub: "Engineering initiatives at the intersection of heavy marine machinery and digital decision intelligence.",
      items: [
        {
          num: "01",
          title: "BMMS Decision Intelligence Architecture",
          desc: "Evidence-linked technical decision support connecting machinery log records, manufacturer service letters, and statutory conventions.",
        },
        {
          num: "02",
          title: "Machinery Reliability & Diagnostic Frameworks",
          desc: "Failure prevention architectures monitoring critical 2-stroke and auxiliary wear rates, oil condition samples, and running clearances.",
        },
        {
          num: "03",
          title: "Environmental Verification & Energy Monitoring",
          desc: "Audit-ready operational workflows for CII, EEXI, SEEMP Part III, and verified VLSFO fuel changeover procedures.",
        },
        {
          num: "04",
          title: "Structured Marine Information Graphs",
          desc: "Extracting structured parameters from static technical manuals to provide instant, contextual reference for Chief Engineers and superintendents.",
        },
      ],
    },

    contact: {
      title: "Start a Useful Conversation",
      sub: "Direct communication channels for Chief Engineer roles, maritime technology, BMMS and technical collaboration.",
      emailLabel: "Email",
      phoneLabel: "Phone",
      webLabel: "Web Platforms",
      cvLabel: "Curriculum Vitae Files",
      cvTr: "Download Turkish CV (PDF)",
      cvEn: "Download English CV (PDF)",
      areasTitle: "Engagement & Discussion Areas",
      areas: [
        "Ocean-Going Chief Engineer & Technical Fleet Leadership",
        "BMMS Maritime Technology & Engineering Decision Systems",
        "Drydock, Shipyard & Newbuilding Technical Advisory",
        "R&D Partnerships, Pilot Deployments & Strategic Inquiries",
      ],
    },
  },
} as const;

export const NUMBER_WORDS: Record<Lang, Record<number, string>> = {
  tr: { 15: "on beş", 16: "on altı", 17: "on yedi", 18: "on sekiz", 19: "on dokuz", 20: "yirmi" },
  en: { 15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen", 20: "twenty" },
};

export type Copy = (typeof COPY)[Lang];
export const copyFor = (lang: Lang): Copy => COPY[lang];
