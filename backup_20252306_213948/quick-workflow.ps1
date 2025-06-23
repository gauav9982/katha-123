# Katha Sales - Quick Workflow Script
# આ script તમને development workflow માં help કરશે

Write-Host "🚀 Katha Sales - Development Workflow Helper" -ForegroundColor Green
Write-Host ""

# Check current status
Write-Host "📊 Current Status:" -ForegroundColor Yellow
git status --porcelain
Write-Host ""

# Show current branch
$currentBranch = git branch --show-current
Write-Host "🌿 Current Branch: $currentBranch" -ForegroundColor Cyan
Write-Host ""

# Menu options
Write-Host "🔧 Available Commands:" -ForegroundColor Yellow
Write-Host "1. Start New Feature (Create new branch)"
Write-Host "2. Save Changes (Add & Commit)"
Write-Host "3. Switch to Main Branch"
Write-Host "4. Merge Feature to Main"
Write-Host "5. Deploy to Server"
Write-Host "6. Emergency Reset"
Write-Host "7. Show All Branches"
Write-Host "8. Show Commit History"
Write-Host ""

$choice = Read-Host "Enter your choice (1-8)"

switch ($choice) {
    "1" {
        Write-Host "🌱 Creating new feature branch..." -ForegroundColor Green
        $featureName = Read-Host "Enter feature name (e.g., add-user-form)"
        git checkout main
        git pull
        git checkout -b $featureName
        Write-Host "✅ New branch '$featureName' created and switched!" -ForegroundColor Green
    }
    "2" {
        Write-Host "💾 Saving changes..." -ForegroundColor Green
        git add .
        $commitMsg = Read-Host "Enter commit message"
        git commit -m $commitMsg
        Write-Host "✅ Changes saved!" -ForegroundColor Green
    }
    "3" {
        Write-Host "🔄 Switching to main branch..." -ForegroundColor Green
        git checkout main
        git pull
        Write-Host "✅ Switched to main branch!" -ForegroundColor Green
    }
    "4" {
        Write-Host "🔀 Merging feature to main..." -ForegroundColor Green
        $featureBranch = Read-Host "Enter feature branch name to merge"
        git checkout main
        git merge $featureBranch
        git push
        Write-Host "✅ Feature merged to main!" -ForegroundColor Green
    }
    "5" {
        Write-Host "🚀 Deploying to server..." -ForegroundColor Green
        Write-Host "⚠️  Make sure you've tested everything locally first!" -ForegroundColor Yellow
        $confirm = Read-Host "Are you sure? (y/n)"
        if ($confirm -eq "y") {
            ./deploy-secure.ps1
        } else {
            Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        }
    }
    "6" {
        Write-Host "🚨 Emergency Reset Options:" -ForegroundColor Red
        Write-Host "a) Reset to last commit"
        Write-Host "b) Reset to main branch"
        Write-Host "c) Delete current branch"
        $resetChoice = Read-Host "Choose option (a/b/c)"
        
        switch ($resetChoice) {
            "a" {
                git reset --hard HEAD~1
                Write-Host "✅ Reset to last commit!" -ForegroundColor Green
            }
            "b" {
                git reset --hard origin/main
                Write-Host "✅ Reset to main branch!" -ForegroundColor Green
            }
            "c" {
                $branchToDelete = Read-Host "Enter branch name to delete"
                git checkout main
                git branch -D $branchToDelete
                Write-Host "✅ Branch deleted!" -ForegroundColor Green
            }
        }
    }
    "7" {
        Write-Host "🌿 All Branches:" -ForegroundColor Yellow
        git branch -a
    }
    "8" {
        Write-Host "📜 Recent Commits:" -ForegroundColor Yellow
        git log --oneline -10
    }
    default {
        Write-Host "❌ Invalid choice!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✨ Workflow completed!" -ForegroundColor Green 