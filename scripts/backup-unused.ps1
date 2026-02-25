# Create backup directory with timestamp
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupDir = "backup_pages_$timestamp"
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
Write-Host "📁 Created backup directory: $backupDir" -ForegroundColor Green

# List of pages that are NOT in navigation (safe to backup)
$unusedPages = @(
    "admin\analytics",
    "admin\disbursements",
    "admin\pending-approvals",
    "admin\ready-for-disbursement",
    "admin\recent-payments",
    "admin\debug",
    "admin\debug-customer",
    "admin\auth-check",
    "admin\debug-customers",
    # Also backup any customer debug pages
    "admin\debug-customer\[id]"
)

foreach ($page in $unusedPages) {
    $source = "src\app\$page"
    if (Test-Path $source) {
        $dest = "$backupDir\$page"
        $destDir = Split-Path $dest -Parent
        if (!(Test-Path $destDir) -and $destDir -ne $backupDir) {
            New-Item -Path $destDir -ItemType Directory -Force | Out-Null
        }
        
        # Move the folder
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "✅ Moved: $page" -ForegroundColor Green
    } else {
        Write-Host "❌ Not found: $page" -ForegroundColor Red
    }
}

Write-Host "`n✅ Backup complete! Unused pages moved to: $backupDir" -ForegroundColor Green
Write-Host "`n📝 To restore if needed:" -ForegroundColor Yellow
Write-Host "   Copy-Item -Path `"$backupDir\*`" -Destination `"src\app\`" -Recurse -Force" -ForegroundColor White
