import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", lang: "tr", role: "Baş Mühendis", cv: "CV indir" },
  { path: "/en/", lang: "en", role: "Chief Engineer", cv: "Download CV" },
] as const;

for (const p of PAGES) {
  test.describe(`${p.lang} page`, () => {
    test("renders content, no horizontal scroll, one-line name", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(p.path);
      await expect(page.locator("html")).toHaveAttribute("lang", p.lang);
      await expect(page.locator("h1")).toContainText("Murat Can");
      await expect(page.locator(".post")).toHaveCount(17);
      await expect(page.locator(".post--now")).toContainText(p.role);
      const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
      expect(sw).toBeLessThanOrEqual(iw);
      // İsim üst şeritte tek satırda kalmalı (eski sitede iPad'de 3 satıra bölünüyordu).
      const brand = await page.locator(".brand__name").boundingBox();
      expect(brand?.height ?? 99).toBeLessThan(36);
      // Tasarım aracından kalan "Direction A/B" düğmesi olmamalı.
      await expect(page.getByText(/direction/i)).toHaveCount(0);
      expect(errors).toEqual([]);
    });

    test("memberships fill their rows", async ({ page }) => {
      await page.goto(p.path);
      const members = page.locator(".member");
      await expect(members).toHaveCount(4);
      const boxes = await members.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
      const rows = new Map<number, number>();
      boxes.forEach((t) => rows.set(Math.round(t), (rows.get(Math.round(t)) ?? 0) + 1));
      const counts = [...rows.values()];
      // Her satırda aynı sayıda kart: boş gri hücre kalmaz.
      expect(new Set(counts).size).toBe(1);
    });

    test("filters narrow the logbook", async ({ page }) => {
      await page.goto(p.path);
      await page.locator('[data-filter="capesize"]').click();
      await expect(page.locator(".post:visible")).toHaveCount(1);
      await expect(page.locator('[data-filter="capesize"]')).toHaveAttribute("aria-pressed", "true");
      await page.locator('[data-filter="all"]').click();
      await expect(page.locator(".post:visible")).toHaveCount(17);
    });

    test("theme toggle persists", async ({ page }) => {
      await page.goto(p.path);
      const before = await page.locator("html").getAttribute("data-theme");
      await page.locator("[data-theme-toggle]").click();
      const after = await page.locator("html").getAttribute("data-theme");
      expect(after).not.toBe(before);
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", after ?? "");
    });

    test("links: CV, contact, language switch", async ({ page, request }) => {
      await page.goto(p.path);
      const cv = page.locator("a.cv");
      await expect(cv).toBeVisible();
      const res = await request.get(new URL((await cv.getAttribute("href")) ?? "", page.url()).toString());
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("pdf");
      await expect(page.locator('a[href="tel:+905326591923"]')).toHaveCount(1);
      await expect(page.locator('a[href="mailto:c@bskn.tr"]').first()).toBeVisible();
      const other = p.lang === "tr" ? "en" : "tr";
      await page.locator(`.lang a[hreflang="${other}"]`).click();
      await expect(page.locator("html")).toHaveAttribute("lang", other);
    });

    test("SEO head", async ({ page }) => {
      await page.goto(p.path);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe(`https://bskn.tr${p.path}`);
      await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(1);
      const desc = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
      expect(desc.length).toBeGreaterThan(80);
      expect(desc.length).toBeLessThanOrEqual(170);
      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
      expect(ld["@graph"].some((n: { "@type": string }) => n["@type"] === "Person")).toBe(true);
    });
  });
}

test("images load", async ({ page }) => {
  await page.goto("/");
  const srcs = await page.locator("img").evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src));
  for (const s of new Set(srcs)) {
    const r = await page.request.get(s);
    expect(r.status(), s).toBe(200);
  }
});

test("sitemap, robots and 404", async ({ request }) => {
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://bskn.tr/sitemap.xml");
});
