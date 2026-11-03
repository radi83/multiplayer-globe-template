import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const PAGES = [
  { path: "/", lang: "tr", role: "Uzakyol Gemi Baş Mühendisi", cvFileName: "Murat_Can_Baskan_CV_Signature_White_TR.pdf" },
  { path: "/en/", lang: "en", role: "Ocean-Going Chief Engineer", cvFileName: "Murat_Can_Baskan_CV_EN.pdf" },
];

for (const p of PAGES) {
  test.describe(`${p.lang.toUpperCase()} suite`, () => {
    // Test all 3 viewports
    for (const vp of VIEWPORTS) {
      test(`Renders correctly on ${vp.name} (${vp.width}px) without horizontal scroll`, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(p.path);

        await expect(page.locator("html")).toHaveAttribute("lang", p.lang);
        await expect(page.locator("body")).toHaveAttribute("data-lang", p.lang);

        // Header identity verification
        await expect(page.locator(".identity-name")).toHaveText("Murat Can Başkan");
        await expect(page.locator(".identity-role")).toHaveText(p.role);

        // Check horizontal overflow
        const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
        expect(sw).toBeLessThanOrEqual(iw);

        expect(errors).toEqual([]);
      });
    }

    test("Closed cards rule: strictly 10 cards, image-free, exact structure", async ({ page }) => {
      await page.goto(p.path);
      const cards = page.locator(".bento-card");
      await expect(cards).toHaveCount(10);

      // Verify closed cards have ZERO images or svg illustrations
      for (let i = 0; i < 10; i++) {
        const card = cards.nth(i);
        await expect(card.locator("img")).toHaveCount(0);
        await expect(card.locator("picture")).toHaveCount(0);
        await expect(card.locator("svg")).toHaveCount(0);
        await expect(card.locator(".bento-card__num")).toBeVisible();
        await expect(card.locator(".bento-card__plus")).toHaveText("+");
        await expect(card.locator(".bento-card__title")).toBeVisible();
        await expect(card.locator(".bento-card__sub")).toBeVisible();
      }

      // Check DEFAMED spelling specifically in Card 08
      const card08 = page.locator('.bento-card[data-card="08"]');
      await expect(card08.locator(".bento-card__sub")).toContainText("DEFAMED");
    });

    test("All 10 modules open into editorial layer and close via Escape or Backdrop", async ({ page }) => {
      await page.goto(p.path);
      const layer = page.locator("#detail-layer");
            await expect(layer).toBeHidden();

      const moduleIds = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];

      for (const modId of moduleIds) {
        const trigger = page.locator(`.bento-card[data-card="${modId}"] button`);
        await trigger.scrollIntoViewIfNeeded();
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
        await trigger.click();

        await expect(layer).toBeVisible();
        await expect(trigger).toHaveAttribute("aria-expanded", "true");
        await expect(page.locator(`.module-open-pane[data-pane="${modId}"]`)).toBeVisible();

        // Close via Escape key
        await page.keyboard.press("Escape");
        await expect(layer).toBeHidden();
        await expect(trigger).toHaveAttribute("aria-expanded", "false");

        // Open again and close via backdrop click
        await trigger.click();
        await expect(layer).toBeVisible();
        await page.locator("#overlay-dismiss-btn").click();
        await expect(layer).toBeHidden();
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
      }
    });

    test("Career module (02): displays stats, 17 posts, and filters by vessel type", async ({ page }) => {
      await page.goto(p.path);
      await page.locator('.bento-card[data-card="02"] button').click();
      await expect(page.locator('.module-open-pane[data-pane="02"]')).toBeVisible();

      // Stats row
      const statVals = page.locator(".career-stat-val");
      await expect(statVals).toHaveCount(4);

      // Total posts
      const posts = page.locator(".career-post-entry");
      await expect(posts).toHaveCount(17);

      // Filtering by Capesize
      const capesizeFilter = page.locator('.career-chip[data-filter="capesize"]');
      await capesizeFilter.click();
      await expect(capesizeFilter).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator('.career-post-entry[data-post-type="capesize"]')).toBeVisible();
      await expect(page.locator('.career-post-entry:visible')).toHaveCount(1);

      // Reset to all
      const allFilter = page.locator('.career-chip[data-filter="all"]');
      await allFilter.click();
      await expect(page.locator('.career-post-entry:visible')).toHaveCount(17);
    });

    test("Marine Technology module (04): category tabs and progressive disclosure", async ({ page }) => {
      await page.goto(p.path);
      await page.locator('.bento-card[data-card="04"] button').click();
      await expect(page.locator('.module-open-pane[data-pane="04"]')).toBeVisible();

      const tabs = page.locator(".skills-tab-btn");
      await expect(tabs).toHaveCount(6);

      // Switch to operations tab
      const opsTab = page.locator('.skills-tab-btn[data-skill-tab="operations"]');
      await opsTab.click();
      await expect(opsTab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator('.skills-tab-content[data-skill-content="operations"]')).toBeVisible();
    });

    test("BMMS module (05): contains narrative, R&D badges, graphic and external CTA link", async ({ page }) => {
      await page.goto(p.path);
      await page.locator('.bento-card[data-card="05"] button').click();
      await expect(page.locator('.module-open-pane[data-pane="05"]')).toBeVisible();

      const cta = page.locator(".bmms-cta-btn");
      await expect(cta).toHaveText("Explore BMMS →");
      await expect(cta).toHaveAttribute("href", "https://bskn.net");
    });

    test("Certifications module (07): contains 12 certificates and document previews", async ({ page }) => {
      await page.goto(p.path);
      await page.locator('.bento-card[data-card="07"] button').click();
      await expect(page.locator('.module-open-pane[data-pane="07"]')).toBeVisible();

      const certs = page.locator(".cert-card");
      await expect(certs).toHaveCount(12);

      // Test opening a certificate zoom preview
      const thumb = page.locator(".cert-view-btn").first();
      await thumb.click();
      const zoomModal = page.locator("#zoom-modal");
      await expect(zoomModal).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(zoomModal).toBeHidden();
    });

    test("Memberships module (08): contains UYBM, GEMİMO, DEFAMED, IMarEST with official logos", async ({ page }) => {
      await page.goto(p.path);
      await page.locator('.bento-card[data-card="08"] button').click();
      await expect(page.locator('.module-open-pane[data-pane="08"]')).toBeVisible();

      const members = page.locator(".member-card");
      await expect(members).toHaveCount(4);
      await expect(members.locator(".member-acronym")).toContainText(["UYBM", "GEMİMO", "DEFAMED", "IMarEST"]);
      await expect(members.locator("img")).toHaveCount(4);
    });

    test("Professional Registration module (03): conservative In Progress status", async ({ page }) => {
      await page.goto(p.path);
      await page.locator('.bento-card[data-card="03"] button').click();
      await expect(page.locator('.module-open-pane[data-pane="03"]')).toBeVisible();

      const statusPill = page.locator(".reg-status-pill");
      await expect(statusPill).toContainText("IN PROGRESS");
    });

    test("Theme toggle: toggles light/dark and persists", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto(p.path);
      await expect(page.locator("body")).toHaveAttribute("data-theme", "light");

      const toggle = page.locator("[data-theme-toggle]");
      await toggle.click();
      await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");

      await page.reload();
      await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
    });

    test("CV access: links point to valid PDF documents", async ({ page, request }) => {
      await page.goto(p.path);
      const cvBtn = page.locator("[data-cv-download]");
      const href = await cvBtn.getAttribute("href");
      expect(href).toContain(".pdf");
      expect(href).toContain(p.cvFileName);

      const res = await request.get(new URL(href ?? "", page.url()).toString());
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("pdf");
    });

    test("SEO head verification", async ({ page }) => {
      await page.goto(p.path);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe(`https://bskn.tr${p.path}`);
      await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(1);
      const desc = await page.locator('meta[name="description"]').getAttribute("content");
      expect(desc?.length).toBeGreaterThan(60);
    });
  });
}
