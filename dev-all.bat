@echo off
setlocal

set ROOT=%~dp0

echo ============================================
echo  WorkLink - Dev Launcher
echo ============================================
echo.
echo Yeu cau: MySQL phai dang chay tai 127.0.0.1:3306
echo (xem apps\api\.env hoac .env o repo root).
echo.

echo [1/3] Starting API (backend)  -^> http://localhost:4000/api
start "WorkLink API (4000)" cmd /k "cd /d "%ROOT%" && pnpm --filter @worklink/api dev"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Operations Web -^> http://localhost:5174
start "WorkLink Operations Web (5174)" cmd /k "cd /d "%ROOT%" && pnpm --filter @worklink/operations-web dev"

echo [3/3] Starting Customer Web   -^> http://localhost:5175
start "WorkLink Customer Web (5175)" cmd /k "cd /d "%ROOT%" && pnpm --filter @worklink/customer-web dev"

echo.
echo Da mo 3 cua so rieng biet:
echo   API (Swagger docs):  http://localhost:4000/api/docs
echo   Operations Web:      http://localhost:5174
echo   Customer Web:        http://localhost:5175
echo.
echo Dong tung cua so (hoac Ctrl+C ben trong) de dung tung service.
echo Dung dev-stop.bat de dung tat ca cung luc.
echo.
pause
