Write-Host "Patching Cold Turkey..." -ForegroundColor Cyan

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

Write-Host "Cold Turkey patched!" -ForegroundColor Green

Start-Process $targetPath

Read-Host "`nDone! Press ENTER to exit..."

