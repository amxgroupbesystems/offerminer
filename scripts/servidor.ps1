param([switch]$AutoStart)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()

$projectRoot = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $projectRoot 'logs'
$pidFile = Join-Path $logsDir 'servidor.pid'
$stdoutLog = Join-Path $logsDir 'servidor-output.log'
$stderrLog = Join-Path $logsDir 'servidor-error.log'
$managerLog = Join-Path $logsDir 'gerenciador.log'
$vite = Join-Path $projectRoot 'node_modules\.bin\vite.cmd'
$serverEntry = Join-Path $projectRoot 'server-dist\index.js'

New-Item -ItemType Directory -Path $logsDir -Force | Out-Null

function Write-ManagerLog([string]$Message) {
    $line = '[{0}] {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
    Add-Content -LiteralPath $managerLog -Value $line -Encoding UTF8
}

function Find-OfferMinerProcess {
    $listener = netstat -ano | Select-String ':3010\s+.*LISTENING' | Select-Object -First 1
    if (-not $listener) { return $null }
    $listenerPid = [int](($listener.ToString() -split '\s+')[-1])
    $process = Get-Process -Id $listenerPid -ErrorAction SilentlyContinue
    if ($process -and $process.ProcessName -eq 'node') { return $process }
    return $null
}

function Get-ServerProcess {
    if (Test-Path -LiteralPath $pidFile) {
        $savedPid = (Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
        if ($savedPid) {
            $savedProcess = Get-Process -Id ([int]$savedPid) -ErrorAction SilentlyContinue
            if ($savedProcess) { return $savedProcess }
        }
        Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
    }

    $detected = Find-OfferMinerProcess
    if ($detected) {
        Set-Content -LiteralPath $pidFile -Value $detected.Id -Encoding ASCII
        Write-ManagerLog "Servidor existente detectado e incorporado ao painel. PID $($detected.Id)"
        return $detected
    }
    return $null
}

function Show-Header {
    Clear-Host
    Write-Host '============================================================' -ForegroundColor Cyan
    Write-Host '             OfferMiner - Servidor local' -ForegroundColor Cyan
    Write-Host '============================================================' -ForegroundColor Cyan
    $process = Get-ServerProcess
    if ($process) {
        Write-Host ("STATUS: ONLINE  | PID: {0} | http://localhost:3010" -f $process.Id) -ForegroundColor Green
    } else {
        Write-Host 'STATUS: PARADO' -ForegroundColor Yellow
    }
    Write-Host ("LOGS: {0}" -f $logsDir) -ForegroundColor DarkGray
    Write-Host ''
}

function Build-Server {
    if (-not (Test-Path -LiteralPath $vite)) {
        throw 'Dependencias ausentes. Execute npm install antes de iniciar o servidor.'
    }
    Write-Host 'Compilando o backend...' -ForegroundColor Cyan
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & $vite build --ssr server/index.ts --outDir server-dist 2>&1 |
        ForEach-Object {
            $line = $_.ToString()
            Write-Host $line
            Add-Content -LiteralPath $managerLog -Value $line -Encoding UTF8
        }
    $buildExitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousPreference
    if ($buildExitCode -ne 0) { throw 'Falha ao compilar o backend.' }
}

function Start-Server {
    $existing = Get-ServerProcess
    if ($existing) {
        Write-Host 'O servidor ja esta em execucao.' -ForegroundColor Yellow
        return $existing
    }

    Build-Server
    New-Item -ItemType File -Path $stdoutLog -Force | Out-Null
    New-Item -ItemType File -Path $stderrLog -Force | Out-Null

    $process = Start-Process -FilePath 'node.exe' `
        -ArgumentList 'server-dist/index.js' `
        -WorkingDirectory $projectRoot `
        -RedirectStandardOutput $stdoutLog `
        -RedirectStandardError $stderrLog `
        -PassThru

    Set-Content -LiteralPath $pidFile -Value $process.Id -Encoding ASCII
    Start-Sleep -Milliseconds 900
    $process.Refresh()
    if ($process.HasExited) {
        Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
        Write-ManagerLog "Falha ao iniciar servidor. Codigo: $($process.ExitCode)"
        throw "O servidor encerrou ao iniciar. Veja $stderrLog"
    }
    Write-ManagerLog "Servidor iniciado. PID $($process.Id)"
    Write-Host ("Servidor iniciado em http://localhost:3010 (PID {0})." -f $process.Id) -ForegroundColor Green
    return $process
}

function Stop-Server {
    $process = Get-ServerProcess
    if (-not $process) {
        Write-Host 'O servidor ja esta parado.' -ForegroundColor Yellow
        return
    }
    Stop-Process -Id $process.Id -Force
    Wait-Process -Id $process.Id -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
    Write-ManagerLog "Servidor parado. PID $($process.Id)"
    Write-Host 'Servidor parado.' -ForegroundColor Yellow
}

function Show-LiveLogs {
    $process = Get-ServerProcess
    if (-not $process) {
        Write-Host 'Inicie o servidor antes de acompanhar os logs.' -ForegroundColor Yellow
        return
    }

    Clear-Host
    Write-Host 'LOG AO VIVO - [M] menu  [S] parar servidor' -ForegroundColor Cyan
    Write-Host '------------------------------------------------------------' -ForegroundColor DarkGray
    $outIndex = 0
    $errIndex = 0

    while ($true) {
        $process = Get-ServerProcess
        $outLines = @(Get-Content -LiteralPath $stdoutLog -ErrorAction SilentlyContinue)
        $errLines = @(Get-Content -LiteralPath $stderrLog -ErrorAction SilentlyContinue)

        if ($outLines.Count -gt $outIndex) {
            $outLines[$outIndex..($outLines.Count - 1)] | ForEach-Object { Write-Host "[OUT] $_" }
            $outIndex = $outLines.Count
        }
        if ($errLines.Count -gt $errIndex) {
            $errLines[$errIndex..($errLines.Count - 1)] | ForEach-Object { Write-Host "[ERRO] $_" -ForegroundColor Red }
            $errIndex = $errLines.Count
        }

        if (-not $process) {
            Write-Host 'O servidor foi encerrado.' -ForegroundColor Yellow
            Start-Sleep -Seconds 1
            return
        }
        if ([Console]::KeyAvailable) {
            $key = [Console]::ReadKey($true).Key
            if ($key -eq 'M') { return }
            if ($key -eq 'S') { Stop-Server; return }
        }
        Start-Sleep -Milliseconds 350
    }
}

function Show-RecentLogs {
    Write-Host '--- Saida recente ---' -ForegroundColor Cyan
    Get-Content -LiteralPath $stdoutLog -Tail 80 -ErrorAction SilentlyContinue
    Write-Host '--- Erros recentes ---' -ForegroundColor Red
    Get-Content -LiteralPath $stderrLog -Tail 80 -ErrorAction SilentlyContinue
    Write-Host '--- Gerenciador ---' -ForegroundColor Cyan
    Get-Content -LiteralPath $managerLog -Tail 40 -ErrorAction SilentlyContinue
}

function Select-ActiveToken {
    $envPath = Join-Path $projectRoot '.env.local'
    $slotText = Read-Host 'Número do token ativo (1 a 15)'
    $slot = 0
    if (-not [int]::TryParse($slotText, [ref]$slot) -or $slot -lt 1 -or $slot -gt 15) {
        throw 'Informe um número inteiro entre 1 e 15.'
    }

    $lines = [System.Collections.Generic.List[string]](Get-Content -LiteralPath $envPath)
    $tokenLine = $lines | Where-Object { $_ -match "^APIFY_TOKEN_$slot=(.+)$" } | Select-Object -First 1
    if (-not $tokenLine -or $tokenLine -match "^APIFY_TOKEN_$slot=\s*$") {
        throw "APIFY_TOKEN_$slot ainda não foi preenchido no .env.local."
    }

    $activeIndex = -1
    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match '^APIFY_ACTIVE_TOKEN=') { $activeIndex = $index; break }
    }
    if ($activeIndex -ge 0) { $lines[$activeIndex] = "APIFY_ACTIVE_TOKEN=$slot" }
    else { $lines.Insert(0, "APIFY_ACTIVE_TOKEN=$slot") }
    $modeIndex = -1
    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match '^APIFY_TOKEN_SELECTION=') { $modeIndex = $index; break }
    }
    if ($modeIndex -ge 0) { $lines[$modeIndex] = 'APIFY_TOKEN_SELECTION=fixed' }
    else { $lines.Insert(0, 'APIFY_TOKEN_SELECTION=fixed') }
    [IO.File]::WriteAllLines($envPath, $lines, [Text.UTF8Encoding]::new($false))
    Write-ManagerLog "Token ativo alterado para a posição $slot."
    Write-Host "Token $slot selecionado. Reiniciando o servidor..." -ForegroundColor Green
    Stop-Server
    Start-Server | Out-Null
    Show-LiveLogs
}

function Enable-RandomTokens {
    $envPath = Join-Path $projectRoot '.env.local'
    $lines = [System.Collections.Generic.List[string]](Get-Content -LiteralPath $envPath)
    $configured = @()
    for ($slot = 1; $slot -le 15; $slot++) {
        if ($lines -match "^APIFY_TOKEN_$slot=.+") { $configured += $slot }
    }
    if (-not $configured.Count) { throw 'Nenhum token foi preenchido no .env.local.' }
    $modeIndex = -1
    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match '^APIFY_TOKEN_SELECTION=') { $modeIndex = $index; break }
    }
    if ($modeIndex -ge 0) { $lines[$modeIndex] = 'APIFY_TOKEN_SELECTION=random' }
    else { $lines.Insert(0, 'APIFY_TOKEN_SELECTION=random') }
    [IO.File]::WriteAllLines($envPath, $lines, [Text.UTF8Encoding]::new($false))
    Write-ManagerLog "Seleção aleatória ativada para as posições: $($configured -join ', ')."
    Write-Host "Modo aleatório ativado para: $($configured -join ', '). Reiniciando..." -ForegroundColor Green
    Stop-Server
    Start-Server | Out-Null
    Show-LiveLogs
}

Set-Location -LiteralPath $projectRoot
Write-ManagerLog 'Painel de gerenciamento aberto.'

if ($AutoStart -and -not (Get-ServerProcess)) {
    try {
        Start-Server | Out-Null
        Show-LiveLogs
    } catch {
        Write-Host ("ERRO: {0}" -f $_.Exception.Message) -ForegroundColor Red
        Write-ManagerLog ("ERRO: {0}" -f $_.Exception.Message)
        Write-Host ''
        Pause
    }
}

while ($true) {
    Show-Header
    Write-Host '[1] Iniciar servidor e acompanhar logs'
    Write-Host '[2] Acompanhar logs ao vivo'
    Write-Host '[3] Parar servidor'
    Write-Host '[4] Reiniciar servidor'
    Write-Host '[5] Mostrar logs recentes'
    Write-Host '[6] Abrir pasta de logs'
    Write-Host '[7] Selecionar token Apify ativo'
    Write-Host '[8] Ativar alternância aleatória de tokens'
    Write-Host '[0] Fechar painel (o servidor continua rodando)'
    Write-Host ''
    $choice = Read-Host 'Escolha'

    try {
        switch ($choice) {
            '1' { Start-Server | Out-Null; Show-LiveLogs }
            '2' { Show-LiveLogs }
            '3' { Stop-Server; Start-Sleep -Seconds 1 }
            '4' { Stop-Server; Start-Server | Out-Null; Show-LiveLogs }
            '5' { Show-RecentLogs; Write-Host ''; Pause }
            '6' { Start-Process explorer.exe -ArgumentList $logsDir }
            '7' { Select-ActiveToken }
            '8' { Enable-RandomTokens }
            '0' { Write-ManagerLog 'Painel fechado.'; exit 0 }
            default { Write-Host 'Opcao invalida.' -ForegroundColor Yellow; Start-Sleep -Seconds 1 }
        }
    } catch {
        Write-Host ("ERRO: {0}" -f $_.Exception.Message) -ForegroundColor Red
        Write-ManagerLog ("ERRO: {0}" -f $_.Exception.Message)
        Write-Host ''
        Pause
    }
}
