@echo off

:: Verifica se Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python nao encontrado. Instale em https://python.org
    pause
    exit
)

:: Verifica se a porta 8080 já está em uso (servidor já rodando)
netstat -ano | find ":8080" >nul 2>&1
if %errorlevel% equ 0 (
    :: Servidor já rodando, só abre o Chrome
    start "" "http://localhost:8080"
    exit
)

:: Inicia o servidor Python minimizado (sem janela preta)
start /min "" cmd /c "cd /d "%~dp0" && python -m http.server 8080"

:: Aguarda 2 segundos para o servidor subir
timeout /t 2 /nobreak >nul

:: Abre o Chrome no app
start "" "http://localhost:8080"