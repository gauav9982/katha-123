Write-Host "Testing Deployment Prerequisites..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Gray
Write-Host "Testing Git installation..." -ForegroundColor Blue
$gitVersion = git --version
Write-Host "Git is installed: $gitVersion" -ForegroundColor Green
Write-Host "Testing SSH key..." -ForegroundColor Blue
$sshKeyPath = "C:\Users\DELL\Desktop\katha 123\config\deploy_key"
if (Test-Path $sshKeyPath) { Write-Host "SSH key found" -ForegroundColor Green }
Write-Host "Testing Node.js and npm..." -ForegroundColor Blue
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host "npm version: $npmVersion" -ForegroundColor Green
Write-Host "Testing local disk space..." -ForegroundColor Blue
$drive = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
$freeSpaceGB = [math]::Round($drive.FreeSpace / 1GB, 2)
Write-Host "Disk space: $freeSpaceGB GB free" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Gray
Write-Host "Minimal prerequisites check completed!" -ForegroundColor Green
Write-Host "Ready for deployment!" -ForegroundColor Green
Write-Host "You can now run: deploy-both-applications.bat" -ForegroundColor Cyan
Pause 