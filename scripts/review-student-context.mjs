import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.SITE_URL||'http://127.0.0.1:4198/2026-PIRIP-lecture/';
const browser=await chromium.launch();const results=[];const errors=[];
await fs.mkdir('work/student-context/screens',{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',error=>errors.push(String(error)));
 const course=await (await page.request.get(base+'course.json')).json();
 const go=async(lecture,slide)=>{await page.goto(base+'?'+new URLSearchParams({lecture:lecture.id,slide:slide.id}),{waitUntil:'domcontentloaded'});await page.locator(`[data-slide-id="${slide.id}"]`).waitFor();await page.evaluate(()=>document.fonts.ready);};
 for(const [i,lecture] of course.lectures.entries()){
  const intro=lecture.slides.find(s=>s.id.endsWith('-context'));
  await go(lecture,intro);assert.equal(await page.locator('.slide-source,.slide-discipline').count(),0);
  const footer=await page.locator('.slide-footer').innerText();assert(/^\d+$/.test(footer.trim()));
  await page.screenshot({path:`work/student-context/screens/lecture-${i+1}-context.png`});
  const materials=lecture.slides.find(s=>s.kind==='materials');await go(lecture,materials);
  const link=page.getByRole('link',{name:'Условие учебного проекта «Конференции.РФ» ↗',exact:true});
  const href=await link.getAttribute('href');assert(href.endsWith('#lecture-'+(i+1)));
  const brief=new URL(href);await page.goto(base+'project-brief.html'+brief.hash,{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'«Конференции.РФ»: что нужно разработать',exact:true}).waitFor();
  assert.equal(await page.locator('#lecture-'+(i+1)).count(),1);
  results.push({lecture:lecture.id,introduction:true,footer:'number only',briefAnchor:true});
 }
 for(const width of [1366,390]){
  await page.setViewportSize({width,height:width===390?844:768});await page.goto(base+'project-brief.html');
  await page.screenshot({path:`work/student-context/screens/brief-${width}.png`,fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 // Download the real offline bundle, disconnect the browser, then open the HTML brief.
 await page.goto(base);await page.getByRole('button',{name:'Открыть лекцию',exact:true}).first().waitFor();
 const offline=await page.evaluate(async()=>{
  const registration=await navigator.serviceWorker.register(new URL('sw.js',location.href),{scope:new URL('.',location.href).pathname});
  await navigator.serviceWorker.ready;const worker=registration.active;
  return new Promise((resolve,reject)=>{const channel=new MessageChannel();const timer=setTimeout(()=>reject(Error('offline timeout')),45000);channel.port1.onmessage=e=>{clearTimeout(timer);resolve(e.data)};worker.postMessage({type:'PREPARE'},[channel.port2]);});
 });
 assert.equal(offline.ready,true,JSON.stringify(offline));await context.setOffline(true);
 await page.goto(base+'project-brief.html#lecture-2');await page.getByRole('heading',{name:'«Конференции.РФ»: что нужно разработать',exact:true}).waitFor();
 await page.goto(base+'laboratories.html');await page.getByRole('heading',{name:'ПИРИП · Пять лабораторных работ',exact:true}).waitFor();
 await context.setOffline(false);assert.equal(errors.length,0);
 const report={base,lectures:results,briefViewportWidths:[1366,390],offlineBrief:true,offlineLabs:true,errors};
 await fs.writeFile('reports/student-context.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close();}
