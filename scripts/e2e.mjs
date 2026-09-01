import { launchBrowser, startServer, stopServer } from './runtime.mjs';

const viewports = [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 360, height: 800 }];
const port = 4700 + Math.floor(Math.random() * 200);
const liveUrl = process.env.SMOKE_BASE_URL?.replace(/\/$/, '');
const { child, url } = liveUrl ? { child: null, url: liveUrl } : await startServer(port);
let browser;
try {
  browser = await launchBrowser(); const page = await browser.newPage(); const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  if (await page.locator('[data-lecture-id]').count() !== 5) throw new Error('Catalog must contain 5 lectures');
  if (await page.locator('[data-lab-id]').count() !== 5) throw new Error('Catalog must contain 5 laboratories');
  const lectures = await page.locator('[data-lecture-id]').evaluateAll((cards) => cards.map((card) => card.getAttribute('data-lecture-id')));
  const labs = await page.locator('.lab-card[data-lab-id]').evaluateAll((cards) => cards.map((card) => card.getAttribute('data-lab-id')));
  for (const lecture of lectures) { await page.goto(`${url}/?lecture=${lecture}&slide=25`, { waitUntil: 'networkidle' }); await page.locator('.slide.is-active[data-slide-order="25"]').waitFor(); }
  for (const lab of labs) { await page.goto(`${url}/?lab=${lab}`, { waitUntil: 'networkidle' }); await page.locator(`.lab-shell[data-lab-id="${lab}"]`).waitFor(); }
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.getByLabel('Поиск по лекциям и лабораторным').fill('адаптивность');
  if (await page.locator('[data-lecture-id]').count() === 0) throw new Error('Search returned no matching lectures');
  await page.getByRole('button', { name: 'КИМ 2' }).click();
  if (await page.locator('[data-lecture-id]').count() === 0) throw new Error('KIM filter returned no content');
  await page.goto(`${url}/?lecture=${lectures[0]}&slide=1`, { waitUntil: 'networkidle' });
  await page.keyboard.press('ArrowRight'); await page.locator('.progress-block > span').filter({ hasText: '2 / 25' }).waitFor();
  const saved = await page.evaluate(() => localStorage.length); if (saved === 0) throw new Error('Progress was not saved');
  await page.getByRole('button', { name: 'Сбросить прогресс' }).click();
  for (const viewport of viewports) { await page.setViewportSize(viewport); await page.goto(`${url}/?lecture=${lectures[0]}&slide=5`, { waitUntil: 'networkidle' }); const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (overflow > 1) throw new Error(`Overflow ${overflow}px at ${viewport.width}x${viewport.height}`); console.log(`OK ${viewport.width}x${viewport.height}`); }
  await page.goto(url, { waitUntil: 'networkidle' }); const qr = page.getByAltText('QR-код ссылки на папку материалов'); if (!await qr.evaluate((image) => image.complete && image.naturalWidth > 0)) throw new Error('QR did not load');
  const materialHref = await page.getByRole('link', { name: /Открыть папку материалов/ }).getAttribute('href'); if (materialHref !== 'https://disk.yandex.ru/d/doO6apAunlrARw') throw new Error('Materials URL mismatch');
  if (errors.length) throw new Error(`JavaScript errors: ${errors.join(' | ')}`);
  console.log('OK catalog/search/filter/deep links/keyboard/progress/theme-ready/QR');
} finally { if (browser) await browser.close(); if (child) stopServer(child); }
