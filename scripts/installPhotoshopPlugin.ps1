[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$PhotoshopRoot = "C:\Program Files\Adobe\Adobe Photoshop 2022",
    [string]$BuildRoot = "",
    [string]$BackupRoot = "",
    [switch]$AllowRunningPhotoshop
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
if ($BuildRoot.Trim() -eq "") {
    $BuildRoot = Join-Path $repoRoot "dist"
}
if ($BackupRoot.Trim() -eq "") {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $BackupRoot = Join-Path $repoRoot "validation-backups\photoshop-install-$timestamp"
}

$PhotoshopRoot = [IO.Path]::GetFullPath($PhotoshopRoot)
$BuildRoot = [IO.Path]::GetFullPath($BuildRoot)
$BackupRoot = [IO.Path]::GetFullPath($BackupRoot)

function Assert-DirectoryExists {
    param(
        [string]$Path,
        [string]$Label
    )
    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "$Label does not exist: $Path"
    }
}

function Assert-NoBundledExportBinaries {
    param([string[]]$Paths)
    $matches = @()
    foreach ($path in $Paths) {
        if (Test-Path -LiteralPath $path) {
            $matches += Get-ChildItem -LiteralPath $path -Recurse -File -Force |
                Where-Object { $_.Name -match '^(ffmpeg|ffprobe)(\.exe)?$' } |
                ForEach-Object { $_.FullName }
        }
    }
    if ($matches.Count -gt 0) {
        throw "Bundled ffmpeg/ffprobe binaries are not allowed:`n$($matches -join "`n")"
    }
}

function Assert-DirectoryWritable {
    param(
        [string]$Path,
        [string]$Label
    )
    $probePath = Join-Path $Path ".f-record-write-probe-$([Guid]::NewGuid().ToString('N')).tmp"
    try {
        [IO.File]::WriteAllText($probePath, "")
    } catch {
        throw "$Label is not writable: $Path`nRun PowerShell as Administrator, then retry the install script."
    } finally {
        Remove-Item -LiteralPath $probePath -Force -ErrorAction SilentlyContinue
    }
}

function Get-PhotoshopProcesses {
    $photoshopRootPrefix = $PhotoshopRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
    Get-Process -ErrorAction SilentlyContinue |
        Where-Object {
            if ($_.ProcessName -ne "Photoshop") {
                return $false
            }
            $processPath = $null
            try {
                $processPath = $_.Path
            } catch {
                return $true
            }
            if ([string]::IsNullOrWhiteSpace($processPath)) {
                return $true
            }
            return ($processPath -eq (Join-Path $PhotoshopRoot "Photoshop.exe")) -or $processPath.StartsWith($photoshopRootPrefix)
        }
}

Assert-DirectoryExists -Path $PhotoshopRoot -Label "Photoshop root"
Assert-DirectoryExists -Path $BuildRoot -Label "Build root"

$pluginPairs = @(
    [PSCustomObject]@{
        Name = "cep"
        Source = Join-Path $BuildRoot "com.f_know.f_record.cep"
        Target = Join-Path $PhotoshopRoot "Required\CEP\extensions\com.f_know.f_record.cep"
    },
    [PSCustomObject]@{
        Name = "generator"
        Source = Join-Path $BuildRoot "com.f_know.f_record.generator"
        Target = Join-Path $PhotoshopRoot "Plug-ins\Generator\com.f_know.f_record.generator"
    }
)

foreach ($pair in $pluginPairs) {
    Assert-DirectoryExists -Path $pair.Source -Label "$($pair.Name) build output"
    $targetParent = Split-Path -Parent $pair.Target
    Assert-DirectoryExists -Path $targetParent -Label "$($pair.Name) install parent"
    if (-not $WhatIfPreference) {
        Assert-DirectoryWritable -Path $targetParent -Label "$($pair.Name) install parent"
    }
}

if (-not $AllowRunningPhotoshop) {
    $runningPhotoshop = @(Get-PhotoshopProcesses)
    if ($runningPhotoshop.Count -gt 0) {
        $processList = $runningPhotoshop | ForEach-Object { "PID $($_.Id): $($_.Path)" }
        throw "Close Photoshop before installing, or pass -AllowRunningPhotoshop if you only want to stage files for the next restart.`n$($processList -join "`n")"
    }
}

New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null

foreach ($pair in $pluginPairs) {
    if (Test-Path -LiteralPath $pair.Target) {
        $backupTarget = Join-Path $BackupRoot $pair.Name
        if ($PSCmdlet.ShouldProcess($pair.Target, "Move existing plugin to $backupTarget")) {
            Move-Item -LiteralPath $pair.Target -Destination $backupTarget
            Write-Output "Backed up $($pair.Target) -> $backupTarget"
        }
    }

    if ($PSCmdlet.ShouldProcess($pair.Target, "Install $($pair.Source)")) {
        Copy-Item -LiteralPath $pair.Source -Destination $pair.Target -Recurse
        Write-Output "Installed $($pair.Source) -> $($pair.Target)"
    }
}

Assert-NoBundledExportBinaries -Paths ($pluginPairs | ForEach-Object { $_.Target })
Write-Output "Install complete. BackupRoot=$BackupRoot"
