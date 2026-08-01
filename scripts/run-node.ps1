param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$NodeArgs
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-NodePath {
    if (-not [string]::IsNullOrWhiteSpace($env:F_RECORD_NODE_PATH)) {
        $envNodePath = [IO.Path]::GetFullPath($env:F_RECORD_NODE_PATH)
        if (Test-Path -LiteralPath $envNodePath -PathType Leaf) {
            return $envNodePath
        }
        throw "F_RECORD_NODE_PATH does not point to a file: $envNodePath"
    }

    $pathNode = Get-Command node -ErrorAction SilentlyContinue
    if ($null -ne $pathNode -and -not [string]::IsNullOrWhiteSpace($pathNode.Source)) {
        return $pathNode.Source
    }

    $currentPid = $PID
    while ($true) {
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $currentPid" -ErrorAction SilentlyContinue
        if ($null -eq $process -or $null -eq $process.ParentProcessId) {
            break
        }

        $parent = Get-CimInstance Win32_Process -Filter "ProcessId = $($process.ParentProcessId)" -ErrorAction SilentlyContinue
        if ($null -eq $parent) {
            break
        }

        if ($parent.Name -ieq "node.exe" -and -not [string]::IsNullOrWhiteSpace($parent.ExecutablePath)) {
            return $parent.ExecutablePath
        }

        $currentPid = $parent.ProcessId
    }

    throw "Node.js runtime is not available. Install Node.js, add node.exe to PATH, or set F_RECORD_NODE_PATH."
}

$nodePath = Resolve-NodePath
& $nodePath @NodeArgs
exit $LASTEXITCODE
