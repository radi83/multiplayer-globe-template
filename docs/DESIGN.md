# Tasarım ve hareket kuralları

## Fikir

Sayfa bir mühendislik çizim dosyası gibi kurgulanmıştır. Her bölüm bir
**pafta**dır (01–06); her paftanın antet etiketi, şekil numarası ve ölçek
notu vardır. İlk ekran koyu bir çizim masasıdır: ince ızgara, çizgi-nokta
merkez eksenleri, koordinat halkası ve yavaş dönen tel kafes bir dünya.
Sayfanın geri kalanı BMMS deposunun kırmızı/beyaz/siyah teknik doküman
diline döner.

Bu bir tasarım referansıdır; herhangi bir çizim standardına uygunluk iddiası
değildir.

## Palet

Kaynak: BMMS deposu, `docs/BRAND_SYSTEM.md`. Geçici öneri değil, projenin
kanonik paletidir.

| Değişken | Değer | Kullanım |
|---|---|---|
| `--red` | `#B3121D` | BMMS kırmızısı. Az kullanılır: vurgu, kritik geçiş, durum işareti |
| `--ink` | `#111111` | Ana metin, yapı |
| `--paper` | `#FFFFFF` | Zemin |
| `--paper-2` | `#F5F5F3` | Sıcak teknik gri, ikincil zemin |
| `--line` | `#D9D9D6` | Çizgiler |
| `--muted` | `#555555` | İkincil metin |
| `--red-on-dark` | `#E2464F` | Koyu zeminde küçük metin kontrastı için açıklaştırılmış kırmızı (türetilmiş) |
| `--stage` | `#0F1011` | Koyu çizim masası (ilk ekran, iletişim) |

Marka kuralları gereği süs amaçlı denizcilik ikonografisi (gemi, çapa, dümen)
kullanılmaz; neon degrade, oyun estetiği ve rozet duvarı yoktur.

## Tipografi

IBM Plex ailesi, **yerel olarak** sunulur (`@fontsource`, yalnızca Latin ve
Latin-genişletilmiş alt kümeleri; Türkçe karakterler dahil). Google Fonts'a
bağımlılık yoktur; kongre ağında harici bir istek gerekmez.

- Başlık: IBM Plex Sans Condensed 600/700
- Metin: IBM Plex Sans 400/500/600
- Etiket, koordinat, kod: IBM Plex Mono 400/500

## Hareket dili

1. **Dinlenme hâli tamamlanmış hâldir.** Her bölümün CSS'teki varsayılan
   görünümü okunabilir ve bitmiş durumdur. Animasyon yalnızca o duruma giden
   yolu çizer.
2. **Metin asla gizlenmez.** Hiçbir animasyon metnin opaklığını sıfırlamaz;
   başlık ve açıklamalar animasyonu beklemeden okunur.
3. **Aynı anda tek odak.** Dünya sürekli ama yavaş döner; diğer hareketler
   ziyaretçinin kaydırmasına bağlıdır ve bölüm görünürken çalışır.
4. **Hareket kapatılabilir.** Sağ alttaki düğme ve `prefers-reduced-motion`
   desteklenir. Kapatıldığında tüm zaman çizelgeleri geri alınır, dünya tek bir
   sabit kare olarak çizilir.
5. **Dokunmatikte fareye bağlı etkileşim yok.** Yumuşak kaydırma (Lenis) ve
   dünyanın fareye derinlik tepkisi yalnızca ince imleçli cihazlarda açılır.

| Bölüm | Hareket | Tetik |
|---|---|---|
| 01 İlk ekran | Metin hafifçe yerine oturur, çizgi çizilir, halka döner; dünya ekvatordan kutuplara doğru belirir, yaylar çizilir, ardından ışık darbeleri başlar | Açılış |
| 01 → 02 | Dünya geri çekilir, ızgara yavaşça kayar | Kaydırma (scrub) |
| 02 Problem | Dağınık kaynak parçaları ortak kayıt düzenine oturur; alanlar kesikliden düze döner | Kaydırma (scrub) |
| 03 Yaklaşım | Akış çizgisi kırmızıyla dolar, okunan adım vurgulanır | Kaydırma |
| 04 Örnek | Durum değişince bağlantı çizgilerinden ışık geçer | Tıklama |
| 05 İlkeler | ≠ işaretleri sırayla belirir, kartlar yerine oturur | Görünür olunca |
| 06 Aşama | Sütun başlık çizgileri çizilir | Görünür olunca |

## Dünya (Three.js)

- Ortografik değil perspektif kamera; birim küre, 20°'lik meridyen/paralel ızgarası.
- Ön ve arka yüz ayrımı shader'da yapılır (`facing.glsl`): arka çizgiler soluk kalır.
- Yavaşça dolaşan bir tarama bandı ve kenar parıltısı "kontrollü ışık" sağlar.
- 26 düğüm ve yaylar **sabit tohumla** üretilir; her açılışta aynıdır ve gerçek
  veri, kullanıcı ya da konum içermez. Şekil altyazısı bunu açıkça belirtir.
- Işık darbeleri yay boyunca ilerler, vardığı düğümü kısa süre parlatır.
- Dönüş hızı ≈ 0,28 rad/sn (bir tur ≈ 22 sn); koordinat halkası 40 sn'de bir döner.
  Cümle katmanı okunabilirlik için kürenin yarı hızında (0,14 rad/sn) döner.
- **Küre içindeki cümleler:** Projenin kilit ilkeleri, kürenin içinde (yarıçap
  0,9) kavisli bir şeride çizilir ve küreyle birlikte döner. Soldan girer, öne
  geldiğinde tam okunur, yana kıvrılırken söner. Aynı anda en fazla iki cümle
  görünür. Metinler sayfanın dilinden gelir (`hero.globePhrases`); yalnızca
  sayfada zaten doğrulanmış ifadeler kullanılır. Hareket kapalıyken ilk cümle
  sabit olarak önde gösterilir.
- Görünmediğinde (sekme arka planda, bölüm ekran dışında) çizim durur.
- WebGL yoksa, parça yüklenemezse ya da GPU bağlamı kaybolursa sabit SVG
  çizimi görünür kalır.

## Performans bütçesi

`scripts/check-budget.mjs` her derlemede kontrol eder (gzip):

| Parça | Bütçe |
|---|---|
| HTML (tüm metin dahil) | 30 KB |
| Ana JavaScript | 80 KB |
| CSS | 20 KB |
| Sonradan yüklenen en büyük parça (Three.js sahnesi) | 200 KB |

## Erişilebilirlik

- "İçeriğe geç" bağlantısı, görünür odak çerçeveleri, klavyeyle kullanılabilir seçenekler.
- Senaryo sonucu `aria-live` ile duyurulur.
- Dünya çizimi `role="img"` ve açıklayıcı etiket taşır; tuval dekoratif olarak gizlenir.
- Koyu zeminde küçük metin için kontrastı artırılmış kırmızı ton kullanılır.
