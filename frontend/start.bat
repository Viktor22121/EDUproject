@echo off
:: Переход в папку проекта
cd /d "%~dp0%"

:: Проверяем, установлен ли Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js не установлен. Скачайте и установите с официального сайта: https://nodejs.org 
    timeout /t 5 /nobreak >nul
    exit
)

:: Проверяем, установлен ли зависимости
if not exist "node_modules" (
    echo Установка зависимостей...
    npm install
)

:: Запуск сервера
echo Запуск сайта...
npm start