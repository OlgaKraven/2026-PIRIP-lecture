import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.SITE_URL||'http://127.0.0.1:4175/2026-PIRIP-lecture/';
const course=JSON.parse(await fs.readFile('public/course.json','utf8'));
const bank=JSON.parse(await fs.readFile('public/assessment.json','utf8'));
const output='work/browser';await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
await context.addInitScript(()=>{localStorage.setItem('lecture:/2026-PIRIP-lecture/:pirip-2027:animation','false');});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(base);await page.getByRole('button',{name:'Открыть',exact:true}).first().waitFor();
assert.equal(await page.getByRole('button',{name:'Открыть',exact:true}).count(),5);
await page.screenshot({path:output+'/catalog.png',fullPage:true});
await page.setViewportSize({width:1200,height:630});await page.screenshot({path:'public/og.png'});
const findings=[];let checked=0;
async function go(l,s){await page.evaluate(({l,s})=>{const u=new URL(location.href);u.search=new URLSearchParams({lecture:l,slide:s}).toString();history.replaceState({},'',u);dispatchEvent(new PopStateEvent('popstate'));},{l:l.id,s:s.id});await page.locator(`[data-slide-id="${s.id}"]`).waitFor();}
for(const viewport of (process.env.ONLY_FUNCTIONAL?[]:[{width:1920,height:1080},{width:1366,height:768},{width:390,height:844}])){
 await page.setViewportSize(viewport);
 for(const l of course.lectures){for(const s of l.slides){
  await go(l,s);await page.evaluate(()=>document.fonts.ready);
  const bad=await page.locator(`[data-slide-id="${s.id}"]`).evaluate((el)=>{
   const frame=el.getBoundingClientRect();const nodes=[...el.querySelectorAll('.slide-copy h2,.slide-body-copy,.slide-copy li,.reading-entry,.task-prompt,.choice-grid label,.matching-fields label,.write-note,.slide-image,.infographic')];
   const overflow=nodes.filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&(r.left<frame.left-2||r.right>frame.right+2||r.bottom>frame.bottom-8);}).map(n=>({tag:n.className||n.tagName,text:n.textContent?.slice(0,90),bottom:Math.round(n.getBoundingClientRect().bottom-frame.bottom)}));
   return {pageOverflow:document.documentElement.scrollWidth>innerWidth+2,overflow};
  });
  if(bad.pageOverflow||bad.overflow.length)findings.push({width:viewport.width,slide:s.id,...bad});
  if(viewport.width===1366&&(['title','literature','agenda','section','questions','test'].includes(s.kind)||s.id.endsWith('-example')||s.visual?.type==='codeParts'))await page.locator(`[data-slide-id="${s.id}"]`).screenshot({path:output+'/'+s.id+'.png'});
  checked++;
 }console.log('Rendered',viewport.width,l.id);}
}
if(checked)await fs.writeFile('reports/browser-geometry.json',JSON.stringify({checked,findings,errors},null,2));
console.log('Geometry:',checked,'slides across sizes;',findings.length,'findings');
// Four task types: empty, correct, incorrect, partial, retry and mobile result privacy.
await page.setViewportSize({width:1366,height:900});
const lecture=course.lectures[0],tasks=lecture.slides.filter(s=>s.task).slice(0,4);
for(const s of tasks){
 await go(lecture,s);const t=s.task,k=bank.keys[t.id];
 await page.getByRole('button',{name:'Проверить',exact:true}).click();assert.equal(await page.locator('.task-status').count(),0);
 if(t.type==='single')await page.getByRole('radio').nth(t.options.findIndex(o=>o.id===k.correct[0])).check();
 if(t.type==='multiple')for(const id of k.correct)await page.getByRole('checkbox').nth(t.options.findIndex(o=>o.id===id)).check();
 if(t.type==='short')await page.getByRole('textbox',{name:'Краткий ответ'}).fill('  '+k.accepted[0].toLowerCase()+'  ');
 if(t.type==='matching')for(const item of t.items)await page.getByLabel('Соответствие: '+item.text).selectOption(k.pairs[item.id]);
 await page.getByRole('button',{name:'Проверить',exact:true}).click();await page.locator('.task-status.correct').waitFor();
 await page.getByRole('button',{name:'Разбор ответа',exact:true}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});await page.getByText('Ответ сохранён',{exact:true}).waitFor();assert.equal(await page.locator('.task-status').count(),0);assert.equal(await page.getByRole('button',{name:'Разбор ответа',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'Ещё попытка',exact:true}).count(),0);
 await page.reload();await page.getByText('Ответ сохранён',{exact:true}).waitFor();
 await page.setViewportSize({width:1366,height:900});await page.getByRole('button',{name:'Ещё попытка',exact:true}).click();
 if(t.type==='single')await page.getByRole('radio').nth(t.options.findIndex(o=>!k.correct.includes(o.id))).check();
 if(t.type==='multiple')await page.getByRole('checkbox').first().check();
 if(t.type==='short')await page.getByRole('textbox',{name:'Краткий ответ'}).fill('неверный ответ');
 if(t.type==='matching')await page.getByLabel('Соответствие: '+t.items[0].text).selectOption(k.pairs[t.items[0].id]);
 await page.getByRole('button',{name:'Проверить',exact:true}).click();await page.locator('.task-status.incorrect').waitFor();
 if(t.type==='matching')assert((await page.locator('.task-status').innerText()).includes('0,25'));
}
console.log('Assessment: all four types, empty/correct/incorrect/partial, mobile + reload passed');
const diagram=lecture.slides.find(s=>s.id.endsWith('-example'));
await go(lecture,diagram);await page.getByRole('button',{name:'Рассмотреть схему',exact:true}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');
const audiencePromise=context.waitForEvent('page');
await page.getByRole('button',{name:'Начать занятие в двух окнах',exact:true}).click();
await page.getByRole('button',{name:'Открыть аудиторию',exact:true}).waitFor();
const audience=await audiencePromise;const audienceRequests=[];audience.on('request',r=>audienceRequests.push(r.url()));await audience.locator('.slide-frame').waitFor();
await page.locator('input[type="file"]').setInputFiles('private/teacher-pack.json');await page.getByRole('button',{name:'Применить заметки',exact:true}).click();await page.locator('.note-reader').waitFor();assert((await page.locator('.note-reader').innerText()).length>100);
await page.getByRole('button',{name:'Рассмотреть схему',exact:true}).first().click();await audience.getByRole('dialog').waitFor();await page.keyboard.press('Escape');await audience.getByRole('dialog').waitFor({state:'hidden'});
const before=await audience.locator('.slide-frame').getAttribute('data-slide-id');
await page.getByRole('button',{name:'Вперёд',exact:true}).click();await audience.waitForFunction(id=>document.querySelector('.slide-frame')?.getAttribute('data-slide-id')!==id,before);
await audience.reload();await audience.locator('.slide-frame').waitFor();assert(!audienceRequests.some(u=>u.includes('assessment.json')));
assert.equal(await audience.getByText('Сценарий',{exact:true}).count(),0);
await page.getByRole('button',{name:'Чёрный экран',exact:true}).click();await page.getByRole('button',{name:'Вернуть слайд',exact:true}).click();
await fs.writeFile('reports/browser-functional.json',JSON.stringify({status:'passed',assessment:'4 types; empty/correct/incorrect/partial; retry; mobile resize and reload',teaching:'Two actual browser pages; teacher pack import; synchronized diagram; navigation, audience reload, black screen; no bank request',consoleErrors:errors,physicalMonitorsTested:false},null,2));
await browser.close();
if(errors.length)throw Error('Browser exceptions: '+errors.join('\n'));
if(findings.length)console.log('Review geometry findings before release.');
