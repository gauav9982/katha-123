Write-Host "Starting All Apps (auto port kill)..." -ForegroundColor Green

# Kill required ports
$ports = @(4000, 4001, 5174, 5180)
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
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'backend'; node index.cjs" -WindowStyle Normal

# Start Main Frontend
Write-Host "Starting Main Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm run dev" -WindowStyle Normal

# Start School Backend
Write-Host "Starting School Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'school/backend'; node index.cjs" -WindowStyle Normal

# Start School Frontend
Write-Host "Starting School Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'school/frontend'; npm run build; npm run preview -- --port 5180 --host" -WindowStyle Normal

Write-Host "\nAll servers are starting in new windows!" -ForegroundColor Green
Write-Host "Main backend:    http://localhost:4000" -ForegroundColor Cyan
Write-Host "Main frontend:   http://localhost:5174" -ForegroundColor Cyan
Write-Host "School backend:  http://localhost:4001" -ForegroundColor Cyan
Write-Host "School frontend: http://localhost:5180/school-app/" -ForegroundColor Cyan 