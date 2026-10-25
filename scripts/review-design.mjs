import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import reviewPublicTasks from './review-public-tasks.mjs';
const base=process.env.SITE_URL||'http://127.0.0.1:4198/2026-PIRIP-lecture/';
const output='work/design';await fs.mkdir(output,{recursive:true});
const course=JSON.parse(await fs.readFile('public/course.json','utf8'));
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
const errors=[];context.on('page',page=>page.on('pageerror',error=>errors.push(String(error))));
try{
 const page=await context.newPage();await page.goto(base);
 await page.getByRole('button',{name:'Открыть лекцию',exact:true}).first().waitFor();
 assert.equal(await page.getByRole('button',{name:'Открыть лекцию',exact:true}).count(),5);
 await page.getByRole('textbox',{name:'Поиск по темам'}).fill('backend');
 await page.getByRole('button',{name:'Список',exact:true}).click();
 assert.equal(await page.getByRole('button',{name:'Открыть лекцию',exact:true}).count(),1);
 assert.equal(await page.getByRole('textbox',{name:'Поиск по темам'}).inputValue(),'backend');
 await page.getByRole('textbox',{name:'Поиск по темам'}).fill('');
 await page.screenshot({path:output+'/catalog-list-light.png',fullPage:true});
 await page.getByRole('button',{name:'Карточки',exact:true}).click();
 await page.screenshot({path:output+'/catalog-light.png',fullPage:true});
 await page.getByRole('button',{name:'Материалы',exact:true}).click();
 await page.getByRole('img',{name:'QR-код папки материалов'}).waitFor();
 await page.keyboard.press('Escape');
 await page.getByRole('dialog').waitFor({state:'hidden'});
 const visuals=course.lectures.flatMap(lecture=>lecture.slides.filter(slide=>slide.visual).map(slide=>({lecture,slide})));
 const coverage=[];
 const go=async(lecture,slide)=>{
  await page.evaluate(({lecture,slide})=>{const url=new URL(location.href);url.search=new URLSearchParams({lecture,slide});history.replaceState({},'',url);dispatchEvent(new PopStateEvent('popstate'));},{lecture:lecture.id,slide:slide.id});
  await page.locator(`[data-slide-id="${slide.id}"]`).waitFor();
 };
 for(const theme of ['light','dark']){
  await fs.mkdir(path.join(output,theme),{recursive:true});
  await page.goto(base);
  const toggle=page.getByRole('button',{name:theme==='dark'?'Включить тёмную тему':'Включить светлую тему',exact:true});
  if(await toggle.count())await toggle.click();
  await page.screenshot({path:output+`/catalog-${theme}.png`,fullPage:true});
  await page.getByRole('button',{name:'Открыть лекцию',exact:true}).first().click();
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:output+`/title-${theme}.png`});
  for(const {lecture,slide} of visuals){
   await go(lecture,slide);
   const frame=page.locator(`[data-slide-id="${slide.id}"]`);
   assert.equal(await frame.locator('.readable-diagram').count(),1);
   assert.equal(await frame.locator('.infographic-canvas').count(),0);
   assert.equal(await frame.locator('.slide-header .diagram-header-button').count(),1);
   await frame.screenshot({path:output+`/${theme}/${slide.id}.png`});
   if(theme==='light'){
    await frame.getByRole('button',{name:'Развернуть схему',exact:true}).click();
    await page.getByRole('dialog',{name:'Разбор схемы'}).waitFor();
    assert((await page.getByRole('dialog').innerText()).length>30);
    await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
   }
   coverage.push({lecture:lecture.id,id:slide.id,type:slide.visual.type,theme,rendered:true,headerExpansion:true});
  }
  const first=course.lectures[0];await go(first,first.slides.find(slide=>slide.kind==='section'));
  await page.screenshot({path:output+`/question-${theme}.png`});
 }
 // Keyboard traversal, a narrow layout, then real presentation windows.
 await page.goto(base);await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:output+'/catalog-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Открыть лекцию',exact:true}).first().click();
 const first=course.lectures[0],diagram=first.slides.find(slide=>slide.id.endsWith('-example'));
 await go(first,diagram);await page.screenshot({path:output+'/diagram-mobile.png',fullPage:true});
 await page.setViewportSize({width:1366,height:900});
 const popup=page.waitForEvent('popup');await page.getByRole('button',{name:'Начать занятие в двух окнах',exact:true}).click();
 const audience=await popup;await audience.locator(`[data-slide-id="${diagram.id}"]`).waitFor();
 const controls=page.locator('.rd-controls').first();await controls.getByRole('button',{name:'Далее',exact:true}).click();
 await audience.locator('.rd-flow [aria-current="step"]').waitFor();
 const focusText=await page.locator('.rd-flow [aria-current="step"]').first().innerText();
 assert.equal(await audience.locator('.rd-flow [aria-current="step"]').innerText(),focusText);
 await audience.reload();await audience.locator('.rd-flow [aria-current="step"]').waitFor();
 assert.equal(await audience.locator('.rd-flow [aria-current="step"]').innerText(),focusText);
 await page.getByRole('button',{name:'Развернуть схему',exact:true}).first().click();
 await audience.getByRole('dialog',{name:'Разбор схемы'}).waitFor();
 assert.equal(await audience.getByRole('button',{name:'Закрыть окно',exact:true}).count(),0);
 await page.screenshot({path:output+'/presenter-expanded.png'});await audience.screenshot({path:output+'/audience-expanded.png'});
 await page.keyboard.press('Escape');await audience.getByRole('dialog').waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Сменить тему',exact:true}).click();
 const theme=await page.evaluate(()=>document.documentElement.dataset.theme);
 await audience.waitForFunction(value=>document.documentElement.dataset.theme===value,theme);
 assert.equal(await audience.locator('.note-reader').count(),0);
 await page.getByRole('button',{name:'Завершить',exact:true}).click();await audience.close();
 await fs.writeFile('reports/design-review.json',JSON.stringify({base,visuals:visuals.length,states:coverage.length,coverage,stepsMirror:true,stepRestoredAfterReload:true,diagramModalMirrors:true,themeMirrors:true,notesPrivate:true,errors},null,2)+'\n');
 console.log('Visual review:',visuals.length,'diagrams in both themes; presentation steps, modal and theme passed');
 if(!process.argv.includes('--visual-only')){
 const results=await reviewPublicTasks(page,base);
 await fs.writeFile('reports/public-review.json',JSON.stringify(results,null,2)+'\n');
 const tasks=results.results.filter(row=>row.type!=='reload');
 assert.equal(tasks.length,100);assert.equal(tasks.filter(row=>row.error).length,0);
 assert(tasks.every(row=>row.modalOpens&&row.escapeCloses&&row.closeButton&&row.audienceDialog===1&&row.sameExplanation));
 assert.equal(errors.length,0);
 console.log('Public reviews:',tasks.length,'paired windows with equal explanation, Escape and close button passed');
 }
}finally{await browser.close();}
