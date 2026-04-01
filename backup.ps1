param(
    [string]$Description = "",
    [switch]$Quick
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFolder = "backups\$timestamp"

Write-Host "📦 Creating backup..." -ForegroundColor Cyan
Write-Host "   Time: $(Get-Date)" -ForegroundColor Yellow
if ($Description) { Write-Host "   Description: $Description" -ForegroundColor Yellow }

# Create backup folder
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

# 1. Backup Prisma schema
Copy-Item -Path "prisma\schema.prisma" -Destination "$backupFolder\schema.prisma" -Force
Write-Host "  ✅ Schema backed up" -ForegroundColor Green

# 2. Backup environment file (without sensitive data for sharing)
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    # Mask sensitive values for safe sharing
    $envContent = $envContent -replace '(JWT_SECRET=).*', '$1[REDACTED]'
    $envContent = $envContent -replace '(DATABASE_URL=).*', '$1postgresql://user:password@localhost:5432/adrian_cims'
    $envContent | Set-Content -Path "$backupFolder\.env.example" -Encoding UTF8
    Write-Host "  ✅ .env.example created (secrets redacted)" -ForegroundColor Green
}

# 3. Backup key configuration files
$configFiles = @(
    "prisma.config.ts",
    "tailwind.config.js",
    "next.config.ts",
    "tsconfig.json"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination "$backupFolder\$file" -Force
        Write-Host "  ✅ $file backed up" -ForegroundColor Green
    }
}

# 4. Backup package.json and lock file
if (Test-Path "package.json") {
    Copy-Item -Path "package.json" -Destination "$backupFolder\package.json" -Force
    Write-Host "  ✅ package.json backed up" -ForegroundColor Green
}

# 5. Create backup info file
$infoContent = @"
Backup created: $(Get-Date)
Description: $Description
Git Branch: $(git branch --show-current 2>$null)
Last commit: $(git log -1 --pretty=format:"%h - %s" 2>$null)

Working Features at time of backup:
- Customer creation with duplicate checks
- Document upload/download/delete
- Loan creation and payment recording
- Progress rings and animations
- Dark mode support
- Responsive design
"@

$infoContent | Set-Content -Path "$backupFolder\backup-info.txt" -Encoding UTF8
Write-Host "  ✅ Backup info created" -ForegroundColor Green

# 6. Quick mode - skip heavy files
if (-not $Quick) {
    # Backup source code (optional - can be heavy)
    Write-Host "  📁 Backing up source code..." -ForegroundColor Yellow
    $srcBackup = "$backupFolder\src"
    New-Item -ItemType Directory -Path $srcBackup -Force | Out-Null
    
    # Only backup key directories (not node_modules, .next, etc.)
    $srcDirs = @("app", "components", "hooks", "lib", "services")
    foreach ($dir in $srcDirs) {
        $sourcePath = "src\$dir"
        if (Test-Path $sourcePath) {
            Copy-Item -Path $sourcePath -Destination "$srcBackup\" -Recurse -Force
            Write-Host "     ✅ src/$dir backed up" -ForegroundColor Green
        }
    }
}

# Summary
Write-Host ""
Write-Host "🎉 BACKUP COMPLETE!" -ForegroundColor Green
Write-Host "   Location: $backupFolder" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 To restore this backup:" -ForegroundColor Cyan
Write-Host "   1. Copy files from: $backupFolder" -ForegroundColor White
Write-Host "   2. Run: npm install" -ForegroundColor White
Write-Host "   3. Run: npx prisma generate" -ForegroundColor White
Write-Host ""
Write-Host "🔧 To list all backups:" -ForegroundColor Cyan
Write-Host "   ls backups\" -ForegroundColor White
Write-Host ""
Write-Host "🗑️ To restore database from this backup:" -ForegroundColor Cyan
Write-Host "   pg_restore -U postgres -d adrian_cims < backup-file.sql" -ForegroundColor White

# Return the backup folder path
return $backupFolder
