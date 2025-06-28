# Katha Sales - Secure Deployment Script
# This script ensures only tested code reaches production

# --- HELPER FUNCTIONS ---
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-LocalEnvironment {
    Write-Status "Testing local development environment..."
    
    # Test 1: Check if all dependencies are installed
    if (-not (Test-Path "node_modules")) {
        Write-Error "Node modules not found. Run 'npm install' first."
        return $false
    }
    
    if (-not (Test-Path "frontend/node_modules")) {
        Write-Error "Frontend node modules not found. Run 'cd frontend && npm install' first."
        return $false
    }
    
    if (-not (Test-Path "backend/node_modules")) {
        Write-Error "Backend node modules not found. Run 'cd backend && npm install' first."
        return $false
    }
    
    Write-Success "All dependencies are installed"
    return $true
}

function Test-Database {
    Write-Status "Testing database connection..."
    
    try {
        $result = node backend/check-tables.cjs
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database connection successful"
            return $true
        } else {
            Write-Error "Database connection failed"
            return $false
        }
    } catch {
        Write-Error "Database test failed: $_"
        return $false
    }
}

function Test-BackendAPI {
    Write-Status "Testing backend API..."
    
    # Start backend in background
    Start-Process -FilePath "node" -ArgumentList "backend/index.cjs" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4000/api" -Method Get -TimeoutSec 10
        if ($response.message -eq "API is running") {
            Write-Success "Backend API is working"
            
            # Stop backend
            Get-Process -Name "node" | Where-Object {$_.CommandLine -like "*backend/index.cjs*"} | Stop-Process
            return $true
        } else {
            Write-Error "Backend API returned unexpected response"
            Get-Process -Name "node" | Where-Object {$_.CommandLine -like "*backend/index.cjs*"} | Stop-Process
            return $false
        }
    } catch {
        Write-Error "Backend API test failed: $_"
        Get-Process -Name "node" | Where-Object {$_.CommandLine -like "*backend/index.cjs*"} | Stop-Process
        return $false
    }
}

function Test-FrontendBuild {
    Write-Status "Testing frontend build..."
    
    try {
        Push-Location frontend
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Frontend build successful"
            Pop-Location
            return $true
        } else {
            Write-Error "Frontend build failed"
            Pop-Location
            return $false
        }
    } catch {
        Write-Error "Frontend build test failed: $_"
        Pop-Location
        return $false
    }
}

function Test-GitStatus {
    Write-Status "Checking Git status..."
    
    # Check if there are uncommitted changes
    $status = git status --porcelain
    if ($status) {
        Write-Warning "There are uncommitted changes:"
        Write-Host $status
        $response = Read-Host "Do you want to commit these changes before deployment? (y/n)"
        if ($response -eq "y" -or $response -eq "Y") {
            git add .
            $commitMessage = Read-Host "Enter commit message"
            git commit -m $commitMessage
        } else {
            Write-Error "Please commit or stash your changes before deployment"
            return $false
        }
    }
    
    Write-Success "Git status is clean"
    return $true
}

# --- MAIN DEPLOYMENT PROCESS ---

Write-Host "🔒 Starting Secure Katha Sales Deployment..." -ForegroundColor Green

# Step 1: Pre-deployment tests
Write-Status "Running pre-deployment tests..."

if (-not (Test-LocalEnvironment)) {
    Write-Error "Local environment test failed. Please fix the issues and try again."
    exit 1
}

if (-not (Test-Database)) {
    Write-Error "Database test failed. Please fix the database issues and try again."
    exit 1
}

if (-not (Test-BackendAPI)) {
    Write-Error "Backend API test failed. Please fix the backend issues and try again."
    exit 1
}

if (-not (Test-FrontendBuild)) {
    Write-Error "Frontend build test failed. Please fix the frontend issues and try again."
    exit 1
}

if (-not (Test-GitStatus)) {
    Write-Error "Git status check failed. Please commit your changes and try again."
    exit 1
}

Write-Success "All pre-deployment tests passed!"

# Step 2: Push to GitHub
Write-Status "Pushing code to GitHub..."
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push to GitHub"
    exit 1
}
Write-Success "Code pushed to GitHub successfully"

# Step 3: Deploy to server
Write-Status "Deploying to server..."
& "./deploy-github.ps1"

if ($LASTEXITCODE -eq 0) {
    Write-Success "🎉 Secure deployment completed successfully!"
    Write-Status "Your application is now live at: http://kathasales.com"
} else {
    Write-Error "Deployment failed. Please check the logs and try again."
    exit 1
} 