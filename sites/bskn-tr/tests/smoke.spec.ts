import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", lang: "tr", role: "Baş Mühendis" },
  { path: "/en/", lang: "en", role: "Chief Engineer" },
] as const;

const CARDS = '#kariyer [data-dc-tpl="66"]';

for (const p of PAGES) {
  test.describe(`${p.lang} page`, () => {
    test("renders, no horizontal scroll, one-line name, no Direction toggle", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(p.path);
      await expect(page.locator("html")).toHaveAttribute("lang", p.lang);
      await expect(page.locator("body")).toHaveAttribute("data-lang", p.lang);
      await expect(page.locator("h1")).toContainText("Murat Can");
      await expect(page.locator(CARDS)).toHaveCount(17);
      await expect(page.locator(CARDS).last()).toContainText(p.role);
      const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
      expect(sw).toBeLessThanOrEqual(iw);
      // İsim tek satır (eski sitede iPad'de 3 satıra bölünüyordu).
      const brand = await page.locator('[data-dc-tpl="10"]').boundingBox();
      expect(brand?.height ?? 99).toBeLessThan(32);
      await expect(page.locator('[data-dc-tpl="276"]')).toHaveCount(0);
      await expect(page.getByText(/^(Yön|Direction)$/)).toHaveCount(0);
      expect(errors).toEqual([]);
    });

    test("card grids have no empty cells", async ({ page }) => {
      await page.goto(p.path);
      for (const sel of ['[data-dc-tpl="122"]', '[data-dc-tpl="132"]']) {
        const grid = page.locator(sel);
        const gridBox = await grid.boundingBox();
        const kids = await grid.locator(":scope > *").evaluateAll((els) =>
          els.map((e) => {
            const r = e.getBoundingClientRect();
            return { top: Math.round(r.top), right: Math.round(r.right), left: Math.round(r.left) };
          }),
        );
        // Her satırın son kartı ızgaranın sağ kenarına ulaşır → gri boşluk kalmaz.
        const rows = new Map<number, number>();
        kids.forEach((k) => rows.set(k.top, Math.max(rows.get(k.top) ?? 0, k.right)));
        const right = Math.round((gridBox?.x ?? 0) + (gridBox?.width ?? 0));
        for (const r of rows.values()) expect(Math.abs(right - r)).toBeLessThanOrEqual(6); // 2 px çerçeve + yuvarlama
      }
    });

    test("filter narrows the logbook", async ({ page }) => {
      await page.goto(p.path);
      await page.locator('[data-filter="capesize"]').click();
      await expect(page.locator(`${CARDS}:visible`)).toHaveCount(1);
      await expect(page.locator('[data-filter="capesize"]')).toHaveAttribute("aria-pressed", "true");
      await page.locator('[data-filter="all"]').click();
      await expect(page.locator(`${CARDS}:visible`)).toHaveCount(17);
    });

    test("card opens on click without rotation, closes again", async ({ page }) => {
      await page.goto(p.path);
      const card = page.locator('#kariyer [data-dc-tpl="67"]').nth(8);
      await card.scrollIntoViewIfNeeded();
      // Tıklanabilir olduğu belli: yılın solunda kırmızı "+" kutusu.
      await expect(card.locator(".peek__plus")).toBeVisible();
      await expect(card).toHaveAttribute("aria-expanded", "false");
      await card.hover();
      await expect(card).toHaveAttribute("aria-expanded", "false"); // üzerine gelmek açmaz
      await card.click();
      await expect(card).toHaveAttribute("aria-expanded", "true");
      await expect(card.locator('[data-dc-tpl="84"]')).toBeVisible();
      const tf = await card.locator('[data-dc-tpl="75"]').evaluate((e) => getComputedStyle(e).transform);
      expect(tf === "none" || !/matrix3d/.test(tf)).toBe(true);
      await card.click();
      await expect(card).toHaveAttribute("aria-expanded", "false");
      await card.focus();
      await page.keyboard.press("Enter");
      await expect(card).toHaveAttribute("aria-expanded", "true");
    });

    test("theme toggle persists", async ({ page }) => {
      await page.goto(p.path);
      await expect(page.locator("body")).toHaveAttribute("data-theme", "light");
      await page.locator("[data-theme-toggle]").click();
      await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
      await page.reload();
      await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
    });

    test("CV, contact and language links", async ({ page, request }) => {
      await page.goto(p.path);
      const href = await page.locator(".nav [data-cv-download]").getAttribute("href");
      const res = await request.get(new URL(href ?? "", page.url()).toString());
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("pdf");
      await expect(page.locator('a[href="tel:+905326591923"]')).toHaveCount(1);
      await expect(page.locator('a[href="mailto:c@bskn.tr"]')).toHaveCount(1);
      const other = p.lang === "tr" ? "en" : "tr";
      await page.locator(`[data-lang-switch] a[hreflang="${other}"]`).click();
      await expect(page.locator("html")).toHaveAttribute("lang", other);
    });

    test("SEO head", async ({ page }) => {
      await page.goto(p.path);
      expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(`https://bskn.tr${p.path}`);
      await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(1);
      const desc = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
      expect(desc.length).toBeGreaterThan(80);
      expect(desc.length).toBeLessThanOrEqual(170);
      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
      expect(ld["@graph"].some((n: { "@type": string }) => n["@type"] === "Person")).toBe(true);
    });
  });
}

test("hero shows the blueprint ship and a Project link to bskn.net", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-ship]")).toBeVisible();
  await expect(page.locator("[data-ship-stage]")).toHaveAttribute("role", "img");
  const cta = page.locator(".ship__cta");
  await expect(cta).toContainText("Proje");
  expect(await cta.getAttribute("href")).toBe("https://bskn.net/");
  await expect(page.locator('img[src*="bmms"]')).toHaveCount(0);
});

test("all images load", async ({ page }) => {
  await page.goto("/");
  const srcs = await page.locator("img[src]:not([src^='data:'])").evaluateAll((els) =>
    els.map((e) => (e as HTMLImageElement).src),
  );
  expect(srcs.length).toBeGreaterThan(10);
  for (const s of new Set(srcs)) expect((await page.request.get(s)).status(), s).toBe(200);
});

test("sitemap and robots", async ({ request }) => {
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://bskn.tr/sitemap.xml");
});
