Write-Host "=== COMPREHENSIVE APPLICATION TEST ===" -ForegroundColor Green

# Test all ports
Write-Host "`n1. Testing Port Status..." -ForegroundColor Yellow
$ports = @(4000, 4001, 5173, 5180)
$allPortsRunning = $true

foreach ($port in $ports) {
    $pids = netstat -ano | findstr ":$port" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Select-Object -Unique

    if ($pids.Count -gt 0) {
        Write-Host "✓ Port $port is running (PID: $($pids -join ', '))" -ForegroundColor Green
    } else {
        Write-Host "✗ Port $port is NOT running!" -ForegroundColor Red
        $allPortsRunning = $false
    }
}

# Test API endpoints
Write-Host "`n2. Testing API Endpoints..." -ForegroundColor Yellow

$apiTests = @(
    @{ Name = "Main Backend Health"; Url = "http://localhost:4000/api/health" },
    @{ Name = "Main Backend Items"; Url = "http://localhost:4000/api/items" },
    @{ Name = "School Backend Health"; Url = "http://localhost:4001/api/health" },
    @{ Name = "School Backend Cities"; Url = "http://localhost:4001/api/cities" }
)

foreach ($test in $apiTests) {
    try {
        $response = Invoke-WebRequest -Uri $test.Url -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ $($test.Name) is working" -ForegroundColor Green
        } else {
            Write-Host "✗ $($test.Name) returned status: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ $($test.Name) is not responding" -ForegroundColor Red
    }
}

# Test frontend applications
Write-Host "`n3. Testing Frontend Applications..." -ForegroundColor Yellow

$frontendTests = @(
    @{ Name = "Main Frontend"; Url = "http://localhost:5173" },
    @{ Name = "School Frontend"; Url = "http://localhost:5180" }
)

foreach ($test in $frontendTests) {
    try {
        $response = Invoke-WebRequest -Uri $test.Url -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ $($test.Name) is working" -ForegroundColor Green
        } else {
            Write-Host "✗ $($test.Name) returned status: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ $($test.Name) is not responding" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Green

if ($allPortsRunning) {
    Write-Host "✓ All applications are running successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠ Some applications may have issues. Check the command windows for errors." -ForegroundColor Yellow
}

Write-Host "`n=== APPLICATION LINKS ===" -ForegroundColor Cyan
Write-Host "Main Application: http://localhost:5173" -ForegroundColor White
Write-Host "School Application: http://localhost:5180" -ForegroundColor White
Write-Host "Main API: http://localhost:4000" -ForegroundColor White
Write-Host "School API: http://localhost:4001" -ForegroundColor White

Write-Host "`n=== TESTING INSTRUCTIONS ===" -ForegroundColor Yellow
Write-Host "1. Main App: Test Reports menu and other features" -ForegroundColor Gray
Write-Host "2. School App: Login with any city, test reports section" -ForegroundColor Gray
Write-Host "3. Test Report: http://localhost:5180/test-report" -ForegroundColor Gray
Write-Host "4. If any issues, check browser console for errors" -ForegroundColor Gray

Write-Host "`nTest completed. Press Enter to exit..." -ForegroundColor Gray
Read-Host 