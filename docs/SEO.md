# SEO

## Sitede olanlar

| Öğe | Nerede üretilir |
|---|---|
| Dile özel başlık ve açıklama (≤ 160 karakter) | `src/content/<dil>.json` → `meta` |
| Kanonik adres, `hreflang` (tr, en, x-default) | `src/templates/page.ts` → `renderHead` |
| Open Graph / Twitter kartı, paylaşım görseli | `renderHead`, `public/og-image.jpg` |
| Yapılandırılmış veri (schema.org: WebSite, ResearchProject, WebPage) | `renderHead` → `structuredData` |
| `robots.txt`, `sitemap.xml` (iki dil + hreflang) | `vite.config.ts` → `seoFiles`, derlemede üretilir |
| Uygulama ikonları, `site.webmanifest` | `public/` |
| 404 sayfası dizine eklenmez | `public/404.html` (`noindex`) |

Site adresi tek yerde: `src/config.ts` → `SITE_URL`. Yapılandırılmış veride
yalnızca sayfada zaten yer alan bilgiler kullanılır (kuruluş tarihi, ekip, ödül
gibi doğrulanmamış alanlar eklenmez).

## Google Search Console

1. https://search.google.com/search-console → **Mülk ekle** → **URL ön eki** →
   `https://bskn.net/`
2. Doğrulama yöntemi: **HTML etiketi**. Verilen etiketteki `content="..."`
   değerini `src/config.ts` → `SEARCH_VERIFICATION.google` alanına yazın ve yayınlayın.
3. Yayından sonra Search Console'da **Doğrula**.
4. **Site haritaları** → `sitemap.xml` gönderin.
5. **URL denetimi** → `https://bskn.net/` ve `https://bskn.net/en/` için
   **Dizine eklenmesini iste**.

Bing Webmaster Tools, Search Console'dan içe aktarılabilir; ayrı kod gerekirse
`SEARCH_VERIFICATION.bing` alanına yazılır.

## Beklenti

Yeni ve niş bir alan adı kısa vadede özellikle proje adıyla ("BMMS",
"BMMS maritime") yapılan aramalarda görünür. Bildiri özetleri, sunum ve
profesyonel profillerden verilen bağlantılar keşfi hızlandırır.
