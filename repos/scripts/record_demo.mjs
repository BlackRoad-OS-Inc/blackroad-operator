import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const [,, outputPathArg] = process.argv;
if (!outputPathArg) {
  console.error('Usage: record_demo.mjs <output.webm>');
  process.exit(1);
}

const outputPath = path.resolve(outputPathArg);
await fs.mkdir(path.dirname(outputPath), { recursive: true });

const demoCasePath = path.resolve('demo/cases/borderline.json');
await fs.readFile(demoCasePath, 'utf-8');

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: path.dirname(outputPath), size: { width: 1280, height: 720 } }
});
const page = await context.newPage();

const demoUrl = process.env.DEMO_URL || 'http://localhost:5173/_devDemo';
await page.goto(`${demoUrl}?case=borderline`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.click('button[data-action="replay"]');
await page.waitForSelector('[data-status="bundle-ready"]', { timeout: 60000 });
await page.waitForTimeout(2000);

const videoPath = await page.video().path();
await context.close();
await browser.close();

await fs.copyFile(videoPath, outputPath);
