<#
  Stricter cleanup: Move large files off the USB drive and prune caches.
  This aims to maximize free space for npm install and Next.js dev.
  This script should be run from PowerShell with appropriate rights.
  It does not modify code files in the project root.
  It also reports post-cleanup node_modules/.next sizes.
#>

$projectRoot = "D:\command and storm code"
$archiveRoot = "D:\cleanup_archive_strict"
if (-not (Test-Path $archiveRoot)) { New-Item -ItemType Directory -Path $archiveRoot -Force | Out-Null }

$sizeThreshold = 50MB
$itemsMoved = 0

Write-Host "Starting strict cleanup..." -ForegroundColor Green

Get-ChildItem -Path 'D:\' -Recurse -File | Where-Object {
  ($_.FullName -notlike "$projectRoot*") -and ($_.Length -ge $sizeThreshold)
} | ForEach-Object {
  try {
    $dest = Join-Path $archiveRoot $_.Name
    $i = 1
    while (Test-Path $dest) {
      $dest = Join-Path $archiveRoot ($_.BaseName + "_" + $i + $_.Extension)
      $i++
    }
    Move-Item -LiteralPath $_.FullName -Destination $dest -Force
    Write-Host "Moved: $($_.FullName) -> $dest" -ForegroundColor Cyan
    $itemsMoved++
  } catch {
    Write-Host "Failed to move: $($_.FullName)" -ForegroundColor Yellow
  }
}

Write-Host "Total moved: $itemsMoved" -ForegroundColor Green

## Prune npm caches
foreach ($p in @("$env:LOCALAPPDATA\npm-cache","$env:APPDATA\npm-cache","C:\\Users\\thepr\\AppData\\Local\\npm-cache","C:\\Users\\thepr\\AppData\\Roaming\\npm-cache")) {
  if (Test-Path $p) {
    try { Remove-Item -Path $p -Recurse -Force -ErrorAction SilentlyContinue; Write-Host "Cleared: $p" -ForegroundColor Green }
    catch { Write-Host "Failed clearing: $p" -ForegroundColor Yellow }
  }
}

## Clear Windows temp folders
foreach ($t in @("C:\\Windows\\Temp", "$env:LOCALAPPDATA\\Temp")) {
  if (Test-Path $t) {
    try { Remove-Item -Path (Join-Path $t '*') -Recurse -Force -ErrorAction SilentlyContinue; Write-Host "Cleared: $t" -ForegroundColor Green }
    catch { Write-Host "Failed clearing: $t" -ForegroundColor Yellow }
  }
}

Write-Host "Strict cleanup complete." -ForegroundColor Green

## Size audit after cleanup
try {
  $nodeMods = (Get-ChildItem -Path 'D:\command and storm code' -Recurse -File | Where-Object { $_.FullName -like '*\\node_modules\\*' } | Measure-Object -Property Length -Sum).Sum
  $nextSize = 0
  if (Test-Path 'D:\command and storm code\\.next') {
    $nextSize = (Get-ChildItem -Path 'D:\command and storm code\\.next' -Recurse -File | Measure-Object -Property Length -Sum).Sum
  }
  $driveFree = (Get-PSDrive -Name D -ErrorAction SilentlyContinue).Free
  Write-Host "Node_modules size: $( [math]::Round($nodeMods/1GB,2) ) GB" -ForegroundColor Green
  Write-Host ".next size: $( [math]::Round($nextSize/1GB,2) ) GB" -ForegroundColor Green
  if ($driveFree) { Write-Host "Free on D: $driveFree bytes" -ForegroundColor Green }
} catch {
  Write-Host "Audit failed: $_" -ForegroundColor Yellow
}
