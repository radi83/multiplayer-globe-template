import { expect, test, type Page } from "@playwright/test";

const collectErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
};

test("metin JavaScript'ten bağımsız, statik HTML'de gelir", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("kaynağına kadar");
  await expect(page.locator("#ornek h2")).toBeVisible();
  await expect(page.locator(".globe__fallback")).toBeVisible();
  await ctx.close();
});

test("sayfa hatasız açılır, yatay taşma yok", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1500);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test("dünya ya WebGL ile canlanır ya da yedek çizim görünür kalır", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);
  const live = await page.locator("#globe").evaluate((el) => el.classList.contains("is-live"));
  if (live) {
    await expect(page.locator("#globe canvas")).toHaveCount(1);
  } else {
    await expect(page.locator(".globe__fallback")).toBeVisible();
  }
});

test("WebGL yoksa yedek çizim görünür", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type.startsWith("webgl")) return null;
      return (original as (...a: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof original;
  });
  await page.goto("/");
  await page.waitForTimeout(2000);
  await expect(page.locator("#globe")).not.toHaveClass(/is-live/);
  await expect(page.locator(".globe__fallback")).toBeVisible();
});

test("temsili senaryo tüm durumları doğru gösterir", async ({ page }) => {
  await page.goto("/");
  const cases: [string, string, string, string, string][] = [
    ["in", "doc", "UZMAN KARARINA HAZIR", "UYGULANABİLİR", "İLGİLİ · BU BAĞLAMDA UYGULANAMAZ"],
    ["out", "doc", "UZMAN KARARINA HAZIR", "İLGİLİ · BU BAĞLAMDA UYGULANAMAZ", "UYGULANABİLİR"],
    ["unk", "doc", "BELİRSİZ · SONUÇ ÜRETİLMEDİ", "UYGULANABİLİRLİĞİ BELİRLENEMEDİ", "UYGULANABİLİRLİĞİ BELİRLENEMEDİ"],
    ["in", "none", "KANIT EKSİK", "UYGULANABİLİR", "İLGİLİ · BU BAĞLAMDA UYGULANAMAZ"],
  ];
  for (const [loc, evi, state, pa, pb] of cases) {
    await page.locator(`label[for=loc-${loc}]`).click();
    await page.locator(`label[for=evi-${evi}]`).click();
    await expect(page.locator("#res-state")).toHaveText(state);
    await expect(page.locator("#pa-pill")).toHaveText(pa);
    await expect(page.locator("#pb-pill")).toHaveText(pb);
  }
  await expect(page.locator("#res-chain")).toContainText("→");
});

test("hareket düğmesi tercihi değiştirir ve hatırlar", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
  await page.locator("#motion-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await expect(page.locator("#motion-label")).toHaveText("Hareketi başlat");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
});

test("hareketi azalt tercihinde sayfa dinlenme hâlinde açılır", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await expect(page.locator("[data-frags]")).not.toHaveClass(/is-loose/);
  const reached = await page.locator(".step.is-reached").count();
  expect(reached).toBe(await page.locator(".step").count());
  await ctx.close();
});

test("klavyeyle ilk odak içeriğe geç bağlantısıdır", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveText("İçeriğe geç");
});

test("iletişim bilgileri görünür ve bağlantılar doğru", async ({ page }) => {
  await page.goto("/");
  const contact = page.locator("#contact");
  await expect(contact).toContainText("c@bskn.tr");
  await expect(contact).toContainText("+90 532 659 1923");
  await expect(contact.locator('a[href="mailto:c@bskn.tr"]')).toHaveCount(1);
  await expect(contact.locator('a[href="tel:+905326591923"]')).toHaveCount(1);
  await expect(contact.locator("#copy-mail")).toBeVisible();
});

test.describe("İngilizce sayfa", () => {
  test("statik İngilizce içerik ve doğru dil", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/en/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toContainText("back to its source");
    await expect(page.locator(".lang a[aria-current=page]")).toHaveText("EN");
    await ctx.close();
  });

  test("hatasız açılır, yatay taşma yok, dünya yüklenir", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/en/");
    await page.waitForTimeout(2500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test("senaryo İngilizce durumları gösterir", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator("#res-state")).toHaveText("READY FOR EXPERT DECISION");
    await page.locator("label[for=loc-unk]").click();
    await expect(page.locator("#res-state")).toHaveText("INDETERMINATE · NO CONCLUSION");
    await page.locator("label[for=loc-in]").click();
    await page.locator("label[for=evi-none]").click();
    await expect(page.locator("#res-state")).toHaveText("EVIDENCE MISSING");
    await expect(page.locator("#motion-label")).toHaveText("Pause motion");
  });
});

test("dil düğmesi iki sayfa arasında gezer", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".lang")).toBeVisible();
  await page.locator(".lang a", { hasText: "EN" }).click();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.locator(".lang a", { hasText: "TR" }).click();
  await expect(page).toHaveURL(/localhost:4173\/$/);
  await expect(page.locator("h1")).toContainText("kaynağına kadar");
});

test("küre cümleleri sayfanın dilinde", async ({ page }) => {
  await page.goto("/");
  const tr = JSON.parse((await page.locator("#globe").getAttribute("data-phrases")) ?? "[]") as string[];
  expect(tr.length).toBeGreaterThanOrEqual(4);
  expect(tr.join(" ")).toContain("Kaynak");
  await page.goto("/en/");
  const en = JSON.parse((await page.locator("#globe").getAttribute("data-phrases")) ?? "[]") as string[];
  expect(en.length).toBe(tr.length);
  expect(en.join(" ")).toContain("Source");
  const enWords = JSON.parse((await page.locator("#globe").getAttribute("data-words")) ?? "[]") as string[];
  expect(enWords).toContain("Provenance");
  await page.goto("/");
  const trWords = JSON.parse((await page.locator("#globe").getAttribute("data-words")) ?? "[]") as string[];
  expect(trWords).toContain("Köken");
  expect(trWords.length).toBe(enWords.length);
});

test("hareket kapalıyken de dünya hatasız çizilir", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors = collectErrors(page);
  await page.goto("/");
  await page.waitForTimeout(3500);
  expect(errors).toEqual([]);
  await ctx.close();
});
