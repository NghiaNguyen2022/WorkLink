$ErrorActionPreference = "Stop"

$root = Resolve-Path "$PSScriptRoot\..\src"
$databaseRoot = Resolve-Path "$root\database"

$patterns = @(
    "from 'mysql2",
    'from "mysql2',
    "from 'drizzle-orm/mysql2",
    'from "drizzle-orm/mysql2',
    "createPool(",
    "@Inject(DATABASE)",
    "@Inject(MYSQL_POOL)"
)

$violations = @()

Get-ChildItem $root -Recurse -File -Include *.ts |
Where-Object {
    -not $_.FullName.StartsWith($databaseRoot.Path)
} |
ForEach-Object {
    $file = $_

    foreach ($pattern in $patterns) {
        $matches = Select-String `
            -LiteralPath $file.FullName `
            -SimpleMatch `
            -Pattern $pattern

        foreach ($match in $matches) {
            $violations += [PSCustomObject]@{
                File = $file.FullName
                Line = $match.LineNumber
                Pattern = $pattern
                Content = $match.Line.Trim()
            }
        }
    }
}

if ($violations.Count -gt 0) {
    Write-Host ""
    Write-Host "FAIL: Direct database access found outside src/database." `
        -ForegroundColor Red

    $violations | Format-Table -AutoSize

    exit 1
}

Write-Host ""
Write-Host `
    "PASS: Database access is centralized through DatabaseService." `
    -ForegroundColor Green
