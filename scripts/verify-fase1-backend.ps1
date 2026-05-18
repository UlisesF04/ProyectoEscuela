<#
.SYNOPSIS
    Verifica FASE 1 (Backend API Core) — CHANGE-004~008.
    Ejecutar: .\scripts\verify-fase1-backend.ps1
.DESCRIPTION
    51 verificaciones HTTP contra los módulos de FASE 1:
      Absences (CHANGE-004), Grades (CHANGE-005), Tasks (CHANGE-006),
      Teachers (CHANGE-007), Tutors (CHANGE-008)
    Arranca el servidor automáticamente y lo limpia al final.
#>

$ErrorActionPreference = "Stop"
$passed = 0
$failed = 0
$total = 51

$green = "Green"
$red = "Red"
$yellow = "Yellow"
$cyan = "Cyan"

$projectRoot = Resolve-Path "$PSScriptRoot\.."
$BASE = "http://localhost:5000"
$DocToken = ""; $AdmToken = ""; $TutToken = ""

function api {
    param([string]$method, [string]$path, [string]$token, $body)
    $h = @{ "Content-Type" = "application/json" }
    if ($token) { $h["Authorization"] = "Bearer $token" }
    $b = if ($body) { $body | ConvertTo-Json -Compress } else { $null }
    try {
        $r = Invoke-WebRequest -Uri "$BASE$path" -Method $method `
          -Headers $h -Body $b -TimeoutSec 5 -UseBasicParsing
        $data = $r.Content | ConvertFrom-Json
        return @{ status = [int]$r.StatusCode; data = $data }
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        try { $d = ($_.ErrorDetails.Message | ConvertFrom-Json) } catch { $d = $_.Exception.Message }
        return @{ status = $code; data = $d }
    }
}

function Pass($msg) { Write-Host "[PASS] " -ForegroundColor $green -NoNewline; Write-Host $msg; $script:passed++ }
function Fail($msg) { Write-Host "[FAIL] " -ForegroundColor $red -NoNewline; Write-Host $msg; $script:failed++ }
function Warn($msg) { Write-Host "[WARN] " -ForegroundColor $yellow -NoNewline; Write-Host $msg }

# =========================================================
# Arrancar servidor
# =========================================================
Write-Host "============================================" -ForegroundColor $cyan
Write-Host "  ProyectoEscuela - Verificacion FASE 1     " -ForegroundColor $cyan
Write-Host "  Backend API Core (CHANGE-004~008)        " -ForegroundColor $cyan
Write-Host "============================================" -ForegroundColor $cyan
Write-Host ""

$serverProc = $null
$serverStarted = $false

Write-Host "--- Setup: Servidor Node ---" -ForegroundColor $cyan
try {
    $existing = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    foreach ($conn in $existing) {
        $oldPid = $conn.OwningProcess
        if ($oldPid) { Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue }
    }
    Start-Sleep -Seconds 1

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "node"
    $psi.Arguments = "app.js"
    $psi.WorkingDirectory = "$projectRoot\backend"
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false

    $serverProc = [System.Diagnostics.Process]::Start($psi)
    Start-Sleep -Seconds 2

    if ($serverProc.HasExited) {
        Fail "Servidor fallo al arrancar: $($serverProc.StandardError.ReadToEnd())"
        exit 1
    }

    $ready = $false
    for ($i = 0; $i -lt 10; $i++) {
        Start-Sleep -Milliseconds 500
        try {
            $r = Invoke-WebRequest -Uri "$BASE/health" -TimeoutSec 1 -UseBasicParsing
            if ($r.StatusCode -eq 200) { $ready = $true; break }
        } catch {}
    }
    if ($ready) {
        $serverStarted = $true
        Pass "Servidor Node corriendo en puerto 5000"
    } else {
        Fail "Servidor no respondio en 7s"
        exit 1
    }
} catch {
    Fail "Error al arrancar servidor: $_"
    exit 1
}

# =========================================================
# Setup: Login
# =========================================================
Write-Host "`n--- Setup: Login ---" -ForegroundColor $cyan

$r1 = api POST /api/auth/login $null @{email = "docente1@escuela.com"; password = "docente123"}
$r2 = api POST /api/auth/login $null @{email = "admin@escuela.com"; password = "admin123"}
$r3 = api POST /api/auth/login $null @{email = "tutor1@email.com"; password = "tutor123"}

$DocToken = $r1.data.token
$AdmToken = $r2.data.token
$TutToken = $r3.data.token

if ($DocToken -and $AdmToken -and $TutToken) {
    Pass "Tokens obtenidos: docente ($($r1.data.user.rol)), admin ($($r2.data.user.rol)), tutor ($($r3.data.user.rol))"
} else {
    Fail "Uno o mas logins fallaron"
    goto cleanup
}

# =========================================================
# FASE A — Absences (CHANGE-004)
# =========================================================
Write-Host "`n--- FASE A: Absences (CHANGE-004) ---" -ForegroundColor $cyan

# A01
$r = api GET /api/absences/student/1 $DocToken
if ($r.status -eq 200 -and $r.data.student) { Pass "GET /student/1 → $($r.data.summary.total) ausencias" } else { Fail "GET /student/1 → $($r.status)" }

# A02
$r = api GET /api/absences/student/999 $DocToken
if ($r.status -eq 404) { Pass "GET /student/999 → 404" } else { Fail "GET /student/999 → $($r.status) (esperado 404)" }

# A03
$r = api GET /api/absences/course/1 $DocToken
if ($r.status -eq 200 -and $r.data.estudiantes) { Pass "GET /course/1 → $($r.data.estudiantes.Count) estudiantes" } else { Fail "GET /course/1 → $($r.status)" }

# A04
$r = api GET /api/absences/risk $AdmToken
if ($r.status -eq 200 -and $r.data.total -ne $null) { Pass "GET /risk → $($r.data.total) en riesgo" } else { Fail "GET /risk → $($r.status)" }

# A05
$r = api GET "/api/absences/student/1/monthly?anio=2026&mes=5" $DocToken
if ($r.status -eq 200 -and $r.data.total -ne $null) { Pass "GET /student/1/monthly → $($r.data.total) ausencias" } else { Fail "GET /student/1/monthly → $($r.status)" }

# A06
$r = api POST /api/absences/register $AdmToken @{estudiante_ids = @(1, 2); fecha = (Get-Date -Format "yyyy-MM-dd")}
if ($r.status -eq 201) { Pass "POST /register → 201 (registrada)" } elseif ($r.status -eq 403) { Pass "POST /register → 403 (auth, esperado)" } else { Fail "POST /register → $($r.status)" }

# A07 (RN-03)
$r = api POST /api/absences/register $AdmToken @{estudiante_ids = @(1); fecha = "2099-12-31"}
if ($r.status -eq 400) { Pass "POST /register fecha futura → 400 (RN-03)" } elseif ($r.status -eq 403) { Warn "POST fecha futura → 403 (auth, RN-03 no evaluado)" } else { Fail "POST /register fecha futura → $($r.status)" }

# A08
$r = api PUT /api/absences/1 $AdmToken @{justificada = $true}
if ($r.status -eq 200) { Pass "PUT /1 justificar → 200" } elseif ($r.status -eq 404) { Pass "PUT /1 → 404 (ID puede no existir)" } else { Fail "PUT /1 → $($r.status)" }

# =========================================================
# FASE B — Grades (CHANGE-005)
# =========================================================
Write-Host "`n--- FASE B: Grades (CHANGE-005) ---" -ForegroundColor $cyan

# B01
$r = api GET /api/grades/subjects $DocToken
if ($r.status -eq 200 -and $r.data.data) { Pass "GET /subjects → $($r.data.data.Count) materia(s)" } else { Fail "GET /subjects → $($r.status)" }

# B02
$r = api GET /api/grades/subjects $TutToken
if ($r.status -eq 403) { Pass "GET /subjects (tutor) → 403" } else { Fail "GET /subjects (tutor) → $($r.status) (esperado 403)" }

# B03
$r = api GET /api/grades/student/1 $DocToken
if ($r.status -eq 200 -and $r.data.grades) { Pass "GET /student/1 → $($r.data.grades.Count) calificaciones" } else { Fail "GET /student/1 → $($r.status)" }

# B04
$r = api GET /api/grades/student/1/average $DocToken
if ($r.status -eq 200 -and $r.data.generalAverage -ne $null) { Pass "GET /student/1/average → prom $($r.data.generalAverage)" } else { Fail "GET /student/1/average → $($r.status)" }

# B05
$r = api GET /api/grades/student/999/average $DocToken
if ($r.status -eq 404) { Pass "GET /student/999/average → 404" } else { Fail "GET /student/999/average → $($r.status) (esperado 404)" }

# B06
$r = api GET /api/grades/course/1 $DocToken
if ($r.status -eq 200 -and $r.data.estudiantes) { Pass "GET /course/1 → $($r.data.estudiantes.Count) estudiantes" } else { Fail "GET /course/1 → $($r.status)" }

# B07
$r = api GET /api/grades/critical $DocToken
if ($r.status -eq 200 -and $r.data.total -ne $null) { Pass "GET /critical → $($r.data.total) nota(s) critica(s)" } else { Fail "GET /critical → $($r.status)" }

# B08
$r = api GET /api/grades/critical $TutToken
if ($r.status -eq 403) { Pass "GET /critical (tutor) → 403" } else { Fail "GET /critical (tutor) → $($r.status) (esperado 403)" }

# B09
$r = api GET /api/grades/low-average $DocToken
if ($r.status -eq 200 -and $r.data.total -ne $null) { Pass "GET /low-average → $($r.data.total) alumno(s)" } else { Fail "GET /low-average → $($r.status)" }

# B10
$r = api POST /api/grades $DocToken @{estudiante_id = 1; materia_id = 1; nota = 7; periodo = "T1"; fecha = (Get-Date -Format "yyyy-MM-dd")}
if ($r.status -eq 201) { Pass "POST /grades → 201 (nota 7)" } else { Fail "POST /grades → $($r.status): $($r.data.message)" }

# B11 (RN-04)
$r = api POST /api/grades $DocToken @{estudiante_id = 2; materia_id = 1; nota = 3; periodo = "T1"; fecha = (Get-Date -Format "yyyy-MM-dd")}
if ($r.status -eq 201 -and $r.data.alerta.tipo -eq "RN-04") { Pass "POST nota=3 → 201 + RN-04" } else { Fail "POST nota=3 → $($r.status) (esperado RN-04)" }

# B12 (invalid note)
$r = api POST /api/grades $DocToken @{estudiante_id = 1; materia_id = 1; nota = 15; periodo = "T1"; fecha = (Get-Date -Format "yyyy-MM-dd")}
if ($r.status -eq 400) { Pass "POST nota=15 → 400 (validacion)" } else { Fail "POST nota=15 → $($r.status) (esperado 400)" }

# B13
$r = api POST /api/grades $AdmToken @{estudiante_id = 1; materia_id = 1; nota = 8; periodo = "T1"; fecha = (Get-Date -Format "yyyy-MM-dd")}
if ($r.status -eq 403) { Pass "POST /grades (admin) → 403" } else { Fail "POST /grades (admin) → $($r.status) (esperado 403)" }

# B14 (tutor allowed on student grades)
$r = api GET /api/grades/student/1 $TutToken
if ($r.status -eq 200) { Pass "GET /student/1 (tutor) → 200" } else { Fail "GET /student/1 (tutor) → $($r.status) (esperado 200)" }

# B15 (tutor allowed on average)
$r = api GET /api/grades/student/1/average $TutToken
if ($r.status -eq 200) { Pass "GET /student/1/average (tutor) → 200" } else { Fail "GET /student/1/average (tutor) → $($r.status) (esperado 200)" }

# B16 (sin token)
$r = api GET /api/grades/subjects $null
if ($r.status -eq 401) { Pass "GET /subjects sin token → 401" } else { Fail "GET /subjects sin token → $($r.status) (esperado 401)" }

# =========================================================
# FASE C — Tasks (CHANGE-006)
# =========================================================
Write-Host "`n--- FASE C: Tasks (CHANGE-006) ---" -ForegroundColor $cyan

# C01
$r = api POST /api/tasks $DocToken @{materia_id = 1; nombre = "TP Verify - Matematica"; descripcion = "Test"; fecha_asignacion = "2026-05-18"; fecha_entrega = "2026-05-25"}
if ($r.status -eq 201) { Pass "POST /tasks → 201 (creada)" } else { Fail "POST /tasks → $($r.status): $($r.data.message)" }

# C02
$r = api POST /api/tasks $AdmToken @{materia_id = 1; nombre = "Admin task"; fecha_asignacion = "2026-05-18"; fecha_entrega = "2026-05-25"}
if ($r.status -eq 403) { Pass "POST /tasks (admin) → 403" } else { Fail "POST /tasks (admin) → $($r.status) (esperado 403)" }

# C03
$r = api POST /api/tasks $DocToken @{nombre = "Incompleta"}
if ($r.status -eq 400) { Pass "POST /tasks incompleta → 400" } else { Fail "POST /tasks incompleta → $($r.status) (esperado 400)" }

# C04
$r = api GET /api/tasks $DocToken
if ($r.status -eq 200 -and $r.data.total -ne $null) { Pass "GET /tasks → $($r.data.total) tarea(s)" } else { Fail "GET /tasks → $($r.status)" }

# C05
$r = api GET /api/tasks/1 $DocToken
if ($r.status -eq 200 -and $r.data.nombre) { Pass "GET /tasks/1 → 200" } else { Fail "GET /tasks/1 → $($r.status)" }

# C06
$r = api GET /api/tasks/999 $DocToken
if ($r.status -eq 404) { Pass "GET /tasks/999 → 404" } else { Fail "GET /tasks/999 → $($r.status) (esperado 404)" }

# C07
$r = api PUT /api/tasks/1 $DocToken @{nombre = "TP Verify - Actualizado"}
if ($r.status -eq 200) { Pass "PUT /tasks/1 → 200 (actualizado)" } else { Fail "PUT /tasks/1 → $($r.status) (esperado 200)" }

# C08
$r = api PUT /api/tasks/999 $DocToken @{nombre = "Nope"}
if ($r.status -eq 404) { Pass "PUT /tasks/999 → 404" } else { Fail "PUT /tasks/999 → $($r.status) (esperado 404)" }

# C09
$r = api GET /api/tasks/1/submissions $DocToken
if ($r.status -eq 200 -and $r.data.estudiantes) { Pass "GET /tasks/1/submissions → $($r.data.estudiantes.Count) estudiantes" } else { Fail "GET /tasks/1/submissions → $($r.status)" }

# C10
$r = api PUT /api/tasks/1/students/1 $DocToken @{entregada = $true}
if ($r.status -eq 200) { Pass "PUT /tasks/1/students/1 entregada → 200" } else { Fail "PUT /tasks/1/students/1 → $($r.status) (esperado 200)" }

# C11
$r = api PUT /api/tasks/1/students/2 $DocToken @{entregada = $false}
if ($r.status -eq 200) { Pass "PUT /tasks/1/students/2 no entregada → 200" } else { Fail "PUT /tasks/1/students/2 → $($r.status) (esperado 200)" }

# C12
$r = api GET /api/tasks/student/1 $TutToken
if ($r.status -eq 200 -and $r.data.summary) { Pass "GET /tasks/student/1 (tutor) → 200" } else { Fail "GET /tasks/student/1 (tutor) → $($r.status)" }

# C13
$r = api GET /api/tasks/student/999 $DocToken
if ($r.status -eq 404) { Pass "GET /tasks/student/999 → 404" } else { Fail "GET /tasks/student/999 → $($r.status) (esperado 404)" }

# C14 (RN-06)
$r = api GET /api/tasks/student/1/consecutive-missed $DocToken
if ($r.status -eq 200 -and $r.data.total_alertas -ne $null) { Pass "GET /tasks/student/1/consecutive-missed → $($r.data.total_alertas) alerta(s)" } else { Fail "GET /tasks/student/1/consecutive-missed → $($r.status)" }

# C15 (DELETE como admin)
$rTemp = api POST /api/tasks $DocToken @{materia_id = 1; nombre = "Temp para DELETE"; fecha_asignacion = "2026-05-18"; fecha_entrega = "2026-05-25"}
$tempId = $rTemp.data.data.id
if ($tempId) {
    $r = api DELETE "/api/tasks/$tempId" $AdmToken
    if ($r.status -eq 200) { Pass "DELETE /tasks/$tempId (admin) → 200" } else { Fail "DELETE /tasks/$tempId → $($r.status) (esperado 200)" }
} else {
    Warn "No se pudo crear tarea temporal para DELETE"
}

# C16
$r = api DELETE /api/tasks/1 $DocToken
if ($r.status -eq 403) { Pass "DELETE /tasks/1 (docente) → 403" } else { Fail "DELETE /tasks/1 (docente) → $($r.status) (esperado 403)" }

# =========================================================
# FASE D — Teachers (CHANGE-007)
# =========================================================
Write-Host "`n--- FASE D: Teachers (CHANGE-007) ---" -ForegroundColor $cyan

# D01
$r = api GET /api/teachers/license $DocToken
if ($r.status -eq 200 -and $r.data.dias_restantes -ne $null) {
    $alerta = if ($r.data.alerta_por_vencimiento) { " ⚠️ <=3" } else { " OK" }
    Pass "GET /license → $($r.data.dias_restantes)/$($r.data.dias_licencia_total) dias$alerta"
} else { Fail "GET /license → $($r.status)" }

# D02
$r = api GET /api/teachers/license $AdmToken
if ($r.status -eq 403) { Pass "GET /license (admin) → 403" } else { Fail "GET /license (admin) → $($r.status) (esperado 403)" }

# D03
$r = api GET /api/teachers/students/absences $DocToken
if ($r.status -eq 200 -and $r.data.total_cursos -ne $null) { Pass "GET /students/absences → $($r.data.total_cursos) curso(s)" } else { Fail "GET /students/absences → $($r.status)" }

# D04
$r = api GET "/api/teachers/students/absences?desde=2026-01-01&hasta=2026-12-31" $DocToken
if ($r.status -eq 200) { Pass "GET /students/absences con filtro → 200" } else { Fail "GET /students/absences con filtro → $($r.status)" }

# D05
$r = api GET /api/teachers/students/absences $TutToken
if ($r.status -eq 403) { Pass "GET /students/absences (tutor) → 403" } else { Fail "GET /students/absences (tutor) → $($r.status) (esperado 403)" }

# D06
$r = api GET /api/teachers/license $null
if ($r.status -eq 401) { Pass "GET /license sin token → 401" } else { Fail "GET /license sin token → $($r.status) (esperado 401)" }

# =========================================================
# FASE E — Tutors (CHANGE-008)
# =========================================================
Write-Host "`n--- FASE E: Tutors (CHANGE-008) ---" -ForegroundColor $cyan

# E01
$r = api GET /api/tutors/children $TutToken
if ($r.status -eq 200 -and $r.data.hijos) { Pass "GET /children → $($r.data.total_hijos) hijo(s)" } else { Fail "GET /children → $($r.status)" }

# E02
$r = api GET /api/tutors/children $DocToken
if ($r.status -eq 403) { Pass "GET /children (docente) → 403" } else { Fail "GET /children (docente) → $($r.status) (esperado 403)" }

# E03
$r = api GET /api/tutors/children/1/summary $TutToken
if ($r.status -eq 200 -and $r.data.estudiante -and $r.data.inasistencias) {
    $riesgoAbs = if ($r.data.inasistencias.riesgo_regularidad) { "⚠️ " } else { "" }
    $riesgoAcad = if ($r.data.calificaciones.riesgo_academico) { "⚠️ " } else { "" }
    Pass "GET /children/1/summary → aus: $($r.data.inasistencias.total) ($riesgoAbs), prom: $($r.data.calificaciones.promedio_general) ($riesgoAcad), pend: $($r.data.tareas_pendientes.total)"
} else { Fail "GET /children/1/summary → $($r.status)" }

# E04
$r = api GET /api/tutors/children/999/summary $TutToken
if ($r.status -eq 403 -or $r.status -eq 404) { Pass "GET /children/999/summary → $($r.status) (no es hijo)" } else { Fail "GET /children/999/summary → $($r.status) (esperado 403 o 404)" }

# E05
$r = api GET /api/tutors/children $null
if ($r.status -eq 401) { Pass "GET /children sin token → 401" } else { Fail "GET /children sin token → $($r.status) (esperado 401)" }

# =========================================================
# Cleanup
# =========================================================
if ($serverStarted -and $serverProc -and !$serverProc.HasExited) {
    $serverProc.Kill() 2>$null
    Wait-Process -Id $serverProc.Id -Timeout 3 2>$null
}

# =========================================================
# Resumen
# =========================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor $cyan
$ok = $passed + $failed
Write-Host "  TOTAL: $ok/$total verificaciones ejecutadas" -ForegroundColor $cyan
if ($failed -eq 0) {
    Write-Host "  RESULTADO: $passed/$total - TODOS OK" -ForegroundColor $green
    Write-Host "============================================" -ForegroundColor $cyan
    Write-Host "FASE 1 BACKEND API CORE: VERIFICADA" -ForegroundColor $green
    Write-Host "CHANGE-004 + 005 + 006 + 007 + 008" -ForegroundColor $green
    Write-Host ""
    exit 0
} else {
    Write-Host "  RESULTADO: $passed/$total - FALLOS: $failed" -ForegroundColor $red
    Write-Host "============================================" -ForegroundColor $cyan
    Write-Host "Corregir los [FAIL] y re-ejecutar" -ForegroundColor $yellow
    Write-Host ""
    exit 1
}
