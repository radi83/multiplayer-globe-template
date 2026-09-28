import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { SITE_URL, SEARCH_VERIFICATION } from "./src/config.ts";
import { LANG_PATH, renderBody, renderHead } from "./src/templates/page.ts";
import type { Lang } from "./src/data.ts";

const langOf = (file: string): Lang => (/[\\/]en[\\/]index\.html$/.test(file) ? "en" : "tr");

/** <!--HEAD--> ve <!--BODY--> işaretlerini derleme anında statik HTML ile doldurur. */
function staticContent(): Plugin {
  return {
    name: "bskn-static-content",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const lang = langOf(ctx.filename);
        if (!html.includes(`<html lang="${lang}"`)) {
          throw new Error(`${ctx.filename}: <html lang> "${lang}" olmalı`);
        }
        return html
          .replace("<!--HEAD-->", renderHead(lang, SITE_URL, SEARCH_VERIFICATION))
          .replace("<!--BODY-->", renderBody(lang));
      },
    },
  };
}

/** sitemap.xml ve robots.txt üretir. */
function seoFiles(): Plugin {
  return {
    name: "bskn-seo-files",
    apply: "build",
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const langs = Object.keys(LANG_PATH) as Lang[];
      const alts = langs
        .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}${LANG_PATH[l]}"/>`)
        .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>`)
        .join("\n");
      const urls = langs
        .map((l) => `  <url>\n    <loc>${SITE_URL}${LANG_PATH[l]}</loc>\n    <lastmod>${today}</lastmod>\n${alts}\n  </url>`)
        .join("\n");
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [staticContent(), seoFiles()],
  build: {
    rollupOptions: {
      input: { tr: resolve(import.meta.dirname, "index.html"), en: resolve(import.meta.dirname, "en/index.html") },
    },
  },
  server: { watch: { ignored: ["**/test-results/**"] } },
});

