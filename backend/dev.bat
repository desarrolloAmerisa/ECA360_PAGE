@echo off
REM Arranque rapido: solo vigila app/ (no .venv)
cd /d "%~dp0"
".venv\Scripts\uvicorn.exe" app.main:app --reload --reload-dir app --host 127.0.0.1 --port 8000
