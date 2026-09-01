import type { Lecture } from '@/app/course';

const design = ['kim-2027-pdf', 'kim-style-guide', 'kim-2027-zip', 'pirip-02-site'];

export const lecture03: Lecture = {
  id: 'lecture-03-design-and-responsive', order: 3,
  title: 'Элементы графического дизайна и адаптивность', shortTitle: 'дизайн и 390×844',
  description: 'Превращаем wireframes в единую дизайн-систему, оформляем формы и карточки, оптимизируем медиа и перестраиваем интерфейс для смартфона 390×844.',
  recommendedDurationMinutes: 90, laboratoryId: 'lab-03-task-02', kimTasks: [2],
  objectives: ['Применить руководство по стилю КИМ', 'Собрать повторно используемый UI-kit', 'Спроектировать формы, списки и карточки', 'Проверить все страницы на 390×844 без горизонтального переполнения'],
  teacherDemo: ['показать wireframe', 'применить токены', 'собрать форму', 'перестроить карточки на 390 px', 'сравнить вес изображений'],
  sourceIds: design,
  content: [
    { id: 'task2-purpose', title: 'Задание 2 улучшает весь пользовательский путь', eyebrow: 'ДИЗАЙН ВСЕХ СТРАНИЦ', type: 'process', steps: [
      { title: 'Регистрация', text: 'Понятные поля и ошибки рядом с вводом' }, { title: 'Авторизация', text: 'Чёткий вход и переход к регистрации' },
      { title: 'Заявка', text: 'Select вместо неоднозначного текста' }, { title: 'Администратор', text: 'Карточки, фильтр и заметный статус' },
    ], sourceIds: ['kim-2027-pdf'] },
    { id: 'style-guide', title: 'Руководство КИМ задаёт язык учебного приложения', eyebrow: 'PT SANS · ПАЛИТРА', type: 'bento', cards: [
      { label: 'Голубой', value: '#007bff', tone: 'blue' }, { label: 'Тёмно-синий', value: '#0d47a1', tone: 'blue' },
      { label: 'Серый', value: '#6c757d', tone: 'yellow' }, { label: 'Фон / белый', value: '#f8f9fa / #ffffff', tone: 'green' },
    ], sourceIds: ['kim-style-guide'] },
    { id: 'typography', title: 'Типографика создаёт предсказуемую иерархию', eyebrow: 'PT SANS', type: 'comparison', compare: {
      leftTitle: 'Заголовки', left: ['H1 — 36 px, Bold', 'H2 — 24 px, Bold', 'H3 — 18 px, Bold'],
      rightTitle: 'Текст', right: ['Основной — 16 px', 'Вспомогательный — 12 px Italic', 'Не уменьшать текст ради переполненного макета'],
    }, sourceIds: ['kim-style-guide'] },
    { id: 'design-tokens', title: 'Токены отделяют решение от отдельной страницы', eyebrow: 'CSS VARIABLES', type: 'terminal', code: ':root {\n  --color-primary: #007bff;\n  --color-primary-dark: #0d47a1;\n  --color-muted: #6c757d;\n  --color-bg: #f8f9fa;\n  --space-3: 12px;\n  --radius: 10px;\n}', sourceIds: ['kim-style-guide', 'pirip-01-site'] },
    { id: 'wireframe-to-html', title: 'Wireframe переносится по ролям блоков', eyebrow: 'ПИРИП-02 → HTML', type: 'architecture', steps: [
      { title: 'Header', text: 'Название сервиса, навигация и выход' }, { title: 'Main', text: 'Единственная основная задача страницы' },
      { title: 'Form / list', text: 'Семантическая группа управления или данных' }, { title: 'Feedback', text: 'Ошибка, успех или пустое состояние' },
    ], sourceIds: ['pirip-02-site', 'pirip-01-site'] },
    { id: 'ui-kit', title: 'UI-kit сокращает количество решений', eyebrow: 'ПОВТОРНОЕ ИСПОЛЬЗОВАНИЕ', type: 'bento', cards: [
      { label: 'Button', value: 'primary, secondary, danger', tone: 'red' }, { label: 'Field', value: 'label, control, hint, error', tone: 'blue' },
      { label: 'Status', value: 'new, scheduled, completed', tone: 'green' }, { label: 'Card', value: 'заявка + действия', tone: 'yellow' },
    ], sourceIds: ['pirip-02-site', 'kim-2027-pdf'] },
    { id: 'form-anatomy', title: 'Поле формы содержит четыре части', eyebrow: 'LABEL → CONTROL → HINT → ERROR', type: 'definition', quote: 'Пользователь должен понять, что ввести, в каком формате и как исправить ошибку — не угадывая по цвету рамки.', bullets: ['label всегда видим', 'placeholder не заменяет label', 'ошибка связана с полем через aria-describedby', 'текст ошибки появляется рядом с причиной'], sourceIds: ['kim-2027-pdf', 'wcag-22'] },
    { id: 'validation-states', title: 'Ошибки показываются на форме и сохраняют контекст', eyebrow: 'ЗАДАНИЕ 2', type: 'states', cards: [
      { label: 'Default', value: 'Требование к формату видно заранее', tone: 'blue' }, { label: 'Focus', value: 'Заметный контур клавиатуры', tone: 'yellow' },
      { label: 'Error', value: 'Причина + способ исправления', tone: 'red' }, { label: 'Success', value: 'Подтверждение без потери данных', tone: 'green' },
    ], sourceIds: ['kim-2027-pdf', 'wcag-22'] },
    { id: 'selects', title: 'Select ограничивает выбор допустимыми данными', eyebrow: 'ПОМЕЩЕНИЕ · ОПЛАТА · СТАТУС', type: 'comparison', compare: {
      leftTitle: 'Текстовое поле', left: ['Опечатки и разные названия', 'Сложная серверная нормализация', 'Фильтр получает грязные данные'],
      rightTitle: 'Выпадающий список', right: ['Опции приходят из справочника', 'Отправляется стабильный id', 'Подпись остаётся понятной человеку'],
    }, sourceIds: ['kim-2027-pdf'] },
    { id: 'admin-card', title: 'Карточка заявки отвечает на пять вопросов', eyebrow: 'ПАНЕЛЬ АДМИНИСТРАТОРА', type: 'bento', cards: [
      { label: 'Кто', value: 'ФИО и контакт', tone: 'blue' }, { label: 'Где', value: 'Помещение и тип', tone: 'red' },
      { label: 'Когда', value: 'Дата конференции', tone: 'yellow' }, { label: 'Как', value: 'Оплата и текущий статус', tone: 'green' },
    ], sourceIds: ['kim-2027-pdf'] },
    { id: 'mobile-layout', title: 'На 390×844 композиция перестраивается', eyebrow: 'НЕ УМЕНЬШАЕМ DESKTOP', type: 'comparison', compare: {
      leftTitle: 'Desktop', left: ['Две колонки формы', 'Панель фильтров в строку', 'Карточка: данные + действия рядом'],
      rightTitle: '390×844', right: ['Одна колонка', 'Фильтры прокручиваются или складываются', 'Действия занимают доступную ширину', 'Текст остаётся 16 px'],
    }, sourceIds: ['kim-2027-pdf', 'wcag-22'] },
    { id: 'navigation-mobile', title: 'Навигация сохраняет приоритет задачи', eyebrow: 'МОБИЛЬНЫЙ СЦЕНАРИЙ', type: 'process', steps: [
      { title: 'Сначала', text: 'Заголовок и основное действие страницы' }, { title: 'Далее', text: 'Поля или список по естественному порядку' },
      { title: 'После', text: 'Вторичные ссылки и справочная информация' }, { title: 'Всегда', text: 'Выход и обратный переход доступны без ловушки' },
    ], sourceIds: ['pirip-02-site', 'wcag-22'] },
    { id: 'touch-targets', title: 'Интерактивные элементы должны быть различимы и достижимы', eyebrow: 'TOUCH · KEYBOARD', type: 'mistake', bullets: ['Не ставьте маленькие иконки вплотную', 'Подпишите действие текстом или aria-label', 'Сохраните заметный focus-visible', 'Не меняйте порядок фокуса только ради макета'], sourceIds: ['wcag-22'] },
    { id: 'image-optimization', title: 'Оптимизация начинается с назначения изображения', eyebrow: 'ГРАФИКА', type: 'process', steps: [
      { title: 'Выбрать', text: 'Нужен ли визуал для смысла страницы' }, { title: 'Кадрировать', text: 'Под целевой блок, без случайных объектов' },
      { title: 'Сжать', text: 'WebP/AVIF или оптимизированный JPEG/PNG' }, { title: 'Проверить', text: 'Резкость, вес, alt и размеры на 390 px' },
    ], sourceIds: ['kim-2027-pdf', 'kim-2027-zip'] },
    { id: 'kim-media', title: 'Медиа КИМ — источник, а не инструкция', eyebrow: 'ПРИЛОЖЕНИЕ К ЗАДАНИЮ', type: 'case', subtitle: 'Используем только реально найденные файлы и не дублируем одинаковые наборы ПА и БУ.', bullets: ['22 файла в media', '3 файла в social', 'Архивы ПА и БУ имеют одинаковый состав', 'Сохраняем происхождение ассета в SOURCES.md'], media: '/kim-media/auditorium.jpg', mediaAlt: 'Аудитория из приложения КИМ', sourceIds: ['kim-2027-zip'] },
    { id: 'messages', title: 'Сообщение состояния продолжает сценарий', eyebrow: 'ОШИБКА · УСПЕХ · ПУСТО', type: 'states', cards: [
      { label: 'Ошибка', value: 'Что случилось и что сделать дальше', tone: 'red' }, { label: 'Успех', value: 'Что сохранено и где увидеть результат', tone: 'green' },
      { label: 'Пусто', value: 'Почему записей нет и как создать первую', tone: 'yellow' }, { label: 'Загрузка', value: 'Что ожидается без блокировки контекста', tone: 'blue' },
    ], sourceIds: ['wcag-22', 'pirip-02-site'] },
    { id: 'contrast-focus', title: 'Цвет не должен быть единственным сигналом', eyebrow: 'ДОСТУПНОСТЬ', type: 'comparison', compare: {
      leftTitle: 'Недостаточно', left: ['Красная рамка без текста', 'Слабый серый текст', 'Focus удалён outline: none'],
      rightTitle: 'Надёжно', right: ['Иконка + текст ошибки', 'Контрастные подписи', 'Заметный focus-visible', 'Статус читается словами'],
    }, sourceIds: ['wcag-22'] },
    { id: 'responsive-test', title: 'Пять размеров дают карту риска', eyebrow: 'ПРОВЕРКА', type: 'terminal', code: '1920×1080 — большой экран\n1366×768  — типичный ноутбук\n768×1024  — планшет\n390×844   — целевой смартфон КИМ\n360×800   — узкий смартфон', bullets: ['Проверить overflow-x', 'Прочитать длинные заголовки', 'Пройти формы клавиатурой', 'Проверить карточки и фильтры'], sourceIds: ['kim-2027-pdf', 'wcag-22'] },
    { id: 'consistency-audit', title: 'Визуальная проверка идёт по повторяющимся правилам', eyebrow: 'UI-АУДИТ', type: 'process', steps: [
      { title: 'Токены', text: 'Нет случайных цветов и размеров' }, { title: 'Компоненты', text: 'Одинаковые поля и кнопки ведут себя одинаково' },
      { title: 'Состояния', text: 'Ошибка, успех и disabled различимы' }, { title: 'Адаптивность', text: 'Все страницы перестроены, не только главная' },
    ], sourceIds: ['kim-style-guide', 'pirip-02-site'] },
    { id: 'lab3-handoff', title: 'Контрольная точка lab3-ready', eyebrow: 'СДАВАЕМ ДИЗАЙН', type: 'case', bullets: ['Подключён PT Sans и токены палитры', 'Оформлены все страницы и состояния форм', 'Select используется для помещений и оплаты', 'Карточки и фильтр работают в админ-панели', '390×844 проходит без горизонтального скролла', 'Изображения оптимизированы'], sourceIds: design },
  ],
  selfCheck: { kind: 'single', prompt: 'Что нужно сделать с desktop-композицией на 390×844?', options: ['Перестроить в мобильную структуру с читаемым текстом', 'Уменьшить весь экран пропорционально', 'Спрятать основные поля формы'], answer: 'Перестроить в мобильную структуру с читаемым текстом', explanation: 'КИМ требует дизайн для смартфона, а не миниатюру desktop-страницы.' },
  finalChecklist: ['Токены соответствуют руководству КИМ', 'UI-kit используется на всех страницах', 'Формы показывают локальные ошибки', 'Админ-панель содержит карточки и фильтр', '390×844 и 360×800 не дают горизонтального переполнения'],
};
