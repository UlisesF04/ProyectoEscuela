import models from '../../models/index.js';
import { Op, fn, col, literal } from 'sequelize';

const { Estudiante, Curso, Inasistencia, Calificacion, Materia, Tarea, EntregaTarea, Tutor } = models;

const ESTIMATED_CLASSES = 180;

function mesKey(fecha) {
  const d = new Date(fecha);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Helpers ───

async function getStudentOrFail(studentId) {
  const student = await Estudiante.findByPk(studentId, {
    include: [{ model: Curso, attributes: ['nombre', 'anio', 'division'] }],
  });
  if (!student) throw new Error('Estudiante no encontrado');
  return student;
}

async function getAbsenceAnalytics(studentId) {
  const absences = await Inasistencia.findAll({
    where: { estudiante_id: studentId },
    order: [['fecha', 'ASC']],
  });

  const total = absences.length;
  const justificadas = absences.filter(a => a.justificada).length;
  const noJustificadas = total - justificadas;

  // Monthly breakdown
  const monthlyMap = {};
  for (const a of absences) {
    const key = mesKey(a.fecha);
    if (!monthlyMap[key]) monthlyMap[key] = { mes: key, total: 0, justificadas: 0, no_justificadas: 0 };
    monthlyMap[key].total++;
    if (a.justificada) {
      monthlyMap[key].justificadas++;
    } else {
      monthlyMap[key].no_justificadas++;
    }
  }

  const evolucionMensual = Object.values(monthlyMap).sort((a, b) => a.mes.localeCompare(b.mes));

  // Alerts
  const alertas = [];
  const porcentaje = total > 0 ? Number(((total / ESTIMATED_CLASSES) * 100).toFixed(1)) : 0;

  // RN-01: 3+ inasistencias en un mismo mes
  for (const mes of evolucionMensual) {
    if (mes.no_justificadas >= 3) {
      alertas.push({
        tipo: 'RN-01',
        descripcion: `${mes.no_justificadas} inasistencias no justificadas en ${mes.mes}`,
        mes: mes.mes,
      });
    }
  }

  // RN-02: >20% ausencias
  if (porcentaje > 20) {
    alertas.push({
      tipo: 'RN-02',
      descripcion: `${porcentaje}% de ausencias acumuladas (umbral: 20%)`,
      porcentaje,
    });
  }

  return {
    total,
    justificadas,
    no_justificadas: noJustificadas,
    porcentaje,
    evolucion_mensual: evolucionMensual,
    alertas,
  };
}

async function getGradeAnalytics(studentId) {
  const grades = await Calificacion.findAll({
    where: { estudiante_id: studentId },
    include: [{ model: Materia, as: 'Materium', attributes: ['nombre'] }],
    order: [['fecha', 'ASC']],
  });

  const total = grades.length;
  const todasLasNotas = grades.map(g => g.nota);
  const promedioGeneral = total > 0
    ? Number((todasLasNotas.reduce((a, b) => a + b, 0) / total).toFixed(1))
    : null;

  // By subject
  const bySubject = {};
  for (const g of grades) {
    const subj = g.Materium?.nombre || 'N/A';
    if (!bySubject[subj]) bySubject[subj] = [];
    bySubject[subj].push(g);
  }

  const materias = Object.entries(bySubject).map(([nombre, notas]) => {
    const vals = notas.map(n => n.nota);
    return {
      materia: nombre,
      promedio: Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)),
      cantidad_notas: vals.length,
      criticas: vals.filter(n => n <= 4).length,
      evolucion: notas.map(n => ({
        fecha: n.fecha,
        nota: n.nota,
        periodo: n.periodo,
      })),
    };
  });

  // Alerts
  const alertas = [];

  // RN-04: nota crítica (≤4)
  const criticas = grades.filter(g => g.nota <= 4);
  for (const c of criticas) {
    alertas.push({
      tipo: 'RN-04',
      descripcion: `Nota ${c.nota} en ${c.Materium?.nombre || 'N/A'} (${c.fecha})`,
      materia: c.Materium?.nombre || 'N/A',
      nota: c.nota,
      fecha: c.fecha,
    });
  }

  // RN-05: promedio general < 6
  if (promedioGeneral !== null && promedioGeneral < 6) {
    alertas.push({
      tipo: 'RN-05',
      descripcion: `Promedio general ${promedioGeneral} por debajo del umbral (6)`,
      promedio_general: promedioGeneral,
    });
  }

  return {
    total_calificaciones: total,
    promedio_general: promedioGeneral,
    materias,
    alertas,
  };
}

async function getTaskAnalytics(studentId) {
  const pendingCount = await EntregaTarea.count({
    where: { estudiante_id: studentId, entregada: false },
  });

  return {
    tareas_pendientes: pendingCount,
  };
}

// ─── Main analytics endpoint ───

export async function getFullAnalytics(studentId) {
  const student = await getStudentOrFail(studentId);

  const [absences, grades, tasks] = await Promise.all([
    getAbsenceAnalytics(studentId),
    getGradeAnalytics(studentId),
    getTaskAnalytics(studentId),
  ]);

  return {
    estudiante: {
      id: student.id,
      nombre: student.nombre,
      apellido: student.apellido,
      dni: student.dni,
      curso: student.Curso ? `${student.Curso.nombre} ${student.Curso.anio}${student.Curso.division}` : null,
    },
    inasistencias: absences,
    calificaciones: grades,
    tareas: tasks,
    resumen_alertas: {
      total: absences.alertas.length + grades.alertas.length,
      items: [...absences.alertas, ...grades.alertas],
    },
  };
}

export async function getAbsenceAnalyticsOnly(studentId) {
  await getStudentOrFail(studentId);
  const absences = await getAbsenceAnalytics(studentId);
  return absences;
}

export async function getGradeAnalyticsOnly(studentId) {
  await getStudentOrFail(studentId);
  const grades = await getGradeAnalytics(studentId);
  return grades;
}
