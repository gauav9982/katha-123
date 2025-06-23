Write-Host "Starting School App (auto port kill)..." -ForegroundColor Green

# Kill required ports
$ports = @(4009, 5179)
foreach ($port in $ports) {
    $pids = netstat -ano | findstr ":$port" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Select-Object -Unique
    foreach ($pid in $pids) {
        if ($pid -match '^\d+$') {
            Write-Host "Killing PID $pid on port $port" -ForegroundColor Red
            taskkill /PID $pid /F | Out-Null
        }
    }
}

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start" -WindowStyle Normal

# Wait for backend to start
Write-Host "Waiting 2 seconds for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

# Start Frontend Server
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "All servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:4009" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5179" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 