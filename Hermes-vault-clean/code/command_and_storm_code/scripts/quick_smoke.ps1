param(
  [string]$Base = "http://localhost:3000"
)
Write-Host "Running quick smoke tests against $Base"

try {
  $hermes = Invoke-RestMethod -Method Post -Uri "$Base/api/hermes/route" -Body (@{command="status"} | ConvertTo-Json) -ContentType 'application/json'
  Write-Host "Hermes response:" $hermes
} catch {
  Write-Host "Hermes test failed: $($_.Exception.Message)" -ForegroundColor Red
}

try {
  $stormInvalid = Invoke-RestMethod -Method Post -Uri "$Base/api/storm/route" -Body (@{zip='abc'; email='a@b.c'} | ConvertTo-Json) -ContentType 'application/json'
  Write-Host "Storm (invalid) response:" $stormInvalid
} catch {
  Write-Host "Storm invalid test: $($_.Exception.Message)" -ForegroundColor Yellow
}

try {
  $stormValid = Invoke-RestMethod -Method Post -Uri "$Base/api/storm/route" -Body (@{zip='12345'; email='user@example.com'} | ConvertTo-Json) -ContentType 'application/json'
  Write-Host "Storm (valid) response:" $stormValid
} catch {
  Write-Host "Storm valid test: $($_.Exception.Message)" -ForegroundColor Yellow
}

try {
  $health = Invoke-RestMethod -Method Get -Uri "$Base/api/health"
  Write-Host "Health:" $health
} catch {
  Write-Host "Health test failed: $($_.Exception.Message)" -ForegroundColor Red
}
