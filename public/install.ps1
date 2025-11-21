Write-Host "Mendeteksi system (dan mengirim informasi pribadi ke bang Ahmad ;) )..." -ForegroundColor Cyan

# ===== Detect architecture =====
$arch = (Get-CimInstance Win32_Processor).Architecture

switch ($arch) {
    9  { $CPU = "x86_64" }  # 64-bit
    12 { $CPU = "arm64" }
    default {
        Write-Host "Unsupported architecture: $arch" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Architecture detected: $CPU"

# ActivityWatch only provides x86_64 installer right now
if ($CPU -ne "x86_64") {
    Write-Host "Aihh.., tidak support ini :(." -ForegroundColor Red
    exit 1
}

# ===== Funny messages =====
$messages = @(
    "Mendownload anime bajakan...",
    "Men-scan ID card santri satu demi satu...",
    "Mencari donat yang hilang...",
    "Mengecek histori browser mu..."
    "Mengingat Allah...",
    "Mencoba menembus firewall tetangga..."
)

$i = 0
while ($i -lt 6) {
    $randomMessage = Get-Random -InputObject $messages
    Write-Host $randomMessage -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    $i++
}

# ===== Download location =====
$tempFile = "$env:TEMP\activitywatch_setup.exe"
$downloadURL = "https://github.com/ActivityWatch/activitywatch/releases/download/v0.13.2/activitywatch-v0.13.2-windows-x86_64-setup.exe"

Write-Host "Mendownload virus..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $downloadURL -OutFile $tempFile

Write-Host "Download selesai. Mulai instalasi..." -ForegroundColor Green

# ===== Run installer silently or normally =====
Start-Process -FilePath $tempFile -Wait

Write-Host "`nActivityWatch installation finished!" -ForegroundColor Green
