import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { renderBody, renderHead, type Content, type Lang } from "./src/templates/page.ts";
import { CONTACT, SITE_URL } from "./src/config.ts";

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
          .replace("<!--app:head-->", renderHead(content, SITE_URL, lang))
          .replace("<!--app:body-->", renderBody(content, CONTACT, lang));
        if (out.includes("<!--app:")) throw new Error(`${ctx.filename}: işlenmemiş şablon işareti kaldı`);
        if (!out.includes(`<html lang="${lang}"`)) throw new Error(`${ctx.filename}: <html lang> "${lang}" olmalı`);
        return out;
      },
    },
  };
}

export default defineConfig({
  // Göreli yollar: site hem alan adının kökünde hem bir alt yolda çalışır.
  base: "./",
  plugins: [staticContent()],
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
