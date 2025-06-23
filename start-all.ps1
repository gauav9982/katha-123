Write-Host "Starting All Apps (auto port kill)..." -ForegroundColor Green

# Kill required ports
$ports = @(4005, 4009, 5173, 5179)
foreach ($port in $ports) {
    $pids = netstat -ano | findstr ":$port" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Select-Object -Unique
    foreach ($procId in $pids) {
        if ($procId -match '^\d+$') {
            Write-Host "Killing PID $procId on port $port" -ForegroundColor Red
            taskkill /PID $procId /F | Out-Null
        }
    }
}

# Start Main Backend
Write-Host "Starting Main Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'backend'; npm start" -WindowStyle Normal

# Start Main Frontend
Write-Host "Starting Main Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm run dev" -WindowStyle Normal

# Start School Backend
Write-Host "Starting School Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'school/backend'; npm start" -WindowStyle Normal

# Start School Frontend
Write-Host "Starting School Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'school/frontend'; npm run dev" -WindowStyle Normal

Write-Host "\nAll servers are starting in new windows!" -ForegroundColor Green
Write-Host "Main backend:   http://localhost:4005" -ForegroundColor Cyan
Write-Host "Main frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "School backend: http://localhost:4009" -ForegroundColor Cyan
Write-Host "School frontend:http://localhost:5179" -ForegroundColor Cyan 