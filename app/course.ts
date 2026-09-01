import { sourcesById, type SourceRef } from '@/src/data/sourceRegistry';

export type SlideType =
  | 'title' | 'objectives' | 'definition' | 'bento' | 'process' | 'architecture'
  | 'comparison' | 'terminal' | 'case' | 'mistake' | 'quiz' | 'summary'
  | 'sources' | 'materials' | 'states';

export type QuizKind = 'single' | 'multi' | 'trueFalse' | 'ordering' | 'short' | 'selfReview';
export type TeacherProfile = { fullName: string; position: string; department: string };
export type Quiz = {
  kind: QuizKind;
  prompt: string;
  options?: string[];
  answer: string | string[];
  explanation: string;
};

export type Card = { label: string; value: string; tone?: 'red' | 'yellow' | 'green' | 'blue' };
export type Step = { title: string; text: string };

export type ContentPoint = {
  id: string;
  title: string;
  eyebrow?: string;
  type?: Exclude<SlideType, 'title' | 'objectives' | 'summary' | 'sources' | 'materials'>;
  subtitle?: string;
  bullets?: string[];
  cards?: Card[];
  steps?: Step[];
  compare?: { leftTitle: string; left: string[]; rightTitle: string; right: string[] };
  code?: string;
  quote?: string;
  media?: string;
  mediaAlt?: string;
  sourceIds: string[];
  check?: { question: string; answer: string; explanation: string };
  teacherNote?: string;
};

export type Slide = Omit<ContentPoint, 'type'> & {
  order: number;
  kind: 'content' | 'service';
  section: string;
  type: SlideType;
  quiz?: Quiz;
  materialUrl?: string;
  citations: SourceRef[];
};

export type Lecture = {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  recommendedDurationMinutes: number;
  laboratoryId: string;
  kimTasks: number[];
  objectives: string[];
  content: ContentPoint[];
  selfCheck: Quiz;
  finalChecklist: string[];
  teacherDemo: string[];
  sourceIds: string[];
};

export type LabStep = {
  title: string;
  actions: string[];
  result: string;
  files: string[];
};

export type Laboratory = {
  id: string;
  order: number;
  title: string;
  recommendedDurationMinutes: number;
  lectureId: string;
  kimTasks: number[];
  goal: string;
  starterFiles: string[];
  steps: LabStep[];
  deliverables: string[];
  acceptanceCriteria: string[];
  testCases: { action: string; expected: string }[];
  commonErrors: string[];
  recoveryHints: string[];
  submission: string[];
  sourceIds: string[];
};

export type Course = {
  id: string;
  shortTitle: string;
  title: string;
  subtitle: string;
  audience: string;
  materialsUrl: string;
  repositoryUrl: string;
  pagesUrl: string;
  lectures: Lecture[];
  laboratories: Laboratory[];
};

const typeRotation: ContentPoint['type'][] = [
  'bento', 'process', 'definition', 'comparison', 'architecture',
  'case', 'terminal', 'mistake', 'states', 'process',
];

function citations(ids: string[]) {
  return ids.map((id) => sourcesById[id]).filter((source): source is SourceRef => Boolean(source));
}

export function buildDeck(lecture: Lecture, _course: Course): Slide[] {
  if (lecture.content.length !== 20) {
    throw new Error(`Лекция ${lecture.id}: требуется ровно 20 содержательных экранов`);
  }

  const serviceStart: Slide[] = [
    {
      id: 'title', order: 1, kind: 'service', section: 'Старт', type: 'title',
      title: lecture.title,
      eyebrow: `ЛЕКЦИЯ ${lecture.order} · КИМ ${lecture.kimTasks.join(', ')}`,
      subtitle: lecture.description,
      sourceIds: lecture.sourceIds,
      citations: citations(lecture.sourceIds),
      media: '/brand/rhino-designer.webp',
      mediaAlt: 'Носорог-проектировщик курса',
      teacherNote: `Рекомендуемая методическая длительность: ${lecture.recommendedDurationMinutes} минут. Это не официальная академическая нагрузка.`,
    },
    {
      id: 'objectives-plan', order: 2, kind: 'service', section: 'Старт', type: 'objectives',
      title: 'Цели и маршрут занятия',
      eyebrow: 'ЦЕЛИ · ПЛАН',
      bullets: lecture.objectives,
      steps: lecture.content.slice(0, 5).map((point, index) => ({ title: `0${index + 1}`, text: point.title })),
      sourceIds: lecture.sourceIds,
      citations: citations(lecture.sourceIds),
      teacherNote: `Демонстрация: ${lecture.teacherDemo.join(' → ')}`,
    },
  ];

  const contentSlides: Slide[] = lecture.content.map((point, index) => ({
    ...point,
    order: index + 3,
    kind: 'content',
    section: index < 5 ? 'Ориентир' : index < 10 ? 'Рабочая модель' : index < 15 ? 'Реализация' : 'Проверка',
    type: point.type ?? typeRotation[index % typeRotation.length] ?? 'definition',
    citations: citations(point.sourceIds),
  }));

  const usedSourceIds = Array.from(new Set([...lecture.sourceIds, ...lecture.content.flatMap((point) => point.sourceIds)]));
  const lectureSources = citations(usedSourceIds);
  const serviceEnd: Slide[] = [
    {
      id: 'self-check', order: 23, kind: 'service', section: 'Самопроверка', type: 'quiz',
      title: 'Самопроверка', eyebrow: 'ПРОВЕРЬТЕ ПОНИМАНИЕ',
      sourceIds: lecture.sourceIds, citations: citations(lecture.sourceIds), quiz: lecture.selfCheck,
    },
    {
      id: 'sources', order: 24, kind: 'service', section: 'Источники', type: 'sources',
      title: 'Источники и границы', eyebrow: 'ПРОВЕРЕНО · 01.09.2026',
      bullets: lectureSources.map((source) => `${source.title}${source.url ? ` — ${source.url}` : ''}`),
      sourceIds: usedSourceIds, citations: lectureSources,
      teacherNote: 'Учебный домен «Конференции.РФ» используется как тренировочный пример и может отличаться от варианта оператора.',
    },
    {
      id: 'final', order: 25, kind: 'service', section: 'Финиш', type: 'summary',
      title: `Готово: ${lecture.shortTitle}`, eyebrow: 'ИТОГ · СВЯЗЬ С ЛАБОРАТОРНОЙ',
      bullets: lecture.finalChecklist,
      sourceIds: lecture.sourceIds, citations: citations(lecture.sourceIds),
      media: '/brand/rhino-tablet.webp', mediaAlt: 'Носорог с планшетом',
      teacherNote: `Следующий шаг: лабораторная работа ${lecture.laboratoryId}.`,
    },
  ];

  const slides = [...serviceStart, ...contentSlides, ...serviceEnd];
  if (slides.length !== 25 || slides.filter((slide) => slide.kind === 'content').length !== 20) {
    throw new Error(`Лекция ${lecture.id}: нарушена структура 20 + 5 экранов`);
  }
  return slides;
}
