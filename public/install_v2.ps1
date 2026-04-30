# --- 1. Silent Auto-Elevation ---
# Removed Read-Host so it doesn't hang in Veyon
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Self-elevating to Admin..." -ForegroundColor Yellow
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "Installing dependencies..." -ForegroundColor Cyan

# --- 2. Download Installer ---
$downloadURL = "https://raw.githubusercontent.com/kreindo/personal-web-tanstack/master/public/coldturkey-exe/Cold_Turkey_Installer.exe"
$installer = "$env:TEMP\Cold_Turkey_Installer.exe"
Invoke-WebRequest -Uri $downloadURL -OutFile $installer -UseBasicParsing

# --- 3. THE FIX: Silent Install (Inno Setup Flags) ---
# /VERYSILENT removes the wizard entirely. /SUPPRESSMSGBOXES kills popups.
Write-Host "Running silent installer..." -ForegroundColor Gray
Start-Process $installer -ArgumentList "/VERYSILENT", "/SUPPRESSMSGBOXES", "/NORESTART", "/SP-" -Wait


# --- 4. Prepare EXE Override ---
$exeDownloadURL = "https://raw.githubusercontent.com/kreindo/personal-web-tanstack/master/public/coldturkey-exe/Cold%20Turkey%20Blocker.exe"
$exeLocation = "$env:TEMP\Cold_Turkey_Blocker_Patched.exe"
$targetPath = "C:\Program Files\Cold Turkey\Cold Turkey Blocker.exe"

try {
    Invoke-WebRequest $exeDownloadURL -OutFile $exeLocation -ErrorAction Stop
} catch {
    Write-Host "❌ Failed to download replacement EXE" -ForegroundColor Red
    Exit
}

# --- 5. Clean Kill (Crucial for Overwrite) ---
Start-Sleep 4
Write-Host "Stopping active processes..." -ForegroundColor Gray
Get-Process "Cold Turkey Blocker" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process "CTService" -ErrorAction SilentlyContinue | Stop-Process -Force

# --- 6. Overwrite & Verify ---
Start-Sleep 4
if (Test-Path $exeLocation) {
    Copy-Item -Path $exeLocation -Destination $targetPath -Force
    Write-Host "✅ Cold Turkey patched successfully!" -ForegroundColor Green
}

# --- 7. Start Service & App ---
Start-Sleep 4
Start-Process "C:\Program Files\Cold Turkey\CTServiceInstaller.exe" -Wait # Re-registers the service
# Start-Process $targetPath

# --- 8. Auto-Configure Blocks (New for v4.9+) ---
$ctCLI = "C:\Program Files\Cold Turkey\Cold Turkey Blocker.exe"
$blockName = [guid]::NewGuid().ToString().Substring(0, 8)

Write-Host "Configuring $blockName..." -ForegroundColor Gray
Start-Sleep 4

# while (!(Get-Service "CTService" -ErrorAction SilentlyContinue | Where-Object {$_.Status -eq "Running"})) {
#     Write-Host "Waiting for Cold Turkey Service to stabilize..." -ForegroundColor Yellow
#     Start-Sleep -Seconds 2
# }

# 1. Create the block (if it doesn't exist)
Start-Process $ctCLI -ArgumentList "-add-block `"$blockName`"" -Wait
Start-Sleep 2

# 2. Add your standard "distraction" list
# You can add multiple sites by repeating the command
$sites = "*.*"
foreach ($site in $sites) {
    Start-Process $ctCLI -ArgumentList "-add `"$blockName`" -web `"$site`"" -Wait
    Start-Sleep 2
}

# 3. Add your standard "distraction" list
# You can add multiple sites by repeating the command
$siteExceptions = "*pesantrenteknologi.id*, canva.com, studio.youtube.com, learn.kreii.net"
foreach ($site in $siteExceptions) {
    Start-Process $ctCLI -ArgumentList "-add `"$blockName`" -exception `"$site`"" -Wait
    Start-Sleep 2
}

# 4. Add an application (Optional - e.g., blocking a specific game or app)
# Start-Process $ctCLI -ArgumentList "-add `"$blockName`" -app `"C:\Path\To\Game.exe`"" -Wait

# Write-Host "✅ $blockName configured with $($sites.Count) sites." -ForegroundColor Green

# 5. Optional: Start the block immediately and lock it for the duration of the lab
Start-Process $ctCLI -ArgumentList "-start `"$blockName`" -password 12345667890" -Wait


# Only use Read-Host if a human is actually watching (Interactive mode)
if ([Environment]::UserInteractive) {
    Read-Host "`nDone, remember 24/1!! Press ENTER to exit..."
}