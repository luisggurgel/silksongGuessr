$mongodPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$dataDir = "$PSScriptRoot\..\data_backup"
$resolvedDataDir = Resolve-Path $dataDir

if (-not (Test-Path $mongodPath)) {
    Write-Host "Error: mongod.exe not found at $mongodPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $resolvedDataDir)) {
    Write-Host "Error: Data directory not found at $resolvedDataDir" -ForegroundColor Red
    exit 1
}

Write-Host "Starting MongoDB..." -ForegroundColor Green
Write-Host "Data Directory: $resolvedDataDir"
Write-Host "Log File: $resolvedDataDir\mongod.log"

& $mongodPath --dbpath $resolvedDataDir --bind_ip 127.0.0.1 --port 27017
