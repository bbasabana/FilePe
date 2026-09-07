@echo off
chcp 65001 >nul
title FilePe — Agent empreintes Live20R
cd /d "%~dp0"

set FILEPE_FP_MODE=hardware
set FILEPE_FP_PORT=8765

REM Python embarqué dans le pack (pas besoin d'installer Python)
if exist "%~dp0python\python.exe" (
  set "FILEPE_FP_PYTHON=%~dp0python\python.exe"
)

echo.
echo  ========================================
echo   FilePe — Agent empreintes Live20R
echo  ========================================
echo.
echo   1. Branchez le Live20R en USB
echo   2. Laissez CETTE fenetre ouverte
echo   3. Chrome sur CE PC :
echo      https://file-pe.vercel.app/
echo.
echo   Port local : 8765
echo.

if exist "%~dp0FilePeFingerprintAgent.exe" (
  "%~dp0FilePeFingerprintAgent.exe"
) else if exist "%~dp0server.cjs" (
  where node >nul 2>&1
  if errorlevel 1 (
    echo ERREUR: FilePeFingerprintAgent.exe introuvable.
    echo Telechargez le pack Agent depuis GitHub Releases.
    pause
    exit /b 1
  )
  node "%~dp0server.cjs"
) else (
  echo ERREUR: Agent introuvable dans ce dossier.
  pause
  exit /b 1
)

echo.
echo Agent arrete.
pause
