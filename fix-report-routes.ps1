Write-Host "Fixing report routes in school frontend components..." -ForegroundColor Green

# List of files to fix
$files = @(
    "school/frontend/src/components/PayableHRAReport.tsx",
    "school/frontend/src/components/Payable7thCommissionReport.tsx",
    "school/frontend/src/components/Payable5thCommissionReport.tsx",
    "school/frontend/src/components/PaidHRAReport.tsx",
    "school/frontend/src/components/Paid7thCommissionReport.tsx",
    "school/frontend/src/components/Paid6thCommissionReport.tsx",
    "school/frontend/src/components/Paid5thCommissionReport.tsx",
    "school/frontend/src/components/Payable6thCommissionReport.tsx",
    "school/frontend/src/components/DifferentSalaryReport.tsx",
    "school/frontend/src/components/AllPaidReport.tsx",
    "school/frontend/src/components/AllPayableReport.tsx",
    "school/frontend/src/components/TestReport.tsx",
    "school/frontend/src/components/SupPayable6thCommissionReport.tsx",
    "school/frontend/src/components/SupPayable5thCommissionReport.tsx",
    "school/frontend/src/components/SupPaid6thCommissionReport.tsx",
    "school/frontend/src/components/SupPaid5thCommissionReport.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing $file..." -ForegroundColor Yellow
        
        # Read file content
        $content = Get-Content $file -Raw
        
        # Replace '/school' with '/dashboard'
        $newContent = $content -replace "navigate\('/school'\)", "navigate('/dashboard')"
        
        # Write back to file
        Set-Content $file $newContent -Encoding UTF8
        
        Write-Host "Fixed $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "All report routes have been fixed!" -ForegroundColor Green
Write-Host "Reports should now redirect to /dashboard instead of /school" -ForegroundColor Cyan 