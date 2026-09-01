'use client';

import { ArrowLeft, BookOpen, CheckCircle2, FileCode2, FlaskConical, Moon, Printer, RotateCcw, Sun, TestTube2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Course, Laboratory } from './course';

export function LabView({ course, lab, dark, onBack, onOpenLecture, onTheme, onReset }: {
  course: Course;
  lab: Laboratory;
  dark: boolean;
  onBack: () => void;
  onOpenLecture: (id: string) => void;
  onTheme: () => void;
  onReset: () => void;
}) {
  const lecture = course.lectures.find((item) => item.id === lab.lectureId);
  return (
    <main className="lab-shell" data-lab-id={lab.id}>
      <header className="lab-toolbar">
        <Button variant="ghost" onClick={onBack}><ArrowLeft /> Каталог</Button>
        <div className="lab-toolbar-actions">
          <Button variant="ghost" size="icon" onClick={onTheme} aria-label="Сменить тему">{dark ? <Sun /> : <Moon />}</Button>
          <Button variant="ghost" size="icon" onClick={() => window.print()} aria-label="Печать лабораторной"><Printer /></Button>
          <Button variant="ghost" size="icon" onClick={onReset} aria-label="Сбросить локальный прогресс"><RotateCcw /></Button>
        </div>
      </header>
      <section className="lab-hero">
        <p className="eyebrow">ЛАБОРАТОРНАЯ {lab.order} · ЗАДАНИЯ КИМ {lab.kimTasks.join(', ')}</p>
        <h1>{lab.title}</h1>
        <p>{lab.goal}</p>
        <div className="lab-meta"><span><FlaskConical /> Методическая рекомендация: {lab.recommendedDurationMinutes} минут</span><span><BookOpen /> Связана с лекцией {lecture?.order}</span></div>
        {lecture && <Button onClick={() => onOpenLecture(lecture.id)}>Открыть связанную лекцию <BookOpen /></Button>}
      </section>
      <div className="lab-content">
        <section className="lab-section lab-starter">
          <header><FileCode2 /><div><p className="eyebrow">СТАРТОВЫЙ НАБОР</p><h2>Исходные файлы</h2></div></header>
          <ul>{lab.starterFiles.map((file) => <li key={file}>{file}</li>)}</ul>
        </section>
        <section className="lab-section">
          <header><FlaskConical /><div><p className="eyebrow">ПОШАГОВО</p><h2>Ход работы</h2></div></header>
          <div className="lab-steps">{lab.steps.map((step, index) => <article key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><ol>{step.actions.map((action) => <li key={action}>{action}</li>)}</ol><p className="step-result"><b>Ожидаемый результат:</b> {step.result}</p><p className="changed-files"><b>Изменить:</b> {step.files.join(' · ')}</p></div></article>)}</div>
        </section>
        <section className="lab-section lab-two-column">
          <div><p className="eyebrow">АРТЕФАКТЫ</p><h2>Что сдавать</h2><ul className="check-list">{lab.deliverables.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul></div>
          <div><p className="eyebrow">ПРИЁМКА</p><h2>Критерии готовности</h2><ul className="check-list">{lab.acceptanceCriteria.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul></div>
        </section>
        <section className="lab-section">
          <header><TestTube2 /><div><p className="eyebrow">МИНИМУМ 3 ПРОВЕРКИ</p><h2>Тест-кейсы</h2></div></header>
          <div className="test-table" role="table" aria-label="Тест-кейсы лабораторной"><div className="test-row test-head" role="row"><span role="columnheader">Действие</span><span role="columnheader">Ожидаемый результат</span></div>{lab.testCases.map((test) => <div className="test-row" role="row" key={test.action}><span role="cell">{test.action}</span><span role="cell">{test.expected}</span></div>)}</div>
        </section>
        <section className="lab-section lab-recovery">
          <div><p className="eyebrow">ТИПИЧНЫЕ ОШИБКИ</p><h2><TriangleAlert /> Не застревайте</h2><ul>{lab.commonErrors.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><p className="eyebrow">ВОССТАНОВЛЕНИЕ</p><h2>Если шаг не работает</h2><ol>{lab.recoveryHints.map((item) => <li key={item}>{item}</li>)}</ol></div>
        </section>
        <section className="lab-section lab-submit"><p className="eyebrow">ФОРМАТ СДАЧИ</p><h2>Финальный чек-лист</h2><ul className="check-list">{lab.submission.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul></section>
      </div>
    </main>
  );
}
