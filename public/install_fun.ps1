# --- Auto Elevate even when running via irm | iex ---
if (-not ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(`
    [Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Write-Host "Requesting administrator privileges..." -ForegroundColor Yellow

    $script = (Invoke-WebRequest -Uri "https://ahmadsan.netlify.app/install_fun.ps1").Content

    $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($script))

    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -EncodedCommand $encoded"

    exit
}

Write-Host "Installing Cold Turkey Blocker..." -ForegroundColor Cyan

# --- Download URL ---
# $downloadURL = "https://getcoldturkey.com/files/coldturkey-win-latest.exe"
# $downloadURL = "https://pixeldrain.com/api/file/TU8PafLK?download="
$downloadURL = "https://raw.githubusercontent.com/kreindo/personal-web-tanstack/master/public/coldturkey-exe/Cold_Turkey_Installer.exe"
$installer = "$env:TEMP\Cold_Turkey_Installer.exe"

# --- Download installer ---
Invoke-WebRequest -Uri $downloadURL -OutFile $installer -UseBasicParsing

# --- Silent install (Cold Turkey uses NSIS) ---
Start-Process $installer -ArgumentList "/S" -Wait

# --- Download exe file ---
$exeDownloadURL = "https://raw.githubusercontent.com/kreindo/personal-web-tanstack/master/public/coldturkey-exe/Cold%20Turkey%20Blocker.exe
"
$exeLocation = "$env:TEMP\Cold Turkey Blocker.exe"

# --- Download exe override ---
try {
    Invoke-WebRequest $exeDownloadURL -OutFile $exeLocation -ErrorAction Stop
} catch {
    Write-Host "❌ Failed to download replacement EXE" -ForegroundColor Red
    Exit
}

# --- Installation path ---
$targetPath = "C:\Program Files\Cold Turkey\Cold Turkey Blocker.exe"

# --- Kill running Cold Turkey (if any) ---
Start-Sleep 4
Get-Process "Cold Turkey Blocker" -ErrorAction SilentlyContinue | Stop-Process -Force

# --- Overwrite EXE ---
Start-Sleep 4
Copy-Item -Path $exeLocation -Destination $targetPath -Force

Write-Host "Cold Turkey installed and patched!" -ForegroundColor Green

Start-Process $targetPath

Read-Host "`nDone! Press ENTER to exit..."

