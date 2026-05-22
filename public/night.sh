#!/bin/bash

# 1. Safety check to ensure the script is run with root privileges
if [ "$EUID" -ne 0 ]; then
  echo "Error: Please run this setup script as root (using sudo)."
  exit 1
fi

echo "Deploying Nighttime Lockout System..."

# 2. Create the lockout script
echo "-> Creating /usr/local/bin/nighttime-lock.sh..."
cat << 'EOF' > /usr/local/bin/nighttime-lock.sh
#!/bin/bash
HOUR=$(date +%-H)

if (( HOUR >= 22 || HOUR < 7 )); then
    wall "Nighttime lock is active. System shutting down."
    /usr/bin/systemctl poweroff
fi
EOF

# Make it executable
chmod +x /usr/local/bin/nighttime-lock.sh


# 3. Create the systemd service
echo "-> Creating /etc/systemd/system/nighttime-lock.service..."
cat << 'EOF' > /etc/systemd/system/nighttime-lock.service
[Unit]
Description=Enforce nighttime lockout

[Service]
Type=oneshot
ExecStart=/usr/local/bin/nighttime-lock.sh
EOF


# 4. Create the systemd timer
echo "-> Creating /etc/systemd/system/nighttime-lock.timer..."
cat << 'EOF' > /etc/systemd/system/nighttime-lock.timer
[Unit]
Description=Run nighttime lockout check

[Timer]
OnBootSec=1min
OnCalendar=*:0/5

[Install]
WantedBy=timers.target
EOF


# 5. Reload systemd and enable the timer
echo "-> Reloading systemd daemon..."
systemctl daemon-reload

echo "-> Enabling and starting the timer..."
systemctl enable --now nighttime-lock.timer

echo ""
echo "Setup complete! The lockout timer is now active."
