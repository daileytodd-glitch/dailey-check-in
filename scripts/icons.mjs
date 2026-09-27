import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
const svg = readFileSync("public/icon.svg", "utf8");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [name, size] of [["icon-512.png", 512], ["icon-192.png", 192], ["apple-touch-icon.png", 180], ["badge-96.png", 96]]) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`);
  const buf = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(`public/${name}`, buf);
  await page.close();
}
await browser.close();
console.log("icons written");
