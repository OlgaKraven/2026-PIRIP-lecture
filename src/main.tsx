import {createRoot} from 'react-dom/client'
import {LectureSite,validateCourse} from '@olgakraven/lecture-engine'
import '@olgakraven/lecture-engine/style.css'
const root=createRoot(document.getElementById('root')!)
async function load(){
 root.render(<p role="status">Загружаем курс…</p>)
 try{
 const response=await fetch(import.meta.env.BASE_URL+'course.json',{signal:AbortSignal.timeout(15000)})
 if(!response.ok)throw Error('Не удалось загрузить курс: '+response.status)
 const course=await response.json();validateCourse(course)
 root.render(<LectureSite course={course} base={import.meta.env.BASE_URL}/>)
 }catch(error){root.render(<main><h1>Курс не загрузился</h1><p role="alert">{String(error)}</p><button onClick={()=>void load()}>Повторить загрузку</button></main>)}
}
void load()
