import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { renderBody, renderHead, type Content } from "./src/templates/page.ts";
import { CONTACT, SITE_URL } from "./src/config.ts";

const contentPath = fileURLToPath(new URL("./src/content/tr.json", import.meta.url));

/**
 * index.html içindeki <!--app:head--> ve <!--app:body--> işaretlerini
 * src/content/tr.json + src/templates/page.ts çıktısıyla değiştirir.
 * Sonuç: metnin tamamı statik HTML'de, JavaScript'e bağımlı değil.
 */
function staticContent(): Plugin {
  return {
    name: "bmms-static-content",
    configureServer(server) {
      server.watcher.add(contentPath);
      server.watcher.on("change", (file) => {
        if (file === contentPath) server.ws.send({ type: "full-reload" });
      });
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const content = JSON.parse(readFileSync(contentPath, "utf8")) as Content;
        const out = html
          .replace("<!--app:head-->", renderHead(content, SITE_URL))
          .replace("<!--app:body-->", renderBody(content, CONTACT));
        if (out.includes("<!--app:")) throw new Error("index.html: işlenmemiş şablon işareti kaldı");
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
  },
});
