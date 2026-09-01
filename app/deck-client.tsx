'use client';
/* oxlint-disable next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, BookOpen, Expand, ExternalLink, FlaskConical, Grid3X3, Moon, Printer, RotateCcw, Search, Sparkles, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { assetUrl, SITE_BASE } from './assets';
import { buildDeck, type Course, type Lecture, type Quiz, type TeacherProfile } from './course';
import { LabView } from './lab-view';
import { type SavedAnswer } from './quiz-card';
import { SlideView } from './slide-view';

type DeckState = { current: number; dark: boolean; animation: boolean; answers: Record<string, SavedAnswer> };
const emptyState: DeckState = { current: 0, dark: false, animation: true, answers: {} };
const emptyTeacher: TeacherProfile = { fullName: '', position: '', department: '' };

function storageKey(courseId: string, lectureId: string) { return `${courseId}-deck-v1:${lectureId}`; }
function teacherKey(courseId: string) { return `${courseId}-teacher-profile-v1`; }
function isCorrect(answer: SavedAnswer | undefined, quiz: Quiz) {
  if (!answer?.submitted || quiz.kind === 'selfReview') return false;
  if (Array.isArray(quiz.answer)) return Array.isArray(answer.value) && quiz.answer.length === answer.value.length && quiz.answer.every((item, index) => item === answer.value[index]);
  return !Array.isArray(answer.value) && answer.value.toLocaleLowerCase('ru').includes(quiz.answer.toLocaleLowerCase('ru'));
}

function CourseCatalog({ course, teacher, onTeacherChange, onOpenLecture, onOpenLab, notice }: {
  course: Course;
  teacher: TeacherProfile;
  onTeacherChange: (teacher: TeacherProfile) => void;
  onOpenLecture: (lecture: Lecture) => void;
  onOpenLab: (id: string) => void;
  notice: string;
}) {
  const [query, setQuery] = useState('');
  const [task, setTask] = useState('all');
  const normalized = query.toLocaleLowerCase('ru');
  const lectures = course.lectures.filter((lecture) => {
    const matchesQuery = `${lecture.order} ${lecture.title} ${lecture.description} ${lecture.objectives.join(' ')}`.toLocaleLowerCase('ru').includes(normalized);
    return matchesQuery && (task === 'all' || lecture.kimTasks.includes(Number(task)));
  });
  const labs = course.laboratories.filter((lab) => {
    const matchesQuery = `${lab.order} ${lab.title} ${lab.goal} ${lab.deliverables.join(' ')}`.toLocaleLowerCase('ru').includes(normalized);
    return matchesQuery && (task === 'all' || lab.kimTasks.includes(Number(task)));
  });
  const empty = lectures.length === 0 && labs.length === 0;
  return (
    <main className="catalog-shell">
      <header className="catalog-hero">
        <div className="catalog-copy">
          <img src={assetUrl('/brand/synergy-logo.webp')} alt="Университет Синергия" />
          <p className="eyebrow">{course.audience}</p>
          <h1>{course.title}</h1>
          <p>{course.subtitle}</p>
          <div className="catalog-metrics"><span><b>5</b> лекций</span><span><b>125</b> экранов</span><span><b>5</b> лабораторных</span></div>
          <div className="catalog-teacher"><strong>Данные преподавателя для титульных листов и PDF</strong><div className="teacher-fields"><Input aria-label="ФИО преподавателя" value={teacher.fullName} onChange={(event) => onTeacherChange({ ...teacher, fullName: event.target.value })} placeholder="ФИО преподавателя" /><Input aria-label="Должность преподавателя" value={teacher.position} onChange={(event) => onTeacherChange({ ...teacher, position: event.target.value })} placeholder="Должность" /><Input aria-label="Кафедра или лаборатория" value={teacher.department} onChange={(event) => onTeacherChange({ ...teacher, department: event.target.value })} placeholder="Кафедра / лаборатория" /></div></div>
        </div>
        <img className="catalog-rhino" src={assetUrl('/brand/rhino-designer.webp')} alt="Носорог-проектировщик" />
      </header>
      <section className="catalog-content">
        {notice && <output className="catalog-notice">{notice}</output>}
        <div className="catalog-filters">
          <div className="search-box"><Search /><Input aria-label="Поиск по лекциям и лабораторным" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти тему, понятие или артефакт" /></div>
          <div className="semester-tabs" aria-label="Фильтр по заданию КИМ">{[['all', 'Все задания'], ['1', 'КИМ 1'], ['2', 'КИМ 2'], ['3', 'КИМ 3']].map(([value, label]) => <button className={task === value ? 'is-active' : ''} key={value} onClick={() => setTask(value)}>{label}</button>)}</div>
        </div>
        {empty ? <div className="catalog-empty"><Search /><h2>Ничего не найдено</h2><p>Измените запрос или сбросьте фильтр КИМ.</p><Button onClick={() => { setQuery(''); setTask('all'); }}><RotateCcw /> Сбросить</Button></div> : <>
          {lectures.length > 0 && <section className="catalog-group" aria-labelledby="lectures-title"><div className="group-heading"><div><p className="eyebrow">5 × 25 ЭКРАНОВ</p><h2 id="lectures-title">Лекции</h2></div><p>20 содержательных и 5 служебных экранов в каждой теме.</p></div><div className="topic-grid">{lectures.map((lecture) => <article className="topic-card" data-lecture-id={lecture.id} key={lecture.id}><div className="topic-card-top"><span>Лекция {lecture.order}</span><span>КИМ {lecture.kimTasks.join(', ')}</span></div><p>25 ЭКРАНОВ · ЛАБОРАТОРНАЯ {lecture.order}</p><h3>{lecture.title}</h3><div className="tag-row">{lecture.objectives.slice(0, 3).map((item) => <span key={item}>{item.split(' ').slice(0, 4).join(' ')}</span>)}</div><p className="topic-result"><b>Результат:</b> {lecture.finalChecklist[0]}</p><div className="card-actions"><Button onClick={() => onOpenLecture(lecture)}>Открыть лекцию <ArrowRight /></Button><Button variant="outline" onClick={() => onOpenLab(lecture.laboratoryId)}><FlaskConical /> Лабораторная</Button></div></article>)}</div></section>}
          {labs.length > 0 && <section className="catalog-group" aria-labelledby="labs-title"><div className="group-heading"><div><p className="eyebrow">ПОШАГОВЫЕ ИНСТРУКЦИИ</p><h2 id="labs-title">Лабораторные работы</h2></div><p>Одна проверяемая операция на этапе, тест-кейсы и восстановление.</p></div><div className="lab-grid">{labs.map((lab) => <article className="lab-card" data-lab-id={lab.id} key={lab.id}><div className="topic-card-top"><span>Лабораторная {lab.order}</span><span>КИМ {lab.kimTasks.join(', ')}</span></div><h3>{lab.title}</h3><p>{lab.goal}</p><strong>{lab.steps.length} этапов · {lab.testCases.length} тест-кейса</strong><Button onClick={() => onOpenLab(lab.id)}>Открыть инструкцию <ArrowRight /></Button></article>)}</div></section>}
        </>}
        <section className="teacher-materials"><div><p className="eyebrow">МАТЕРИАЛЫ ПРЕПОДАВАТЕЛЯ</p><h2>Демонстрация, ответы и печать</h2><p>В каждой лекции есть комментарии, самопроверка и PDF-вариант с ответами. Рекомендуемое время — методическая рекомендация, не официальная нагрузка.</p></div><div className="materials-catalog-panel"><img src={assetUrl(`/qr/${course.id}-materials.svg`)} alt="QR-код ссылки на папку материалов" /><div><strong>Ссылка на папку материалов</strong><p>Папка открывается отдельно. Содержимое здесь не перечисляется.</p><a href={course.materialsUrl} target="_blank" rel="noreferrer">Открыть папку материалов <ExternalLink /></a></div></div></section>
      </section>
    </main>
  );
}

export function DeckClient({ course }: { course: Course }) {
  const [lectureId, setLectureId] = useState<string | null>(null);
  const [labId, setLabId] = useState<string | null>(null);
  const [state, setState] = useState<DeckState>(emptyState);
  const [teacher, setTeacher] = useState<TeacherProfile>(emptyTeacher);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [replay, setReplay] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const lecture = course.lectures.find((item) => item.id === lectureId) ?? null;
  const lab = course.laboratories.find((item) => item.id === labId) ?? null;
  const slides = useMemo(() => lecture ? buildDeck(lecture, course) : [], [course, lecture]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const savedTeacher = localStorage.getItem(teacherKey(course.id));
    if (savedTeacher) setTeacher(JSON.parse(savedTeacher) as TeacherProfile);
    const requestedLecture = params.get('lecture');
    const requestedLab = params.get('lab');
    if (requestedLecture) {
      const selected = course.lectures.find((item) => item.id === requestedLecture);
      if (selected) {
        const saved = localStorage.getItem(storageKey(course.id, selected.id));
        const parsed = saved ? JSON.parse(saved) as DeckState : emptyState;
        const requested = Number(params.get('slide'));
        const deckLength = buildDeck(selected, course).length;
        setState({ ...parsed, current: Number.isFinite(requested) && requested > 0 ? Math.min(deckLength - 1, requested - 1) : Math.min(deckLength - 1, parsed.current) });
        setLectureId(selected.id);
      } else setNotice('Лекция из ссылки не найдена. Открыт каталог курса.');
    } else if (requestedLab) {
      const selected = course.laboratories.find((item) => item.id === requestedLab);
      if (selected) setLabId(selected.id); else setNotice('Лабораторная из ссылки не найдена. Открыт каталог курса.');
    }
    setReady(true);
  }, [course]);

  useEffect(() => { document.documentElement.classList.toggle('dark', state.dark); }, [state.dark]);
  useEffect(() => { if (ready) localStorage.setItem(teacherKey(course.id), JSON.stringify(teacher)); }, [course.id, ready, teacher]);
  useEffect(() => {
    if (!ready || !lecture) return;
    localStorage.setItem(storageKey(course.id, lecture.id), JSON.stringify(state));
    const url = new URL(window.location.href); url.search = ''; url.searchParams.set('lecture', lecture.id); url.searchParams.set('slide', String(state.current + 1)); window.history.replaceState({}, '', url);
  }, [course.id, lecture, ready, state]);

  const go = useCallback((next: number) => setState((value) => ({ ...value, current: Math.max(0, Math.min(slides.length - 1, next)) })), [slides.length]);
  useEffect(() => {
    if (!lecture) return;
    const onKey = (event: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) return;
      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); go(state.current + 1); }
      if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); go(state.current - 1); }
      if (event.key.toLocaleLowerCase('ru') === 'r') setReplay((value) => value + 1);
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [go, lecture, state]);

  const openLecture = (nextLecture: Lecture) => {
    const saved = localStorage.getItem(storageKey(course.id, nextLecture.id));
    setState(saved ? JSON.parse(saved) as DeckState : { ...emptyState, dark: state.dark });
    setLabId(null); setLectureId(nextLecture.id); setNotice('');
  };
  const openLectureById = (id: string) => { const next = course.lectures.find((item) => item.id === id); if (next) openLecture(next); };
  const openLab = (id: string) => { setLectureId(null); setLabId(id); setNotice(''); const url = new URL(window.location.href); url.search = ''; url.searchParams.set('lab', id); window.history.replaceState({}, '', url); };
  const close = () => { setLectureId(null); setLabId(null); window.history.replaceState({}, '', window.location.pathname); };
  const reset = () => { if (lecture) localStorage.removeItem(storageKey(course.id, lecture.id)); setState((value) => ({ ...emptyState, dark: value.dark })); };
  const resetAll = () => { course.lectures.forEach((item) => localStorage.removeItem(storageKey(course.id, item.id))); setState((value) => ({ ...emptyState, dark: value.dark })); };
  const fullscreen = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();

  if (!ready) return <main className="loading-shell">Загрузка курса…</main>;
  if (lab) return <LabView course={course} lab={lab} dark={state.dark} onBack={close} onOpenLecture={openLectureById} onTheme={() => setState((value) => ({ ...value, dark: !value.dark }))} onReset={resetAll} />;
  if (!lecture) return <CourseCatalog course={course} teacher={teacher} onTeacherChange={setTeacher} onOpenLecture={openLecture} onOpenLab={openLab} notice={notice} />;

  const currentSlide = slides[state.current];
  const quizSlides = slides.filter((slide) => slide.quiz);
  const submitted = quizSlides.filter((slide) => state.answers[slide.id]?.submitted);
  const correct = quizSlides.filter((slide) => slide.quiz && isCorrect(state.answers[slide.id], slide.quiz));
  const neighbors = [state.current - 1, state.current, state.current + 1].filter((index) => index >= 0 && index < slides.length);
  return (
    <main className="deck-shell">
      <header className="deck-toolbar">
        <button className="deck-id" onClick={close} title="Вернуться в каталог"><img src={assetUrl('/brand/synergy-logo.webp')} alt="" /><span>{course.shortTitle} · Лекция {lecture.order}</span></button>
        <div className="toolbar-actions">
          <div className="toggle-label" title="Анимация"><Sparkles aria-hidden="true" /><Switch checked={state.animation} onCheckedChange={(animation) => setState((value) => ({ ...value, animation }))} aria-label="Включить анимацию" /></div>
          <Button variant="ghost" size="icon" onClick={() => setState((value) => ({ ...value, dark: !value.dark }))} aria-label="Сменить тему">{state.dark ? <Sun /> : <Moon />}</Button>
          <Button variant="ghost" size="icon" onClick={fullscreen} aria-label="Полноэкранный режим"><Expand /></Button>
          <Button variant="ghost" size="icon" onClick={() => window.open(`${SITE_BASE}${SITE_BASE ? '/print.html' : '/print'}?lecture=${lecture.id}&mode=teacher`, '_blank')} aria-label="Печать для преподавателя"><Printer /></Button>
          <Dialog open={resultOpen} onOpenChange={setResultOpen}><DialogTrigger render={<Button variant="outline" size="sm" />}><BarChart3 /> Самопроверка</DialogTrigger><DialogContent className="result-dialog"><DialogHeader><DialogTitle>Самопроверка лекции</DialogTitle><DialogDescription>{lecture.title}</DialogDescription></DialogHeader><div className="score-grid"><div><b>{submitted.length}</b><span>выполнено из {quizSlides.length}</span></div><div><b>{correct.length}</b><span>верных ответов</span></div><div><b>{quizSlides.length - submitted.length}</b><span>осталось</span></div></div>{quizSlides.map((slide) => <Button variant="outline" key={slide.id} onClick={() => { go(slides.indexOf(slide)); setResultOpen(false); }}>Перейти к экрану {slides.indexOf(slide) + 1}</Button>)}</DialogContent></Dialog>
          <Dialog open={tocOpen} onOpenChange={setTocOpen}><DialogTrigger render={<Button variant="outline" size="sm" />}><BookOpen /> Содержание</DialogTrigger><DialogContent className="toc-dialog"><DialogHeader><DialogTitle>Содержание лекции</DialogTitle><DialogDescription>{lecture.shortTitle}</DialogDescription></DialogHeader><nav className="toc-list">{slides.map((slide, index) => <button key={slide.id} onClick={() => { go(index); setTocOpen(false); }} className={index === state.current ? 'is-current' : ''}><span>{String(index + 1).padStart(2, '0')}</span>{slide.title}</button>)}</nav></DialogContent></Dialog>
        </div>
      </header>
      <div className="stage-wrap" aria-live="polite"><div className="stage">{neighbors.map((index) => { const slide = slides[index]; const active = index === state.current; return <div className={`stage-layer ${active ? 'is-current' : 'is-neighbor'}`} aria-hidden={!active} key={active ? `${slide.id}-${replay}` : slide.id}><SlideView course={course} lecture={lecture} slide={slide} index={index} total={slides.length} active={active} animation={active && state.animation} saved={state.answers[slide.id]} onAnswer={(answer) => setState((value) => ({ ...value, answers: { ...value.answers, [slide.id]: answer } }))} teacher={teacher} onTeacherChange={setTeacher} /></div>; })}</div></div>
      <footer className="deck-controls"><Button variant="ghost" size="icon" onClick={close} aria-label="Каталог"><Grid3X3 /></Button><Button variant="outline" size="icon-lg" onClick={() => go(state.current - 1)} disabled={state.current === 0} aria-label="Предыдущий экран"><ArrowLeft /></Button><div className="progress-block"><Progress value={((state.current + 1) / slides.length) * 100} aria-label="Прогресс лекции" /><span>{state.current + 1} / {slides.length} · {currentSlide.section}</span></div><Button variant="default" size="icon-lg" onClick={() => go(state.current + 1)} disabled={state.current === slides.length - 1} aria-label="Следующий экран"><ArrowRight /></Button><Button variant="ghost" size="icon" onClick={reset} aria-label="Сбросить прогресс"><RotateCcw /></Button></footer>
    </main>
  );
}
