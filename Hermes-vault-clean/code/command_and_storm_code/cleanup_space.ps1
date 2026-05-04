<#
  Cleanup script: Move large files outside the project root to an archive on the same drive.
  This helps free space for npm installs and dev servers when working from USB or limited disks.
#>

$projectRoot = "D:\command and storm code"
$archiveRoot = "D:\cleanup_archive"

# Ensure archive directory exists
if (-not (Test-Path -Path $archiveRoot)) {
  New-Item -ItemType Directory -Path $archiveRoot -Force | Out-Null
}

$sizeThreshold = 100MB

Write-Host "Starting cleanup. Moving files larger than $sizeThreshold outside project root..." -ForegroundColor Green

$filesMoved = 0
Get-ChildItem -Path 'D:\' -Recurse -File | Where-Object {
  ($_.Length -gt $sizeThreshold) -and (-not $_.FullName.StartsWith($projectRoot, [System.StringComparison]::InvariantCultureIgnoreCase))
} | ForEach-Object {
  try {
    $dest = Join-Path $archiveRoot $_.Name
    Move-Item -LiteralPath $_.FullName -Destination $archiveRoot -Force
    Write-Host "Moved: $($_.FullName) -> $archiveRoot" -ForegroundColor Cyan
    $filesMoved++
  } catch {
    Write-Host "Failed to move: $($_.FullName)" -ForegroundColor Yellow
  }
}

Write-Host "Cleanup complete. Files moved: $filesMoved" -ForegroundColor Green
