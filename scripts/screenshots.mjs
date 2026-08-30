// One-off README screenshot generator. Run with the preview server up:
//   npm run build && npm run preview   (in another terminal)
//   npm install --no-save puppeteer-core
//   node scripts/screenshots.mjs
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const OUT = "docs/screenshots";
const EDGE =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: "networkidle0" });

const clickButton = (label) =>
  page.evaluate((l) => {
    const button = [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim().toLowerCase() === l,
    );
    button?.click();
  }, label);

const waitForLabel = (text) =>
  page.waitForFunction(
    (t) =>
      [...document.querySelectorAll("p")].some(
        (p) => p.textContent.trim() === t,
      ),
    { timeout: 30000 },
    text,
  );

await page.screenshot({ path: `${OUT}/idle.png` });

await clickButton("start");
await waitForLabel("Get ready");
await sleep(2400); // let the countdown show a mid-value
await page.screenshot({ path: `${OUT}/get-ready.png` });

await waitForLabel("Hold");
await sleep(3400);
await page.screenshot({ path: `${OUT}/hold.png` });

await waitForLabel("Next position");
await sleep(1400);
await page.screenshot({ path: `${OUT}/next-position.png` });

await waitForLabel("Hold");
await sleep(2000);
await clickButton("stop");
await waitForLabel("Time in position");
await sleep(400);
await page.screenshot({ path: `${OUT}/finished.png` });

await browser.close();
console.log(`Screenshots written to ${OUT}/`);
