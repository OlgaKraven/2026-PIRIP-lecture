import type { Lecture } from '@/app/course';

const sources = ['kim-2027-pdf', 'lit-markin-baranov-2026'];

export const lecture02: Lecture = {
  id: 'lecture-02-database-backend-security',
  order: 2,
  title: 'База данных, backend и безопасность приложения',
  shortTitle: 'БД, backend и безопасность',
  description: 'Собираем задание 1: проектируем четыре сущности, реализуем регистрацию и сессии, защищаем роли и проводим заявку от формы до БД.',
  recommendedDurationMinutes: 90,
  laboratoryId: 'lab-02-task-01',
  kimTasks: [1],
  objectives: ['Построить ER-модель и SQL-схему', 'Разделить backend на понятные объекты и операции', 'Реализовать безопасную регистрацию и авторизацию', 'Защитить доступ к данным пользователя и панели администратора'],
  teacherDemo: ['создать БД', 'зарегистрировать пользователя', 'войти через сессию', 'создать заявку', 'сменить статус', 'проверить запрет чужого доступа'],
  sourceIds: sources,
  content: [
    {
      id: 'entities', title: 'Четыре сущности покрывают рабочий минимум', eyebrow: 'МОДЕЛЬ ДАННЫХ', type: 'bento',
      cards: [
        { label: 'users', value: 'Учётные данные, контакты и роль', tone: 'red' },
        { label: 'venues', value: 'Название и тип помещения', tone: 'blue' },
        { label: 'reservations', value: 'Дата, оплата, статус и владелец', tone: 'green' },
        { label: 'reviews', value: 'Текст отзыва для завершённой заявки', tone: 'yellow' },
      ], sourceIds: sources,
    },
    {
      id: 'users-table', title: 'users хранит идентичность, но не открытый пароль', eyebrow: 'ТАБЛИЦА 1', type: 'terminal',
      code: 'users\n  id BIGINT PRIMARY KEY AUTO_INCREMENT\n  login VARCHAR(50) UNIQUE NOT NULL\n  password_hash VARCHAR(255) NOT NULL\n  fio VARCHAR(120) NOT NULL\n  phone VARCHAR(20) NOT NULL\n  email VARCHAR(120) NOT NULL\n  role ENUM(\'user\', \'admin\') NOT NULL', sourceIds: sources,
    },
    {
      id: 'venues-table', title: 'venues превращает текстовый ввод в справочник', eyebrow: 'ТАБЛИЦА 2', type: 'comparison',
      compare: {
        leftTitle: 'Свободный текст', left: ['«Коворкинг» и «коворкинг» расходятся', 'Пользователь допускает опечатку', 'Фильтрация становится ненадёжной'],
        rightTitle: 'Справочник venues', right: ['Стабильный id помещения', 'Тип выбирается из допустимых значений', 'Select на форме заполняется из БД'],
      }, sourceIds: sources,
    },
    {
      id: 'reservations-table', title: 'reservations связывает пользователя и помещение', eyebrow: 'ТАБЛИЦА 3', type: 'terminal',
      code: 'reservations\n  id BIGINT PRIMARY KEY AUTO_INCREMENT\n  user_id BIGINT NOT NULL\n  venue_id BIGINT NOT NULL\n  event_date DATE NOT NULL\n  payment_method ENUM(\'onsite\', \'sbp\') NOT NULL\n  status ENUM(\'new\', \'scheduled\', \'completed\') DEFAULT \'new\'\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', sourceIds: sources,
    },
    {
      id: 'reviews-table', title: 'review зависит от завершённой заявки', eyebrow: 'ТАБЛИЦА 4', type: 'definition',
      quote: 'Наличие внешнего ключа связывает отзыв с заявкой; бизнес-правило дополнительно проверяет статус «Завершено».',
      bullets: ['reservation_id — UNIQUE, если допускается один отзыв', 'text — обязательный текст с разумным пределом длины', 'created_at — время отправки', 'Проверка владельца выполняется на сервере'], sourceIds: sources,
    },
    {
      id: 'er-keys', title: 'Ключи делают связи проверяемыми', eyebrow: 'ER-ДИАГРАММА', type: 'architecture',
      code: 'users.id         → reservations.user_id\nvenues.id        → reservations.venue_id\nreservations.id  → reviews.reservation_id',
      bullets: ['Первичный ключ однозначно определяет строку', 'Внешний ключ не допускает ссылку на отсутствующую запись', 'Индексы на внешних ключах ускоряют выборки'], sourceIds: sources,
    },
    {
      id: 'schema-order', title: 'SQL-схема создаётся в порядке зависимостей', eyebrow: 'SCHEMA.SQL', type: 'process',
      steps: [
        { title: '01', text: 'users и venues — независимые таблицы' },
        { title: '02', text: 'reservations — внешние ключи на users и venues' },
        { title: '03', text: 'reviews — внешний ключ на reservations' },
        { title: '04', text: 'Индексы, ограничения и тестовая выборка' },
      ], sourceIds: sources,
    },
    {
      id: 'seed-data', title: 'seed.sql создаёт только проверочные данные', eyebrow: 'ВОСПРОИЗВОДИМОСТЬ', type: 'terminal',
      code: "INSERT INTO venues (title, venue_type) VALUES\n('Аудитория 301', 'auditorium'),\n('Коворкинг Север', 'coworking'),\n('Кинозал Маяк', 'cinema');",
      bullets: ['Администратор создаётся с хешем пароля', 'Тестовые пользователи явно помечены', 'Скрипт можно безопасно повторить после очистки БД'], sourceIds: sources,
    },
    {
      id: 'db-connection', title: 'Одно подключение — одна точка диагностики', eyebrow: 'PDO · MYSQL', type: 'terminal',
      code: "$pdo = new PDO($dsn, $dbUser, $dbPassword, [\n  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\n]);",
      bullets: ['Параметры подключения не дублируются по страницам', 'Ошибки логируются без показа секрета пользователю', 'Кодировка соединения задаётся явно'], sourceIds: sources,
    },
    {
      id: 'oop-boundaries', title: 'ООП нужно для границ ответственности, а не для количества классов', eyebrow: 'МИНИМАЛЬНАЯ АРХИТЕКТУРА', type: 'architecture',
      steps: [
        { title: 'User', text: 'Регистрация и поиск пользователя' },
        { title: 'Auth', text: 'Проверка пароля и работа с сессией' },
        { title: 'Reservation', text: 'Создание, выборка и смена статуса' },
        { title: 'Review', text: 'Проверка условий и сохранение отзыва' },
      ], sourceIds: sources,
    },
    {
      id: 'registration-validation', title: 'Сервер повторяет все проверки формы', eyebrow: 'НЕ ДОВЕРЯЕМ БРАУЗЕРУ', type: 'process',
      steps: [
        { title: 'Нормализовать', text: 'trim, единый регистр логина, формат телефона' },
        { title: 'Проверить', text: 'обязательность, длину и шаблон каждого поля' },
        { title: 'Уникальность', text: 'SELECT по логину до INSERT и UNIQUE в БД' },
        { title: 'Сохранить', text: 'Только после полного набора успешных проверок' },
      ], sourceIds: sources,
    },
    {
      id: 'password-hash', title: 'Пароль сравнивается через хеш', eyebrow: 'БЕЗОПАСНОСТЬ', type: 'comparison',
      compare: {
        leftTitle: 'Нельзя', left: ['Хранить Demo77 как обычный текст', 'Сравнивать пароль SQL-запросом', 'Показывать, какой логин существует'],
        rightTitle: 'Нужно', right: ['password_hash при создании', 'password_verify при входе', 'Одинаковое сообщение для неверной пары'],
      }, sourceIds: sources,
    },
    {
      id: 'prepared-statements', title: 'Подготовленный запрос отделяет SQL от данных', eyebrow: 'SQL-INJECTION', type: 'terminal',
      code: "$stmt = $pdo->prepare(\n  'SELECT id, password_hash, role FROM users WHERE login = :login'\n);\n$stmt->execute(['login' => $login]);",
      bullets: ['Не вставляйте ввод строковой конкатенацией', 'Параметр получает значение отдельно', 'Выбор имени столбца требует белого списка'], sourceIds: sources,
    },
    {
      id: 'session-login', title: 'Сессия хранит минимальную идентичность', eyebrow: 'АВТОРИЗАЦИЯ', type: 'process',
      steps: [
        { title: 'Вход', text: 'Найти пользователя и проверить пароль' },
        { title: 'Обновить ID', text: 'session_regenerate_id после успешного входа' },
        { title: 'Сохранить', text: 'user_id и role, без пароля' },
        { title: 'Выход', text: 'Очистить данные и завершить сессию' },
      ], sourceIds: sources,
    },
    {
      id: 'role-guard', title: 'Проверка роли выполняется до рендера страницы', eyebrow: 'ПАНЕЛЬ АДМИНИСТРАТОРА', type: 'terminal',
      code: "requireLogin();\nif (currentUserRole() !== 'admin') {\n  http_response_code(403);\n  exit('Доступ запрещён');\n}",
      bullets: ['Скрытая кнопка не является защитой', 'Прямой URL тоже должен вернуть запрет', 'Смена статуса доступна только роли admin'], sourceIds: sources,
    },
    {
      id: 'create-reservation', title: 'Создание заявки — одна серверная операция', eyebrow: 'ФОРМА → БД', type: 'process',
      steps: [
        { title: 'Вход', text: 'Проверить сессию пользователя' },
        { title: 'Данные', text: 'Проверить venue_id, event_date и payment_method' },
        { title: 'INSERT', text: 'Подставить user_id из сессии, статус new' },
        { title: 'Ответ', text: 'Редирект в кабинет с сообщением об успехе' },
      ], sourceIds: sources,
    },
    {
      id: 'ownership-filter', title: 'Пользователь видит только собственные заявки', eyebrow: 'КОНТРОЛЬ ДОСТУПА', type: 'terminal',
      code: 'SELECT r.*, v.title\nFROM reservations r\nJOIN venues v ON v.id = r.venue_id\nWHERE r.user_id = :current_user_id\nORDER BY r.created_at DESC;',
      bullets: ['user_id берётся из сессии', 'Не доверяйте user_id из query-параметра', 'Администратор использует отдельную выборку'], sourceIds: sources,
    },
    {
      id: 'status-transition', title: 'Смена статуса разрешена только по белому списку', eyebrow: 'АДМИНИСТРАТОР', type: 'states',
      cards: [
        { label: 'new', value: 'Можно назначить или завершить', tone: 'red' },
        { label: 'scheduled', value: 'Можно завершить', tone: 'blue' },
        { label: 'completed', value: 'Финальное состояние для отзыва', tone: 'green' },
        { label: 'Любая другая строка', value: 'HTTP 422 и без UPDATE', tone: 'yellow' },
      ], sourceIds: sources,
    },
    {
      id: 'review-rule', title: 'Отзыв проверяется тремя условиями', eyebrow: 'ПОСЛЕ ЗАВЕРШЕНИЯ', type: 'process',
      steps: [
        { title: 'Владелец', text: 'Заявка принадлежит текущему пользователю' },
        { title: 'Статус', text: 'status строго равен completed' },
        { title: 'Дубликат', text: 'Для reservation_id ещё нет отзыва' },
        { title: 'Текст', text: 'Не пустой и укладывается в лимит' },
      ], sourceIds: sources,
    },
    {
      id: 'security-checklist', title: 'Контрольная точка lab2-ready', eyebrow: 'ПЕРЕД КОММИТОМ', type: 'mistake',
      bullets: ['Пароли хешируются; SQL параметризован', 'Сессия и роли проверяются на сервере', 'Пользователь не читает чужие заявки', 'Статусы и отзыв подчиняются бизнес-правилам', 'ER-диаграмма и schema.sql совпадают с кодом'], sourceIds: sources,
    },
  ],
  selfCheck: {
    kind: 'multi', prompt: 'Что обязательно проверяется на сервере при добавлении отзыва?',
    options: ['Владелец заявки', 'Статус «Завершено»', 'Отсутствие существующего отзыва', 'Цвет кнопки в браузере'],
    answer: ['Владелец заявки', 'Статус «Завершено»', 'Отсутствие существующего отзыва'],
    explanation: 'Клиентский интерфейс помогает пользователю, но не заменяет серверные ограничения.',
  },
  finalChecklist: ['ER-диаграмма соответствует четырём таблицам', 'Регистрация и авторизация работают через безопасные запросы', 'Сессия отделяет пользователя от администратора', 'Заявка проходит от формы до БД', 'Отзыв доступен только после завершения'],
};
