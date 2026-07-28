# Arranque rápido en Windows: solo vigila app/ (ignora .venv y uploads)
Set-Location $PSScriptRoot
& .\.venv\Scripts\uvicorn.exe app.main:app --reload --reload-dir app --host 127.0.0.1 --port 8000
