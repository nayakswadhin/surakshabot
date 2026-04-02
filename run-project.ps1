[CmdletBinding()]
param(
    [switch]$SkipInstalls
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

function Assert-Command {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$InstallHint
    )

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found. $InstallHint"
    }
}

function Assert-Path {
    param(
        [Parameter(Mandatory = $true)][string]$PathToCheck,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if (-not (Test-Path $PathToCheck)) {
        throw $Message
    }
}

function Start-ServiceTerminal {
    param(
        [Parameter(Mandatory = $true)][string]$Title,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string[]]$Commands
    )

    $commandBody = @(
        "$host.UI.RawUI.WindowTitle = '$Title'",
        "$ErrorActionPreference = 'Stop'",
        "Set-Location '$WorkingDirectory'"
    ) + $Commands

    $scriptText = $commandBody -join "`r`n"

    Start-Process powershell -ArgumentList @(
        '-NoExit',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        $scriptText
    ) | Out-Null
}

function Get-PythonSetupCommands {
    param(
        [Parameter(Mandatory = $true)][string]$RunCommand
    )

    $commands = @(
        "python -m venv venv",
        "if (-not (Test-Path '.\\venv\\Scripts\\python.exe')) { throw 'Virtual environment creation failed.' }",
        ".\\venv\\Scripts\\Activate.ps1",
        "python -m pip --version",
        "if (`$LASTEXITCODE -ne 0) { throw 'pip is not available in this environment.' }"
    )

    if (-not $SkipInstalls) {
        $commands += @(
            "python -m pip install --upgrade pip",
            "if (`$LASTEXITCODE -ne 0) { throw 'Failed to upgrade pip.' }",
            "python -m pip install -r requirements.txt",
            "if (`$LASTEXITCODE -ne 0) { throw 'Failed to install Python dependencies. Check errors above.' }"
        )
    }

    $commands += @(
        $RunCommand,
        "if (`$LASTEXITCODE -ne 0) { throw 'Application exited with an error.' }"
    )

    return $commands
}

function Get-NpmSetupCommands {
    param(
        [Parameter(Mandatory = $true)][string]$RunCommand
    )

    $commands = @("npm --version")

    if (-not $SkipInstalls) {
        $commands += @(
            "npm install",
            "if (`$LASTEXITCODE -ne 0) { throw 'Failed to install npm dependencies. Check errors above.' }"
        )
    }

    $commands += @(
        $RunCommand,
        "if (`$LASTEXITCODE -ne 0) { throw 'Application exited with an error.' }"
    )

    return $commands
}

# Pre-flight checks
Assert-Command -Name 'python' -InstallHint 'Install Python 3.10+ and add it to PATH.'
Assert-Command -Name 'node' -InstallHint 'Install Node.js LTS and add it to PATH.'
Assert-Command -Name 'npm' -InstallHint 'npm is bundled with Node.js. Reinstall Node.js if missing.'

Assert-Path -PathToCheck "$repoRoot\\.env" -Message "Missing root .env. Copy .env.example to .env and add required keys before running."
Assert-Path -PathToCheck "$repoRoot\\CyberDogesg_RAG_Pipeline-\\.env" -Message "Missing CyberDogesg_RAG_Pipeline-/.env. Copy .env.example to .env and add PINECONE_API_KEY and GOOGLE_API_KEY."

Assert-Path -PathToCheck "$repoRoot\\CyberCrimeClassifier_SentenceTransformers" -Message "Missing folder: CyberCrimeClassifier_SentenceTransformers"
Assert-Path -PathToCheck "$repoRoot\\CyberDogesg_RAG_Pipeline-" -Message "Missing folder: CyberDogesg_RAG_Pipeline-"
Assert-Path -PathToCheck "$repoRoot\\frontend" -Message "Missing folder: frontend"

Write-Host 'Starting all services in separate terminals...' -ForegroundColor Cyan
if ($SkipInstalls) {
    Write-Host 'Skip mode enabled: dependency installation steps will be skipped.' -ForegroundColor Yellow
}

Start-ServiceTerminal -Title 'Classifier Service' -WorkingDirectory "$repoRoot\\CyberCrimeClassifier_SentenceTransformers" -Commands (Get-PythonSetupCommands -RunCommand 'python main.py')

Start-ServiceTerminal -Title 'RAG API Service' -WorkingDirectory "$repoRoot\\CyberDogesg_RAG_Pipeline-" -Commands (Get-PythonSetupCommands -RunCommand 'python api.py')

Start-ServiceTerminal -Title 'Frontend Dev Server' -WorkingDirectory "$repoRoot\\frontend" -Commands (Get-NpmSetupCommands -RunCommand 'npm run dev')

Start-ServiceTerminal -Title 'Node WhatsApp Backend' -WorkingDirectory "$repoRoot" -Commands (Get-NpmSetupCommands -RunCommand 'npm run start')

Write-Host ''
Write-Host 'Launched 4 terminals:' -ForegroundColor Green
Write-Host '1) Classifier Service (python main.py)'
Write-Host '2) RAG API Service (python api.py)'
Write-Host '3) Frontend Dev Server (npm run dev)'
Write-Host '4) Node WhatsApp Backend (npm run start)'
Write-Host ''
Write-Host 'Run this command from repo root:' -ForegroundColor Cyan
Write-Host 'powershell -ExecutionPolicy Bypass -File .\run-project.ps1'
Write-Host ''
Write-Host 'For faster restarts (skip installs):' -ForegroundColor Cyan
Write-Host 'powershell -ExecutionPolicy Bypass -File .\run-project.ps1 -SkipInstalls'
