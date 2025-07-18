# Документация шагов

## Шаг 1: Настройка окружения
**Цель**: Подготовить среду для запуска API в Docker.
- **Действия**:
  - Созданы файлы:
    - `Dockerfile`: Основа `python:3.9-slim`, установка зависимостей из `requirements.txt`, копирование `api.py`, `security_checker.py`, `logger.py`, `ip_loggernew.py`, `rate_limited.py`, `.env`.
    - `docker-compose.yml`: Сервис `education-api`, порт 8000, 2 ГБ памяти, 4 CPU, монтирование `submissions.log`, `hashes_db.json`.
    - `.env`: Хранит `SECRET_KEY` для JWT.
    - `api.py`: FastAPI-приложение с эндпоинтами для кода и админ-доступа.
    - `security_checker.py`: Проверка кода на плагиат и опасные конструкции.
    - `logger.py`, `ip_loggernew.py`: Логирование запросов в `submissions.log`.
    - `rate_limited.py`: Ограничение запросов через `slowapi`.
    - `requirements.txt`: Зависимости (`fastapi`, `uvicorn`, `slowapi`, `python-jose`, `passlib`).
    - `.gitignore`: Исключены `.env`, `hashes_db.json`, `submissions.log`, `admin_token.json`, `token.json`.
- **Проблемы**:
  - Гвизор (runsc) не работал в WSL2 (ошибка `unknown or invalid runtime name: runsc`). Решение: нативный Docker.
  - Ограничения WSL2 (2 ГБ, 4 CPU) мешали сложным инструментам.
- **Результат**: Среда настроена, образ `education-api` собран.

## Шаг 2: Тестирование API
**Цель**: Запустить контейнер и проверить API.
- **Действия**:
  - Сборка образа: `docker build -t education-api .`
  - Запуск контейнера (ID: `7564e84218d7`): `docker run -d --memory="2g" --cpus="4" --network bridge -v $(pwd)/submissions.log:/app/submissions.log -v $(pwd)/hashes_db.json:/app/hashes_db.json -p 8000:8000 --name api-test education-api`
  - Проверка API на `localhost:8000` через `curl` или браузер.
  - Проверка `submissions.log` и `hashes_db.json`.
- **Проблемы**:
  - Конфликт имени `api-test`. Решение: использовать существующий контейнер или `docker rm -f api-test`.
  - Мало документации из-за фокуса на Шагах 3 и 4.
- **Результат**: Контейнер работает, API доступно на порту 8000.

## Шаг 3: Проверка кода
**Цель**: Реализовать проверку кода на плагиат и безопасность.
- **Реализация**: Эндпоинты в `api.py`, логика в `security_checker.py`, ограничение запросов в `rate_limited.py`.
- **Результаты**:
  - Тест 1: `{"status":"ok","user_id":"test-id","hash":"9652c57342bab8e956cb05bda9a30cb04c7bdf682cc0c988935462efcafac1eb"}`
  - Тест 2: `{"detail":"Обнаружено похожее решение"}`
  - Тест 3: `{"detail":"Код содержит опасные конструкции"}`
- **Логи**: `submissions.log` подтверждает отправку (хэш `9652c573...`).

## Шаг 4: Админ-доступ
**Цель**: Реализовать JWT-аутентификацию.
- **Реализация**: JWT в `api.py`, токены в `admin_token.json`, `token.json`.
- **Результаты**:
  - Тест 1: `{"detail":"Недостаточно прав"}`
  - Тест 2: `{"message":"Доступ разрешен"}`

## Шаг 5: Защита от DoS
**Цель**: Настроить защиту от атак "отказ в обслуживании".
- **Действия**:
  - `slowapi` и `rate_limited.py`: лимиты 5 запросов/мин на пользователя, 60/мин всего.
  - Лимиты контейнера: 2 ГБ памяти, 4 CPU.
- **Проблемы**:
  - WSL2 (2 ГБ, 4 CPU) не позволил тестировать Locust/JMeter.
  - Нет инструментов для симуляции DoS.
  - Этические ограничения для атак.
- **Результат**: Частичная защита есть, тестирование не проведено.

## Шаг 6: Реализация WAF
**Цель**: Настроить Web Application Firewall против инъекций.
- **Действия**:
  - Планировалась фильтрация запросов (`union.*select`, `os.system`).
  - Команда создала `middleware.py` для Django, но FastAPI его не поддерживает.
- **Проблемы**:
  - FastAPI не совместим с Django-middleware.
  - Нет облачной инфраструктуры (Azure WAF, Cloudflare).
  - WSL2 ограничил настройку ModSecurity.
- **Результат**: WAF не реализован, попытка задокументирована.
