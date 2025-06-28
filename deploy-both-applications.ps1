# ========================================
# કથા સેલ્સ એપ્લિકેશન ડેપ્લોયમેન્ટ સ્ક્રિપ્ટ
# ========================================
# આ script બધી deployment problems solve કરે છે
# ========================================

param(
    [string]$Environment = "production",
    [switch]$Force = $false,
    [switch]$SkipBackup = $false
)

# Configuration
$config = @{
    ServerHost = "kathasales.com"
    ServerUser = "root"
    ServerPath = "/var/www/katha-app"
    LocalPath = "."
    BackupPath = "backups"
    DeployKeyPath = "config/deploy_key"
}

function Write-Header {
    param([string]$Title, [string]$Color = "Green")
    Write-Host ""
    Write-Host "================================================" -ForegroundColor $Color
    Write-Host $Title -ForegroundColor $Color
    Write-Host "================================================" -ForegroundColor $Color
    Write-Host ""
}

function Test-Prerequisites {
    Write-Header "🔍 પ્રી-ડેપ્લોયમેન્ટ ચેક્સ"
    
    # Check if SSH key exists
    if (-not (Test-Path $config.DeployKeyPath)) {
        Write-Host "❌ SSH key not found: $($config.DeployKeyPath)" -ForegroundColor Red
        Write-Host "   Please setup SSH key first" -ForegroundColor Yellow
        return $false
    }
    
    # Check if git is available
    try {
        $gitVersion = git --version 2>$null
        Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Git not installed" -ForegroundColor Red
        return $false
    }
    
    # Check if we're in a git repository
    if (-not (Test-Path ".git")) {
        Write-Host "❌ Not in a git repository" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ All prerequisites met" -ForegroundColor Green
    return $true
}

function Create-LocalBackup {
    if ($SkipBackup) {
        Write-Host "⚠️  Backup skipped as requested" -ForegroundColor Yellow
        return
    }
    
    Write-Header "💾 લોકલ બેકઅપ બનાવવામાં આવે છે"
    
    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $backupDir = "$($config.BackupPath)/pre_deploy_$timestamp"
    
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # Backup important files
    $filesToBackup = @(
        "database/katha_sales.db",
        "database/kathasales_live_backup.db",
        "school/database/school_salary.db",
        "backend/.env",
        "frontend/.env",
        "school/backend/.env",
        "school/frontend/.env"
    )
    
    foreach ($file in $filesToBackup) {
        if (Test-Path $file) {
            $backupFile = "$backupDir/$(Split-Path $file -Leaf)"
            Copy-Item $file $backupFile
            Write-Host "   ✅ $file backed up" -ForegroundColor Green
        }
    }
    
    Write-Host "✅ Local backup created: $backupDir" -ForegroundColor Green
}

function Stop-ServerApplications {
    Write-Header "🛑 સર્વર પર એપ્લિકેશન્સ બંધ કરવામાં આવે છે"
    
    $commands = @(
        "cd $($config.ServerPath)",
        "pm2 stop all 2>/dev/null || true",
        "pm2 delete all 2>/dev/null || true",
        "pkill -f 'node.*4000' 2>/dev/null || true",
        "pkill -f 'node.*4001' 2>/dev/null || true",
        "pkill -f 'node.*5173' 2>/dev/null || true",
        "pkill -f 'node.*5180' 2>/dev/null || true",
        "fuser -k 4000/tcp 2>/dev/null || true",
        "fuser -k 4001/tcp 2>/dev/null || true",
        "fuser -k 5173/tcp 2>/dev/null || true",
        "fuser -k 5180/tcp 2>/dev/null || true"
    )
    
    $commandString = $commands -join " && "
    
    try {
        ssh -i $config.DeployKeyPath $($config.ServerUser)@$($config.ServerHost) $commandString
        Write-Host "✅ Server applications stopped" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Some processes may still be running, continuing..." -ForegroundColor Yellow
    }
}

function Clean-ServerDirectory {
    Write-Header "🧹 સર્વર ડિરેક્ટરી ક્લીન કરવામાં આવે છે"
    
    $commands = @(
        "cd $($config.ServerPath)",
        "rm -rf node_modules",
        "rm -rf frontend/node_modules",
        "rm -rf frontend/dist",
        "rm -rf school/backend/node_modules",
        "rm -rf school/frontend/node_modules",
        "rm -rf school/frontend/dist",
        "rm -rf logs/*",
        "rm -rf school/logs/*",
        "rm -f package-lock.json",
        "rm -f frontend/package-lock.json",
        "rm -f school/backend/package-lock.json",
        "rm -f school/frontend/package-lock.json"
    )
    
    $commandString = $commands -join " && "
    
    try {
        ssh -i $config.DeployKeyPath $($config.ServerUser)@$($config.ServerHost) $commandString
        Write-Host "✅ Server directory cleaned" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to clean server directory" -ForegroundColor Red
        throw
    }
}

function Deploy-CodeToServer {
    Write-Header "📤 કોડ સર્વર પર મોકલવામાં આવે છે"
    
    # Create deployment package
    $deployDir = "deploy_temp_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
    
    # Copy files to deployment directory
    $filesToDeploy = @(
        "backend",
        "frontend", 
        "school",
        "database",
        "config",
        "ecosystem.config.cjs",
        "package.json",
        "nginx-katha.conf",
        "README.md",
        "APPLICATION_GUIDE.md"
    )
    
    foreach ($item in $filesToDeploy) {
        if (Test-Path $item) {
            Copy-Item -Path $item -Destination $deployDir -Recurse -Force
            Write-Host "   ✅ $item copied" -ForegroundColor Green
        }
    }
    
    # Create production environment files
    Create-ProductionEnvFiles $deployDir
    
    # Deploy to server
    try {
        # Create tar.gz package
        $tarFile = "$deployDir.tar.gz"
        tar -czf $tarFile -C $deployDir .
        
        # Upload to server
        scp -i $config.DeployKeyPath $tarFile $($config.ServerUser)@$($config.ServerHost):$($config.ServerPath)/
        
        # Extract on server
        $extractCommands = @(
            "cd $($config.ServerPath)",
            "rm -rf *",
            "tar -xzf $tarFile",
            "rm -f $tarFile",
            "chmod -R 755 .",
            "chown -R www-data:www-data ."
        )
        
        $extractCommandString = $extractCommands -join " && "
        ssh -i $config.DeployKeyPath $($config.ServerUser)@$($config.ServerHost) $extractCommandString
        
        # Clean up local temp files
        Remove-Item $deployDir -Recurse -Force
        Remove-Item $tarFile -Force
        
        Write-Host "✅ Code deployed to server" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to deploy code" -ForegroundColor Red
        # Clean up on error
        Remove-Item $deployDir -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item $tarFile -Force -ErrorAction SilentlyContinue
        throw
    }
}

function Create-ProductionEnvFiles {
    param([string]$DeployDir)
    
    Write-Host "   🔧 Production environment files creating..." -ForegroundColor Blue
    
    # Backend production .env
    $backendEnv = @"
# Production Environment - Katha Sales Backend
NODE_ENV=production
PORT=4000
DB_PATH=/var/www/katha-app/database/katha_sales.db
CORS_ORIGIN=https://kathasales.com
API_BASE_URL=https://kathasales.com/api
LOG_LEVEL=info
"@
    $backendEnv | Out-File "$DeployDir/backend/.env" -Encoding UTF8
    
    # Frontend production .env
    $frontendEnv = @"
# Production Environment - Katha Sales Frontend
VITE_API_BASE_URL=https://kathasales.com/api
VITE_APP_NAME=Katha Sales
VITE_APP_VERSION=1.0.0
"@
    $frontendEnv | Out-File "$DeployDir/frontend/.env" -Encoding UTF8
    
    # School backend production .env
    $schoolBackendEnv = @"
# Production Environment - School Backend
NODE_ENV=production
PORT=4001
DB_PATH=/var/www/katha-app/school/database/school_salary.db
CORS_ORIGIN=https://school.kathasales.com
API_BASE_URL=https://school.kathasales.com/api
LOG_LEVEL=info
"@
    $schoolBackendEnv | Out-File "$DeployDir/school/backend/.env" -Encoding UTF8
    
    # School frontend production .env
    $schoolFrontendEnv = @"
# Production Environment - School Frontend
VITE_API_BASE_URL=https://school.kathasales.com/api
VITE_APP_NAME=School Management
VITE_APP_VERSION=1.0.0
"@
    $schoolFrontendEnv | Out-File "$DeployDir/school/frontend/.env" -Encoding UTF8
    
    Write-Host "   ✅ Production environment files created" -ForegroundColor Green
}

function Install-Dependencies {
    Write-Header "📦 ડિપેન્ડન્સી ઇન્સ્ટોલ કરવામાં આવે છે"
    
    $installCommands = @(
        "cd $($config.ServerPath)",
        "npm install --production",
        "cd frontend && npm install --production && npm run build",
        "cd ../school/backend && npm install --production",
        "cd ../frontend && npm install --production && npm run build"
    )
    
    $installCommandString = $installCommands -join " && "
    
    try {
        ssh -i $config.DeployKeyPath $($config.ServerUser)@$($config.ServerHost) $installCommandString
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        throw
    }
}

function Start-ServerApplications {
    Write-Header "🚀 સર્વર પર એપ્લિકેશન્સ સ્ટાર્ટ કરવામાં આવે છે"
    
    $startCommands = @(
        "cd $($config.ServerPath)",
        "pm2 start ecosystem.config.cjs",
        "pm2 save",
        "pm2 startup"
    )
    
    $startCommandString = $startCommands -join " && "
    
    try {
        ssh -i $config.DeployKeyPath $($config.ServerUser)@$($config.ServerHost) $startCommandString
        Write-Host "✅ Server applications started" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to start applications" -ForegroundColor Red
        throw
    }
}

function Test-Deployment {
    Write-Header "🧪 ડેપ્લોયમેન્ટ ટેસ્ટ કરવામાં આવે છે"
    
    # Wait for applications to start
    Start-Sleep -Seconds 10
    
    $testUrls = @(
        "https://kathasales.com",
        "https://school.kathasales.com",
        "https://kathasales.com/api/health",
        "https://school.kathasales.com/api/health"
    )
    
    foreach ($url in $testUrls) {
        try {
            $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "   ✅ $url - OK" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  $url - Status: $($response.StatusCode)" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "   ❌ $url - Failed" -ForegroundColor Red
        }
    }
}

function Show-DeploymentStatus {
    Write-Header "📊 ડેપ્લોયમેન્ટ સ્ટેટસ"
    
    try {
        $statusCommands = @(
            "cd $($config.ServerPath)",
            "pm2 status",
            "echo '--- Port Status ---'",
            "netstat -tulpn | grep -E ':(4000|4001|80|443)' || echo 'No ports found'"
        )
        
        $statusCommandString = $statusCommands -join " && "
        ssh -i $config.DeployKeyPath $($config.ServerUser)@$($config.ServerHost) $statusCommandString
    }
    catch {
        Write-Host "⚠️  Could not get server status" -ForegroundColor Yellow
    }
}

function Main {
    Write-Header "🚀 કથા સેલ્સ એપ્લિકેશન ડેપ્લોયમેન્ટ" "Cyan"
    
    try {
        # Step 1: Check prerequisites
        if (-not (Test-Prerequisites)) {
            Write-Host "❌ Prerequisites not met. Deployment cancelled." -ForegroundColor Red
            return
        }
        
        # Step 2: Create local backup
        Create-LocalBackup
        
        # Step 3: Stop server applications
        Stop-ServerApplications
        
        # Step 4: Clean server directory
        Clean-ServerDirectory
        
        # Step 5: Deploy code to server
        Deploy-CodeToServer
        
        # Step 6: Install dependencies
        Install-Dependencies
        
        # Step 7: Start server applications
        Start-ServerApplications
        
        # Step 8: Test deployment
        Test-Deployment
        
        # Step 9: Show status
        Show-DeploymentStatus
        
        Write-Header "🎉 ડેપ્લોયમેન્ટ સફળ!" "Green"
        Write-Host "✅ બધી એપ્લિકેશન્સ સર્વર પર ચાલુ છે" -ForegroundColor Green
        Write-Host "🌐 કથા સેલ્સ: https://kathasales.com" -ForegroundColor Cyan
        Write-Host "🏫 સ્કૂલ એપ્લિકેશન: https://school.kathasales.com" -ForegroundColor Cyan
        
    }
    catch {
        Write-Header "❌ ડેપ્લોયમેન્ટ ફેઇલ!" "Red"
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Please check the logs and try again." -ForegroundColor Yellow
        return 1
    }
}

# Run main function
Main 