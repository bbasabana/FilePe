@echo off
title FilePe Fingerprint Agent
cd /d "%~dp0"
set FILEPE_FP_MODE=hardware
set FILEPE_FP_PORT=8765

echo.
echo  FilePe — Agent empreintes Live20R
echo  ---------------------------------
echo  1. Branchez le Live20R en USB
echo  2. Laissez cette fenetre ouverte
echo  3. Ouvrez Chrome : https://file-pe.vercel.app/
echo.

if exist "FilePeFingerprintAgent.exe" (
  FilePeFingerprintAgent.exe
) else if exist "server.cjs" (
  node server.cjs
) else (
  echo ERREUR: Agent introuvable.
  pause
  exit /b 1
)

pause
