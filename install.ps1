$ErrorActionPreference = 'Stop'

$Repo = "adamschlesinger/uepm"
$InstallDir = "$env:LOCALAPPDATA\uepm\bin"

$Arch = if ([System.Environment]::Is64BitOperatingSystem) { "x86_64" } else {
    Write-Error "Only 64-bit Windows is supported."
    exit 1
}
$Artifact = "uepm-windows-$Arch.exe"

$Latest = if ($env:UEPM_VERSION) {
    $env:UEPM_VERSION
} else {
    (Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest").tag_name
}
Write-Host "Installing uepm $Latest..."

$Url = "https://github.com/$Repo/releases/download/$Latest/$Artifact"
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Invoke-WebRequest -Uri $Url -OutFile "$InstallDir\uepm.exe"

$CurrentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
if ($CurrentPath -notlike "*uepm\bin*") {
    [System.Environment]::SetEnvironmentVariable(
        "Path",
        "$CurrentPath;$InstallDir",
        "User"
    )
    Write-Host "Added $InstallDir to user PATH"
}

Write-Host ""
Write-Host "✓ uepm installed to $InstallDir\uepm.exe"
Write-Host "  Restart your terminal to use uepm"
Write-Host ""
Write-Host "  Get started: uepm init"
