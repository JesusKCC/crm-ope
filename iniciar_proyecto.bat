@echo off
title CRM MEJORA - Lanzador de Aplicacion
color 0A
echo ===================================================
echo   CRM INGENIERIA Y LOCALES COMERCIALES (OPTIMIZADO)
echo ===================================================
echo.
echo Iniciando servidor de desarrollo de Frontend Vite...
echo.

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Instalando dependencias necesarias...
    call npm install
)

echo Abriendo aplicacion en el navegador http://localhost:5173...
call npm run dev -- --open

pause
