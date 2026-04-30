#!/bin/bash

# Print the cyan status message
echo -e "\e[36m🛡️ Force-installing Deps...\e[0m"

# Define the Linux Firefox policy directory and file path
POLICY_DIR="/etc/firefox/policies"
POLICY_FILE="$POLICY_DIR/policies.json"

# Create the directory if it doesn't exist (requires root)
sudo mkdir -p "$POLICY_DIR"

# Write the JSON payload to the policy file
sudo tee "$POLICY_FILE" > /dev/null << 'EOF'
{
  "policies": {
    "ExtensionSettings": {
      "*": {
        "installation_mode": "blocked",
        "blocked_install_message": "Blocked by Pesantren Teknologi"
      },
      "{2662ff67-b302-4363-95f3-b050218bd72c}": {
        "installation_mode": "force_installed",
        "install_url": "https://addons.mozilla.org/firefox/downloads/latest/untrap-for-youtube/latest.xpi"
      },
      "uBlock0@raymondhill.net": {
        "installation_mode": "force_installed",
        "install_url": "https://addons.mozilla.org/firefox/downloads/file/4721638/ublock_origin-1.70.0.xpi"
      },
      "leechblockng@proginosko.com": {
        "installation_mode": "force_installed",
        "install_url": "https://addons.mozilla.org/firefox/downloads/file/4657335/leechblock_ng-1.7.2.xpi"
      }
    }
  }
}
EOF