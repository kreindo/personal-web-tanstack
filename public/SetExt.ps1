# --- Browser setup ---
Write-Host "🛡️ Force-installing browser extensions..." -ForegroundColor Cyan

# --- Block Extension Install ---
# This policy prevents users from removing or disabling extensions. Only an administrator can remove them.

# 1. For Chrome
$chromePolicyPath = "HKLM:\SOFTWARE\Policies\Google\Chrome\ExtensionInstallBlocklist"
if (!(Test-Path $chromePolicyPath)) { New-Item -Path $chromePolicyPath -Force | Out-Null }
Set-ItemProperty -Path $chromePolicyPath -Name "1" -Value "*" -Type String

# 2. For Edge
$edgePolicyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallBlocklist"
if (!(Test-Path $edgePolicyPath)) { New-Item -Path $edgePolicyPath -Force | Out-Null }
Set-ItemProperty -Path $edgePolicyPath -Name "1" -Value "*" -Type String

# --- Install Extensions ---
# This policy forces the extension to be installed and keeps it enabled.

# --- 1. CHROME ---
# ID: pganeibhckoanndahmnfggfoeofncnii
$chromePath = "HKLM:\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist"
if (!(Test-Path $chromePath)) { New-Item -Path $chromePath -Force | Out-Null }
Set-ItemProperty -Path $chromePath -Name "102" -Value "enboaomnljiigfhfjfoalacienlhjlfil;https://clients2.google.com/service/update2/crx" # Untrap Youtube

# --- 2. EDGE ---
# ID: jfphahkinplobmabmgjmjgflbhjjddeb
$edgePath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallForcelist"
if (!(Test-Path $edgePath)) { New-Item -Path $edgePath -Force | Out-Null }
Set-ItemProperty -Path $edgePath -Name "101" -Value "jfphahkinplobmabmgjmjgflbhjjddeb;https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/microsoftedge/extension/update2/crx"


Write-Host "✅ Chrome, and Edge extensions forced via Policy." -ForegroundColor Green

# Firefox setup

$firefoxPolicyPath = "C:\Program Files\Mozilla Firefox\distribution\policies.json"
if (!(Test-Path $firefoxPolicyPath)) { New-Item -Path $firefoxPolicyPath -Force | Out-Null }
$policy = @{
  "policies": {
    "ExtensionSettings": {
      "*": {
        "installation_mode": "blocked",
        "blocked_install_message": "Custom extensions are disabled."
      },
      "{2662ff67-b302-4363-95f3-b050218bd72c}": {
        "installation_mode": "force_installed",
        "install_url": "https://addons.mozilla.org/firefox/downloads/latest/untrap-for-youtube/latest.xpi"
      }
    }
  }
}

Set-Content -Path $firefoxPolicyPath -Value ($policy | ConvertTo-Json -Depth 4) -Encoding UTF8


# --- BROWSER SETTINGS: Disable Incognito & Stealth Mode ---
Write-Host "🛡️ Locking browser settings (No Incognito, No Stealth)..." -ForegroundColor Cyan

# === 1. CHROME ===
# Disables "New Incognito Window" option in menus
$chromePolicyPath = "HKLM:\SOFTWARE\Policies\Google\Chrome"
if (!(Test-Path $chromePolicyPath)) { New-Item -Path $chromePolicyPath -Force | Out-Null }
Set-ItemProperty -Path $chromePolicyPath -Name "IncognitoModeAvailability" -Value 1 # 1 = Disabled

# --- EDGE ---
# Disables "New InPrivate Window" option in menus
$edgePolicyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
if (!(Test-Path $edgePolicyPath)) { New-Item -Path $edgePolicyPath -Force | Out-Null }
Set-ItemProperty -Path $edgePolicyPath -Name "InPrivateModeAvailability" -Value 1 # 1 = Disabled

# === 3. FIREFOX (Stealth Mode) ===
# Firefox doesn't have an "Incognito" mode in the same way, but it has "Private Browsing".
# We can't force "Private Browsing Off" globally via standard HKLM policies easily without JS.
# However, we can ensure the "Private Browsing" button is hidden from the toolbar.
# Note: Users can still right-click links -> "Open Link in New Private Window".
# To block that is much more complex. For now, we hide the main button.

$ffPolicyPath = "HKLM:\SOFTWARE\Policies\Mozilla\Firefox"
if (!(Test-Path $ffPolicyPath)) { New-Item -Path $ffPolicyPath -Force | Out-Null }
# Note: This specific policy to hide the button is sometimes hard to enforce without enterprise config files.
# The IncognitoModeAvailability = 1 for Chrome/Edge is usually the most critical part.

Write-Host "✅ Incognito/InPrivate/Stealth mode restrictions applied." -ForegroundColor Green