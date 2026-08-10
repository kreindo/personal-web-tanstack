# Alias wrapper for disable_history_deletion.ps1
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$targetScript = Join-Path $scriptDir "disable_history_deletion.ps1"

if (Test-Path $targetScript) {
    & $targetScript @args
} else {
    Invoke-RestMethod -Uri "https://raw.githubusercontent.com/kreindo/personal-web-tanstack/master/public/disable_history_deletion.ps1" | Invoke-Expression
}
