Write-Host "=== KATHA & SCHOOL APPLICATIONS RESTART SCRIPT ===" -ForegroundColor Green
Write-Host "Restarting All Apps..." -ForegroundColor Green

# Function to kill processes by port
function Stop-ProcessByPort {
    param([int]$Port)
    try {
        $pids = netstat -ano | findstr ":$Port" | ForEach-Object {
            ($_ -split '\s+')[-1]
        } | Select-Object -Unique
        
        foreach ($pid in $pids) {
            if ($pid -match '^\d+$') {
                Write-Host "Killing PID $pid on port $Port" -ForegroundColor Red
                taskkill /PID $pid /F | Out-Null
            }
        }
    } catch {
        Write-Host "Could not kill processes on port $Port" -ForegroundColor DarkYellow
    }
}

# Step 1: Kill all processes
Write-Host "`nStep 1: Killing all existing processes..." -ForegroundColor Yellow

$ports = @(4000, 4001, 5173, 5174, 5175, 5176, 5177, 5180)
foreach ($port in $ports) {
    Write-Host "Killing processes on port $port..." -ForegroundColor DarkYellow
    Stop-ProcessByPort $port
}

# Kill all node/npm processes
Write-Host "Killing all node.exe and npm.exe processes..." -ForegroundColor DarkYellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait for processes to close
Write-Host "`nStep 2: Waiting for processes to close..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 3: Start all applications
Write-Host "`nStep 3: Starting all applications..." -ForegroundColor Yellow

# Start Main Backend
Write-Host "Starting Main Backend (http://localhost:4000)..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k", "cd /d `"$PWD\backend`" && node index.cjs" -WindowStyle Normal

# Start Main Frontend
Write-Host "Starting Main Frontend (http://localhost:5173)..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k", "cd /d `"$PWD\frontend`" && npm run dev" -WindowStyle Normal

# Start School Backend
Write-Host "Starting School Backend (http://localhost:4001)..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k", "cd /d `"$PWD\school\backend`" && node index.cjs" -WindowStyle Normal

# Start School Frontend
Write-Host "Starting School Frontend (http://localhost:5180)..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k", "cd /d `"$PWD\school\frontend`" && npm run dev" -WindowStyle Normal

# Wait for servers to start
Write-Host "`nStep 4: Waiting for all servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Final status check
Write-Host "`n=== RESTART COMPLETE ===" -ForegroundColor Green
Write-Host "All applications are starting in new windows!" -ForegroundColor Green

Write-Host "`nApplications are accessible at:" -ForegroundColor Cyan
Write-Host "Main App: http://localhost:5173" -ForegroundColor White
Write-Host "School App: http://localhost:5180" -ForegroundColor White
Write-Host "Main API: http://localhost:4000" -ForegroundColor White
Write-Host "School API: http://localhost:4001" -ForegroundColor White

Write-Host "`nPort Status Check:" -ForegroundColor Yellow
foreach ($port in @(4000, 4001, 5173, 5180)) {
    $pids = netstat -ano | findstr ":$port" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Select-Object -Unique
    if ($pids.Count -gt 0) {
        Write-Host "✓ Port $port is running (PID: $($pids -join ', '))" -ForegroundColor Green
    } else {
        Write-Host "✗ Port $port is NOT running!" -ForegroundColor Red
    }
}

Write-Host "`nIMPORTANT NOTES:" -ForegroundColor Yellow
Write-Host "1. React Router warnings in console are normal and can be ignored." -ForegroundColor Gray
Write-Host "2. If applications don't load, check the command windows for error messages." -ForegroundColor Gray
Write-Host "3. Reports should work properly in both applications." -ForegroundColor Gray

Write-Host "`nScript completed. Press Enter to exit..." -ForegroundColor Gray
Read-Host 