@echo off
title Evidence Ai: Digital Evidence Management System
echo ======================================================================
echo EVIDENCE AI: AI-POWERED DIGITAL EVIDENCE MANAGEMENT SYSTEM
echo MIT School of Computing, MIT-ADT University Pune
echo Students: Vitesh Dongre, Sakshi Mashere, Swayam Lase
echo Guide: Dr. Sachin Jagadale
echo ======================================================================
echo Starting Evidence Ai Backend Server on http://localhost:5000 ...
start "Evidence Ai Backend (Port 5000)" cmd /k "cd server && npm run start"
timeout /t 3 /nobreak >nul
echo Starting Evidence Ai React Frontend on http://localhost:5173 ...
start "Evidence Ai Frontend (Vite Port 5173)" cmd /k "cd client && npm run dev"
echo.
echo Both Evidence Ai services launched successfully!
echo Open your browser at: http://localhost:5173
echo ======================================================================
pause
