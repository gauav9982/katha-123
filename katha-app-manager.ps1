# ========================================
# કથા સેલ્સ એપ્લિકેશન મેનેજર
# ========================================
# આ એક જ file માં બધા functions છે
# ========================================

function Show-Menu {
    Clear-Host
    Write-Host "🚀 કથા સેલ્સ એપ્લિકેશન મેનેજર" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 કયું કામ કરવું છે?" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1️⃣  🚀 બધી એપ્લિકેશન્સ સ્ટાર્ટ કરો" -ForegroundColor Yellow
    Write-Host "2️⃣  🛑 બધી એપ્લિકેશન્સ બંધ કરો" -ForegroundColor Red
    Write-Host "3️⃣  🔍 પોર્ટ્સ સ્ટેટસ ચેક કરો" -ForegroundColor Blue
    Write-Host "4️⃣  🔄 એપ્લિકેશન્સ રિસ્ટાર્ટ કરો" -ForegroundColor Magenta
    Write-Host "5️⃣  🌐 બ્રાઉઝરમાં ખોલો" -ForegroundColor Green
    Write-Host "6️⃣  📊 સિસ્ટમ સ્ટેટસ જુઓ" -ForegroundColor White
    Write-Host "0️⃣  ❌ બહાર નીકળો" -ForegroundColor Gray
    Write-Host ""
    Write-Host "તમારી પસંદગી લખો (0-6): " -ForegroundColor Cyan -NoNewline
}

function Start-AllApplications {
    Write-Host ""
    Write-Host "🚀 બધી એપ્લિકેશન્સ સ્ટાર્ટ કરવામાં આવે છે..." -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""

    # સ્ટેપ 1: બધા ports kill કરવા
    Write-Host "📋 સ્ટેપ 1: બધા ports kill કરવા..." -ForegroundColor Yellow
    Kill-AllPorts

    # સ્ટેપ 2: PM2 processes stop કરવા
    Write-Host "📋 સ્ટેપ 2: PM2 processes stop કરવા..." -ForegroundColor Yellow
    Stop-PM2Processes

    # સ્ટેપ 3: Dependencies ચેક કરવા
    Write-Host "📋 સ્ટેપ 3: Dependencies ચેક કરવા..." -ForegroundColor Yellow
    Check-Dependencies

    # સ્ટેપ 4: Applications start કરવા
    Write-Host "📋 સ્ટેપ 4: Applications start કરવા..." -ForegroundColor Yellow
    Start-Applications

    # સ્ટેપ 5: Status ચેક કરવા
    Write-Host "📋 સ્ટેપ 5: Status ચેક કરવા..." -ForegroundColor Yellow
    Check-ApplicationStatus

    # સ્ટેપ 6: Browser માં ખોલવા
    Write-Host "📋 સ્ટેપ 6: Browser માં applications ખોલવા..." -ForegroundColor Yellow
    Open-InBrowser

    Write-Host ""
    Write-Host "🎉 બધી એપ્લિકેશન્સ successfully start થઈ ગઈ છે!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Show-FinalStatus
}

function Stop-AllApplications {
    Write-Host ""
    Write-Host "🛑 બધી એપ્લિકેશન્સ બંધ કરવામાં આવે છે..." -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""

    # સ્ટેપ 1: બધા ports kill કરવા
    Write-Host "📋 સ્ટેપ 1: બધા ports kill કરવા..." -ForegroundColor Yellow
    Kill-AllPorts

    # સ્ટેપ 2: PM2 processes stop કરવા
    Write-Host "📋 સ્ટેપ 2: PM2 processes stop કરવા..." -ForegroundColor Yellow
    Stop-PM2Processes

    # સ્ટેપ 3: Node.js processes kill કરવા
    Write-Host "📋 સ્ટેપ 3: Node.js processes kill કરવા..." -ForegroundColor Yellow
    Kill-NodeProcesses

    Write-Host ""
    Write-Host "✅ બધી એપ્લિકેશન્સ successfully બંધ કરી દેવામાં આવી છે!" -ForegroundColor Green
    Write-Host ""
}

function Check-PortStatus {
    Write-Host ""
    Write-Host "🔍 પોર્ટ સ્ટેટસ ચેક કરવામાં આવે છે..." -ForegroundColor Blue
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host ""
    Check-ApplicationStatus
    Write-Host ""
}

function Restart-Applications {
    Write-Host ""
    Write-Host "🔄 એપ્લિકેશન્સ રિસ્ટાર્ટ કરવામાં આવે છે..." -ForegroundColor Magenta
    Write-Host "================================================" -ForegroundColor Magenta
    Write-Host ""
    
    Stop-AllApplications
    Start-Sleep -Seconds 2
    Start-AllApplications
}

function Open-InBrowser {
    Write-Host "   🌐 કથા સેલ્સ એપ્લિકેશન browser માં ખોલવામાં આવ્યું" -ForegroundColor Blue
    Start-Process "http://localhost:5173"

    if (Test-Path "school/frontend") {
        Start-Sleep -Seconds 1
        Write-Host "   🌐 સ્કૂલ એપ્લિકેશન browser માં ખોલવામાં આવ્યું" -ForegroundColor Blue
        Start-Process "http://localhost:5180"
    }
}

function Show-SystemStatus {
    Write-Host ""
    Write-Host "📊 સિસ્ટમ સ્ટેટસ" -ForegroundColor White
    Write-Host "================================================" -ForegroundColor White
    Write-Host ""

    # Node.js version
    try {
        $nodeVersion = node --version 2>$null
        Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Node.js installed નથી" -ForegroundColor Red
    }

    # NPM version
    try {
        $npmVersion = npm --version 2>$null
        Write-Host "   ✅ NPM: $npmVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ NPM installed નથી" -ForegroundColor Red
    }

    # PM2 version
    try {
        $pm2Version = pm2 --version 2>$null
        Write-Host "   ✅ PM2: $pm2Version" -ForegroundColor Green
    }
    catch {
        Write-Host "   ℹ️  PM2 installed નથી (optional)" -ForegroundColor Blue
    }

    Write-Host ""
    Write-Host "📁 ડિરેક્ટરી સ્ટેટસ:" -ForegroundColor Cyan
    
    $directories = @(
        @{Path="backend"; Name="કથા સેલ્સ બેકએન્ડ"},
        @{Path="frontend"; Name="કથા સેલ્સ ફ્રન્ટએન્ડ"},
        @{Path="school/backend"; Name="સ્કૂલ બેકએન્ડ"},
        @{Path="school/frontend"; Name="સ્કૂલ ફ્રન્ટએન્ડ"},
        @{Path="database"; Name="ડેટાબેઝ"}
    )

    foreach ($dir in $directories) {
        if (Test-Path $dir.Path) {
            Write-Host "   ✅ $($dir.Name): મળ્યું" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $($dir.Name): નથી મળ્યું" -ForegroundColor Red
        }
    }

    Write-Host ""
    Check-ApplicationStatus
    Write-Host ""
}

function Kill-AllPorts {
    $portsToKill = @(4000, 4001, 4005, 5173, 5180, 3000, 3001, 3002, 3003, 3004)

    foreach ($port in $portsToKill) {
        try {
            $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
            if ($processes) {
                foreach ($pid in $processes) {
                    try {
                        $processName = (Get-Process -Id $pid -ErrorAction SilentlyContinue).ProcessName
                        Write-Host "   🔴 Port $port પર $processName (PID: $pid) kill કરવામાં આવ્યું" -ForegroundColor Red
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    }
                    catch {
                        Write-Host "   ⚠️  Port $port પર process kill કરવામાં error" -ForegroundColor Yellow
                    }
                }
            } else {
                Write-Host "   ✅ Port $port પર કોઈ process નથી" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "   ⚠️  Port $port ચેક કરવામાં error" -ForegroundColor Yellow
        }
    }
}

function Stop-PM2Processes {
    try {
        $pm2Check = Get-Command pm2 -ErrorAction SilentlyContinue
        if ($pm2Check) {
            Write-Host "   🔴 બધા PM2 processes stop કરવામાં આવ્યા" -ForegroundColor Red
            pm2 stop all 2>$null
            pm2 delete all 2>$null
        } else {
            Write-Host "   ℹ️  PM2 installed નથી, skip કરવામાં આવ્યું" -ForegroundColor Blue
        }
    }
    catch {
        Write-Host "   ⚠️  PM2 stop કરવામાં error" -ForegroundColor Yellow
    }
}

function Kill-NodeProcesses {
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            foreach ($process in $nodeProcesses) {
                Write-Host "   🔴 Node.js process (PID: $($process.Id)) kill કરવામાં આવ્યું" -ForegroundColor Red
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        } else {
            Write-Host "   ✅ કોઈ Node.js process નથી" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "   ⚠️  Node.js processes kill કરવામાં error" -ForegroundColor Yellow
    }
}

function Check-Dependencies {
    # Backend dependencies
    if (Test-Path "backend/package.json") {
        if (-not (Test-Path "backend/node_modules")) {
            Write-Host "   📦 Backend dependencies install કરવામાં આવ્યા" -ForegroundColor Blue
            Set-Location backend
            npm install --silent
            Set-Location ..
        } else {
            Write-Host "   ✅ Backend dependencies ready છે" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ Backend package.json મળ્યું નથી" -ForegroundColor Red
    }

    # Frontend dependencies
    if (Test-Path "frontend/package.json") {
        if (-not (Test-Path "frontend/node_modules")) {
            Write-Host "   📦 Frontend dependencies install કરવામાં આવ્યા" -ForegroundColor Blue
            Set-Location frontend
            npm install --silent
            Set-Location ..
        } else {
            Write-Host "   ✅ Frontend dependencies ready છે" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ Frontend package.json મળ્યું નથી" -ForegroundColor Red
    }
}

function Start-Applications {
    # Create logs directory if not exists
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" -Force | Out-Null
    }

    # Start Katha Sales Backend
    Write-Host "   🚀 કથા સેલ્સ બેકએન્ડ start કરવામાં આવ્યું (Port: 4000)" -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; node index.cjs" -WindowStyle Minimized

    # Wait a bit for backend to start
    Start-Sleep -Seconds 3

    # Start Katha Sales Frontend
    Write-Host "   🚀 કથા સેલ્સ ફ્રન્ટએન્ડ start કરવામાં આવ્યું (Port: 5173)" -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Minimized

    # Check if school application exists
    if (Test-Path "school/backend") {
        # Start School Backend
        Write-Host "   🚀 સ્કૂલ બેકએન્ડ start કરવામાં આવ્યું (Port: 4001)" -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\school\backend'; node index.cjs" -WindowStyle Minimized
        
        # Wait a bit for school backend to start
        Start-Sleep -Seconds 3
        
        # Start School Frontend
        if (Test-Path "school/frontend") {
            Write-Host "   🚀 સ્કૂલ ફ્રન્ટએન્ડ start કરવામાં આવ્યું (Port: 5180)" -ForegroundColor Green
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\school\frontend'; npm run dev" -WindowStyle Minimized
        }
    }
}

function Check-ApplicationStatus {
    Start-Sleep -Seconds 3

    $portsToCheck = @(
        @{Port=4000; Name="કથા સેલ્સ બેકએન્ડ"; URL="http://localhost:4000"},
        @{Port=5173; Name="કથા સેલ્સ ફ્રન્ટએન્ડ"; URL="http://localhost:5173"},
        @{Port=4001; Name="સ્કૂલ બેકએન્ડ"; URL="http://localhost:4001"},
        @{Port=5180; Name="સ્કૂલ ફ્રન્ટએન્ડ"; URL="http://localhost:5180"}
    )

    foreach ($app in $portsToCheck) {
        try {
            $connection = Test-NetConnection -ComputerName localhost -Port $app.Port -InformationLevel Quiet -WarningAction SilentlyContinue
            if ($connection) {
                Write-Host "   ✅ $($app.Name) ચાલુ છે - $($app.URL)" -ForegroundColor Green
            } else {
                Write-Host "   ❌ $($app.Name) ચાલુ નથી - $($app.URL)" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "   ❌ $($app.Name) ચેક કરવામાં error - $($app.URL)" -ForegroundColor Red
        }
    }
}

function Show-FinalStatus {
    Write-Host ""
    Write-Host "📱 એપ્લિકેશન URLs:" -ForegroundColor Cyan
    Write-Host "   • કથા સેલ્સ: http://localhost:5173" -ForegroundColor White
    Write-Host "   • સ્કૂલ એપ્લિકેશન: http://localhost:5180" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 API Endpoints:" -ForegroundColor Cyan
    Write-Host "   • કથા સેલ્સ API: http://localhost:4000" -ForegroundColor White
    Write-Host "   • સ્કૂલ API: http://localhost:4001" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  નોંધ:" -ForegroundColor Yellow
    Write-Host "   • બધી applications અલગ terminal windows માં ચાલુ છે" -ForegroundColor White
    Write-Host "   • કોઈ error આવે તો terminal windows ચેક કરો" -ForegroundColor White
    Write-Host "   • Applications બંધ કરવા માટે terminal windows બંધ કરો" -ForegroundColor White
    Write-Host ""
}

# ========================================
# મુખ્ય મેનુ લૂપ
# ========================================

do {
    Show-Menu
    $choice = Read-Host

    switch ($choice) {
        "1" { 
            Start-AllApplications
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "2" { 
            Stop-AllApplications
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "3" { 
            Check-PortStatus
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "4" { 
            Restart-Applications
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "5" { 
            Open-InBrowser
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "6" { 
            Show-SystemStatus
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
            Write-Host "❌ ગલત પસંદગી! કૃપા કરી 0-6 માંથી કોઈ એક નંબર લખો." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
} while ($true) 