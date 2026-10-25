export default async function review(root,base) {
  const page=root;
  page.setDefaultTimeout(10000);
  const escaped=text=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const course=await (await page.request.get(base+'course.json')).json();
  const bank=await (await page.request.get(base+'assessment.json')).json();
  root.__brainmProbeProgress=[];
  for(const old of page.context().pages())if(old!==page)await old.close();
  const runLecture=async lecture=>{
    const page=await root.context().newPage();page.setDefaultTimeout(10000);
    const out=[];
    await page.goto(base+'?'+new URLSearchParams({lecture:lecture.id,slide:lecture.slides[0].id}));
    const popup=page.waitForEvent('popup');
    await page.getByRole('button',{name:'Начать занятие в двух окнах',exact:true}).click();
    const audience=await popup;audience.setDefaultTimeout(10000);await audience.locator('article').waitFor();
    for(const slide of lecture.slides.filter(s=>s.task)){
      const row={lecture:lecture.id,id:slide.id,type:slide.task.type};
      try{
        const index=lecture.slides.indexOf(slide)+1;
        await page.getByRole('complementary').getByRole('button',{name:new RegExp('^'+String(index).padStart(2,'0')+'\\s')}).click();
        const show=page.getByRole('button',{name:'Показать аудитории',exact:true});
        if(await show.count())await show.click();
        const frame=page.locator('article').first();
        await frame.filter({has:page.getByRole('heading',{name:slide.title,exact:true})}).waitFor();
        await audience.locator('[data-slide-id="'+slide.id+'"]').waitFor();
        await frame.ariaSnapshot();
        const retry=frame.getByRole('button',{name:'Ещё попытка',exact:true});
        if(await retry.count())await retry.click();
        const t=slide.task,key=bank.keys[t.id];
        if(t.type==='single')await frame.getByRole('radio',{name:new RegExp('(?:^|\\s)'+escaped(t.options.find(o=>o.id===key.correct[0]).text)+'$')}).check();
        if(t.type==='multiple')for(const id of key.correct)await frame.getByRole('checkbox',{name:new RegExp('(?:^|\\s)'+escaped(t.options.find(o=>o.id===id).text)+'$')}).check();
        if(t.type==='short')await frame.getByRole('textbox',{name:'Краткий ответ'}).fill(key.accepted[0]);
        if(t.type==='matching'){
          for(const item of t.items){
            const box=frame.getByRole('combobox',{name:'Соответствие: '+item.text,exact:true});
            await box.focus();await page.keyboard.press('Home');
            const idx=t.options.findIndex(o=>o.id===key.pairs[item.id])+1;
            for(let i=0;i<idx;i++)await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
          }
          row.keyboardValues=await frame.getByRole('combobox').evaluateAll(xs=>xs.map(x=>x.value));
          row.audienceValues=await audience.getByRole('combobox').evaluateAll(xs=>xs.map(x=>x.value));
          row.keyboardMatches=t.items.every((x,i)=>row.keyboardValues[i]===key.pairs[x.id]);
          row.selectionMirrors=JSON.stringify(row.keyboardValues)===JSON.stringify(row.audienceValues);
          row.mousePopupMirror='not-confirmed-native-select';
        }
        await frame.getByRole('button',{name:'Проверить',exact:true}).click();
        await frame.locator('.task-status').waitFor();
        row.status=await frame.locator('.task-status').innerText();
        await frame.getByRole('button',{name:'Разбор ответа',exact:true}).click();
        await page.getByRole('dialog').waitFor();
        row.modalOpens=true;
        row.dialogText=(await page.getByRole('dialog').innerText()).slice(0,250);
        await audience.getByRole('dialog').waitFor();
        row.sameExplanation=JSON.stringify(await page.getByRole('dialog').locator('p').allTextContents())===JSON.stringify(await audience.getByRole('dialog').locator('p').allTextContents());
        row.audienceDialog=await audience.getByRole('dialog').count();
        await page.keyboard.press('Escape');
        await page.getByRole('dialog').waitFor({state:'hidden'});
        await audience.getByRole('dialog').waitFor({state:'hidden'});
        row.escapeCloses=await page.getByRole('dialog').count()===0;
        await frame.getByRole('button',{name:'Разбор ответа',exact:true}).click();
        await page.getByRole('dialog').waitFor();
        await page.getByRole('button',{name:'Закрыть окно',exact:true}).click();
        await page.getByRole('dialog').waitFor({state:'hidden'});
        await audience.getByRole('dialog').waitFor({state:'hidden'});
        row.closeButton=await page.getByRole('dialog').count()===0;
        row.audienceStatus=await audience.locator('.task-status').allTextContents();
      }catch(error){row.error=String(error).slice(0,600);await page.keyboard.press('Escape').catch(()=>{});}
      out.push(row);
      root.__brainmProbeProgress.push(row);
    }
    await audience.reload();await audience.locator('article').waitFor({timeout:15000});
    out.push({lecture:lecture.id,type:'reload',audienceSlide:await audience.locator('article').getAttribute('data-slide-id'),notesVisible:await audience.getByRole('tablist',{name:'Разделы заметок'}).count()});
    await audience.close();
    await page.close();
    return out;
  };
  const groups=[];
  for(const lecture of course.lectures){
    const group=await runLecture(lecture);groups.push(group);
    console.log('Reviewed',lecture.id,group.filter(row=>row.type!=='reload').length,'tasks;',group.filter(row=>row.error).length,'errors');
  }
  return {base,contentVersion:course.contentVersion,totalSlides:course.lectures.reduce((n,l)=>n+l.slides.length,0),results:groups.flat()};
}
