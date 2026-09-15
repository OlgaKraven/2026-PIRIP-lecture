import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';
const base=process.env.SITE_URL||'http://127.0.0.1:4175/2026-PIRIP-lecture/';
const output=process.env.PDF_OUTPUT||'outputs/pdf/student';
const course=JSON.parse(await fs.readFile('public/course.json','utf8'));
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
const page=await context.newPage();const report=[];
for(const l of course.lectures){
 const url=new URL(base);url.search=new URLSearchParams({mode:'print',scope:l.id}).toString();
 await page.goto(url.href);await page.locator('.print-page').last().waitFor();
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(im=>im.decode().catch(()=>{})));});
 await page.emulateMedia({media:'print'});
 const file=path.join(output,l.id+'.pdf');
 await page.pdf({path:file,printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false});
 const loadingTask=getDocument({data:new Uint8Array(await fs.readFile(file)),useSystemFonts:true});
 const doc=await loadingTask.promise;
 if(doc.numPages!==l.slides.length)throw Error(l.id+': '+doc.numPages+' pages instead of '+l.slides.length);
 const missing=[];
 for(let i=0;i<doc.numPages;i++){
  const p=await doc.getPage(i+1),text=(await p.getTextContent()).items.map(x=>x.str||'').join(' ').replace(/\s/g,'');
  const title=l.slides[i].title.replace(/\s/g,'');
  if(!text.includes(title))missing.push({page:i+1,title:l.slides[i].title});
  if(text.includes('Заметкиимпортированы')||text.includes('Разборответа'))throw Error('Private UI in PDF');
 }
 report.push({lecture:l.id,file:path.basename(file),pages:doc.numPages,missingTitles:missing});
 console.log(l.id,doc.numPages,'pages; missing titles:',missing.length);
 await loadingTask.destroy();
}
await browser.close();await fs.writeFile('reports/pdf.json',JSON.stringify(report,null,2));
if(report.some(x=>x.missingTitles.length))throw Error('PDF text completeness check failed');
