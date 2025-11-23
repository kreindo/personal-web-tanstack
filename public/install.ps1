function Fancy-Spinner {
    param(
        [string]$Message,
        [ScriptBlock]$Task
    )

    $spin = @("⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏")
    # $spin = @("/", "-", "\", "|")
    $running = $true

    $taskJob = Start-Job $Task

    while ($running) {
        foreach ($frame in $spin) {
            if ($taskJob.State -ne 'Running') {
                $running = $false
                break
            }
            Write-Host "`r$frame $Message" -NoNewline
            Start-Sleep -Milliseconds 300
        }
    }

    Receive-Job $taskJob | Out-Null
    Remove-Job $taskJob
    Write-Host "`r✔ $Message"
}

function Get-Version {
    Write-Host "`r■ loaded version 1.2.0" -ForegroundColor Yellow
}

# $HOSTNAME = $env:COMPUTERNAME
$HOSTNAME = hostname

Get-Version

Start-Sleep -Seconds 2

Fancy-Spinner -Message "Menghubungi thinkpad bang Ahmad..." -Task {
    Start-Sleep -Seconds 4
}
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

# @"
#         __   _____________________ ________________________________________   ___ ___  
#         \ \  \______   \_   _____//   _____/\__    ___/\_   _____/\_   ___ \ /   |   \ 
#          \ \  |     ___/|    __)_ \_____  \   |    |    |    __)_ /    \  \//    ~    \
#          / /  |    |    |        \/        \  |    |    |        \\     \___\    Y    /
#  ______ /_/   |____|   /_______  /_______  /  |____|   /_______  / \______  /\___|_  / 
# /_____/                        \/        \/                    \/         \/       \/  
# "@ | Write-Host

@"
░░░░░░░░░▀▄░░█▀█░█▀▀░█▀▀░▀█▀░█▀▀░█▀▀░█░█░░░░░░░░░░
░░░░░░░░░░▄▀░█▀▀░█▀▀░▀▀█░░█░░█▀▀░█░░░█▀█░░░░░░░░░░
░░░░░▀▀▀░▀░░░▀░░░▀▀▀░▀▀▀░░▀░░▀▀▀░▀▀▀░▀░▀░▀▀▀░░░░░░
"@ | Write-Host

# @"
#            /$$    /$$$$$$$  /$$$$$$$$  /$$$$$$  /$$$$$$$$ /$$$$$$$$  /$$$$$$  /$$   /$$       
#         |  $$  | $$__  $$| $$_____/ /$$__  $$|__  $$__/| $$_____/ /$$__  $$| $$  | $$       
#          \  $$ | $$  \ $$| $$      | $$  \__/   | $$   | $$      | $$  \__/| $$  | $$       
#           \  $$| $$$$$$$/| $$$$$   |  $$$$$$    | $$   | $$$$$   | $$      | $$$$$$$$       
#            /$$/| $$____/ | $$__/    \____  $$   | $$   | $$__/   | $$      | $$__  $$       
#           /$$/ | $$      | $$       /$$  \ $$   | $$   | $$      | $$    $$| $$  | $$       
#          /$$/  | $$      | $$$$$$$$|  $$$$$$/   | $$   | $$$$$$$$|  $$$$$$/| $$  | $$       
#  /$$$$$$|__/   |__/      |________/ \______/    |__/   |________/ \______/ |__/  |__//$$$$$$
# |______/                                                                            |______/

# "@ | Write-Host

# @"
# ░▒▓███████▓▒░░▒▓████████▓▒░░▒▓███████▓▒░▒▓████████▓▒░▒▓████████▓▒░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░ 
# ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░         ░▒▓█▓▒░   ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
# ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░         ░▒▓█▓▒░   ░▒▓█▓▒░     ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ 
# ░▒▓███████▓▒░░▒▓██████▓▒░  ░▒▓██████▓▒░   ░▒▓█▓▒░   ░▒▓██████▓▒░░▒▓█▓▒░      ░▒▓████████▓▒░ 
# ░▒▓█▓▒░      ░▒▓█▓▒░             ░▒▓█▓▒░  ░▒▓█▓▒░   ░▒▓█▓▒░     ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ 
# ░▒▓█▓▒░      ░▒▓█▓▒░             ░▒▓█▓▒░  ░▒▓█▓▒░   ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
# ░▒▓█▓▒░      ░▒▓████████▓▒░▒▓███████▓▒░   ░▒▓█▓▒░   ░▒▓████████▓▒░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░ 
# "@ | Write-Host

# @"
# ▗▄▄▖ ▗▄▄▄▖ ▗▄▄▖▗▄▄▄▖▗▄▄▄▖ ▗▄▄▖▗▖ ▗▖
# ▐▌ ▐▌▐▌   ▐▌     █  ▐▌   ▐▌   ▐▌ ▐▌
# ▐▛▀▘ ▐▛▀▀▘ ▝▀▚▖  █  ▐▛▀▀▘▐▌   ▐▛▀▜▌
# ▐▌   ▐▙▄▄▖▗▄▄▞▘  █  ▐▙▄▄▖▝▚▄▄▖▐▌ ▐▌
# "@ | Write-Host
                                   
# @"                          
# ___________________________________/\\\\\\\\\\\\\____/\\\\\\\\\\\\\\\_____/\\\\\\\\\\\____/\\\\\\\\\\\\\\\__/\\\\\\\\\\\\\\\________/\\\\\\\\\__/\\\________/\\\___________________        
#  ____________________/\\\__________\/\\\/////////\\\_\/\\\///////////____/\\\/////////\\\_\///////\\\/////__\/\\\///////////______/\\\////////__\/\\\_______\/\\\___________________       
#   ___________________\////\\\_______\/\\\_______\/\\\_\/\\\______________\//\\\______\///________\/\\\_______\/\\\_______________/\\\/___________\/\\\_______\/\\\___________________      
#    ______________________\////\\\____\/\\\\\\\\\\\\\/__\/\\\\\\\\\\\_______\////\\\_______________\/\\\_______\/\\\\\\\\\\\______/\\\_____________\/\\\\\\\\\\\\\\\___________________     
#     _________________________\////\\\_\/\\\/////////____\/\\\///////___________\////\\\____________\/\\\_______\/\\\///////______\/\\\_____________\/\\\/////////\\\___________________    
#      __________________________/\\\//__\/\\\_____________\/\\\_____________________\////\\\_________\/\\\_______\/\\\_____________\//\\\____________\/\\\_______\/\\\___________________   
#       _______________________/\\\//_____\/\\\_____________\/\\\______________/\\\______\//\\\________\/\\\_______\/\\\______________\///\\\__________\/\\\_______\/\\\___________________  
#        __/\\\\\\\\\\\\\\\__/\\\//________\/\\\_____________\/\\\\\\\\\\\\\\\_\///\\\\\\\\\\\/_________\/\\\_______\/\\\\\\\\\\\\\\\____\////\\\\\\\\\_\/\\\_______\/\\\__/\\\\\\\\\\\\\\\_ 
#         _\///////////////__\///___________\///______________\///////////////____\///////////___________\///________\///////////////________\/////////__\///________\///__\///////////////__

# "@ | Write-Host

# @"
#                  ░█████████  ░██████████   ░██████   ░██████████░██████████   ░██████  ░██     ░██             
#             ░██  ░██     ░██ ░██          ░██   ░██      ░██    ░██          ░██   ░██ ░██     ░██             
#              ░██ ░██     ░██ ░██         ░██             ░██    ░██         ░██        ░██     ░██             
#               ░██░█████████  ░█████████   ░████████      ░██    ░█████████  ░██        ░██████████             
#              ░██ ░██         ░██                 ░██     ░██    ░██         ░██        ░██     ░██             
#             ░██  ░██         ░██          ░██   ░██      ░██    ░██          ░██   ░██ ░██     ░██             
# ░██████████      ░██         ░██████████   ░██████       ░██    ░██████████   ░██████  ░██     ░██ ░██████████ 
                                                                                                                                                                                                                        
                                                                                                               
# "@ | Write-Host

Start-Sleep -Seconds 2

@"
-------------- Assalamu'alaikum, $HOSTNAME --------------
"@ | Write-Host

Start-Sleep -Seconds 2

Fancy-Spinner -Message "Mendeteksi system (dan mengirim informasi pribadi ke bang Ahmad ;) )..." -Task {
    Start-Sleep -Seconds 4

}

Write-Host "`r✓ System terdeteksi!" -ForegroundColor Green
Start-Sleep -Seconds 2

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


Fancy-Spinner -Message "Mendownload virus..." -Task {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    Invoke-RestMethod "https://get.scoop.sh" | Invoke-Expression
}

Fancy-Spinner -Message "Mulai instalasi..." -Task {
    if (-not (scoop bucket list | Select-String "extras")) {
        scoop bucket add extras
    }

    scoop install extras/activitywatch
}


# ===== Download location =====

# Fancy-Spinner -Message "Mendownload virus..." -Task {
#     Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
#     Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

    # $downloadURL = "https://github.com/ActivityWatch/activitywatch/releases/download/v0.13.2/activitywatch-v0.13.2-windows-x86_64-setup.exe"
    # $tempFile = "$env:TEMP\activitywatch_setup.exe"
    # Start-Sleep -Seconds 4
    # Invoke-WebRequest -Uri $downloadURL -OutFile $tempFile
# }

# Fancy-Spinner -Message "Mulai instalasi..." -Task {
#     scoop bucket add extras 2>$null
#     scoop install extras/activitywatch
    # $tempFile = "$env:TEMP\activitywatch_setup.exe"
    # Start-Sleep -Seconds 2
    # Start-Process -FilePath $tempFile -Wait # regular method
    # $proc = Start-Process -FilePath $tempFile -ArgumentList "/s" -PassThru
    # $proc.WaitForExit()

# }

@"
░█▀█░█▀▀░█▀▄░█▀█░█▀█░█▀▀░█░█░█▀█░▀█▀░░░█▀▄░█▀▀░█▀▄░█░█░█▀█░█▀▀░▀█▀░█░░░░░█▀▄░▀█▀░░░█▀▄░█▀▀░▀█▀░█▀█░█▀▀░█
░█▀▀░█▀▀░█▀▄░█▀█░█░█░█░█░█▀▄░█▀█░░█░░░░█▀▄░█▀▀░█▀▄░█▀█░█▀█░▀▀█░░█░░█░░░░░█░█░░█░░░░█▀▄░█▀▀░░█░░█▀█░▀▀█░▀
░▀░░░▀▀▀░▀░▀░▀░▀░▀░▀░▀▀▀░▀░▀░▀░▀░░▀░░░░▀▀░░▀▀▀░▀░▀░▀░▀░▀░▀░▀▀▀░▀▀▀░▀▀▀░░░▀▀░░▀▀▀░░░▀░▀░▀▀▀░░▀░░▀░▀░▀▀▀░▀                                                                                                                                                                                                                                                                                         
"@ | Write-Host -ForegroundColor Red

Start-Sleep -Seconds 2

@"

                 uuuuuuu
             uu###########uu
          uu#################uu
         u#####################u
        u#######################u
       u#########################u
       u#########################u
       u######"   "###"   "######u
       "####"      u#u       ####"
        ###u       u#u       u###
        ###u      u###u      u###
         "####uu###   ###uu####"            Welcome to P3sTeck Und3r9r0und X_X
          "#######"   "#######"             
            u#######u#######u               
             u#"#"#"#"#"#"#u
  uuu        ##u# # # # #u##       uuu
 u####        #####u#u#u###       u####
  #####uu      "#########"     uu######
u###########uu    """""    uuuu##########
####"""##########uuu   uu#########"""###"
 """      ""###########uu ""#"""
           uuuu ""##########uuu
  u###uuu#########uu ""###########uuu###
  ##########""""           ""###########"
   "#####"                      ""####""
     ###"                         ####"
"@ | Write-Host -ForegroundColor Red