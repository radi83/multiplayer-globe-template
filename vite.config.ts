import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { LANG_PATH, renderBody, renderHead, type Content, type Lang } from "./src/templates/page.ts";
import { CONTACT, SEARCH_VERIFICATION, SITE_URL } from "./src/config.ts";

const root = (path: string): string => fileURLToPath(new URL(path, import.meta.url));
const contentPath: Record<Lang, string> = {
  tr: root("./src/content/tr.json"),
  en: root("./src/content/en.json"),
};

/** Hangi HTML dosyası hangi dilde: en/index.html İngilizce, diğerleri Türkçe. */
const langOf = (filename: string): Lang => (/[\\/]en[\\/]index\.html$/.test(filename) ? "en" : "tr");

/**
 * HTML dosyalarındaki <!--app:head--> ve <!--app:body--> işaretlerini
 * src/content/<dil>.json + src/templates/page.ts çıktısıyla değiştirir.
 * Sonuç: her dilde metnin tamamı statik HTML'de, JavaScript'e bağımlı değil.
 */
function staticContent(): Plugin {
  const watched = Object.values(contentPath);
  return {
    name: "bmms-static-content",
    configureServer(server) {
      watched.forEach((f) => server.watcher.add(f));
      server.watcher.on("change", (file) => {
        if (watched.includes(file)) server.ws.send({ type: "full-reload" });
      });
    },
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const lang = langOf(ctx.filename);
        const content = JSON.parse(readFileSync(contentPath[lang], "utf8")) as Content;
        const out = html
          .replace(
            "<!--app:head-->",
            renderHead(content, lang, { siteUrl: SITE_URL, contact: CONTACT, verification: SEARCH_VERIFICATION }),
          )
          .replace("<!--app:body-->", renderBody(content, CONTACT, lang));
        if (out.includes("<!--app:")) throw new Error(`${ctx.filename}: işlenmemiş şablon işareti kaldı`);
        if (!out.includes(`<html lang="${lang}"`)) throw new Error(`${ctx.filename}: <html lang> "${lang}" olmalı`);
        return out;
      },
    },
  };
}

/**
 * robots.txt ve sitemap.xml: site adresi tek kaynaktan (src/config.ts) gelir.
 * Site haritası iki dili ve aralarındaki hreflang bağlantılarını içerir.
 */
function seoFiles(): Plugin {
  return {
    name: "bmms-seo-files",
    apply: "build",
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const langs = Object.keys(LANG_PATH) as Lang[];
      const loc = (l: Lang): string => `${SITE_URL}${LANG_PATH[l]}`;
      const alternates = [
        ...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${loc(l)}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc("tr")}"/>`,
      ].join("\n");
      const urls = langs
        .map((l) => `  <url>\n    <loc>${loc(l)}</loc>\n    <lastmod>${today}</lastmod>\n${alternates}\n  </url>`)
        .join("\n");
      const sitemap = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
        urls,
        `</urlset>`,
        ``,
      ].join("\n");
      const robots = [`User-agent: *`, `Allow: /`, ``, `Sitemap: ${SITE_URL}/sitemap.xml`, ``].join("\n");
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
    },
  };
}

export default defineConfig({
  // Göreli yollar: site hem alan adının kökünde hem bir alt yolda çalışır.
  base: "./",
  plugins: [staticContent(), seoFiles()],
  build: {
    outDir: "dist",
    target: "es2020",
    sourcemap: true,
    assetsInlineLimit: 0,
    // Three.js parçası bilerek büyük ve sonradan yükleniyor; bütçe scripts/check-budget.mjs içinde.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        tr: root("./index.html"),
        en: root("./en/index.html"),
      },
    },
  },
});
