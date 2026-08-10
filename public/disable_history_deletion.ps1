# =====================================================================
# Script: disable_history_deletion.ps1
# Purpose: Disable Browser History Deletion across Chrome, Edge, Brave, Chromium & Firefox
# OS: Windows (PowerShell)
# =====================================================================

# 1. Self-elevation to Administrator if not already admin
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️ Self-elevating script to run as Administrator..." -ForegroundColor Yellow
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "🛡️  Disabling Browser History Deletion (Windows)" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# Helper function to set registry DWORD values safely
function Set-RegistryPolicy {
    param (
        [string]$Path,
        [string]$Name,
        [int]$Value
    )
    if (!(Test-Path $Path)) {
        New-Item -Path $Path -Force | Out-Null
    }
    Set-ItemProperty -Path $Path -Name $Name -Value $Value -Type DWord -Force
}

# --- 1. Google Chrome ---
Write-Host "-> Configuring Google Chrome policy..." -ForegroundColor Gray
$chromePath = "HKLM:\SOFTWARE\Policies\Google\Chrome"
Set-RegistryPolicy -Path $chromePath -Name "AllowDeletingBrowserHistory" -Value 0
Set-RegistryPolicy -Path $chromePath -Name "SavingBrowserHistoryDisabled" -Value 0
Set-RegistryPolicy -Path $chromePath -Name "IncognitoModeAvailability" -Value 1
Write-Host "   ✓ Chrome: AllowDeletingBrowserHistory set to 0 (Disabled)" -ForegroundColor Green

# --- 2. Microsoft Edge ---
Write-Host "-> Configuring Microsoft Edge policy..." -ForegroundColor Gray
$edgePath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
Set-RegistryPolicy -Path $edgePath -Name "AllowDeletingBrowserHistory" -Value 0
Set-RegistryPolicy -Path $edgePath -Name "SavingBrowserHistoryDisabled" -Value 0
Set-RegistryPolicy -Path $edgePath -Name "InPrivateModeAvailability" -Value 1
Write-Host "   ✓ Edge: AllowDeletingBrowserHistory set to 0 (Disabled)" -ForegroundColor Green

# --- 3. Brave Browser ---
Write-Host "-> Configuring Brave Browser policy..." -ForegroundColor Gray
$bravePath = "HKLM:\SOFTWARE\Policies\BraveSoftware\Brave"
Set-RegistryPolicy -Path $bravePath -Name "AllowDeletingBrowserHistory" -Value 0
Set-RegistryPolicy -Path $bravePath -Name "SavingBrowserHistoryDisabled" -Value 0
Set-RegistryPolicy -Path $bravePath -Name "IncognitoModeAvailability" -Value 1
Write-Host "   ✓ Brave: AllowDeletingBrowserHistory set to 0 (Disabled)" -ForegroundColor Green

# --- 4. Chromium ---
Write-Host "-> Configuring Chromium policy..." -ForegroundColor Gray
$chromiumPath = "HKLM:\SOFTWARE\Policies\Chromium"
Set-RegistryPolicy -Path $chromiumPath -Name "AllowDeletingBrowserHistory" -Value 0
Set-RegistryPolicy -Path $chromiumPath -Name "SavingBrowserHistoryDisabled" -Value 0
Set-RegistryPolicy -Path $chromiumPath -Name "IncognitoModeAvailability" -Value 1
Write-Host "   ✓ Chromium: AllowDeletingBrowserHistory set to 0 (Disabled)" -ForegroundColor Green

# --- 5. Mozilla Firefox ---
Write-Host "-> Configuring Mozilla Firefox policy..." -ForegroundColor Gray

$firefoxPolicyJson = @"
{
  "policies": {
    "DisablePrivateBrowsing": true,
    "DisableForgetButton": true,
    "SanitizeOnShutdown": false,
    "Preferences": {
      "privacy.sanitize.sanitizeOnShutdown": {
        "Value": false,
        "Status": "locked"
      },
      "privacy.clearOnShutdown.history": {
        "Value": false,
        "Status": "locked"
      },
      "privacy.cpd.history": {
        "Value": false,
        "Status": "locked"
      },
      "places.history.enabled": {
        "Value": true,
        "Status": "locked"
      }
    }
  }
}
"@

$ffPaths = @(
    "C:\Program Files\Mozilla Firefox\distribution",
    "C:\Program Files (x86)\Mozilla Firefox\distribution"
)

foreach ($path in $ffPaths) {
    if (!(Test-Path $path)) {
        New-Item -Path $path -Force | Out-Null
    }
    $policyFile = Join-Path -Path $path -ChildPath "policies.json"
    Set-Content -Path $policyFile -Value $firefoxPolicyJson -Encoding UTF8 -Force
}
Write-Host "   ✓ Firefox: policies.json written to distribution folders" -ForegroundColor Green

# Registry policy fallback for Firefox
$ffRegistryPath = "HKLM:\SOFTWARE\Policies\Mozilla\Firefox"
Set-RegistryPolicy -Path $ffRegistryPath -Name "DisablePrivateBrowsing" -Value 1

Write-Host ""
Write-Host "✅ Browser history deletion has been successfully disabled for all installed browsers!" -ForegroundColor Green
Write-Host "ℹ️ Please restart any open browsers for policy changes to take effect." -ForegroundColor Yellow

if ([Environment]::UserInteractive) {
    Read-Host "`nPress ENTER to exit..."
}
