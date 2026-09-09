# ── Super Collection · Deploy Script (Windows) ─────────────────────
# Future changes publish karne ke liye BASS ye chalao:
#   powershell .\deploy.ps1 "ye change kiya"
#
# Ye karega: client build test -> git commit -> GitHub push
# Render khud auto-deploy karta hai (dono services par).

param(
  [string]$msg = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=== 1/3  CLIENT BUILD TEST ===" -ForegroundColor Cyan
Push-Location client
npm run build
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  Write-Host "BUILD FAILED - Fix errors pehle, phir dobara chalao." -ForegroundColor Red
  exit 1
}
Pop-Location
Write-Host "Build OK ✓" -ForegroundColor Green

Write-Host ""
Write-Host "=== 2/3  GIT COMMIT ===" -ForegroundColor Cyan
git add -A
git commit -m $msg
if ($LASTEXITCODE -ne 0) {
  Write-Host "NOTE: Kuch nahi badla (ya commit pehle se hai). Continue.." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 3/3  GITHUB PUSH ===" -ForegroundColor Cyan
$env:GIT_TERMINAL_PROMPT = '0'
git push super main
if ($LASTEXITCODE -ne 0) {
  Write-Host "PUSH FAILED - GitHub credentials / network check karo." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "DONE ✓ - Render ab auto-deploy kar raha hai." -ForegroundColor Green
Write-Host "   Frontend: https://super-collection-frontend.onrender.com" -ForegroundColor White
Write-Host "   Backend:  https://super-collections-1.onrender.com" -ForegroundColor White
Write-Host "   Deploy status: Render dashboard → Events/Logs dekh lo (1-2 min)." -ForegroundColor White
Write-Host "===========================================" -ForegroundColor Green