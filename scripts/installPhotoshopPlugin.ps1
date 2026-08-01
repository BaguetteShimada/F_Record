[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$PhotoshopRoot = "C:\Program Files\Adobe\Adobe Photoshop 2025",
    [string]$BuildRoot = "",
    [string]$BackupRoot = "",
    [switch]$AllowRunningPhotoshop
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$releasePackageRoot = [IO.Path]::GetFullPath($PSScriptRoot)
$isReleasePackage =
    (Test-Path -LiteralPath (Join-Path $releasePackageRoot "com.f_know.f_record.cep") -PathType Container) -and
    (Test-Path -LiteralPath (Join-Path $releasePackageRoot "com.f_know.f_record.generator") -PathType Container)
if ($BuildRoot.Trim() -eq "") {
    $BuildRoot = if ($isReleasePackage) {
        $releasePackageRoot
    } else {
        Join-Path $repoRoot "dist"
    }
}
if ($BackupRoot.Trim() -eq "") {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupBase = if ($isReleasePackage) { $releasePackageRoot } else { $repoRoot }
    $BackupRoot = Join-Path $backupBase "validation-backups\photoshop-install-$timestamp"
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

function Assert-FileExists {
    param(
        [string]$Path,
        [string]$Label
    )
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "$Label does not exist: $Path"
    }
}

function ConvertTo-NormalizedVersion {
    param(
        [string]$Value,
        [string]$Label
    )
    if ($Value -notmatch '^\d+(\.\d+){0,3}$') {
        throw "$Label is not a supported numeric version: $Value"
    }
    $parts = @($Value.Split('.'))
    while ($parts.Count -lt 4) {
        $parts += "0"
    }
    return [Version]::Parse($parts -join '.')
}

function Get-PhotoshopVersion {
    param([string]$ExecutablePath)
    $productVersion = (Get-Item -LiteralPath $ExecutablePath).VersionInfo.ProductVersion
    if ([string]::IsNullOrWhiteSpace($productVersion)) {
        throw "Photoshop executable has no product version: $ExecutablePath"
    }
    $versionMatch = [regex]::Match($productVersion, '^\d+(\.\d+){0,3}')
    if (-not $versionMatch.Success) {
        throw "Photoshop executable has an unsupported product version: $productVersion"
    }
    return ConvertTo-NormalizedVersion -Value $versionMatch.Value -Label "Photoshop product version"
}

function Test-VersionInCepRange {
    param(
        [Version]$Version,
        [string]$Range
    )
    if ($Range -match '^\d+(\.\d+){0,3}$') {
        $minimumVersion = ConvertTo-NormalizedVersion -Value $Range -Label "CEP host version"
        return $Version -ge $minimumVersion
    }

    $rangeMatch = [regex]::Match(
        $Range,
        '^(?<lowerDelimiter>[\[\(])(?<lower>\d+(\.\d+){0,3}),(?<upper>\d+(\.\d+){0,3})(?<upperDelimiter>[\]\)])$'
    )
    if (-not $rangeMatch.Success) {
        throw "Unsupported CEP host version range: $Range"
    }

    $lowerVersion = ConvertTo-NormalizedVersion -Value $rangeMatch.Groups['lower'].Value -Label "CEP lower host version"
    $upperVersion = ConvertTo-NormalizedVersion -Value $rangeMatch.Groups['upper'].Value -Label "CEP upper host version"
    $meetsLowerBound = if ($rangeMatch.Groups['lowerDelimiter'].Value -eq '[') {
        $Version -ge $lowerVersion
    } else {
        $Version -gt $lowerVersion
    }
    $meetsUpperBound = if ($rangeMatch.Groups['upperDelimiter'].Value -eq ']') {
        $Version -le $upperVersion
    } else {
        $Version -lt $upperVersion
    }
    return $meetsLowerBound -and $meetsUpperBound
}

function Assert-CepManifestSupportsPhotoshop {
    param(
        [string]$ManifestPath,
        [Version]$PhotoshopVersion
    )
    Assert-FileExists -Path $ManifestPath -Label "CEP manifest"
    try {
        [xml]$manifest = Get-Content -LiteralPath $ManifestPath -Raw
    } catch {
        throw "CEP manifest is not valid XML: $ManifestPath`n$($_.Exception.Message)"
    }

    foreach ($hostName in @("PHXS", "PHSP")) {
        $hostEntry = @($manifest.ExtensionManifest.ExecutionEnvironment.HostList.Host) |
            Where-Object { $_.Name -eq $hostName } |
            Select-Object -First 1
        if ($null -eq $hostEntry) {
            throw "CEP manifest does not declare the Photoshop host ${hostName}: $ManifestPath"
        }
        $hostRange = [string]$hostEntry.Version
        if (-not (Test-VersionInCepRange -Version $PhotoshopVersion -Range $hostRange)) {
            throw "CEP manifest host $hostName range $hostRange does not support Photoshop $PhotoshopVersion"
        }
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
$photoshopExecutable = Join-Path $PhotoshopRoot "Photoshop.exe"
Assert-FileExists -Path $photoshopExecutable -Label "Photoshop executable"
$photoshopVersion = Get-PhotoshopVersion -ExecutablePath $photoshopExecutable
$cepManifestPath = Join-Path $BuildRoot "com.f_know.f_record.cep\CSXS\manifest.xml"
Assert-CepManifestSupportsPhotoshop -ManifestPath $cepManifestPath -PhotoshopVersion $photoshopVersion
Write-Output "Target Photoshop: $PhotoshopRoot (version $photoshopVersion)"

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
Assert-NoBundledExportBinaries -Paths ($pluginPairs | ForEach-Object { $_.Source })

if (-not $AllowRunningPhotoshop) {
    $runningPhotoshop = @(Get-PhotoshopProcesses)
    if ($runningPhotoshop.Count -gt 0) {
        $processList = $runningPhotoshop | ForEach-Object { "PID $($_.Id): $($_.Path)" }
        throw "Close Photoshop before installing, or pass -AllowRunningPhotoshop if you only want to stage files for the next restart.`n$($processList -join "`n")"
    }
}

if (-not $WhatIfPreference) {
    New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null
}

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

if ($WhatIfPreference) {
    Write-Output "Preflight complete. No files were changed."
} else {
    Assert-NoBundledExportBinaries -Paths ($pluginPairs | ForEach-Object { $_.Target })
    Write-Output "Install complete. BackupRoot=$BackupRoot"
}
