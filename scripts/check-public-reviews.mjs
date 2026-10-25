import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import review from './review-public-tasks.mjs';
const base=process.env.SITE_URL||'http://127.0.0.1:4198/2026-PIRIP-lecture/';
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();await page.goto(base);
 const results=await review(page,base);await fs.writeFile('reports/public-review.json',JSON.stringify(results,null,2)+'\n');
 const tasks=results.results.filter(row=>row.type!=='reload');
 console.log(JSON.stringify({tasks:tasks.length,errors:tasks.filter(row=>row.error),mirrored:tasks.filter(row=>row.audienceDialog===1).length,equalText:tasks.filter(row=>row.sameExplanation).length,closed:tasks.filter(row=>row.escapeCloses&&row.closeButton).length},null,2));
 assert.equal(tasks.length,100);assert.equal(tasks.filter(row=>row.error).length,0);
 assert(tasks.every(row=>row.modalOpens&&row.escapeCloses&&row.closeButton&&row.audienceDialog===1&&row.sameExplanation));
}finally{await browser.close();}
