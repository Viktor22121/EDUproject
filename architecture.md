Полная архитектура системы безопасности
1. Структура проекта
Proekt/
├── backend/ # Серверная часть
│ ├── api.py # Главный API-сервер
│ ├── requirements.txt
│ ├── security/ # Модули безопасности
│ │ ├── security_checker.py
│ │ └── ip_loggernew.py
│ └── utils/ # Вспомогательные скрипты
│ └── watermark.py
├── frontend/ # Клиентская часть
│ └── src/
│ └── security/
│ ├── block-copy.js
│ └── block-tab-switch.js
├── docker/ # Контейнеризация
│ ├── Dockerfile
│ └── docker-compose.yml
└── docs/ # Документация
└── security/
└── architecture.md
2.Серверная защита (Backend)
			backend/api.py
```python
Основные функции:
├──  Web Application Firewall (WAF)
│   ├─ SQL-инъекции: UNION SELECT, DROP TABLE
│   ├─ XSS: <script>, onerror=
│   └─ RCE: os.system(), exec()
│
├──  Аутентификация
│   ├─ JWT с ролями user/admin
│   ├─ Срок жизни: 15 минут
│   └─ Автоматическая инвалидация
│
└──  Rate Limiting
    ├─ 10 запросов/минуту
    └─ Блокировка при флуде
			backend/security/security_checker.py
Что проверяет:
1. Запрещенные модули:
   - os, subprocess, sys, socket
2. Опасные функции:
   - eval(), exec(), open()
3. Критические атрибуты:
   - __globals__, __code__

Технология:
- Анализ AST-дерева кода
- Возвращает True/False
			backend/security/ip_loggernew.py
Функционал:
1. Логирование:
   - Формат: [Дата] [IP] [SHA-256]
   - Файл: submissions.log
2. Антиплагиат:
   - Алгоритм: difflib.SequenceMatcher
   - Порог: 90% схожести
   - База: hashes_db.json
			backend/utils/watermark.py
Назначение:
- Добавление водяных знаков на изображения

Параметры:
- Текст: настраиваемый
- Цвет: серый (128,128,128)
- Прозрачность: 50%
- Позиция: левый верхний угол
3. Клиентская защита (Frontend)
			frontend/src/security/block-copy.js
Функции:
1. Блокировка:
   - Копирование (Ctrl+C)
   - Контекстное меню (ПКМ)
   - DevTools (F12)
2. Реакция:
   - Замена контента страницы
   - Отправка лога на сервер
			frontend/src/security/block-tab-switch.js
Логика работы:
1. Отслеживает:
   - Смену вкладки
   - Сворачивание окна
2. Действия:
   - Мгновенное уведомление
   - Фиксация нарушения
4. Инфраструктура (Docker)
			docker/Dockerfile
Этапы сборки:
1. Базовый образ: python:3.9-slim
2. Установка зависимостей:
   - Без кеша (--no-cache-dir)
3. Копирование кода
4. Запуск через uvicorn
			docker/docker-compose.yml
Защитные механизмы:
- Песочница: gVisor (runsc)
- Безопасность:
  - no-new-privileges: true
  - cap_drop: [ALL]
- Ресурсы:
  - CPU: 1 ядро
  - RAM: 512MB
- Файловая система: read_only










