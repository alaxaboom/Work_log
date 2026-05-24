

Веб-приложение для учёта выполненных работ на строительной площадке: записи журнала, справочник видов работ, фильтрация по дате.


| Слой | Технологии |
|------|------------|
| Frontend | React, TypeScript, Vite, TanStack Table/Query, shadcn/ui, Tailwind CSS, Zod |
| Backend | NestJS, TypeScript, Prisma ORM |
| БД | PostgreSQL 16 |

## Требования

- **Node.js 20+**
- **npm**
- **Docker Desktop** (для PostgreSQL локально или полного деплоя)

---

## Запуск для разработки (локально)

### 1. Клонировать репозиторий

```powershell
git clone https://github.com/YOUR_USERNAME/work_log.git
cd work_log
```

### 2. Поднять PostgreSQL

```powershell
docker compose up -d postgres
```

БД будет доступна на `localhost:5432`, имя БД — `work_log_db`, пользователь/пароль — `postgres` / `password`.

### 3. Backend

```powershell
cd backend
copy .env.example .env
npm install
npx prisma migrate dev
npx prisma generate
npx prisma db seed
npm run start:dev
```

API: `http://localhost:5000/api`

### 4. Frontend (отдельный терминал)

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Приложение: `http://localhost:3000`

Vite проксирует запросы `/api` на backend. В `.env` фронтенда `VITE_API_URL` оставь пустым.

### Повседневная разработка

| Действие | Команда |
|----------|---------|
| Изменил `schema.prisma` | `npx prisma migrate dev` в папке `backend` |
| После миграции | `npx prisma generate` |
| Пустая БД, нужны начальные виды работ | `npx prisma db seed` |
| Запуск backend | `npm run start:dev` |
| Запуск frontend | `npm run dev` |

---

## Запуск через Docker (сервер / прод)

Поднимает PostgreSQL, backend и frontend (nginx на порту 80).

```powershell
docker compose up -d --build
```

После сборки:

- **Приложение:** `http://localhost`
- **API напрямую:** `http://localhost:5000/api`

Backend при старте автоматически применяет миграции (`prisma migrate deploy`).

### Переменные для сервера

Отредактируй `docker-compose.yml` перед деплоем:

| Переменная | Где | Назначение |
|------------|-----|------------|
| `POSTGRES_PASSWORD` | postgres | Пароль БД |
| `DATABASE_URL` | backend | Строка подключения к PostgreSQL |
| `CORS_ORIGIN` | backend | URL фронтенда, например `http://your-server-ip` |

---

## Структура проекта

```
work_log/
├── backend/          # NestJS API + Prisma
├── frontend/         # React SPA
├── docker-compose.yml
└── README.md
```

---

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/work-logs` | Список записей (`dateFrom`, `dateTo`, `sortOrder`) |
| POST | `/api/work-logs` | Создать запись |
| PATCH | `/api/work-logs/:id` | Изменить запись |
| DELETE | `/api/work-logs/:id` | Удалить запись |
| GET | `/api/work-types` | Список видов работ |
| POST | `/api/work-types` | Создать вид работ |
| PATCH | `/api/work-types/:id` | Изменить вид работ |
| DELETE | `/api/work-types/:id` | Удалить вид работ (каскадно удаляет связанные записи журнала) |

---

## Начальные данные

При первом запуске seed создаёт три вида работ:

- Кладка перегородок (м²)
- Монтаж опалубки (м²)
- Бетонирование (м³)
