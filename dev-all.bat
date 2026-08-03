@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo  WorkLink - Dev Launcher
echo ============================================
echo.
echo Yeu cau: MySQL phai dang chay tai 127.0.0.1:3306
echo (xem apps\api\.env hoac .env o repo root).
echo.
echo Chay nen trong CHINH terminal nay - khong mo cua so cmd/powershell moi.
echo.

start /B "" cmd /c "pnpm --filter @worklink/api dev > api.log 2>&1"
start /B "" cmd /c "pnpm --filter @worklink/operations-web dev > operations-web.log 2>&1"
start /B "" cmd /c "pnpm --filter @worklink/customer-web dev > customer-web.log 2>&1"

echo Da khoi dong 3 service trong nen:
echo   API (Swagger docs):  http://localhost:4000/api/docs   (log: api.log)
echo   Operations Web:      http://localhost:5174            (log: operations-web.log)
echo   Customer Web:        http://localhost:5175            (log: customer-web.log)
echo.
echo Xem log truc tiep (vi du):   type api.log
echo   PowerShell:                Get-Content api.log -Wait
echo Dung tat ca:                 dev-stop.bat
echo.

timeout /t 2 /nobreak >nul
endlocal
