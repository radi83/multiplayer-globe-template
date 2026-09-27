# BMMS — Kongre tanıtım sitesi

**BMMS — Maritime Engineering Knowledge System** için akademisyenlere,
araştırmacılara ve kongre katılımcılarına yönelik tek sayfalık tanıtım sitesi.
Ziyaretçilerin çoğu telefondan, bir QR kod üzerinden gelir; sayfa sunum
sırasında masaüstünde de gösterilir.

- **Metin önce gelir.** Sayfadaki tüm metin derleme sırasında statik HTML'e
  yazılır; JavaScript kapalı olsa bile okunur.
- **Sinematik katman sonradan eklenir.** GSAP ScrollTrigger ile kaydırmaya
  bağlı sahneler, masaüstünde Lenis yumuşak kaydırma, Three.js ile WebGL
  "blueprint" dünya. Dünya ayrı bir parça olarak, sayfa açıldıktan sonra yüklenir.
- **Hareket her zaman kapatılabilir.** Sağ alttaki düğme ve işletim sisteminin
  "hareketi azalt" ayarı desteklenir.
- **İki dil.** Türkçe `bskn.net/`, İngilizce `bskn.net/en/`; sağ üstteki TR / EN
  düğmesiyle geçilir. İki sayfa da ayrı ayrı statik HTML olarak üretilir.
- **İçerik doğruluğu.** Sayfadaki her iddia BMMS deposundaki bir kayda
  dayanır: [`docs/CONTENT_SOURCES.md`](docs/CONTENT_SOURCES.md).

## Hızlı başlangıç

```bash
npm ci
npm run dev        # http://localhost:5173
npm run build      # dist/ + boyut bütçesi kontrolü
npm run preview    # derlenmiş siteyi yerelde aç (http://localhost:4173)
npm test           # Playwright duman testleri (masaüstü + telefon)
npm run check      # tip denetimi + derleme + testler
```

İlk test çalıştırmasından önce: `npx playwright install chromium`.

## Yapı

```text
index.html                    Türkçe sayfa kabuğu (bskn.net/)
en/index.html                 İngilizce sayfa kabuğu (bskn.net/en/)
vite.config.ts                İşaretleri şablon çıktısıyla dolduran Vite eklentisi
src/
  content/tr.json             Türkçe metnin tamamı
  content/en.json             İngilizce metnin tamamı (tr.json ile aynı yapı)
  config.ts                   İletişim bilgileri ve site adresi (boş alan sayfada görünmez)
  templates/page.ts           tr.json → statik HTML (derleme anında çalışır)
  main.ts                     Giriş: yazı tipleri, stiller, hareket, etkileşim
  styles/                     tokens.css + bölüm başına bir stil dosyası
  motion/
    preference.ts             Hareket tercihi (tek doğruluk kaynağı)
    timelines.ts              GSAP ScrollTrigger sahneleri
    smooth.ts                 Lenis (yalnızca masaüstü, hareket açıkken)
  sections/
    demo.ts                   Temsili senaryo etkileşimi
    contact.ts                E-posta kopyalama
  scenes/globe/
    boot.ts                   WebGL denetimi + sonradan yükleme
    GlobeScene.ts             Three.js sahnesi
    geometry.ts               Küre, ızgara, düğüm ve yay matematiği
    shaders/                  Ön/arka yüz, tarama ışığı, ışık darbesi, atmosfer
public/                       favicon, 404 sayfası, önbellek başlıkları, paylaşım görseli
worker/index.ts               Cloudflare Worker (dist/ klasörünü sunar)
wrangler.json                 Cloudflare yapılandırması
scripts/check-budget.mjs      Boyut bütçesi ve statik içerik kontrolü
tests/smoke.spec.ts           Duman testleri
docs/                         Tasarım, içerik kaynakları, yayın
```

## Sık yapılan değişiklikler

| Ne | Nerede |
|---|---|
| Bir metni değiştirmek | `src/content/tr.json` ve aynı yerde `src/content/en.json` |
| İletişim bilgisi (e-posta, telefon, bağlantı) | `src/config.ts` |
| Renk veya yazı tipi | `src/styles/tokens.css` |
| Dünyanın hızı, eğimi, ışık darbesi sıklığı | `src/scenes/globe/GlobeScene.ts` → `TUNING` |
| Kaydırma sahneleri | `src/motion/timelines.ts` |

## Dokümanlar

- [Tasarım ve hareket kuralları](docs/DESIGN.md)
- [İçerik kaynakları ve doğrulama](docs/CONTENT_SOURCES.md)
- [Yayın (Cloudflare) ve geri alma](docs/DEPLOY.md)
