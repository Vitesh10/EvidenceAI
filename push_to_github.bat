@echo off
title Push Evidence Ai to GitHub
set "PATH=C:\Users\hp\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd;%PATH%"

echo ======================================================================
echo   EVIDENCE AI: PUSH TO GITHUB REPOSITORY
echo   Target: https://github.com/Vitesh10/EvidenceAI
echo ======================================================================
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo [SUCCESS] Project successfully pushed to:
    echo https://github.com/Vitesh10/EvidenceAI
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo [NOTE] If GitHub asks for sign-in or token, enter your credentials.
    echo ======================================================================
)
echo.
pause
