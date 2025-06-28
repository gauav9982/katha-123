Write-Host "=== TESTING ALL REPORTS ===" -ForegroundColor Green

# Test Main Application Reports
Write-Host "`nTesting Main Application Reports..." -ForegroundColor Yellow
Write-Host "Main App URL: http://localhost:5173" -ForegroundColor Cyan

# Test School Application Reports
Write-Host "`nTesting School Application Reports..." -ForegroundColor Yellow
Write-Host "School App URL: http://localhost:5180" -ForegroundColor Cyan

# Test School Backend API endpoints
Write-Host "`nTesting School Backend API endpoints..." -ForegroundColor Yellow

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

# Test Main Backend API endpoints
Write-Host "`nTesting Main Backend API endpoints..." -ForegroundColor Yellow

$mainApiEndpoints = @(
    "http://localhost:4000/api/health",
    "http://localhost:4000/api/items",
    "http://localhost:4000/api/categories"
)

foreach ($endpoint in $mainApiEndpoints) {
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

Write-Host "`n=== REPORT TESTING INSTRUCTIONS ===" -ForegroundColor Green
Write-Host "1. Open Main App: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   - Go to Reports menu" -ForegroundColor Gray
Write-Host "   - Test Stock Report and Item Transaction Report" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Open School App: http://localhost:5180" -ForegroundColor Cyan
Write-Host "   - Login with any city (e.g., NADIAD)" -ForegroundColor Gray
Write-Host "   - Go to Reports section" -ForegroundColor Gray
Write-Host "   - Test Test Report first: http://localhost:5180/test-report" -ForegroundColor Gray
Write-Host "   - Then test other commission reports" -ForegroundColor Gray
Write-Host ""
Write-Host "3. If reports don't work, check browser console for errors" -ForegroundColor Yellow
Write-Host "4. Make sure both frontend and backend are running" -ForegroundColor Yellow

Write-Host "`nTest completed. Press Enter to exit..." -ForegroundColor Gray
Read-Host 