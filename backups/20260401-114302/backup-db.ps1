# Database backup script (PowerShell)
# Requires PostgreSQL installed and in PATH

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "backups\db"
$dbName = "adrian_cims"
$dbUser = "postgres"

# Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force

# Backup database
$backupFile = "$backupDir\$dbName-$timestamp.sql"
& pg_dump -U $dbUser -h localhost $dbName > $backupFile

Write-Host "Database backed up to: $backupFile" -ForegroundColor Green
