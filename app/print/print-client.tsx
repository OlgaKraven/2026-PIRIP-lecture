'use client';

import { useEffect, useState } from 'react';
import { buildDeck, type Lecture, type TeacherProfile } from '../course';
import { course } from '../course-data';
import { SlideView } from '../slide-view';

declare global { interface Window { __DECK_READY__?: boolean } }

export function PrintClient() {
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [mode, setMode] = useState<'student' | 'teacher'>('student');
  const [teacher, setTeacher] = useState<TeacherProfile>({ fullName: '', position: '', department: '' });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selected = course.lectures.find((item) => item.id === params.get('lecture')) ?? course.lectures[0];
    setLecture(selected);
    setMode(params.get('mode') === 'teacher' ? 'teacher' : 'student');
    const savedTeacher = localStorage.getItem(`${course.id}-teacher-profile-v1`);
    if (savedTeacher) setTeacher(JSON.parse(savedTeacher) as TeacherProfile);
  }, []);
  useEffect(() => {
    if (!lecture) return;
    void Promise.all([document.fonts.ready, ...Array.from(document.images).map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => { image.addEventListener('load', () => resolve(), { once: true }); image.addEventListener('error', () => resolve(), { once: true }); }))]).then(() => requestAnimationFrame(() => { window.__DECK_READY__ = true; }));
  }, [lecture, teacher]);
  if (!lecture) return <main className="loading-shell">Подготовка печатной версии…</main>;
  const slides = buildDeck(lecture, course);
  return <main className={`print-deck print-${mode}`}>{slides.map((slide, index) => <div className="print-page" key={slide.id}><SlideView course={course} lecture={lecture} slide={slide} index={index} total={slides.length} teacher={teacher} printMode={mode} animation={false} /></div>)}</main>;
}
