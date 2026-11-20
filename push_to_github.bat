@echo off
title Push Evidence Ai to GitHub
echo ======================================================================
echo   EVIDENCE AI: PUSH TO GITHUB REPOSITORY
echo   Target: https://github.com/Vitesh10/EvidenceAI
echo ======================================================================
echo.
echo Make sure you have created the empty repository on GitHub first:
echo   https://github.com/new  (Name: EvidenceAI)
echo.
echo Executing git push -u origin main ...
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
    echo [ACTION NEEDED] Push did not complete. Common reasons:
    echo 1. The repository 'EvidenceAI' is not yet created on GitHub.
    echo    -^> Create it at: https://github.com/new  (Repository name: EvidenceAI)
    echo    -^> Do NOT check "Initialize with README" or .gitignore.
    echo 2. Authentication: Sign in when the GitHub browser prompt appears.
    echo ======================================================================
)
echo.
pause
