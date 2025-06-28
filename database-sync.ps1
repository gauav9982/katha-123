# ========================================
# ડેટાબેઝ સિંક્રનાઈઝેશન સ્ક્રિપ્ટ
# ========================================
# આ script local અને server વચ્ચે database sync કરે છે
# ========================================

param(
    [string]$Action = "sync",  # sync, backup, restore
    [string]$Environment = "local"  # local, server
)

# Configuration
$config = @{
    LocalPath = "database/"
    ServerPath = "/var/www/katha-app/database/"
    ServerHost = "kathasales.com"
    ServerUser = "root"
    BackupPath = "backups/"
    SyncPath = "sync/"
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host $Title -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
}

function Test-SSHConnection {
    try {
        $sshCheck = Get-Command ssh -ErrorAction SilentlyContinue
        if (-not $sshCheck) {
            Write-Host "❌ SSH installed નથી. PuTTY અથવા OpenSSH install કરો." -ForegroundColor Red
            return $false
        }
        return $true
    }
    catch {
        Write-Host "❌ SSH connection error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Get-DatabaseList {
    return @(
        @{Name="katha_sales.db"; Local="database/katha_sales.db"; Server="database/katha_sales.db"},
        @{Name="kathasales_live_backup.db"; Local="database/kathasales_live_backup.db"; Server="database/kathasales_live_backup.db"},
        @{Name="school_salary.db"; Local="school/database/school_salary.db"; Server="school/database/school_salary.db"}
    )
}

function Create-Backup {
    Write-Header "💾 બેકઅપ બનાવવામાં આવે છે..."
    
    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $backupDir = "$($config.BackupPath)$timestamp"
    
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    $databases = Get-DatabaseList
    
    foreach ($db in $databases) {
        if (Test-Path $db.Local) {
            $backupFile = "$backupDir/$($db.Name)"
            Copy-Item $db.Local $backupFile
            $size = (Get-Item $backupFile).Length
            $sizeKB = [math]::Round($size / 1KB, 2)
            Write-Host "   ✅ $($db.Name) બેકઅપ બન્યું ($sizeKB KB)" -ForegroundColor Green
        }
    }
    
    # Create backup info
    $backupInfo = @"
કથા સેલ્સ ડેટાબેઝ બેકઅપ
===============================================
તારીખ: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')
ડિરેક્ટરી: $backupDir

બેકઅપ કરેલી ફાઈલ્સ:
$(Get-ChildItem $backupDir -Name | Where-Object { $_ -ne "backup_info.txt" } | ForEach-Object { "- $_" })

નોંધ: આ બેકઅપ સુરક્ષિત રાખો
"@
    
    $backupInfo | Out-File "$backupDir/backup_info.txt" -Encoding UTF8
    
    Write-Host ""
    Write-Host "✅ બેકઅપ કમ્પ્લીટ: $backupDir" -ForegroundColor Green
    return $backupDir
}

function Sync-LocalToServer {
    Write-Header "📤 લોકલ થી સર્વર પર સિંક કરવામાં આવે છે..."
    
    if (-not (Test-SSHConnection)) {
        return
    }
    
    $databases = Get-DatabaseList
    
    foreach ($db in $databases) {
        if (Test-Path $db.Local) {
            Write-Host "   📤 $($db.Name) અપલોડ કરવામાં આવે છે..." -ForegroundColor Blue
            
            # Create server directory if not exists
            $serverDir = Split-Path $db.Server -Parent
            ssh $($config.ServerUser)@$($config.ServerHost) "mkdir -p $serverDir"
            
            # Upload file
            scp $db.Local "$($config.ServerUser)@$($config.ServerHost):$($config.ServerPath)$($db.Name)"
            
            Write-Host "   ✅ $($db.Name) અપલોડ થયું" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $($db.Name) લોકલ પર નથી મળ્યું" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "✅ લોકલ થી સર્વર સિંક કમ્પ્લીટ" -ForegroundColor Green
}

function Sync-ServerToLocal {
    Write-Header "📥 સર્વર થી લોકલ પર સિંક કરવામાં આવે છે..."
    
    if (-not (Test-SSHConnection)) {
        return
    }
    
    $databases = Get-DatabaseList
    
    foreach ($db in $databases) {
        Write-Host "   📥 $($db.Name) ડાઉનલોડ કરવામાં આવે છે..." -ForegroundColor Blue
        
        # Create local directory if not exists
        $localDir = Split-Path $db.Local -Parent
        if (-not (Test-Path $localDir)) {
            New-Item -ItemType Directory -Path $localDir -Force | Out-Null
        }
        
        # Download file
        scp "$($config.ServerUser)@$($config.ServerHost):$($config.ServerPath)$($db.Name)" $db.Local
        
        if (Test-Path $db.Local) {
            $size = (Get-Item $db.Local).Length
            $sizeKB = [math]::Round($size / 1KB, 2)
            Write-Host "   ✅ $($db.Name) ડાઉનલોડ થયું ($sizeKB KB)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $($db.Name) ડાઉનલોડ ન થયું" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "✅ સર્વર થી લોકલ સિંક કમ્પ્લીટ" -ForegroundColor Green
}

function Compare-Databases {
    Write-Header "🔍 ડેટાબેઝ કમ્પેરિઝન"
    
    $databases = Get-DatabaseList
    
    foreach ($db in $databases) {
        Write-Host "   🔍 $($db.Name) ચેક કરવામાં આવે છે..." -ForegroundColor Blue
        
        $localExists = Test-Path $db.Local
        $serverExists = $false
        
        if (Test-SSHConnection) {
            $serverExists = ssh $($config.ServerUser)@$($config.ServerHost) "test -f $($config.ServerPath)$($db.Name) && echo 'exists'"
        }
        
        if ($localExists) {
            $localSize = (Get-Item $db.Local).Length
            $localModified = (Get-Item $db.Local).LastWriteTime
            Write-Host "   ✅ લોકલ: $([math]::Round($localSize/1KB, 2)) KB ($localModified)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ લોકલ: નથી મળ્યું" -ForegroundColor Red
        }
        
        if ($serverExists) {
            Write-Host "   ✅ સર્વર: મળ્યું" -ForegroundColor Green
        } else {
            Write-Host "   ❌ સર્વર: નથી મળ્યું" -ForegroundColor Red
        }
        
        Write-Host ""
    }
}

function Show-Usage {
    Write-Header "📖 ડેટાબેઝ સિંક્રનાઈઝેશન સ્ક્રિપ્ટ"
    
    Write-Host "ઉપયોગ:" -ForegroundColor Yellow
    Write-Host "  .\database-sync.ps1 [Action] [Environment]" -ForegroundColor White
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Yellow
    Write-Host "  sync     - ડેટાબેઝ સિંક કરો" -ForegroundColor White
    Write-Host "  backup   - બેકઅપ બનાવો" -ForegroundColor White
    Write-Host "  compare  - ડેટાબેઝ કમ્પેર કરો" -ForegroundColor White
    Write-Host ""
    Write-Host "Environments:" -ForegroundColor Yellow
    Write-Host "  local    - લોકલ થી સર્વર" -ForegroundColor White
    Write-Host "  server   - સર્વર થી લોકલ" -ForegroundColor White
    Write-Host ""
    Write-Host "ઉદાહરણો:" -ForegroundColor Yellow
    Write-Host "  .\database-sync.ps1 sync local    # લોકલ થી સર્વર સિંક" -ForegroundColor White
    Write-Host "  .\database-sync.ps1 sync server   # સર્વર થી લોકલ સિંક" -ForegroundColor White
    Write-Host "  .\database-sync.ps1 backup        # બેકઅપ બનાવો" -ForegroundColor White
    Write-Host "  .\database-sync.ps1 compare       # કમ્પેર કરો" -ForegroundColor White
}

# Main execution
switch ($Action.ToLower()) {
    "sync" {
        switch ($Environment.ToLower()) {
            "local" {
                Create-Backup
                Sync-LocalToServer
            }
            "server" {
                Create-Backup
                Sync-ServerToLocal
            }
            default {
                Write-Host "❌ ગલત environment. 'local' અથવા 'server' વાપરો." -ForegroundColor Red
            }
        }
    }
    "backup" {
        Create-Backup
    }
    "compare" {
        Compare-Databases
    }
    default {
        Show-Usage
    }
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 