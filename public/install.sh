#!/bin/sh

set -e

fancy_spinner(){
    local msg=$1
    local spin=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
    while true; do
        for frame in "${spin[@]}"; do
            printf "\r$frame $msg"
            sleep 0.1
        done
    done
}

(fancy_spinner "Mengecek status..." & SP=$!; sleep 4; kill $SP; printf "\r✓ script masih dalam tahap pengembangan...\n")

# ===== Detect OS =====
# OS="$(uname -s)"
# case "$OS" in
#     Linux)   PLATFORM="linux" ;;
#     Darwin)  PLATFORM="macos" ;;
#     *) echo "Unsupported OS: $OS"; exit 1 ;;
# esac

# ===== Detect architecture =====
# ARCH="$(uname -m)"
# case "$ARCH" in
#     x86_64)   CPU="x86_64" ;;
#     amd64)    CPU="x86_64" ;;
#     arm64|aarch64) CPU="arm64" ;;
#     *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
# esac

# echo "Detected: $PLATFORM / $CPU"

# (fancy_spinner "Mendownload virus yang baik hati :) ..." & SP=$!;  sleep 4; kill $SP; printf "\r✓ Virus terdownload\n")
