

Веб-приложение для учёта выполненных работ на строительной площадке: записи журнала, справочник видов работ, фильтрация по дате.


| Слой | Технологии |
|------|------------|
| Frontend | React, TypeScript, Vite, TanStack Table/Query, shadcn/ui, Tailwind CSS, Zod |
| Backend | NestJS, TypeScript, Prisma ORM |
| БД | PostgreSQL 16 |

!!!Я мог что то упустить в инструкции (вроде не должен был)

## Запуск для разработки (локально)
чтобы запустить понадобятся

- **Node.js 20+**
- **npm**

### 1. Клонировать репозиторий

```powershell
git clone https://github.com/alaxaboom/Work_log.git
cd Work_log
```
### 2. База данных

нужно либо локально создать базу данных в pgadmin, либо докером, который должен быть установлен

```powershell
docker compose up -d postgres #перед командой нужно в docker-compose.yml поставить свои данные бд
```

### 3. Backend

```powershell
cd backend
copy .env.example .env
#в .env нужно будет поменять данные бд на свои: пользователя, пароль, название бд
npm install
npx prisma migrate dev
npx prisma generate
npx prisma db seed
npm run start:dev
```

сервер будет доступен по адресу: `http://localhost:5000/api`

### 4. Frontend (в отдельном терминале)

```powershell
cd frontend
copy .env.example .env
//
npm install
npm run dev
```

Приложение будет доступно по: `http://localhost:3000`


## Запуск через Docker (сервер / прод)

сначала нужно убедится что на сервере скачан docker и docker compose 

```powershell
docker --version
docker compose version
```
потом клонировать репозиторий 

```powershell
git clone https://github.com/alaxaboom/Work_log.git
cd Work_log
```

### Переменные для сервера

Отредактируй `docker-compose.yml` перед билдом:

| Переменная | Где | Назначение |
|------------|-----|------------|
| `POSTGRES_PASSWORD` | postgres | Пароль БД |
| `DATABASE_URL` | backend | Строка подключения к PostgreSQL. Два раза нужно написать|
| `CORS_ORIGIN` | backend | айпи своего сервера |

Команда для билда и запуска приложения.

```powershell
docker compose up -d --build
```

После сборки:

- **Приложение будет на :** `http://айпи сервера`

## Начальные данные

При первом запуске seed создаёт три вида работ:

- Кладка перегородок (м²)
- Монтаж опалубки (м²)
- Бетонирование (м³)
