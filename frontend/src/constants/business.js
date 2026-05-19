// =============================================================================
// Business Rules — single source of truth
// All magic numbers in business logic should be imported from here.
// =============================================================================

// ─── Grade thresholds ───────────────────────────────────────────────────────
export const MIN_PASSING_GRADE  = 6    // promedio < 6 → bajo rendimiento
export const CRITICAL_GRADE     = 4    // notas ≤ 4 → críticas
export const GRADE_MIN          = 1    // valor mínimo de nota
export const GRADE_MAX          = 10   // valor máximo de nota
export const GRADE_STEP         = 0.5  // incremento permitido
export const LOW_AVERAGE_UMBRAL = 6    // umbral enviado al backend para promedios bajos

// ─── Absence thresholds ─────────────────────────────────────────────────────
export const MONTHLY_UNEXCUSED_ALERT = 3  // ≥3 injustificadas en un mes → alerta
export const HIGH_ABSENCE_THRESHOLD  = 5  // >5 ausencias totales → marca alumno

// ─── Task / tracking ────────────────────────────────────────────────────────
export const CONSECUTIVE_PENDING_ALERT = 2  // ≥2 tareas pendientes consecutivas → alerta

// ─── License / leave ────────────────────────────────────────────────────────
export const LOW_LICENSE_DAYS = 3  // ≤3 días restantes → alerta visual

// ─── Display / slice limits ─────────────────────────────────────────────────
export const RECENT_TASKS_LIMIT       = 5  // tareas recientes en dashboard
export const TOP_ABSENTEES_LIMIT      = 6  // top alumnos con más ausencias
export const CRITICAL_GRADES_LIMIT    = 5  // notas críticas mostradas
export const LOW_AVERAGE_LIMIT        = 5  // promedios bajos mostrados

// ─── Chart / Analytics ──────────────────────────────────────────────────────
export const MIN_CHART_DATA_POINTS = 2  // mínimo de puntos para graficar
export const CHART_SVG_WIDTH       = 100
export const CHART_SVG_HEIGHT      = 100

// ─── Academic periods ───────────────────────────────────────────────────────
export const ACADEMIC_PERIODS = [
  { value: 1, label: 'Trimestre 1' },
  { value: 2, label: 'Trimestre 2' },
  { value: 3, label: 'Trimestre 3' },
]
export const TOTAL_PERIODS = 3

// ─── Time ───────────────────────────────────────────────────────────────────
export const MS_PER_DAY = 1000 * 60 * 60 * 24

// ─── API ────────────────────────────────────────────────────────────────────
export const API_BASE_URL = 'http://localhost:5000/api'
