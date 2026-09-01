'use client';
/* oxlint-disable next/no-img-element */

import { motion } from 'motion/react';
import { ExternalLink, Lightbulb } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Course, Lecture, Slide, TeacherProfile } from './course';
import { assetUrl } from './assets';
import { QuizCard, type SavedAnswer } from './quiz-card';

const toneClass = { red: 'tone-red', yellow: 'tone-yellow', green: 'tone-green', blue: 'tone-blue' };

function LinkedText({ text }: { text: string }) {
  const match = text.match(/https?:\/\/\S+$/);
  if (!match || match.index === undefined) return text;
  return <>{text.slice(0, match.index)}<a href={match[0]} target="_blank" rel="noreferrer">{match[0]}</a></>;
}

export function SlideView({ course, lecture, slide, index, total, active = false, animation = true, saved, onAnswer, teacher, onTeacherChange, printMode }: {
  course: Course;
  lecture: Lecture;
  slide: Slide;
  index: number;
  total: number;
  active?: boolean;
  animation?: boolean;
  saved?: SavedAnswer;
  onAnswer?: (answer: SavedAnswer) => void;
  teacher: TeacherProfile;
  onTeacherChange?: (teacher: TeacherProfile) => void;
  printMode?: 'student' | 'teacher';
}) {
  const decorative = slide.media?.startsWith('/brand/');
  const firstWebSource = slide.citations.find((source) => source.url);
  const showTeacherFooter = slide.kind === 'service';
  const content = (
    <article className={`slide slide-${slide.type} ${active ? 'is-active' : ''}`} aria-label={`Экран ${index + 1}: ${slide.title}`} data-slide-id={slide.id} data-slide-order={slide.order}>
      <div className="slide-chrome">
        <img className="brand-logo" src={assetUrl('/brand/synergy-logo.webp')} alt="Университет Синергия" />
        <span>{course.shortTitle} · Лекция {lecture.order}</span>
        <span>{String(index + 1).padStart(2, '0')} / {total}</span>
      </div>
      <div className="slide-grid">
        <header className="slide-heading">
          {slide.eyebrow && <p className="eyebrow">{slide.eyebrow}</p>}
          <h1>{slide.title}</h1>
          {slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}
        </header>
        {slide.cards && <div className="bento-grid">{slide.cards.map((card) => <div className={`bento-card ${toneClass[card.tone ?? 'red']}`} key={`${card.label}-${card.value}`}><span>{card.label}</span><strong>{card.value}</strong></div>)}</div>}
        {slide.steps && <div className="step-grid">{slide.steps.map((step) => <div className="step-card" key={`${step.title}-${step.text}`}><strong>{step.title}</strong><span>{step.text}</span></div>)}</div>}
        {slide.bullets && <ul className="bullet-list">{slide.bullets.map((item) => <li key={item}><LinkedText text={item} /></li>)}</ul>}
        {slide.compare && <div className="compare-grid"><section className="compare-left"><h2>{slide.compare.leftTitle}</h2><ul>{slide.compare.left.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="compare-right"><h2>{slide.compare.rightTitle}</h2><ul>{slide.compare.right.map((item) => <li key={item}>{item}</li>)}</ul></section></div>}
        {slide.code && <pre className="code-card"><code>{slide.code}</code></pre>}
        {slide.quote && <blockquote>{slide.quote}</blockquote>}
        {slide.quiz && <QuizCard quiz={slide.quiz} saved={saved} onChange={onAnswer} printMode={printMode} />}
        {slide.check && !printMode && <aside className="mini-check"><Lightbulb /><div><strong>Мини-проверка</strong><span>{slide.check.question}</span></div></aside>}
        {slide.check && printMode === 'teacher' && <aside className="teacher-note"><strong>Мини-проверка:</strong> {slide.check.question}<p><b>Ответ:</b> {slide.check.answer}. {slide.check.explanation}</p></aside>}
        {slide.teacherNote && printMode === 'teacher' && <aside className="teacher-note"><strong>Комментарий преподавателю:</strong><p>{slide.teacherNote}</p></aside>}
        {slide.type === 'title' && !printMode && onTeacherChange && <div className="teacher-editor"><strong>Данные преподавателя</strong><Input aria-label="ФИО преподавателя" value={teacher.fullName} onChange={(event) => onTeacherChange({ ...teacher, fullName: event.target.value })} placeholder="ФИО преподавателя" /><Input aria-label="Должность преподавателя" value={teacher.position} onChange={(event) => onTeacherChange({ ...teacher, position: event.target.value })} placeholder="Должность" /><Input aria-label="Кафедра или лаборатория" value={teacher.department} onChange={(event) => onTeacherChange({ ...teacher, department: event.target.value })} placeholder="Кафедра / лаборатория" /></div>}
        {showTeacherFooter && (teacher.fullName || teacher.position || teacher.department) && <div className="teacher-footer"><span aria-hidden="true">↗</span><p><strong>{teacher.fullName || 'ФИО преподавателя'}</strong>{teacher.position && <><br />{teacher.position}</>}{teacher.department && <><br />{teacher.department}</>}</p></div>}
        {slide.media && decorative && <img className="rhino" src={assetUrl(slide.media)} alt={slide.mediaAlt ?? ''} />}
        {slide.media && !decorative && <figure className="content-media"><img src={assetUrl(slide.media)} alt={slide.mediaAlt ?? ''} /><figcaption>Медиа из приложения к КИМ 2027</figcaption></figure>}
        {firstWebSource && <a className="citation" href={firstWebSource.url} target="_blank" rel="noreferrer"><ExternalLink />{firstWebSource.title}</a>}
      </div>
    </article>
  );
  if (!animation || printMode) return content;
  return <motion.div className="slide-motion" initial={{ opacity: 0, y: 18, scale: .992 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .34, ease: [0.22, 1, 0.36, 1] }} key={slide.id}>{content}</motion.div>;
}
