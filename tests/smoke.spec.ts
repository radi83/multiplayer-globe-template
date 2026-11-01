import { expect, test } from "@playwright/test";

test("closed Bento cards are text only and all ten are expandable", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".card-trigger")).toHaveCount(10);
  await expect(page.locator(".card img, .card picture, .card svg")).toHaveCount(0);
  await expect(page.locator(".card--marine h2")).toHaveText("Marine Technology");
  await expect(page.locator(".card--team h2")).toHaveText("Engineering meets architecture.");
  await expect(page.locator(".card .plus")).toHaveCount(10);
});

test("each card opens above unchanged Bento geometry with its approved visual", async ({ page }) => {
  await page.goto("/");
  const boxes = async () => page.locator(".card").evaluateAll(cards => cards.map(card => {
    const r = card.getBoundingClientRect(); const el = card as HTMLElement;
    return [el.offsetLeft, el.offsetTop, r.width, r.height];
  }));
  const original = await boxes();
  const visuals = [
    "profile-systems",
    "marine-technology",
    "fleet-operational-field",
    "bmms-evidence-lineage",
    "team-duo",
    "entrepreneurship-innovation",
    "professional-network",
    "certifications-expertise",
    "projects-technology",
    "contact-signal",
  ];
  for (let i = 0; i < visuals.length; i++) {
    await page.locator(".card-trigger").nth(i).click();
    await expect(page.locator("#detail-layer")).toBeVisible();
    if (visuals[i] === "team-duo") {
      await expect(page.locator("#detail-team")).toBeVisible();
      await expect(page.locator(".team-portraits-duo img")).toHaveAttribute("src", "assets/bskn/team-duo.png");
    } else {
      await expect(page.locator("#detail-media .slot img")).toHaveAttribute("src", `assets/bskn/${visuals[i]}.png`);
    }
    expect(await boxes()).toEqual(original);
    await page.keyboard.press("Escape");
    await expect(page.locator("#detail-layer")).toBeHidden();
  }
});

test("BMMS layers update in place", async ({ page }) => {
  await page.goto("/");
  await page.locator(".card--bmms .card-trigger").click();
  const layers = ["source", "version", "passage", "evidence", "review"];
  for (const name of layers) {
    const layer = page.locator(`#lineage button[data-layer="${name}"]`);
    await layer.click();
    await expect(layer).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".layer-explanation")).not.toBeEmpty();
    await expect(page.locator("#lineage button")).toHaveCount(5);
  }
});

test("mobile layout has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator(".card--marine .card-trigger").click();
  await expect(page.locator("#detail-layer")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
