import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
async function files(dir){return(await Promise.all((await fs.readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat();}
const publicCourse=await fs.readFile('public/course.json','utf8');
for(const key of ['teacherNote','teacherDemo','preparation','estimatedSeconds','password_hash":'])assert(!publicCourse.includes('"'+key+'"'),key);
let scripts=[];try{const pack=JSON.parse(await fs.readFile('private/teacher-pack.json','utf8'));scripts=Object.values(pack.notes).map(n=>n.script).filter(s=>s.length>100);}catch{/* CI checks file paths and known private fields without possessing the pack. */}
const forbidden=/(teacher-pack|teacher\.md|original-course|[\\/]private[\\/]|\.map$)/i;
const paths=await files('dist');
for(const file of paths){assert(!forbidden.test(file),'Private path: '+file);if(/\.(html|js|json|css|txt)$/.test(file)){const text=await fs.readFile(file,'utf8');for(const s of scripts)assert(!text.includes(s),'Teacher script leaked: '+file);assert(!/C:[\\/]+Users[\\/]/i.test(text),'Local user path leaked');}}
console.log(JSON.stringify({status:'passed',files:paths.length,teacherScriptsCompared:scripts.length,autonomousKeysPublic:true}));
