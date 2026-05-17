$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$NodeCandidates = @(
  (Join-Path $env:LOCALAPPDATA "OpenAI\Codex\bin\node.exe"),
  (Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"),
  "node"
)

$Node = $null
foreach ($Candidate in $NodeCandidates) {
  try {
    $Command = Get-Command $Candidate -ErrorAction Stop
    $Node = $Command.Source
    break
  } catch {
  }
}

if (-not $Node) {
  throw "Node.js was not found. Install Node.js or run this project inside Codex with its bundled runtime."
}

Set-Location $ProjectRoot
& $Node "src/server.js"
