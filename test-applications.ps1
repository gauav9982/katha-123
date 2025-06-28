Write-Host "=== TESTING ALL APPLICATIONS ===" -ForegroundColor Green

# Test Main Backend
Write-Host "Testing Main Backend (http://localhost:4000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Main Backend is working" -ForegroundColor Green
    } else {
        Write-Host "✗ Main Backend returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Main Backend is not responding" -ForegroundColor Red
}

# Test School Backend
Write-Host "Testing School Backend (http://localhost:4001)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4001/api/health" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ School Backend is working" -ForegroundColor Green
    } else {
        Write-Host "✗ School Backend returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ School Backend is not responding" -ForegroundColor Red
}

# Test Main Frontend
Write-Host "Testing Main Frontend (http://localhost:5173)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Main Frontend is working" -ForegroundColor Green
    } else {
        Write-Host "✗ Main Frontend returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Main Frontend is not responding" -ForegroundColor Red
}

# Test School Frontend
Write-Host "Testing School Frontend (http://localhost:5180)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5180" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ School Frontend is working" -ForegroundColor Green
    } else {
        Write-Host "✗ School Frontend returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ School Frontend is not responding" -ForegroundColor Red
}

Write-Host "`n=== PORT STATUS ===" -ForegroundColor Green
$ports = @(4000, 4001, 5173, 5180)
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

Write-Host "`n=== APPLICATION LINKS ===" -ForegroundColor Green
Write-Host "Main Application: http://localhost:5173" -ForegroundColor Cyan
Write-Host "School Application: http://localhost:5180" -ForegroundColor Cyan
Write-Host "Main API: http://localhost:4000" -ForegroundColor Cyan
Write-Host "School API: http://localhost:4001" -ForegroundColor Cyan

Write-Host "`nTest completed. Press Enter to exit..." -ForegroundColor Gray
Read-Host 