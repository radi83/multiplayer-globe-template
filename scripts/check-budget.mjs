/**
 * Derleme sonrası kontrol: boyut bütçesi ve statik içerik.
 *
 * - Ana JavaScript ve CSS küçük kalmalı (kongre interneti).
 * - Three.js ayrı, sonradan yüklenen bir parça olmalı.
 * - Metin statik HTML'de olmalı; şablon işareti kalmamalı.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const DIST = "dist";
const KB = 1024;
const BUDGET = {
  entryJs: 80 * KB, // gzip
  css: 20 * KB, // gzip
  lazyChunk: 200 * KB, // gzip, en büyük sonradan yüklenen parça
  html: 30 * KB, // gzip
};

const html = readFileSync(join(DIST, "index.html"), "utf8");
const assets = readdirSync(join(DIST, "assets")).map((name) => {
  const path = join(DIST, "assets", name);
  const buf = readFileSync(path);
  return { name, raw: statSync(path).size, gz: gzipSync(buf).length };
});

const entryNames = [...html.matchAll(/<script[^>]+type="module"[^>]+src="\.\/assets\/([^"]+)"/g)].map((m) => m[1]);
const cssNames = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="\.\/assets\/([^"]+)"/g)].map((m) => m[1]);
const js = assets.filter((a) => a.name.endsWith(".js"));
const entry = js.filter((a) => entryNames.includes(a.name));
const lazy = js.filter((a) => !entryNames.includes(a.name));
const css = assets.filter((a) => cssNames.includes(a.name));
const fonts = assets.filter((a) => a.name.endsWith(".woff2"));

const sum = (list, key) => list.reduce((n, a) => n + a[key], 0);
const fmt = (n) => `${(n / KB).toFixed(1)} KB`;
const failures = [];
const check = (label, value, limit) => {
  const ok = value <= limit;
  console.log(`${ok ? "✓" : "✗"} ${label.padEnd(34)} ${fmt(value).padStart(10)}  / ${fmt(limit)}`);
  if (!ok) failures.push(label);
};

console.log("\nBoyut bütçesi (gzip)");
check("HTML", gzipSync(html).length, BUDGET.html);
check("Ana JavaScript", sum(entry, "gz"), BUDGET.entryJs);
check("CSS", sum(css, "gz"), BUDGET.css);
const biggestLazy = lazy.reduce((m, a) => (a.gz > m.gz ? a : m), { gz: 0, name: "-" });
check(`Sonradan yüklenen (${biggestLazy.name})`, biggestLazy.gz, BUDGET.lazyChunk);
console.log(`  Yazı tipi dosyaları: ${fonts.length} adet, ${fmt(sum(fonts, "raw"))} (tarayıcı yalnız kullanılanları indirir)`);

if (entry.length === 0) failures.push("Ana betik index.html içinde bulunamadı");
if (lazy.length === 0) failures.push("Three.js ayrı bir parçaya bölünmemiş");
if (html.includes("<!--app:")) failures.push("İşlenmemiş şablon işareti");
if (!/<h1>[^<]*\S/.test(html)) failures.push("Başlık statik HTML'de yok");
if (/fonts\.googleapis|fonts\.gstatic/.test(html)) failures.push("Harici yazı tipi bağlantısı var");

if (failures.length) {
  console.error(`\nBütçe/kontrol hatası: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\nTüm kontroller geçti.\n");
