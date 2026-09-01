import type { Lecture } from '@/app/course';

const interactive = ['kim-2027-pdf', 'mdn-javascript', 'ecma-262', 'wcag-22'];

export const lecture04: Lecture = {
  id: 'lecture-04-performance-and-interactivity', order: 4,
  title: 'Оптимизация производительности и интерактивность', shortTitle: 'интерактивность и качество',
  description: 'Завершаем задание 3: проектируем состояния интерфейса, обмен с backend, фильтрацию, уведомления и микроанимации без потери доступности.',
  recommendedDurationMinutes: 90, laboratoryId: 'lab-04-task-03', kimTasks: [3],
  objectives: ['Реализовать loading, empty, error и success', 'Организовать предсказуемый обмен с backend', 'Добавить фильтрацию, уведомления и микроанимации', 'Проверить производительность, консоль и доступность'],
  teacherDemo: ['включить искусственную задержку', 'показать 4 состояния', 'отфильтровать заявки', 'вызвать ошибку API', 'включить reduced motion', 'проверить консоль'],
  sourceIds: interactive,
  content: [
    { id: 'task3-goal', title: 'Задание 3 соединяет данные, дизайн и поведение', eyebrow: 'ИНТЕГРАЦИЯ', type: 'architecture', steps: [
      { title: 'БД', text: 'Все функции поддержаны схемой' }, { title: 'UI', text: 'Адаптивный дизайн интегрирован' },
      { title: 'Интерактивность', text: 'Состояния, фильтр и обратная связь' }, { title: 'Качество', text: 'Код, производительность и консоль' },
    ], sourceIds: ['kim-2027-pdf'] },
    { id: 'state-model', title: 'Состояние интерфейса — часть контракта', eyebrow: 'НЕ ТОЛЬКО SUCCESS', type: 'states', cards: [
      { label: 'Loading', value: 'Данные ожидаются', tone: 'blue' }, { label: 'Empty', value: 'Успешно, но записей нет', tone: 'yellow' },
      { label: 'Error', value: 'Операция не завершена', tone: 'red' }, { label: 'Success', value: 'Данные получены или сохранены', tone: 'green' },
    ], sourceIds: ['mdn-javascript', 'wcag-22'] },
    { id: 'loading', title: 'Loading сохраняет контекст и блокирует дубликаты', eyebrow: 'ОЖИДАНИЕ', type: 'comparison', compare: {
      leftTitle: 'Плохо', left: ['Пустой экран', 'Кнопка отправляет повторно', 'Неясно, идёт ли запрос'],
      rightTitle: 'Надёжно', right: ['Скелетон или короткий индикатор', 'Submit disabled на время запроса', 'aria-busy и понятная подпись'],
    }, sourceIds: ['wcag-22', 'mdn-javascript'] },
    { id: 'empty', title: 'Empty объясняет следующий шаг', eyebrow: 'НЕТ ЗАПИСЕЙ', type: 'case', bullets: ['Назвать, какой список пуст', 'Не показывать ошибку там, где запрос успешен', 'Предложить создать первую заявку', 'После фильтра — предложить сбросить фильтр'], sourceIds: ['pirip-02-site', 'wcag-22'] },
    { id: 'error', title: 'Error отделяет техническую причину от действия пользователя', eyebrow: 'ВОССТАНОВЛЕНИЕ', type: 'mistake', cards: [
      { label: 'Пользователь', value: '«Не удалось загрузить. Повторить»', tone: 'red' }, { label: 'Разработчик', value: 'Статус, endpoint и ошибка в консоли / логе', tone: 'blue' },
      { label: 'Данные', value: 'Старый список не уничтожается без причины', tone: 'yellow' }, { label: 'Повтор', value: 'Одна явная безопасная операция', tone: 'green' },
    ], sourceIds: ['mdn-javascript'] },
    { id: 'success', title: 'Success подтверждает результат, а не просто цвет кнопки', eyebrow: 'ОБРАТНАЯ СВЯЗЬ', type: 'process', steps: [
      { title: 'Подтвердить', text: '«Заявка создана»' }, { title: 'Показать', text: 'Новая карточка или обновлённый статус' },
      { title: 'Сохранить', text: 'Данные формы очищаются после успеха' }, { title: 'Продолжить', text: 'Ссылка в кабинет или следующее действие' },
    ], sourceIds: ['wcag-22'] },
    { id: 'fetch-contract', title: 'fetch обрабатывает HTTP и JSON отдельно', eyebrow: 'ОБМЕН С BACKEND', type: 'terminal', code: "const response = await fetch('/api/reservations');\nif (!response.ok) throw new Error(`HTTP ${response.status}`);\nconst data = await response.json();\nrenderReservations(data);", bullets: ['Сетевой успех не гарантирует response.ok', 'Формат ответа проверяется до рендера', 'AbortController отменяет устаревший запрос'], sourceIds: ['mdn-javascript'] },
    { id: 'filtering', title: 'Фильтр работает по стабильным значениям', eyebrow: 'АДМИН-ПАНЕЛЬ', type: 'terminal', code: "const visible = reservations.filter((item) =>\n  status === 'all' || item.status === status\n);", bullets: ['Подписи можно переводить, значения остаются стабильными', 'Счётчик сообщает число результатов', 'Пустой результат имеет отдельное состояние', 'Сброс возвращает полный список'], sourceIds: ['mdn-javascript', 'kim-2027-pdf'] },
    { id: 'notifications', title: 'Уведомление отвечает: что произошло и что дальше', eyebrow: 'TOAST / INLINE', type: 'comparison', compare: {
      leftTitle: 'Inline', left: ['Ошибка конкретного поля', 'Постоянное состояние страницы', 'Инструкция восстановления рядом'],
      rightTitle: 'Toast', right: ['Короткое подтверждение операции', 'Не единственное место критической ошибки', 'Не перехватывает клавиатурный фокус'],
    }, sourceIds: ['wcag-22'] },
    { id: 'microanimation', title: 'Микроанимация объясняет изменение', eyebrow: 'ДВИЖЕНИЕ С ЦЕЛЬЮ', type: 'bento', cards: [
      { label: 'Hover / press', value: 'Кнопка отвечает на действие', tone: 'red' }, { label: 'Status', value: 'Метка мягко обновляется', tone: 'green' },
      { label: 'List', value: 'Новая карточка появляется без скачка', tone: 'blue' }, { label: 'Error', value: 'Область подсвечивается без тряски', tone: 'yellow' },
    ], sourceIds: ['kim-2027-pdf', 'wcag-22'] },
    { id: 'reduced-motion', title: 'prefers-reduced-motion меняет поведение, не содержание', eyebrow: 'ДОСТУПНОСТЬ', type: 'terminal', code: '@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    scroll-behavior: auto !important;\n    animation-duration: 0.01ms !important;\n    transition-duration: 0.01ms !important;\n  }\n}', sourceIds: ['wcag-22'] },
    { id: 'image-performance', title: 'Изображение загружается под реальный размер', eyebrow: 'ПРОИЗВОДИТЕЛЬНОСТЬ', type: 'process', steps: [
      { title: 'Формат', text: 'WebP/AVIF или оптимизированный исходный формат' }, { title: 'Размер', text: 'Не отдавать 2400 px в карточку 320 px' },
      { title: 'Атрибуты', text: 'width и height уменьшают layout shift' }, { title: 'Loading', text: 'lazy для контента ниже первого экрана' },
    ], sourceIds: ['kim-2027-pdf'] },
    { id: 'dom-budget', title: 'DOM содержит только актуальные элементы', eyebrow: 'БЫСТРЫЙ РЕНДЕР', type: 'comparison', compare: {
      leftTitle: 'Риск', left: ['Скрыть сотни карточек через display:none', 'Дублировать модальные окна', 'Пересобирать весь список при вводе'],
      rightTitle: 'Рабочий минимум', right: ['Фильтровать данные до render', 'Переиспользовать один контейнер', 'Рендерить только нужное состояние'],
    }, sourceIds: ['mdn-javascript'] },
    { id: 'console-errors', title: 'Чистая консоль — обязательная контрольная точка', eyebrow: 'QA', type: 'mistake', bullets: ['Нет необработанных Promise rejection', 'Нет 404 для CSS, JS и изображений', 'Нет ошибок доступа к null / undefined', 'Нет предупреждений о дублирующихся id', 'Проверены негативные сценарии, а не только happy path'], sourceIds: ['mdn-javascript'] },
    { id: 'keyboard-focus', title: 'Клавиатура проходит тот же сценарий', eyebrow: 'FOCUS', type: 'process', steps: [
      { title: 'Tab', text: 'Переход по интерактивным элементам' }, { title: 'Enter / Space', text: 'Активация кнопок и контролов' },
      { title: 'Escape', text: 'Закрытие диалога без ловушки' }, { title: 'Focus return', text: 'Возврат к элементу, открывшему окно' },
    ], sourceIds: ['wcag-22'] },
    { id: 'aria-live', title: 'Динамическое сообщение должно быть объявлено', eyebrow: 'ASSISTIVE TECHNOLOGY', type: 'terminal', code: '<div role="status" aria-live="polite">\n  Заявка сохранена\n</div>\n\n<div role="alert">\n  Не удалось изменить статус\n</div>', sourceIds: ['wcag-22'] },
    { id: 'code-standard', title: 'Единый стандарт делает ошибку заметнее', eyebrow: 'КАЧЕСТВО КОДА', type: 'bento', cards: [
      { label: 'Имена', value: 'Говорят о данных и действии', tone: 'blue' }, { label: 'Функции', value: 'Одна задача и явный результат', tone: 'green' },
      { label: 'Ошибки', value: 'Обрабатываются на границе операции', tone: 'red' }, { label: 'Формат', value: 'Один стиль во всём проекте', tone: 'yellow' },
    ], sourceIds: ['kim-2027-pdf', 'ecma-262'] },
    { id: 'offline-performance', title: 'Проверка работает в экзаменационной среде', eyebrow: 'БЕЗ ИНТЕРНЕТА', type: 'case', bullets: ['Запустить проект после отключения сети', 'Проверить локальные шрифты и библиотеки', 'Очистить cache и повторить сценарий', 'Оценить загрузку через DevTools без внешних CDN', 'Зафиксировать инструкции в README'], sourceIds: ['kim-2027-pdf'] },
    { id: 'integrated-scenario', title: 'Один сценарий проверяет все уровни', eyebrow: 'СКВОЗНОЙ SMOKE-TEST', type: 'process', steps: [
      { title: 'Форма', text: 'Показать ошибку и успешную отправку' }, { title: 'Список', text: 'Увидеть loading и новую карточку' },
      { title: 'Фильтр', text: 'Оставить только статус «Новая»' }, { title: 'Статус', text: 'Изменить, уведомить и обновить UI' },
      { title: 'Доступность', text: 'Повторить с клавиатуры и reduced motion' },
    ], sourceIds: interactive },
    { id: 'lab4-ready', title: 'Контрольная точка lab4-ready', eyebrow: 'ПЕРЕД ФИНАЛЬНОЙ РЕПЕТИЦИЕЙ', type: 'case', bullets: ['Есть четыре состояния данных', 'Фильтр и уведомления работают', 'Анимации поддерживают reduced motion', 'Изображения оптимизированы', 'Клавиатурный focus заметен', 'Консоль чистая, код оформлен единообразно'], sourceIds: interactive },
  ],
  selfCheck: { kind: 'multi', prompt: 'Какие состояния нужны списку заявок?', options: ['Loading', 'Empty', 'Error', 'Success', 'Только success'], answer: ['Loading', 'Empty', 'Error', 'Success'], explanation: 'Интерфейс должен объяснять ожидание, пустой результат, ошибку и успешные данные.' },
  finalChecklist: ['Обмен с backend обрабатывает HTTP-ошибки', 'Список имеет loading, empty, error и success', 'Фильтр и уведомления продолжают сценарий', 'Микроанимации отключаются при reduced motion', 'Клавиатура и консоль проходят проверку'],
};
