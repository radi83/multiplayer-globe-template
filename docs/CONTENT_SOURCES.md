# İçerik kaynakları ve doğrulama

Sayfadaki iddiaların hangi BMMS kaydına dayandığı. Kaynak:
`4rfz/bmms-maritime-engineering-knowledge-system`, `main` @ `ac6cf83`
(2026-09-17). Depo daha sonra değiştiyse bu tablo yeniden doğrulanmalıdır.

Kural: Sayfada doğrulanmamış başarı oranı, kullanıcı sayısı, kurum logosu,
akademik onay, sertifika ya da kullanım hikâyesi yer almaz. Mevcut özellik,
kısmen mevcut özellik ve geliştirme hedefi her yerde ayrı gösterilir.

## İngilizce sürüm

`src/content/en.json`, `tr.json`'un çevirisidir; aynı iddiaları, aynı durum
etiketlerini ve aynı temsili senaryoyu içerir. Yeni bir iddia eklenmez.
Teknik terimlerde BMMS deposunun kendi İngilizce terimleri kullanılır
(`RETRIEVED != AUTHORITATIVE != CURRENT != APPLICABLE != SUFFICIENT`,
Applicability, Obligation, Assurance State, Abstention). Türkçe metin
değiştiğinde İngilizce karşılığı da aynı değişiklikte güncellenmelidir.

## Kimlik ve görsel dil

| Sayfadaki öğe | Kaynak |
|---|---|
| Ad: "BMMS — Maritime Engineering Knowledge System" | `README.md`, `docs/BRAND_SYSTEM.md` |
| Palet (`#B3121D`, `#111111`, `#F5F5F3`, `#D9D9D6`, `#555555`) | `docs/BRAND_SYSTEM.md` → Palette |
| Süs amaçlı denizcilik ikonu yok, sertifika dili yok | `docs/BRAND_SYSTEM.md` → Design principles, Status language |
| Yazı tabanlı BMMS işareti | `docs/assets/brand/bmms-repository-hero.svg` (ayrı logo dosyası yok) |

## Anlatım

| Sayfadaki iddia | Kaynak |
|---|---|
| Kaynak → sürüm → pasaj → … → denetim geçmişi zinciri | `AGENTS.md` §1; `README.md` §01 |
| Dayanak kurulamazsa kesin cevap yerine açıkça kaydetme | `README.md` §01 ve "Final engineering rule" |
| BULUNAN ≠ YETKİLİ ≠ GÜNCEL ≠ UYGULANABİLİR ≠ YETERLİ | `AGENTS.md` §3 (`RETRIEVED != AUTHORITATIVE != CURRENT != APPLICABLE != SUFFICIENT`) |
| "Bir açığın tespit edilmemiş olması kapanmış olduğunu kanıtlamaz" | `AGENTS.md` §3 (`NO IDENTIFIED GAP != PROVEN CLOSED`) |
| "Eksik kanıt, gerekliliğin bulunmadığı anlamına gelmez" | `AGENTS.md` §3 (`MISSING EVIDENCE != NOT_REQUIRED`) |
| İnceleyen ≠ karar yetkisi; yapay zekâ çıktısı doğrulanmış kanıt değildir | `AGENTS.md` §3–4 |
| Erişim, işleme hakkı değildir; hakkı belirsiz materyal bekletilir | `AGENTS.md` §6; `README.md` §06 |
| Olay tarihindeki revizyon, en yeni revizyon değil | `docs/benchmark/PILOT-12-RESULTS.md` (P12) |
| Kaynak aileleri: IMO/SOLAS/ISM, MARPOL/MEPC, IACS, OCIMF, yetkili OEM | `README.md` §03; `docs/BMMS_PROJECT_STATE.md` §7 |

## Durum etiketleri (Yaklaşım bölümü)

| Adım | Etiket | Kanıt |
|---|---|---|
| Kaynak ve sürüm | Altyapıda mevcut | `docs/tasks/TASK-002..003-COMPLETION.md`; `services/api/src/bmms_api/domain/contracts.py` (`Authority`, `Source`, `SourceVersion`, `EvidenceObject`) |
| Pasaj | Altyapıda mevcut | `docs/tasks/TASK-004-COMPLETION.md`; `Passage`, `Citation` |
| Uygulanabilirlik | Kısmen mevcut | `docs/tasks/TASK-008-COMPLETION.md` (temel); kapsam genişlemesi `docs/BMMS_PROJECT_STATE.md` §9 |
| Yükümlülük ve kanıt | Kısmen mevcut | `Claim`, `ClaimEvidenceLink` mevcut; yükümlülük kapsamı ayrı sorun: `docs/BMMS_PROJECT_STATE.md` §9 |
| Uzman kararı | Kısmen mevcut | `HumanReviewStatus` mevcut; arayüz prototip: `docs/BMMS_PROJECT_STATE.md` §11, açık PR #7 |
| Güvence durumu | Geliştirme hedefi | `docs/BMMS_PROJECT_STATE.md` §9 ("moving beyond retrieval…") |
| Denetim geçmişi | Altyapıda mevcut | `AuditEvent`, `ProvenanceRecord`, `Abstention` (`contracts.py`); `AGENTS.md` §4 |

"Altyapıda mevcut" = sunucu tarafında uygulanmış ve otomatik testlerle
sınanmış. Son kullanıcı ürünü anlamına gelmez; sayfada da böyle açıklanır.

## Bilimsel yaklaşım

| Sayfadaki iddia | Kaynak |
|---|---|
| Varsayılan arama sözcüksel; anlamsal/hibrit deneysel | `docs/BMMS_PROJECT_STATE.md` §6; `AGENTS.md` §8 |
| Ölçütleri önceden kayda geçirilmiş deney; hibrit terfi etmedi | `docs/tasks/TASK-010-GATE-B3-PREREGISTRATION.md`, `docs/tasks/TASK-010-CLOSURE.md` |
| Kritik hatalar toplam orandan ayrı izlenir | `docs/QUALITY_SYSTEM.md`; `docs/BMMS_PROJECT_STATE.md` §10 |
| Tavan etkisi gösteren kalibrasyon seti "fazla kolay", sıralama için kullanılmadı | `docs/benchmark/PILOT-12-RESULTS.md` → Verdict |
| ADR, değiştirilemez kanıt, sıkı tip denetimi, hata testleri, otomatik kalite kapıları, bağımsız inceleme | `docs/decisions/`, `docs/QUALITY_SYSTEM.md`, `pyproject.toml` (mypy strict), `.github/workflows/quality.yml` |

Test sayısı ve benzeri değişken rakamlar bilerek kullanılmadı
(`docs/BRAND_SYSTEM.md`: kalıcı görsellerde geçici iddia olmaz).

## Proje aşaması

| Sayfadaki iddia | Kaynak |
|---|---|
| Temel altyapı tamamlandı (TASK-001…010) | `docs/tasks/`, `docs/BMMS_PROJECT_STATE.md` §6 |
| Kontrollü pilot hazırlığı sürüyor | `docs/tasks/PILOT-001-AUTHORIZATION.md`; `docs/BMMS_PROJECT_STATE.md` §7 |
| Pilot, çalışma zamanı kanıtı olmadan tamamlanmış sayılmaz | `docs/BMMS_PROJECT_STATE.md` §7 → Runtime gate discipline |
| Operasyonel modüller (hedef) | `docs/decisions/ADR-0004-operational-core-product-architecture.md` |
| İmzalı dışa aktarım, doğrulanabilir kanıt paketi (hedef) | `docs/decisions/ADR-0005-evidence-credential-external-trust-architecture.md` |
| Kabul edilmiş yön ≠ uygulama yetkisi | `docs/BMMS_PROJECT_STATE.md` §13–15 |
| Üretimde kullanılan / sertifikalı / onaylı bir sistem değildir | `docs/BRAND_SYSTEM.md` → Status language; pilot durumu |

## Temsili senaryo

Konu (MARPOL Ek VI yakıt kükürt sınırı, ECA içi/dışı) BMMS'in kendi
değerlendirme setindeki `SULPHUR-GEO-01` karşı-olgusal ailesinden esinlenmiştir
(`docs/benchmark/PILOT-12-RESULTS.md`). Sayfadaki pasaj ve belge adları
**temsilidir**; gerçek bir kaynaktan alıntı ya da BMMS sistem çıktısı değildir
ve sayfada bu açıkça yazar. Sınır değerleri bilerek verilmemiştir.

## İletişim

E-posta (`c@bskn.tr`) ve telefon (`+90 532 659 1923`) proje sahibi tarafından
verilmiştir; `src/config.ts` içinde tutulur.

## Tamamlanması gerekenler

- **Ad tutarlılığı:** Bir tanıtım görselinde "Berth Maritime Management System"
  geçiyor; depo "Maritime Engineering Knowledge System" diyor. Sayfa depodakini
  kullanır.
- **Logo:** Depoda ayrı bir logo dosyası yok; yazı tabanlı işaret kullanıldı.
