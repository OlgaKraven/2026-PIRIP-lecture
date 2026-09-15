import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {validateCourse,validateBank,validateTeacherPack,courseAssets,readiness} from '@olgakraven/lecture-engine';
const course=JSON.parse(await fs.readFile('public/course.json','utf8'));
const bank=JSON.parse(await fs.readFile('public/assessment.json','utf8'));
validateCourse(course);validateBank(bank,course);
const map=JSON.parse(await fs.readFile('reports/question-map.json','utf8'));
for(const asset of courseAssets(course))if(!/^https?:/.test(asset))await fs.access('public/'+asset);
assert.equal(course.demo,false);assert.equal(course.lectures.length,5);
for(const l of course.lectures){
 assert(l.slides.length>=80,l.id+': объём');
 assert.deepEqual(l.slides.slice(0,5).map(s=>s.kind),['title','literature','literature','materials','agenda']);
 assert.equal(l.slides.at(-1).kind,'questions');
 const sections=l.slides.flatMap((s,i)=>s.kind==='section'?[i]:[]);
 assert.equal(sections.length,5);
 for(let q=0;q<sections.length;q++){
  const slides=l.slides.slice(sections[q],sections[q+1]||l.slides.length);
  const tasks=slides.filter(s=>s.task);
  assert.deepEqual(tasks.map(s=>s.task.type),['single','multiple','short','matching']);
  assert.equal(tasks[0].task.options.length,4);assert.equal(tasks[1].task.options.length,5);assert.equal(tasks[3].task.items.length,4);
  assert(slides.filter(s=>s.visual).length>=2);assert(slides.some(s=>s.notebook));assert(slides.some(s=>s.kind==='example'));
  const mapping=map.find(x=>x.lectureId===l.id&&x.taskIds[0]===tasks[0].task.id);assert(mapping);
  for(const id of mapping.explanationSlideIds)assert(l.slides.findIndex(s=>s.id===id)<l.slides.findIndex(s=>s.id===tasks[0].id));
  const matching=bank.keys[tasks[3].task.id];assert.equal(new Set(Object.values(matching.pairs)).size,4);
 }
}
const teacherArg=process.argv.find(a=>a.startsWith('--teacher='));
let teacherChecked=false;
if(teacherArg){const pack=JSON.parse(await fs.readFile(teacherArg.slice(10),'utf8'));validateTeacherPack(pack,course);assert.deepEqual(Object.keys(pack.notes).sort(),course.lectures.flatMap(l=>l.slides.map(s=>s.id)).sort());for(const n of Object.values(pack.notes)){assert(n.script.trim());assert(n.estimatedSeconds>0);}teacherChecked=true;}
const warnings=readiness(course);if(process.argv.includes('--strict'))assert.deepEqual(warnings,[]);
const report={course:course.id,contentVersion:course.contentVersion,lectures:5,slides:course.lectures.flatMap(l=>l.slides).length,questions:map.length,tasks:Object.keys(bank.keys).length,teacherChecked,warnings,status:'passed',scope:'Структура, ресурсы, банк, порядок и связи; не экспертная проверка РПД.'};
await fs.writeFile('reports/validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
