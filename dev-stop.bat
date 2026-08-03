@echo off
setlocal enabledelayedexpansion

echo Dang dung cac service WorkLink (port 4000, 5174, 5175)...
echo.

for %%P in (4000 5174 5175) do (
    set FOUND=0
    for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
        echo   Port %%P -^> killing PID %%A
        taskkill /PID %%A /F >nul 2>&1
        set FOUND=1
    )
    if "!FOUND!"=="0" echo   Port %%P: khong co gi dang chay
)

echo.
echo Xong.
pause
