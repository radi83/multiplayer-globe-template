// Derleme sonrası kontrol: içerik statik HTML'de mi, boyutlar bütçede mi, SEO dosyaları var mı.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
const fail = [];
const kb = (n) => (n / 1024).toFixed(1) + " KB";
const gz = (f) => gzipSync(readFileSync(f)).length;

const budget = { html: 30 * 1024, js: 12 * 1024, css: 16 * 1024 };

for (const [page, must] of [
  ["index.html", ["Murat Can Başkan", "Baş Mühendis", "c@bskn.tr", "UYBM", "IMarEST"]],
  ["en/index.html", ["Murat Can Başkan", "Chief Engineer", "c@bskn.tr", "UYBM", "IMarEST"]],
]) {
  const f = join(dist, page);
  if (!existsSync(f)) {
    fail.push(`${page} yok`);
    continue;
  }
  const html = readFileSync(f, "utf8");
  for (const m of must) if (!html.includes(m)) fail.push(`${page}: "${m}" statik HTML'de yok`);
  if (html.includes("<!--HEAD-->") || html.includes("<!--BODY-->")) fail.push(`${page}: işaretler doldurulmamış`);
  const size = gz(f);
  console.log(`${page.padEnd(16)} ${kb(size)} gzip`);
  if (size > budget.html) fail.push(`${page} bütçeyi aşıyor (${kb(size)})`);
}

const assets = join(dist, "assets");
for (const f of readdirSync(assets)) {
  const p = join(assets, f);
  const ext = f.split(".").pop();
  if (ext !== "js" && ext !== "css") continue;
  const size = gz(p);
  console.log(`${("assets/" + f).padEnd(40)} ${kb(size)} gzip`);
  if (size > budget[ext]) fail.push(`${f} bütçeyi aşıyor (${kb(size)})`);
}

for (const f of ["sitemap.xml", "robots.txt", "404.html", "favicon.svg", "og-image.jpg", "cv/Murat_Can_Baskan_CV_EN.pdf"]) {
  if (!existsSync(join(dist, f))) fail.push(`${f} yok`);
}

const imgDir = join(dist, "img");
const imgTotal = readdirSync(imgDir).reduce((s, f) => s + statSync(join(imgDir, f)).size, 0);
console.log(`img/ toplam        ${kb(imgTotal)}`);

if (fail.length) {
  console.error("\nKontrol başarısız:\n- " + fail.join("\n- "));
  process.exit(1);
}
console.log("\nKontrol tamam.");
