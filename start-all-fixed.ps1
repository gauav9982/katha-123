Write-Host "=== KATHA & SCHOOL APPLICATIONS STARTUP SCRIPT (FIXED) ===" -ForegroundColor Green
Write-Host "Starting All Apps..." -ForegroundColor Green

# Kill all required ports
$ports = @(4000, 4001, 5173, 5174, 5175, 5176, 5177, 5180)
Write-Host "Step 1: Killing processes on required ports..." -ForegroundColor Yellow
foreach ($port in $ports) {
    $pids = netstat -ano | findstr ":$port" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Select-Object -Unique
    foreach ($procId in $pids) {
        if ($procId -match '^\d+$') {
            Write-Host "Killing PID $procId on port $port" -ForegroundColor Red
            try {
                taskkill /PID $procId /F | Out-Null
            } catch {
                Write-Host "Could not kill PID $procId" -ForegroundColor DarkYellow
            }
        }
    }
}

# Kill all node/npm processes
Write-Host "Step 2: Killing all node.exe and npm.exe processes..." -ForegroundColor DarkYellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait for processes to close
Write-Host "Step 3: Waiting for processes to close..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Ensure database directory exists
if (!(Test-Path "database")) {
    New-Item -ItemType Directory -Path "database" -Force
    Write-Host "Created database directory" -ForegroundColor Green
}

if (!(Test-Path "school/database")) {
    New-Item -ItemType Directory -Path "school/database" -Force
    Write-Host "Created school database directory" -ForegroundColor Green
}

Write-Host "Step 4: Installing dependencies..." -ForegroundColor Yellow

# Install main backend dependencies
Write-Host "Installing main backend dependencies..." -ForegroundColor Cyan
Set-Location "backend"
if (Test-Path "node_modules") {
    Write-Host "Main backend node_modules already exists" -ForegroundColor Green
} else {
    npm install
}
Set-Location ".."

# Install main frontend dependencies
Write-Host "Installing main frontend dependencies..." -ForegroundColor Cyan
Set-Location "frontend"
if (Test-Path "node_modules") {
    Write-Host "Main frontend node_modules already exists" -ForegroundColor Green
} else {
    npm install
}
Set-Location ".."

# Install school backend dependencies
Write-Host "Installing school backend dependencies..." -ForegroundColor Cyan
Set-Location "school/backend"
if (Test-Path "node_modules") {
    Write-Host "School backend node_modules already exists" -ForegroundColor Green
} else {
    npm install
}
Set-Location "../.."

# Install school frontend dependencies
Write-Host "Installing school frontend dependencies..." -ForegroundColor Cyan
Set-Location "school/frontend"
if (Test-Path "node_modules") {
    Write-Host "School frontend node_modules already exists" -ForegroundColor Green
} else {
    npm install
}
Set-Location "../.."

Write-Host "Step 5: Starting all servers..." -ForegroundColor Yellow

# Start Main Backend
Write-Host "Starting Main Backend (http://localhost:4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; node index.cjs" -WindowStyle Normal
Start-Sleep -Seconds 5

# Start Main Frontend
Write-Host "Starting Main Frontend (http://localhost:5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5

# Start School Backend
Write-Host "Starting School Backend (http://localhost:4001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\school\backend'; node index.cjs" -WindowStyle Normal
Start-Sleep -Seconds 5

# Start School Frontend
Write-Host "Starting School Frontend (http://localhost:5180)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\school\frontend'; npm run dev" -WindowStyle Normal

Write-Host "Step 6: Waiting for all servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "=== STARTUP COMPLETE ===" -ForegroundColor Green
Write-Host "All servers are starting in new windows!" -ForegroundColor Green
Write-Host "Main backend:    http://localhost:4000" -ForegroundColor Cyan
Write-Host "Main frontend:   http://localhost:5173" -ForegroundColor Cyan
Write-Host "School backend:  http://localhost:4001" -ForegroundColor Cyan
Write-Host "School frontend: http://localhost:5180" -ForegroundColor Cyan

# Final port check
Write-Host "Step 7: Final port status check..." -ForegroundColor Yellow
foreach ($port in $ports) {
    $pids = netstat -ano | findstr ":$port" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Select-Object -Unique
    if ($pids.Count -gt 0) {
        Write-Host "Port $port is running (PID(s): $($pids -join ', '))" -ForegroundColor Green
    } else {
        Write-Host "Port $port is NOT running!" -ForegroundColor Red
    }
}

Write-Host "Applications are accessible at:" -ForegroundColor Green
Write-Host "Main App: http://localhost:5173" -ForegroundColor Cyan
Write-Host "School App: http://localhost:5180" -ForegroundColor Cyan

Write-Host ""
Write-Host "IMPORTANT NOTES:" -ForegroundColor Yellow
Write-Host "1. React Router warnings in console are normal and can be ignored." -ForegroundColor Gray
Write-Host "2. If applications don't load, check the PowerShell windows for error messages." -ForegroundColor Gray
Write-Host "3. Reports should work properly in both applications." -ForegroundColor Gray

Write-Host ""
Write-Host "Script completed. Press Enter to exit..." -ForegroundColor Gray
Read-Host 