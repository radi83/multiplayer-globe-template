# Yayın (Cloudflare) ve geri alma

Site bir Cloudflare Worker olarak yayınlanır: `dist/` klasöründeki statik
dosyalar doğrudan sunulur, `worker/index.ts` yalnızca eşleşmeyen isteklere
404 sayfası döndürür.

## Önemli: Worker adı

`wrangler.json` içindeki ad `multiplayer-globe-template` olarak **bilerek
korundu**. bskn.net alan adı bu Worker'a bağlı; adı değiştirmek yeni bir Worker
oluşturur ve alan adı eski Worker'da kalır.

## Git ile otomatik yayın (Workers Builds)

Cloudflare panelinde Worker → Settings → Build:

| Ayar | Değer |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Kök dizin | `/` |
| Node sürümü | 22 (`NODE_VERSION=22` ortam değişkeni) |

`main` dalına birleştirme canlı yayına alır. Diğer dallar (ör. `bmms-kongre`)
Cloudflare'de önizleme sürümü olarak yüklenebilir.

## Elle yayın

```bash
npm ci
npx wrangler login
npm run deploy
```

## Yayından önce

```bash
npm run check                                   # tip denetimi + derleme + testler
npx wrangler deploy --dry-run --outdir .wrangler/dry-run
```

## Geri alma

- Cloudflare paneli → Worker → Deployments → önceki sürüm → **Rollback**.
- Ya da `git revert` ile `main`'e geri dönüş commit'i atıp yeniden yayınlayın.

## İkinci adım: eski Durable Object'in kaldırılması

Önceki şablon `Globe` adlı bir Durable Object tanımlıyordu. Cloudflare,
yayınlanmış bir sınıfın silme adımı olmadan kaldırılmasına izin vermez. Bu yüzden
`worker/index.ts` içinde boş bir `Globe` sınıfı ve `wrangler.json` içinde bağlantısı
şimdilik duruyor. Site bunu kullanmıyor.

Yeni site canlıda sorunsuz çalıştıktan sonra, **ayrı bir değişiklik olarak**:

1. `wrangler.json`:
   - `durable_objects` bloğunu silin.
   - `migrations` dizisine şunu ekleyin:
     `{ "tag": "v2", "deleted_classes": ["Globe"] }`
2. `worker/index.ts`: `Globe` sınıfını ve `DurableObject` içe aktarmasını silin.
3. `npm run check`, ardından doğrudan `main` üzerinden `npx wrangler deploy`.

Not: Silme adımı içeren yapılandırma önizleme yüklemelerinde
(`wrangler versions upload`) kabul edilmez; bu adımı önizleme dalında değil,
doğrudan canlı yayında yapın. Eski sınıf yalnızca geçici bağlantı durumu tutuyordu,
kalıcı veri kaybı yoktur.

## QR kod

QR kodu doğrudan alan adının köküne yönlendirin (ör. `https://bskn.net/`).
Adres sorgu parametresi veya `#` içermemeli; kısa ve kalıcı olmalıdır.
