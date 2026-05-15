<#
.SYNOPSIS
    Verifica CHANGE-001 (database-schema) implementado correctamente.
    Ejecutar: .\scripts\verify-db.ps1
.DESCRIPTION
    6 verificaciones: PostgreSQL, tablas, seed data, servidor Node, health, models
    Lee credenciales DB desde backend/.env
#>

$ErrorActionPreference = "Stop"
$passed = 0
$failed = 0
$total = 6

$green = "Green"
$red = "Red"
$yellow = "Yellow"
$cyan = "Cyan"

$projectRoot = Resolve-Path "$PSScriptRoot\.."
$envFile = "$projectRoot\backend\.env"

# --- Leer .env ---
$dbUser = "postgres"
$dbPass = ""
$dbName = "proyecto_escuela"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^DB_USER=(.+)') { $dbUser = $matches[1] }
        if ($_ -match '^DB_PASSWORD=(.+)') { $dbPass = $matches[1] }
        if ($_ -match '^DB_NAME=(.+)') { $dbName = $matches[1] }
    }
}

# --- Auto-detectar psql ---
$psql = "psql"
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\17\bin\psql.exe"
    "C:\Program Files\PostgreSQL\16\bin\psql.exe"
    "C:\Program Files\PostgreSQL\15\bin\psql.exe"
    "C:\Program Files\PostgreSQL\14\bin\psql.exe"
)
foreach ($p in $psqlPaths) {
    if (Test-Path $p) {
        $psql = $p
        break
    }
}

function exec-psql {
    param([string]$query)
    $env:PGPASSWORD = $dbPass
    $result = & $psql -U $dbUser -d $dbName -t -c $query 2>$null
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    return ($result | Out-String).Trim()
}

Write-Host "`n============================================" -ForegroundColor $cyan
Write-Host "  ProyectoEscuela - Verificacion DB Schema   " -ForegroundColor $cyan
Write-Host "============================================" -ForegroundColor $cyan
Write-Host "psql: $psql"
Write-Host "  DB:   $dbName (user: $dbUser)"
Write-Host ""

function Pass {
    param([string]$msg)
    Write-Host "[PASS] " -ForegroundColor $green -NoNewline
    Write-Host $msg
    $script:passed++
}

function Fail {
    param([string]$msg)
    Write-Host "[FAIL] " -ForegroundColor $red -NoNewline
    Write-Host $msg
    $script:failed++
}

function Warn {
    param([string]$msg)
    Write-Host "[WARN] " -ForegroundColor $yellow -NoNewline
    Write-Host $msg
}

# --------------------------------------------------
# 1. Conexion PostgreSQL + DB existe
# --------------------------------------------------
Write-Host "--- 1/$total PostgreSQL ---" -ForegroundColor $cyan

try {
    $result = exec-psql "SELECT 1 AS ok;"
    if ($result -match "1") {
        Pass "PostgreSQL conectado - DB $dbName existe"
    } else {
        Fail "DB $dbName no encontrada"
        Warn "Crear: & `"$psql`" -U $dbUser -c `"CREATE DATABASE $dbName;`""
    }
} catch {
    Fail "No se puede conectar a PostgreSQL"
    Warn "Verificar que PostgreSQL este instalado y el servicio corriendo"
    Warn "Revisar credenciales en backend/.env"
}

# --------------------------------------------------
# 2. Tablas existen
# --------------------------------------------------
Write-Host "--- 2/$total Tablas ---" -ForegroundColor $cyan

try {
    $tables = exec-psql "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name NOT IN ('SequelizeMeta', 'SequelizeMigrationsLock') ORDER BY table_name;"

    $tableList = @($tables -split "`n" | Where-Object { $_ -match '\S' } | ForEach-Object { $_.Trim() })
    $tableCount = $tableList.Count

    if ($tableCount -ge 13) {
        Pass "$tableCount tablas creadas: $($tableList -join ', ')"
    } elseif ($tableCount -gt 0) {
        Warn "Solo $tableCount de 13 tablas: $($tableList -join ', ')"
        Fail "Ejecutar en backend/: npx sequelize-cli db:migrate"
    } else {
        Fail "No hay tablas. Ejecutar en backend/: npx sequelize-cli db:migrate"
    }
} catch {
    Fail "Error al leer tablas: $_"
}

# --------------------------------------------------
# 3. Seed data
# --------------------------------------------------
Write-Host "--- 3/$total Seed data ---" -ForegroundColor $cyan

try {
    $usuarios   = exec-psql "SELECT COUNT(*) FROM usuarios;"
    $estudiantes = exec-psql "SELECT COUNT(*) FROM estudiantes;"
    $docentes   = exec-psql "SELECT COUNT(*) FROM docentes;"
    $cursos     = exec-psql "SELECT COUNT(*) FROM cursos;"
    $tutores    = exec-psql "SELECT COUNT(*) FROM tutores;"
    $materias   = exec-psql "SELECT COUNT(*) FROM materias;"

    $u = [int]$usuarios; $e = [int]$estudiantes; $d = [int]$docentes
    $c = [int]$cursos; $t = [int]$tutores; $m = [int]$materias

    if ($u -ge 5 -and $e -ge 9 -and $d -ge 2) {
        Pass "Seed OK: $u usuarios, $e estudiantes, $d docentes, $c cursos, $t tutores, $m materias"
    } else {
        Warn "Seed: $u usuarios, $e estudiantes, $d docentes, $c cursos, $t tutores, $m materias"
        Fail "Seed incompleta. Ejecutar en backend/: npx sequelize-cli db:seed:all"
    }
} catch {
    Fail "Error al leer seed data: $_"
}

# --------------------------------------------------
# 4. Servidor Node
# --------------------------------------------------
Write-Host "--- 4/$total Servidor Node ---" -ForegroundColor $cyan

$serverStarted = $false
$proc = $null
$serverPath = "$projectRoot\backend"

try {
    # Matar cualquier proceso previo en puerto 5000
    $existing = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    foreach ($conn in $existing) {
        $pid_ = $conn.OwningProcess
        if ($pid_) { Stop-Process -Id $pid_ -Force -ErrorAction SilentlyContinue }
    }
    Start-Sleep -Seconds 1

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "node"
    $psi.Arguments = "app.js"
    $psi.WorkingDirectory = $serverPath
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $psi.EnvironmentVariables["PORT"] = "5000"

    $proc = [System.Diagnostics.Process]::Start($psi)
    Start-Sleep -Seconds 2

    if ($proc.HasExited) {
        $stderr = $proc.StandardError.ReadToEnd()
        Fail "Servidor fallo: $stderr"
    } else {
        $ready = $false
        for ($i = 0; $i -lt 8; $i++) {
            Start-Sleep -Milliseconds 500
            try {
                $r = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 1 -UseBasicParsing
                if ($r.StatusCode -eq 200) {
                    $ready = $true
                    break
                }
            } catch {}
        }
        if ($ready) {
            Pass "Servidor Node corriendo en puerto 5000"
            $serverStarted = $true
        } else {
            Fail "Servidor no respondio en 6s"
        }
    }
} catch {
    Fail "Error al arrancar servidor: $_"
}

# --------------------------------------------------
# 5. Health endpoint
# --------------------------------------------------
Write-Host "--- 5/$total Health endpoint ---" -ForegroundColor $cyan

if ($serverStarted) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 3 -UseBasicParsing
        $body = $response.Content | ConvertFrom-Json
        if ($body.status -eq "ok") {
            Pass "GET /health -> status: ok, database: $($body.database)"
        } else {
            Fail "Health devolvio: $($body.status)"
        }
    } catch {
        Fail "Health no responde: $_"
    }
} else {
    Warn "Salteando - servidor no arranco"
    $script:failed++
}

# --------------------------------------------------
# 6. Models endpoint
# --------------------------------------------------
Write-Host "--- 6/$total Models endpoint ---" -ForegroundColor $cyan

if ($serverStarted) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/models" -TimeoutSec 3 -UseBasicParsing
        $body = $response.Content | ConvertFrom-Json

        if ($body.models -is [array]) {
            $count = ($body.models | Measure-Object).Count
            Pass "GET /api/models -> $count modelos registrados"
        } else {
            Pass "Models endpoint responde correctamente"
        }
    } catch {
        Warn "GET /api/models -> $_ (puede no existir si no se modifico app.js)"
        $script:failed++
    }
} else {
    Warn "Salteando - servidor no arranco"
    $script:failed++
}

# --------------------------------------------------
# Cleanup
# --------------------------------------------------
if ($serverStarted -and $proc -and !$proc.HasExited) {
    $proc.Kill() 2>$null
    Wait-Process -Id $proc.Id -Timeout 3 2>$null
}

# --------------------------------------------------
# Resumen final
# --------------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor $cyan
if ($failed -eq 0) {
    Write-Host "  RESULTADO: $passed/$total - TODOS OK" -ForegroundColor $green
    Write-Host "============================================" -ForegroundColor $cyan
    Write-Host "CHANGE-001: VERIFICADO" -ForegroundColor $green
    exit 0
} else {
    Write-Host "  RESULTADO: $passed/$total - FALLOS: $failed" -ForegroundColor $red
    Write-Host "============================================" -ForegroundColor $cyan
    Write-Host "Corregir los [FAIL] y re-ejecutar" -ForegroundColor $yellow
    exit 1
}
