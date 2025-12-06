# BuddyBudget - Update Live Website Script
# This script updates the GitHub Pages deployment with your latest frontend changes

Write-Host "🚀 BuddyBudget - Deploying to GitHub Pages..." -ForegroundColor Cyan
Write-Host ""

# Save current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Yellow

# Switch to gh-pages branch
Write-Host "🔄 Switching to gh-pages branch..." -ForegroundColor Yellow
git checkout gh-pages

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to switch to gh-pages branch!" -ForegroundColor Red
    exit 1
}

# Copy frontend files to root
Write-Host "📦 Copying frontend files..." -ForegroundColor Yellow
xcopy /E /I /Y buddybudget\frontend\* . 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to copy files!" -ForegroundColor Red
    git checkout $currentBranch
    exit 1
}

# Check if there are changes
$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace($changes)) {
    Write-Host "✅ No changes to deploy" -ForegroundColor Green
    git checkout $currentBranch
    exit 0
}

# Add and commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git add .
git commit -m "Update website - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to commit changes!" -ForegroundColor Red
    git checkout $currentBranch
    exit 1
}

# Push to GitHub
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push to GitHub!" -ForegroundColor Red
    git checkout $currentBranch
    exit 1
}

# Switch back to original branch
Write-Host "🔙 Switching back to $currentBranch..." -ForegroundColor Yellow
git checkout $currentBranch

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host "🌐 Your website will be updated at: https://vinay-guy.github.io/BUDDYBUDGET/" -ForegroundColor Cyan
Write-Host "⏱️  Changes will be live in 1-2 minutes" -ForegroundColor Yellow
Write-Host ""
