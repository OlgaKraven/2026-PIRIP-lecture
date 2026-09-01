import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { launchBrowser, startServer, stopServer } from './runtime.mjs';

function arg(name) { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : null; }
const requestedLecture = arg('--lecture');
const requestedVariant = arg('--variant');
if (requestedVariant && !['student', 'teacher'].includes(requestedVariant)) throw new Error(`Unknown variant: ${requestedVariant}`);
const variants = requestedVariant ? [requestedVariant] : ['student', 'teacher'];
const port = 4400 + Math.floor(Math.random() * 300);
const liveUrl = process.env.PDF_BASE_URL?.replace(/\/$/, '');
const { child, url } = liveUrl ? { child: null, url: liveUrl } : await startServer(port);
let browser;
try {
  browser = await launchBrowser();
  const catalog = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await catalog.goto(url, { waitUntil: 'networkidle' });
  const lectures = await catalog.locator('[data-lecture-id]').evaluateAll((cards) => cards.map((card, index) => ({ id: card.getAttribute('data-lecture-id'), order: index + 1 })));
  await catalog.close();
  const selected = requestedLecture ? lectures.filter((lecture) => lecture.id === requestedLecture) : lectures;
  if (selected.length === 0) throw new Error(`Lecture not found: ${requestedLecture}`);
  for (const mode of variants) await mkdir(path.join(process.cwd(), 'outputs', 'pdf', mode), { recursive: true });
  for (const [index, lecture] of selected.entries()) for (const mode of variants) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto(`${url}/print?lecture=${encodeURIComponent(lecture.id)}&mode=${mode}`, { waitUntil: 'networkidle', timeout: 120_000 });
    await page.waitForFunction(() => window.__DECK_READY__ === true, null, { timeout: 120_000 });
    const outputPath = path.join(process.cwd(), 'outputs', 'pdf', mode, `${lecture.id}.pdf`);
    await page.pdf({ path: outputPath, printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
    await page.close(); console.log(`[${index + 1}/${selected.length}] ${mode}: ${outputPath}`);
  }
} finally { if (browser) await browser.close(); if (child) stopServer(child); }
