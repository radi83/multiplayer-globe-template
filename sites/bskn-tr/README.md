# bskn.tr — kariyer sitesi

**Murat Can Başkan, Uzakyol Baş Mühendisi** için iki dilli (TR `/`, EN `/en/`)
tek sayfalık kariyer sitesi. Aynı repodaki bskn.net (BMMS tanıtım sitesi)
projesinden bağımsızdır; kendi paketi, derlemesi ve Cloudflare Worker'ı vardır.

- Tüm metin derleme sırasında statik HTML'e yazılır; JavaScript kapalıyken de okunur.
- Açık / koyu tema (işletim sistemi tercihine uyar, seçim hatırlanır).
- Kariyer listesi gemi tipine göre süzülür; "hareketi azalt" ayarına uyulur.
- Sayılar (yıl, görev, gemi tipi, yeni inşa teslimi) içerikten hesaplanır.

## Komutlar

```bash
cd sites/bskn-tr
npm ci
npm run dev        # http://localhost:5173
npm run build      # dist/ + içerik ve boyut kontrolü
npm test           # Playwright: masaüstü, tablet, telefon
npm run check      # tip denetimi + derleme + testler
```

## Nerede ne var

| Ne | Nerede |
|---|---|
| Görevler, sertifikalar, üyelikler, eğitim | `src/data.ts` |
| Menü, başlık ve düğme metinleri, SEO açıklamaları | `src/copy.ts` |
| HTML şablonu | `src/templates/page.ts` |
| Renkler ve yazı | `src/styles/base.css` (`:root` değişkenleri) |
| Bölüm stilleri | `src/styles/sections.css` |
| Gemi fotoğrafları | `public/img/` (WebP, en fazla 1200 px) |
| CV | `public/cv/Murat_Can_Baskan_CV_EN.pdf` |
| Site adresi, Search Console kodu | `src/config.ts` |

**İçerik kuralı:** Sitedeki her görev, tarih, gemi, sertifika ve üyelik CV'de
de yer alır. CV güncellenince önce PDF'i `public/cv/` altına koyun, sonra
`src/data.ts` içindeki kayıtları aynı bilgilere göre düzenleyin.

## Yayın (Cloudflare)

Site, statik dosya sunan bir Cloudflare Worker'dır (`wrangler.json`, ad: `bskn-tr`).
Bir kez yapılacak kurulum:

1. Cloudflare → **Workers & Pages → Create → Import a repository** →
   `radi83/multiplayer-globe-template`.
2. **Project name:** `bskn-tr` · **Root directory:** `sites/bskn-tr` ·
   **Build command:** `npm run build` · **Deploy command:** `npx wrangler deploy`.
3. İlk yayın bitince Worker'ın **Settings → Domains & Routes → Add → Custom domain**
   bölümüne `bskn.tr` (ve istenirse `www.bskn.tr`) eklenir. Alan adı şu an eski
   Pages projesine bağlıysa önce oradan kaldırılır.
4. İsteğe bağlı: iki Worker'ın birbirini gereksiz yere derlememesi için
   **Settings → Build → Build watch paths**: bu Worker için `sites/bskn-tr/*`,
   bskn.net Worker'ı için `sites/bskn-tr/*` hariç tutulur.

Bundan sonra `main` dalına gelen her değişiklik otomatik yayınlanır.
Geri almak için: Cloudflare → Worker → **Deployments** → önceki sürüm → **Rollback**.

## SEO

- Başlık, açıklama, kanonik adres, `hreflang` (tr, en, x-default), Open Graph,
  schema.org `Person` + `ProfilePage` yapılandırılmış verisi.
- `sitemap.xml` ve `robots.txt` derlemede üretilir.
- Search Console'da `https://bskn.tr/sitemap.xml` gönderilir.
