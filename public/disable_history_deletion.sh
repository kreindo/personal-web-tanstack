#!/bin/bash
# =====================================================================
# Script: disable_history_deletion.sh
# Purpose: Disable Browser History Deletion across Chrome, Edge, Brave, Chromium & Firefox
# OS: Linux & macOS
# =====================================================================

set -e

OS="$(uname -s)"

# Ensure root privileges on Linux
if [ "$EUID" -ne 0 ] && [ "$OS" != "Darwin" ]; then
  echo "Error: Please run this script as root (e.g., using sudo)."
  exit 1
fi

echo "======================================================"
echo "🛡️  Disabling Browser History Deletion Policy Setup"
echo "======================================================"

# Chromium Policy JSON Content (Chrome, Chromium, Brave)
CHROMIUM_POLICY='{
  "AllowDeletingBrowserHistory": false,
  "SavingBrowserHistoryDisabled": false,
  "IncognitoModeAvailability": 1
}'

# Edge Policy JSON Content (Uses InPrivateModeAvailability)
EDGE_POLICY='{
  "AllowDeletingBrowserHistory": false,
  "SavingBrowserHistoryDisabled": false,
  "InPrivateModeAvailability": 1
}'

# Firefox Policy JSON Content
FIREFOX_POLICY='{
  "policies": {
    "DisablePrivateBrowsing": true,
    "DisableForgetButton": true,
    "SanitizeOnShutdown": false,
    "Preferences": {
      "privacy.sanitize.sanitizeOnShutdown": { "Value": false, "Status": "locked" },
      "privacy.clearOnShutdown.history": { "Value": false, "Status": "locked" },
      "privacy.cpd.history": { "Value": false, "Status": "locked" },
      "places.history.enabled": { "Value": true, "Status": "locked" }
    }
  }
}'

if [ "$OS" = "Linux" ]; then
  echo "-> Applying policies on Linux..."

  # 1. Google Chrome
  mkdir -p /etc/opt/chrome/policies/managed
  echo "$CHROMIUM_POLICY" > /etc/opt/chrome/policies/managed/disable_history_deletion.json
  echo "  ✓ Google Chrome policy updated (/etc/opt/chrome/policies/managed/disable_history_deletion.json)"

  # 2. Chromium
  mkdir -p /etc/chromium/policies/managed
  echo "$CHROMIUM_POLICY" > /etc/chromium/policies/managed/disable_history_deletion.json
  echo "  ✓ Chromium policy updated (/etc/chromium/policies/managed/disable_history_deletion.json)"

  # 3. Brave Browser
  mkdir -p /etc/brave/policies/managed
  echo "$CHROMIUM_POLICY" > /etc/brave/policies/managed/disable_history_deletion.json
  echo "  ✓ Brave Browser policy updated (/etc/brave/policies/managed/disable_history_deletion.json)"

  # 4. Microsoft Edge
  mkdir -p /etc/opt/edge/policies/managed
  echo "$EDGE_POLICY" > /etc/opt/edge/policies/managed/disable_history_deletion.json
  echo "  ✓ Microsoft Edge policy updated (/etc/opt/edge/policies/managed/disable_history_deletion.json)"

  # 5. Mozilla Firefox
  FF_PATHS=(
    "/etc/firefox/policies"
    "/usr/lib/firefox/distribution"
    "/usr/lib64/firefox/distribution"
    "/usr/lib/firefox-esr/distribution"
  )

  for dir in "${FF_PATHS[@]}"; do
    mkdir -p "$dir"
    echo "$FIREFOX_POLICY" > "$dir/policies.json"
  done
  echo "  ✓ Mozilla Firefox policy updated across distribution folders"

elif [ "$OS" = "Darwin" ]; then
  echo "-> Applying policies on macOS..."

  # Chrome
  defaults write com.google.Chrome AllowDeletingBrowserHistory -bool false
  defaults write com.google.Chrome SavingBrowserHistoryDisabled -bool false
  defaults write com.google.Chrome IncognitoModeAvailability -int 1

  # Edge
  defaults write com.microsoft.Edge AllowDeletingBrowserHistory -bool false
  defaults write com.microsoft.Edge SavingBrowserHistoryDisabled -bool false
  defaults write com.microsoft.Edge InPrivateModeAvailability -int 1

  # Brave
  defaults write com.brave.Browser AllowDeletingBrowserHistory -bool false
  defaults write com.brave.Browser SavingBrowserHistoryDisabled -bool false
  defaults write com.brave.Browser IncognitoModeAvailability -int 1

  # Chromium
  defaults write org.chromium.Chromium AllowDeletingBrowserHistory -bool false
  defaults write org.chromium.Chromium SavingBrowserHistoryDisabled -bool false
  defaults write org.chromium.Chromium IncognitoModeAvailability -int 1

  echo "  ✓ macOS defaults updated for Chrome, Edge, Brave, and Chromium"

  # Firefox macOS Policy
  FF_MAC_DIR="/Applications/Firefox.app/Contents/Resources/distribution"
  if [ -d "/Applications/Firefox.app" ]; then
    mkdir -p "$FF_MAC_DIR"
    echo "$FIREFOX_POLICY" > "$FF_MAC_DIR/policies.json"
    echo "  ✓ Mozilla Firefox macOS policy updated"
  fi
fi

echo ""
echo "✅ History deletion has been successfully disabled across Chrome, Edge, Brave, Chromium, and Firefox!"
echo "ℹ️  Please restart open browsers for policies to take effect."
