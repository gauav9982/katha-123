Write-Host "Starting School Application..." -ForegroundColor Green
Write-Host ""

Write-Host "Killing any existing Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Starting School Backend..." -ForegroundColor Cyan
Set-Location "school\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node index.cjs" -WindowStyle Normal

Write-Host ""
Write-Host "Starting School Frontend..." -ForegroundColor Cyan
Set-Location "..\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "School Application is starting..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:4009" -ForegroundColor White
Write-Host "Frontend will be available at: http://localhost:5179" -ForegroundColor White
Write-Host ""
Write-Host "Please wait a few seconds for the servers to start..." -ForegroundColor Yellow
Write-Host "Then open: http://localhost:5179" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue..." 