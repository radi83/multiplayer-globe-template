# bskn.tr — kariyer sitesi

**Murat Can Başkan, Uzakyol Baş Mühendisi** için iki dilli (TR `/`, EN `/en/`)
kariyer sitesi. Aynı repodaki bskn.net (BMMS tanıtım sitesi) projesinden
bağımsızdır; kendi paketi, derlemesi ve Cloudflare Worker'ı vardır.

**Görünüm eski bskn.tr sitesiyle birebir aynıdır.** Eski site Claude Design ile
yapılmıştı; elimizdeki kopya (59d204b7) çalışmayan bir
"sayfa fotoğrafı" olduğu için aynı tasarım burada yeniden kuruldu:

- Eski sitenin stil dosyaları aynen kullanılır: `src/styles/modernist.css`
  (tasarım sistemi) ve `src/styles/page.css` (sayfa + dönen kartlar).
- HTML aynı yapı ve satır içi stillerle üretilir (`data-dc-tpl` öznitelikleri
  korunur, çünkü eski stiller onlara bağlıdır).
- React çalışma zamanı yerine küçük bir betik (`src/main.ts`) aynı davranışları
  sağlar: tema, filtre, tıklayınca arka yüzü açılan kartlar, belirme, sayaçlar, paralaks.

Eski siteye göre yapılan düzeltmeler (`src/styles/fixes.css`):

- İsim iPad'de 3 satıra bölünüyordu → tek satır.
- Üyelik ve belge kartlarının altında boş gri hücreler kalıyordu → kaldırıldı.
- Deneyim kartları artık dönmüyor (mide bulandırıyordu): tıklayınca doğrudan arka yüz
  açılır; kartın sağındaki kırmızı "+" kutusu tıklanabilir olduğunu gösterir,
  ilk kartta "+" bir kez hafifçe halka yayar.
- Tasarım aracından kalan "Direction / Yön A–B" düğmesi kaldırıldı.
- Telefonda üst şerit sayfayı yana taşırıyordu → düzeltildi.
- İçerik güncel CV'ye göre güncellendi (yıllar, 17 görev, yeni sertifikalar,
  IMarEST MIMarEST · IMarEng).

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
| Görevler, sertifikalar, üyelikler, uzmanlık | `src/data.ts` |
| Menü, başlık ve düğme metinleri, SEO açıklamaları | `src/copy.ts` |
| HTML şablonu | `src/templates/page.ts` |
| Renkler ve yazı (eski tasarım sistemi) | `src/styles/modernist.css` |
| Düzeltmeler | `src/styles/fixes.css` |
| Bilgisayar ekranı ölçüsü (yazı boyutları, boşluk, genişlik) | `src/styles/fixes.css` → "BİLGİSAYAR ÖLÇÜ SİSTEMİ" değişkenleri (`--t-display`, `--t-h1`, `--leading`, `--w-content`…) |
| İlk ekrandaki blueprint gemi (hareket, kamera, renkler) | `src/ship/scene.ts` — yüklenmesi ve yazılar `src/ship/boot.ts`, yazı listesi `src/copy.ts` → `shipPhrases` |
| Gemi fotoğrafları | `public/img/` (WebP, en fazla 1200 px) |
| Belge / üyelik görselleri | `public/uploads/` — `src/data.ts` içindeki `img` adıyla aynı dosya konursa kartta "Belgeyi gör" çıkar |
| CV | `public/cv/Murat_Can_Baskan_CV_EN.pdf` |
| Site adresi, Search Console kodu | `src/config.ts` |

**İçerik kuralı:** Sitedeki her görev, tarih, gemi, sertifika ve üyelik CV'de
de yer alır. CV güncellenince önce PDF'i `public/cv/` altına koyun, sonra
`src/data.ts` içindeki kayıtları aynı bilgilere göre düzenleyin.

## Yayın (Cloudflare)

Site, statik dosya sunan bir Cloudflare Worker'dır (`wrangler.json`, ad: `bskntr`).
Bir kez yapılacak kurulum:

1. Cloudflare → **Workers & Pages → Create → Import a repository** →
   `radi83/multiplayer-globe-template`.
2. **Project name:** `bskntr` (Cloudflare `bskn-tr` adını kabul etmedi) · **Root directory:** boş bırakılır ·
   **Build command:** `cd sites/bskn-tr && npm ci && npm run build` · **Deploy command:** `cd sites/bskn-tr && npx wrangler deploy` · **Preview command:** `cd sites/bskn-tr && npx wrangler versions upload` · **Enable Preview builds:** kapalı.
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
