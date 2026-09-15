import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {PNG} from 'pngjs';
import jsQR from 'jsqr';
const base=process.env.SITE_URL||'http://127.0.0.1:4175/2026-PIRIP-lecture/';
const course=JSON.parse(await fs.readFile('public/course.json','utf8'));
const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'});const page=await context.newPage();
let qrCount=0;
for(const l of course.lectures){for(const s of l.slides.filter(s=>['literature','materials'].includes(s.kind))){
 const u=new URL(base);u.search=new URLSearchParams({lecture:l.id,slide:s.id});await page.goto(u.href);await page.locator('.resource-qr').first().waitFor();
 const elements=page.locator('.reading-entry:has(.resource-qr),.materials-resource');
 for(let i=0;i<await elements.count();i++){
  const element=elements.nth(i);const href=await element.locator('a').getAttribute('href');
  const png=PNG.sync.read(await element.locator('.resource-qr').screenshot({scale:'css'}));
  const decoded=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);
  assert.equal(decoded?.data,href,'QR mismatch: '+s.id);qrCount++;
 }
}}
await page.goto(base);await page.getByRole('button',{name:'Инструменты курса',exact:true}).click();
await page.getByRole('button',{name:'Скачать курс для офлайн',exact:true}).click();
await page.getByText('Курс доступен офлайн.',{exact:false}).waitFor({timeout:30000});
await context.setOffline(true);await page.reload();await page.getByRole('button',{name:'Открыть',exact:true}).first().waitFor();
const offlineLectures=await page.getByRole('button',{name:'Открыть',exact:true}).count();assert.equal(offlineLectures,5);
await context.setOffline(false);await browser.close();
const report={status:'passed',qrDecodedAndMatched:qrCount,offlineReload:true,offlineLectures};await fs.writeFile('reports/resources.json',JSON.stringify(report,null,2));console.log(report);
