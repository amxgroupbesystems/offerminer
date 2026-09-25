@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title OfferMiner - Gerenciador do servidor

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\servidor.ps1" -AutoStart

if errorlevel 1 (
  echo.
  echo O gerenciador terminou com erro. Consulte a pasta logs.
  pause
)
