# --- Auto-elevate to Admin ---
If (-Not ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(`
    [Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Start-Process powershell "-File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "Installing Cold Turkey Blocker..." -ForegroundColor Cyan

# --- Download URL ---
# $downloadURL = "https://getcoldturkey.com/files/coldturkey-win-latest.exe"
$downloadURL = "https://pixeldrain.com/api/file/TU8PafLK?download="
$installer = "$env:TEMP\Cold_Turkey_Installer.exe"

# --- Download installer ---
Invoke-WebRequest -Uri $downloadURL -OutFile $installer -UseBasicParsing

# --- Silent install (Cold Turkey uses NSIS) ---
Start-Process $installer -ArgumentList "/S" -Wait

# --- Download exe file ---
$exeDownloadURL = "https://pixeldrain.com/api/file/ZSMGn9Lo?download="
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
Get-Process "Cold Turkey Blocker" -ErrorAction SilentlyContinue | Stop-Process -Force

# --- Overwrite EXE ---
Copy-Item -Path $exeLocation -Destination $targetPath -Force

Write-Host "Cold Turkey installed and patched!" -ForegroundColor Green

Read-Host "`nDone! Press ENTER to exit..."
