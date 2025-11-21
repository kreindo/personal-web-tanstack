function Fancy-Spinner {
    param(
        [string]$Message
    )

    # $spin = @("⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏")
    $spin = @("/", "-", "\", "|")

    while ($true) {
        foreach ($frame in $spin) {
            Write-Host "`r$frame $Message" -NoNewline
            Start-Sleep -Milliseconds 100
        }
    }
}

# $HOSTNAME = $env:COMPUTERNAME
$HOSTNAME = hostname

$spinner = Start-Job { Fancy-Spinner -Message "Menghubungi thinkpad bang Ahmad..." }
Start-Sleep -Seconds 4
Stop-Job -Job $spinner
Remove-Job -Job $spinner

Write-Host "`r✓ Terhubung!" -ForegroundColor Green
Start-Sleep -Seconds 1

# @"

#                  ░█████████  ░██████████   ░██████   ░██████████░██████████   ░██████  ░██     ░██ 
#             ░██  ░██     ░██ ░██          ░██   ░██      ░██    ░██          ░██   ░██ ░██     ░██ 
#              ░██ ░██     ░██ ░██         ░██             ░██    ░██         ░██        ░██     ░██ 
#               ░██░█████████  ░█████████   ░████████      ░██    ░█████████  ░██        ░██████████ 
#              ░██ ░██         ░██                 ░██     ░██    ░██         ░██        ░██     ░██ 
#             ░██  ░██         ░██          ░██   ░██      ░██    ░██          ░██   ░██ ░██     ░██ 
# ░██████████      ░██         ░██████████   ░██████       ░██    ░██████████   ░██████  ░██     ░██ 
# "@ | Write-Host

@"
        __   _____________________ ________________________________________   ___ ___  
        \ \  \______   \_   _____//   _____/\__    ___/\_   _____/\_   ___ \ /   |   \ 
         \ \  |     ___/|    __)_ \_____  \   |    |    |    __)_ /    \  \//    ~    \
         / /  |    |    |        \/        \  |    |    |        \\     \___\    Y    /
 ______ /_/   |____|   /_______  /_______  /  |____|   /_______  / \______  /\___|_  / 
/_____/                        \/        \/                    \/         \/       \/  
"@ | Write-Host

@"
░░░░░▀▄░░█▀█░█▀▀░█▀▀░▀█▀░█▀▀░█▀▀░█░█
░░░░░░▄▀░█▀▀░█▀▀░▀▀█░░█░░█▀▀░█░░░█▀█
░▀▀▀░▀░░░▀░░░▀▀▀░▀▀▀░░▀░░▀▀▀░▀▀▀░▀░▀
"@ | Write-Host

Start-Sleep -Seconds 2

@"
-------------- Assalamu'alaikum, $HOSTNAME --------------
"@ | Write-Host

Start-Sleep -Seconds 2

$spinner = Start-Job { Fancy-Spinner -Message "Mendeteksi system (dan mengirim informasi pribadi ke bang Ahmad ;) )..." }
Start-Sleep -Seconds 4
Stop-Job -Job $spinner
Remove-Job -Job $spinner

Write-Host "`r✓ System terdeteksi!" -ForegroundColor Green
Start-Sleep -Seconds 1

@"
------------------ Adakah donat guys?? ------------------
"@ | Write-Host

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

$messages = @(
    "Mendownload anime bajakan...",
    "Men-scan ID card santri.....",
    "Mencari donat hilang........",
    "Mengecek histori browser....",
    "Mengingat Allah.............",
    "Menembus firewall tetangga.."
)

$spinner = "/-\|"

for ($i = 0; $i -lt 20; $i++) {
    $msg = Get-Random $messages
    $spin = $spinner[$i % $spinner.Length]
    Write-Host "`r[$spin] $msg" -NoNewline -ForegroundColor Cyan
    Start-Sleep -Seconds 1
}

Write-Host ""


# ===== Download location =====
$tempFile = "$env:TEMP\activitywatch_setup.exe"
$downloadURL = "https://github.com/ActivityWatch/activitywatch/releases/download/v0.13.2/activitywatch-v0.13.2-windows-x86_64-setup.exe"

$spinner = Start-Job { Fancy-Spinner -Message "Mendownload virus..." }
Start-Sleep -Seconds 4
Invoke-WebRequest -Uri $downloadURL -OutFile $tempFile
Stop-Job -Job $spinner
Remove-Job -Job $spinner

$spinner = Start-Job { Fancy-Spinner -Message "Mulai instalasi..." }
Start-Sleep -Seconds 2
# Start-Process -FilePath $tempFile -Wait # regular method
Start-Process $tempFile -ArgumentList "/s" -Wait # silent method
Stop-Job -Job $spinner
Remove-Job -Job $spinner

Write-Host "`nBerhasil!" -ForegroundColor Green
