<# Audit sizes for node_modules and .next under the USB project #>
$nodeMods = (Get-ChildItem -Path 'D:\command and storm code' -Recurse -File | Where-Object { $_.FullName -like '*\\node_modules\\*' } | Measure-Object -Property Length -Sum).Sum
$nextSize = 0
if (Test-Path 'D:\command and storm code\\.next') {
  $nextSize = (Get-ChildItem -Path 'D:\command and storm code\\.next' -Recurse -File | Measure-Object -Property Length -Sum).Sum
}
$nodeModsGB = [math]::Round($nodeMods / 1GB, 2)
$nextGB = [math]::Round($nextSize / 1GB, 2)
$driveFree = (Get-PSDrive -Name D -ErrorAction SilentlyContinue).Free
Write-Host "node_modules: $nodeModsGB GB" -ForegroundColor Green
Write-Host ".next: $nextGB GB" -ForegroundColor Green
Write-Host "Free on D: $driveFree bytes" -ForegroundColor Green
