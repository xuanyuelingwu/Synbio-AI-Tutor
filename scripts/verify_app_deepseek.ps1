$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot

$job = Start-Job -ScriptBlock {
  Set-Location $using:ProjectRoot
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start_server.ps1
}

try {
  Start-Sleep -Seconds 2
  $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health"
  $body = @{ question = "What is synthetic biology? Answer in Chinese." } | ConvertTo-Json
  $answer = Invoke-RestMethod -Uri "http://localhost:3000/api/ask" -Method Post -Body $body -ContentType "application/json; charset=utf-8"

  [pscustomobject]@{
    HealthOk = $health.ok
    HealthMode = $health.mode
    Model = $health.model
    AnswerMode = $answer.mode
    SourceCount = $answer.sources.Count
    AnswerPreview = (($answer.answer -replace "\s+", " ").Substring(0, [Math]::Min(120, ($answer.answer -replace "\s+", " ").Length)))
  }
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue
  Remove-Job $job -Force -ErrorAction SilentlyContinue
}
