#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function main() {
  const repo = process.env.GITHUB_REPOSITORY || 'user/repo';
  const owner = repo.split('/')[0];
  const base =
    process.env.BLACKROAD_URL ||
    (process.env.BLACKROAD_DOMAIN ? `https://${process.env.BLACKROAD_DOMAIN}` : '') ||
    `https://${owner}.github.io`;
  const url = `${base.replace(/\/$/, '')}/`;

  const outDir = path.join(process.cwd(), 'artifacts', 'site-screenshots');
  fs.mkdirSync(outDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(outDir, `home-${timestamp}.png`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  } catch (error) {
    console.error('Unable to launch Chromium:', error.message);
    process.exit(1);
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const publicDir = path.join(process.cwd(), 'sites', 'blackroad', 'public', 'snapshots');
    fs.mkdirSync(publicDir, { recursive: true });
    const latestPath = path.join(publicDir, 'latest.png');
    fs.copyFileSync(screenshotPath, latestPath);
    fs.writeFileSync(
      path.join(publicDir, 'latest.json'),
      JSON.stringify(
        {
          updatedAt: new Date().toISOString(),
          file: 'latest.png',
          source: url,
        },
        null,
        2,
      ),
    );

    console.log(`Saved screenshot to ${screenshotPath}`);
  } catch (error) {
    console.error('Screenshot failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
