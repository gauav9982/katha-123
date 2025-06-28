Write-Host "=== DEBUG REPORTS SCRIPT ===" -ForegroundColor Green

Write-Host "`n1. Testing Basic Routes..." -ForegroundColor Yellow

$basicRoutes = @(
    "http://localhost:5180/dashboard",
    "http://localhost:5180/simple-test-report",
    "http://localhost:5180/test-report"
)

foreach ($route in $basicRoutes) {
    Write-Host "Testing: $route" -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri $route -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ $route is working" -ForegroundColor Green
        } else {
            Write-Host "✗ $route returned status: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ $route is not responding" -ForegroundColor Red
    }
}

Write-Host "`n2. Testing API Endpoints..." -ForegroundColor Yellow

$apiEndpoints = @(
    "http://localhost:4001/api/health",
    "http://localhost:4001/api/cities",
    "http://localhost:4001/api/teachers"
)

foreach ($endpoint in $apiEndpoints) {
    Write-Host "Testing: $endpoint" -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ $endpoint is working" -ForegroundColor Green
        } else {
            Write-Host "✗ $endpoint returned status: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ $endpoint is not responding" -ForegroundColor Red
    }
}

Write-Host "`n3. Testing Report Routes..." -ForegroundColor Yellow

$reportRoutes = @(
    "http://localhost:5180/reports/payable-5th-commission",
    "http://localhost:5180/reports/paid-5th-commission",
    "http://localhost:5180/reports/payable-6th-commission",
    "http://localhost:5180/reports/paid-6th-commission",
    "http://localhost:5180/all-payable",
    "http://localhost:5180/all-paid"
)

foreach ($route in $reportRoutes) {
    Write-Host "Testing: $route" -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri $route -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ $route is working" -ForegroundColor Green
        } else {
            Write-Host "✗ $route returned status: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ $route is not responding" -ForegroundColor Red
    }
}

Write-Host "`n=== DEBUG INSTRUCTIONS ===" -ForegroundColor Green
Write-Host "1. Open School App: http://localhost:5180" -ForegroundColor Cyan
Write-Host "2. Try Simple Test Report: http://localhost:5180/simple-test-report" -ForegroundColor Cyan
Write-Host "3. Try Test Report: http://localhost:5180/test-report" -ForegroundColor Cyan
Write-Host "4. Check browser console for JavaScript errors" -ForegroundColor Yellow
Write-Host "5. Check browser Network tab for failed API calls" -ForegroundColor Yellow

Write-Host "`n=== COMMON ISSUES ===" -ForegroundColor Yellow
Write-Host "1. Session not set - Login first or check localStorage" -ForegroundColor Gray
Write-Host "2. API endpoint not responding - Check backend server" -ForegroundColor Gray
Write-Host "3. CORS issues - Check browser console" -ForegroundColor Gray
Write-Host "4. Component not found - Check import paths" -ForegroundColor Gray

Write-Host "`nDebug completed. Press Enter to exit..." -ForegroundColor Gray
Read-Host 