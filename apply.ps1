param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRoot
)

$ErrorActionPreference = "Stop"

$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRootResolved = Resolve-Path $ProjectRoot

Write-Host "Applying WorkLink Baseline 02.3..." -ForegroundColor Cyan
Write-Host "Project: $projectRootResolved"

$legacySchema = Join-Path `
    $projectRootResolved `
    "apps\api\src\database\schema.ts"

if (Test-Path $legacySchema) {
    Remove-Item $legacySchema -Force
    Write-Host "Removed legacy schema.ts" -ForegroundColor Yellow
}

$sourceRoot = Join-Path $patchRoot "apps"
$targetRoot = Join-Path $projectRootResolved "apps"

Copy-Item `
    -Path $sourceRoot `
    -Destination $projectRootResolved `
    -Recurse `
    -Force

$tsBuildInfo = Get-ChildItem `
    (Join-Path $projectRootResolved "apps\api") `
    -Recurse `
    -Filter "*.tsbuildinfo" `
    -ErrorAction SilentlyContinue

$tsBuildInfo | Remove-Item -Force -ErrorAction SilentlyContinue

$distPath = Join-Path $projectRootResolved "apps\api\dist"
if (Test-Path $distPath) {
    Remove-Item $distPath -Recurse -Force
}

Write-Host ""
Write-Host "Baseline 02.3 applied successfully." -ForegroundColor Green
Write-Host "Run:"
Write-Host "  pnpm --filter @worklink/api lint"
Write-Host "  pnpm check"
Write-Host "  pnpm --filter @worklink/api build"
