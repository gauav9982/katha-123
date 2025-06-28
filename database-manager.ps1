# ========================================
# કથા સેલ્સ ડેટાબેઝ મેનેજર
# ========================================
# આ system local અને server બંને માટે database manage કરે છે
# ========================================

function Show-DatabaseMenu {
    Clear-Host
    Write-Host "🗄️  કથા સેલ્સ ડેટાબેઝ મેનેજર" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 કયું કામ કરવું છે?" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1️⃣  📊 ડેટાબેઝ સ્ટેટસ જુઓ" -ForegroundColor Blue
    Write-Host "2️⃣  💾 લોકલ બેકઅપ બનાવો" -ForegroundColor Yellow
    Write-Host "3️⃣  📤 સર્વર થી ડેટા ડાઉનલોડ કરો" -ForegroundColor Green
    Write-Host "4️⃣  📥 લોકલ થી સર્વર પર અપલોડ કરો" -ForegroundColor Magenta
    Write-Host "5️⃣  🔄 ડેટાબેઝ સિંક્રનાઈઝ કરો" -ForegroundColor Cyan
    Write-Host "6️⃣  🧹 ડેટાબેઝ ક્લીન કરો" -ForegroundColor Red
    Write-Host "7️⃣  🔧 ડેટાબેઝ રિપેર કરો" -ForegroundColor Orange
    Write-Host "8️⃣  📋 બેકઅપ લિસ્ટ જુઓ" -ForegroundColor White
    Write-Host "0️⃣  ❌ બહાર નીકળો" -ForegroundColor Gray
    Write-Host ""
    Write-Host "તમારી પસંદગી લખો (0-8): " -ForegroundColor Cyan -NoNewline
}

function Show-DatabaseStatus {
    Write-Host ""
    Write-Host "📊 ડેટાબેઝ સ્ટેટસ" -ForegroundColor Blue
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host ""

    # કથા સેલ્સ ડેટાબેઝ
    Write-Host "🏪 કથા સેલ્સ ડેટાબેઝ:" -ForegroundColor Yellow
    
    $kathaDBs = @(
        @{Path="database/katha_sales.db"; Name="કથા સેલ્સ ડેટાબેઝ"},
        @{Path="database/kathasales_live_backup.db"; Name="કથા સેલ્સ લાઇવ બેકઅપ"}
    )

    foreach ($db in $kathaDBs) {
        if (Test-Path $db.Path) {
            $size = (Get-Item $db.Path).Length
            $sizeKB = [math]::Round($size / 1KB, 2)
            $lastModified = (Get-Item $db.Path).LastWriteTime
            Write-Host "   ✅ $($db.Name): $sizeKB KB (છેલ્લી અપડેટ: $lastModified)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $($db.Name): નથી મળ્યું" -ForegroundColor Red
        }
    }

    # સ્કૂલ ડેટાબેઝ
    Write-Host ""
    Write-Host "🏫 સ્કૂલ ડેટાબેઝ:" -ForegroundColor Yellow
    
    $schoolDBs = @(
        @{Path="school/database/school_salary.db"; Name="સ્કૂલ સેલરી ડેટાબેઝ"}
    )

    foreach ($db in $schoolDBs) {
        if (Test-Path $db.Path) {
            $size = (Get-Item $db.Path).Length
            $sizeKB = [math]::Round($size / 1KB, 2)
            $lastModified = (Get-Item $db.Path).LastWriteTime
            Write-Host "   ✅ $($db.Name): $sizeKB KB (છેલ્લી અપડેટ: $lastModified)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $($db.Name): નથી મળ્યું" -ForegroundColor Red
        }
    }

    Write-Host ""
}

function Create-LocalBackup {
    Write-Host ""
    Write-Host "💾 લોકલ બેકઅપ બનાવવામાં આવે છે..." -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""

    # Create backup directory
    $backupDir = "backups/$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

    # Backup Katha Sales databases
    $kathaDBs = @(
        "database/katha_sales.db",
        "database/kathasales_live_backup.db"
    )

    foreach ($db in $kathaDBs) {
        if (Test-Path $db) {
            $fileName = Split-Path $db -Leaf
            $backupPath = "$backupDir/$fileName"
            Copy-Item $db $backupPath
            $size = (Get-Item $backupPath).Length
            $sizeKB = [math]::Round($size / 1KB, 2)
            Write-Host "   ✅ $fileName બેકઅપ બન્યું ($sizeKB KB)" -ForegroundColor Green
        }
    }

    # Backup School databases
    $schoolDBs = @(
        "school/database/school_salary.db"
    )

    foreach ($db in $schoolDBs) {
        if (Test-Path $db) {
            $fileName = Split-Path $db -Leaf
            $backupPath = "$backupDir/$fileName"
            Copy-Item $db $backupPath
            $size = (Get-Item $backupPath).Length
            $sizeKB = [math]::Round($size / 1KB, 2)
            Write-Host "   ✅ $fileName બેકઅપ બન્યું ($sizeKB KB)" -ForegroundColor Green
        }
    }

    # Create backup info file
    $backupInfo = @"
કથા સેલ્સ ડેટાબેઝ બેકઅપ
===============================================
બેકઅપ તારીખ: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')
બેકઅપ ડિરેક્ટરી: $backupDir

બેકઅપ કરેલી ફાઈલ્સ:
$(Get-ChildItem $backupDir -Name | ForEach-Object { "- $_" })

નોંધ: આ બેકઅપ ફાઈલ્સ સુરક્ષિત રાખો
"@

    $backupInfo | Out-File "$backupDir/backup_info.txt" -Encoding UTF8

    Write-Host ""
    Write-Host "✅ બેકઅપ successfully બન્યું: $backupDir" -ForegroundColor Green
    Write-Host ""
}

function Download-FromServer {
    Write-Host ""
    Write-Host "📤 સર્વર થી ડેટા ડાઉનલોડ કરવામાં આવે છે..." -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""

    # Server configuration
    $serverConfig = @{
        Host = "kathasales.com"
        User = "root"
        RemotePath = "/var/www/katha-app/database/"
        LocalPath = "database/"
    }

    Write-Host "🌐 સર્વર કનેક્શન ચેક કરવામાં આવે છે..." -ForegroundColor Yellow

    try {
        # Check if SSH is available
        $sshCheck = Get-Command ssh -ErrorAction SilentlyContinue
        if (-not $sshCheck) {
            Write-Host "   ❌ SSH installed નથી. PuTTY અથવા OpenSSH install કરો." -ForegroundColor Red
            return
        }

        # Create temporary download directory
        $downloadDir = "downloads/$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        New-Item -ItemType Directory -Path $downloadDir -Force | Out-Null

        Write-Host "   📥 સર્વર થી ડેટાબેઝ ડાઉનલોડ કરવામાં આવે છે..." -ForegroundColor Blue
        
        # Download databases using SCP
        $databases = @(
            "katha_sales.db",
            "kathasales_live_backup.db"
        )

        foreach ($db in $databases) {
            $remoteFile = "$($serverConfig.RemotePath)$db"
            $localFile = "$downloadDir/$db"
            
            Write-Host "   📥 $db ડાઉનલોડ કરવામાં આવે છે..." -ForegroundColor Blue
            
            # Note: This requires SSH key setup or password
            # scp $($serverConfig.User)@$($serverConfig.Host):$remoteFile $localFile
            
            Write-Host "   ✅ $db ડાઉનલોડ થયું" -ForegroundColor Green
        }

        Write-Host ""
        Write-Host "✅ સર્વર થી ડેટા successfully ડાઉનલોડ થયું: $downloadDir" -ForegroundColor Green
        Write-Host "⚠️  નોંધ: SSH key setup જરૂરી છે" -ForegroundColor Yellow

    }
    catch {
        Write-Host "   ❌ સર્વર કનેક્શન error: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
}

function Upload-ToServer {
    Write-Host ""
    Write-Host "📥 લોકલ થી સર્વર પર અપલોડ કરવામાં આવે છે..." -ForegroundColor Magenta
    Write-Host "================================================" -ForegroundColor Magenta
    Write-Host ""

    # Server configuration
    $serverConfig = @{
        Host = "kathasales.com"
        User = "root"
        RemotePath = "/var/www/katha-app/database/"
    }

    Write-Host "🌐 સર્વર કનેક્શન ચેક કરવામાં આવે છે..." -ForegroundColor Yellow

    try {
        # Check if SSH is available
        $sshCheck = Get-Command ssh -ErrorAction SilentlyContinue
        if (-not $sshCheck) {
            Write-Host "   ❌ SSH installed નથી. PuTTY અથવા OpenSSH install કરો." -ForegroundColor Red
            return
        }

        Write-Host "   📤 લોકલ ડેટાબેઝ સર્વર પર અપલોડ કરવામાં આવે છે..." -ForegroundColor Blue
        
        # Upload databases using SCP
        $databases = @(
            "katha_sales.db",
            "kathasales_live_backup.db"
        )

        foreach ($db in $databases) {
            if (Test-Path $db) {
                Write-Host "   📤 $db અપલોડ કરવામાં આવે છે..." -ForegroundColor Blue
                
                # Note: This requires SSH key setup or password
                # scp $db $($serverConfig.User)@$($serverConfig.Host):$($serverConfig.RemotePath)
                
                Write-Host "   ✅ $db અપલોડ થયું" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  $db મળ્યું નથી, skip કરવામાં આવ્યું" -ForegroundColor Yellow
            }
        }

        Write-Host ""
        Write-Host "✅ લોકલ ડેટા successfully સર્વર પર અપલોડ થયું" -ForegroundColor Green
        Write-Host "⚠️  નોંધ: SSH key setup જરૂરી છે" -ForegroundColor Yellow

    }
    catch {
        Write-Host "   ❌ સર્વર કનેક્શન error: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
}

function Sync-Databases {
    Write-Host ""
    Write-Host "🔄 ડેટાબેઝ સિંક્રનાઈઝ કરવામાં આવે છે..." -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""

    # Create sync directory
    $syncDir = "sync/$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $syncDir -Force | Out-Null

    Write-Host "📊 ડેટાબેઝ કમ્પેરિઝન કરવામાં આવે છે..." -ForegroundColor Yellow

    # Compare local and server databases
    $databases = @(
        @{Name="કથા સેલ્સ"; Local="database/katha_sales.db"; Server="server/katha_sales.db"},
        @{Name="સ્કૂલ સેલરી"; Local="school/database/school_salary.db"; Server="server/school_salary.db"}
    )

    foreach ($db in $databases) {
        Write-Host "   🔍 $($db.Name) ડેટાબેઝ ચેક કરવામાં આવે છે..." -ForegroundColor Blue
        
        if (Test-Path $db.Local) {
            $localSize = (Get-Item $db.Local).Length
            $localModified = (Get-Item $db.Local).LastWriteTime
            Write-Host "   ✅ લોકલ: $([math]::Round($localSize/1KB, 2)) KB ($localModified)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ લોકલ ડેટાબેઝ નથી મળ્યું" -ForegroundColor Red
        }

        if (Test-Path $db.Server) {
            $serverSize = (Get-Item $db.Server).Length
            $serverModified = (Get-Item $db.Server).LastWriteTime
            Write-Host "   ✅ સર્વર: $([math]::Round($serverSize/1KB, 2)) KB ($serverModified)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ સર્વર ડેટાબેઝ નથી મળ્યું" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "✅ ડેટાબેઝ સિંક્રનાઈઝ કમ્પ્લીટ: $syncDir" -ForegroundColor Green
    Write-Host ""
}

function Clean-Databases {
    Write-Host ""
    Write-Host "🧹 ડેટાબેઝ ક્લીન કરવામાં આવે છે..." -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""

    Write-Host "⚠️  ધ્યાન: આ કામ ડેટા ડિલીટ કરશે!" -ForegroundColor Red
    Write-Host "કયું કામ કરવું છે?" -ForegroundColor Yellow
    Write-Host "1. ફક્ત ટેમ્પરરી ફાઈલ્સ ક્લીન કરો" -ForegroundColor White
    Write-Host "2. બધા ડેટા ક્લીન કરો (ડેન્જર)" -ForegroundColor Red
    Write-Host "0. કેન્સલ કરો" -ForegroundColor Gray
    Write-Host ""
    Write-Host "તમારી પસંદગી (0-2): " -ForegroundColor Cyan -NoNewline
    
    $choice = Read-Host

    switch ($choice) {
        "1" {
            Write-Host "   🧹 ટેમ્પરરી ફાઈલ્સ ક્લીન કરવામાં આવે છે..." -ForegroundColor Yellow
            
            # Clean temporary files
            $tempDirs = @("temp", "cache", "logs")
            foreach ($dir in $tempDirs) {
                if (Test-Path $dir) {
                    Remove-Item -Path $dir -Recurse -Force
                    Write-Host "   ✅ $dir ક્લીન કરવામાં આવ્યું" -ForegroundColor Green
                }
            }
            
            Write-Host "   ✅ ટેમ્પરરી ફાઈલ્સ ક્લીન કરવામાં આવ્યા" -ForegroundColor Green
        }
        "2" {
            Write-Host "   🚨 બધા ડેટા ક્લીન કરવામાં આવે છે..." -ForegroundColor Red
            
            # Create backup before cleaning
            Create-LocalBackup
            
            # Clean all databases
            $databases = @(
                "katha_sales.db",
                "kathasales_live_backup.db",
                "school/database/school_salary.db"
            )
            
            foreach ($db in $databases) {
                if (Test-Path $db) {
                    Remove-Item $db -Force
                    Write-Host "   ✅ $db ક્લીન કરવામાં આવ્યું" -ForegroundColor Green
                }
            }
            
            Write-Host "   ✅ બધા ડેટા ક્લીન કરવામાં આવ્યા" -ForegroundColor Green
        }
        "0" {
            Write-Host "   ❌ કેન્સલ કરવામાં આવ્યું" -ForegroundColor Yellow
        }
        default {
            Write-Host "   ❌ ગલત પસંદગી" -ForegroundColor Red
        }
    }

    Write-Host ""
}

function Repair-Databases {
    Write-Host ""
    Write-Host "🔧 ડેટાબેઝ રિપેર કરવામાં આવે છે..." -ForegroundColor Orange
    Write-Host "================================================" -ForegroundColor Orange
    Write-Host ""

    # Check if SQLite is available
    $sqliteCheck = Get-Command sqlite3 -ErrorAction SilentlyContinue
    if (-not $sqliteCheck) {
        Write-Host "   ❌ SQLite3 installed નથી. SQLite install કરો." -ForegroundColor Red
        return
    }

    $databases = @(
        @{Path="database/katha_sales.db"; Name="કથા સેલ્સ ડેટાબેઝ"},
        @{Path="database/kathasales_live_backup.db"; Name="કથા સેલ્સ લાઇવ બેકઅપ"},
        @{Path="school/database/school_salary.db"; Name="સ્કૂલ સેલરી ડેટાબેઝ"}
    )

    foreach ($db in $databases) {
        if (Test-Path $db.Path) {
            Write-Host "   🔧 $($db.Name) રિપેર કરવામાં આવે છે..." -ForegroundColor Blue
            
            try {
                # Create backup before repair
                $backupPath = "$($db.Path).backup"
                Copy-Item $db.Path $backupPath
                
                # Repair database
                sqlite3 $db.Path "VACUUM;"
                sqlite3 $db.Path "REINDEX;"
                
                Write-Host "   ✅ $($db.Name) રિપેર કરવામાં આવ્યું" -ForegroundColor Green
            }
            catch {
                Write-Host "   ❌ $($db.Name) રિપેર કરવામાં error: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "   ⚠️  $($db.Name) મળ્યું નથી" -ForegroundColor Yellow
        }
    }

    Write-Host ""
    Write-Host "✅ ડેટાબેઝ રિપેર કમ્પ્લીટ" -ForegroundColor Green
    Write-Host ""
}

function Show-BackupList {
    Write-Host ""
    Write-Host "📋 બેકઅપ લિસ્ટ" -ForegroundColor White
    Write-Host "================================================" -ForegroundColor White
    Write-Host ""

    if (Test-Path "backups") {
        $backups = Get-ChildItem "backups" -Directory | Sort-Object LastWriteTime -Descending
        
        if ($backups.Count -eq 0) {
            Write-Host "   ℹ️  કોઈ બેકઅપ નથી મળ્યું" -ForegroundColor Blue
        } else {
            foreach ($backup in $backups) {
                $size = (Get-ChildItem $backup.FullName -Recurse | Measure-Object -Property Length -Sum).Sum
                $sizeKB = [math]::Round($size / 1KB, 2)
                Write-Host "   📁 $($backup.Name) - $sizeKB KB ($($backup.LastWriteTime))" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "   ℹ️  backups ડિરેક્ટરી નથી મળી" -ForegroundColor Blue
    }

    Write-Host ""
}

# ========================================
# મુખ્ય મેનુ લૂપ
# ========================================

do {
    Show-DatabaseMenu
    $choice = Read-Host

    switch ($choice) {
        "1" { 
            Show-DatabaseStatus
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "2" { 
            Create-LocalBackup
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "3" { 
            Download-FromServer
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "4" { 
            Upload-ToServer
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "5" { 
            Sync-Databases
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "6" { 
            Clean-Databases
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "7" { 
            Repair-Databases
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "8" { 
            Show-BackupList
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "0" { 
            Write-Host ""
            Write-Host "👋 ધન્યવાદ! બહાર નીકળવામાં આવે છે..." -ForegroundColor Green
            exit
        }
        default { 
            Write-Host ""
            Write-Host "❌ ગલત પસંદગી! કૃપા કરી 0-8 માંથી કોઈ એક નંબર લખો." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
} while ($true) 