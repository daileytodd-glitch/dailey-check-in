// Screenshots of the phone and TV views for a quick visual review.
// Usage: node scripts/screenshots.mjs [baseUrl] [outDir]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "screenshots";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

const tv = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await tv.goto(`${base}/tv`, { waitUntil: "networkidle" });
await tv.waitForTimeout(1500);
await tv.screenshot({ path: `${out}/tv.png` });

const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await phone.goto(`${base}/`, { waitUntil: "networkidle" });
await phone.waitForTimeout(1500);
await phone.screenshot({ path: `${out}/phone-pick.png`, fullPage: true });
await phone.getByRole("button", { name: /Oliver/ }).click();
await phone.waitForTimeout(800);
await phone.screenshot({ path: `${out}/phone-checkin.png`, fullPage: true });

await browser.close();
console.log("screenshots in", out);
