import models from '../../models/index.js';
import { Op } from 'sequelize';

const { Inasistencia, Estudiante, Curso } = models;

const BUSINESS_DAYS_BACK = 2;

function isBusinessDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function countBusinessDaysBack(date) {
  let count = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  while (cursor > target) {
    cursor.setDate(cursor.getDate() - 1);
    if (isBusinessDay(cursor)) count++;
  }
  return count;
}

function validateDateWindow(fecha) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(fecha);
  target.setHours(0, 0, 0, 0);

  if (target > today) {
    return { valid: false, error: 'No se pueden registrar inasistencias en el futuro' };
  }

  const daysBack = countBusinessDaysBack(target);
  if (daysBack > BUSINESS_DAYS_BACK) {
    return { valid: false, error: `Solo se pueden cargar inasistencias de hasta ${BUSINESS_DAYS_BACK} días hábiles atrás` };
  }

  return { valid: true };
}

export async function registerAbsences({ estudiante_ids, fecha, registrado_por, curso_id }) {
  const validation = validateDateWindow(fecha);
  if (!validation.valid) throw new Error(validation.error);

  const created = [];
  const skipped = [];

  for (const estudiante_id of estudiante_ids) {
    const [record, createdNew] = await Inasistencia.findOrCreate({
      where: { estudiante_id, fecha },
      defaults: { estudiante_id, fecha, registrado_por },
    });
    if (createdNew) created.push(record);
    else skipped.push(estudiante_id);
  }

  return { created, skipped };
}

export async function getAbsencesByStudent(studentId) {
  const student = await Estudiante.findByPk(studentId, {
    include: [{ model: Curso, attributes: ['nombre', 'anio', 'division'] }],
  });
  if (!student) throw new Error('Estudiante no encontrado');

  const absences = await Inasistencia.findAll({
    where: { estudiante_id: studentId },
    order: [['fecha', 'DESC']],
  });

  const total = absences.length;
  const justified = absences.filter(a => a.justificada).length;
  const unjustified = total - justified;

  // Estimate total classes year-to-date (Apr-Dec ~36 weeks, 5 days/week = 180)
  // In production this should come from a clases_dictadas table
  const estimatedTotalClasses = 180;
  const percentage = estimatedTotalClasses > 0
    ? Number(((total / estimatedTotalClasses) * 100).toFixed(1))
    : 0;
  const atRisk = percentage > 20;

  return {
    student: {
      id: student.id,
      nombre: student.nombre,
      apellido: student.apellido,
      dni: student.dni,
      curso: student.Curso ? `${student.Curso.nombre} ${student.Curso.anio}${student.Curso.division}` : null,
    },
    summary: { total, justified, unjustified, percentage, atRisk },
    absences,
  };
}

export async function getAbsencesByCourse(courseId, fecha) {
  const dateFilter = fecha || new Date().toISOString().split('T')[0];

  const students = await Estudiante.findAll({
    where: { curso_id: courseId },
    include: [{
      model: Inasistencia,
      where: { fecha: dateFilter },
      required: false,
    }],
    order: [['apellido', 'ASC']],
  });

  return students.map(s => ({
    id: s.id,
    nombre: s.nombre,
    apellido: s.apellido,
    dni: s.dni,
    ausente: s.Inasistencias && s.Inasistencias.length > 0,
    justificada: s.Inasistencias?.[0]?.justificada || false,
    inasistencia_id: s.Inasistencias?.[0]?.id || null,
  }));
}

export async function updateAbsence(id, data, modificado_por) {
  const absence = await Inasistencia.findByPk(id);
  if (!absence) throw new Error('Inasistencia no encontrada');

  if (data.fecha) {
    const validation = validateDateWindow(data.fecha);
    if (!validation.valid) throw new Error(validation.error);
  }

  absence.modificado_por = modificado_por;
  if (data.justificada !== undefined) absence.justificada = data.justificada;
  if (data.fecha) absence.fecha = data.fecha;

  await absence.save();
  return absence;
}

export async function markAsJustified(id, certificado_id, modificado_por) {
  const absence = await Inasistencia.findByPk(id);
  if (!absence) throw new Error('Inasistencia no encontrada');

  absence.justificada = true;
  if (certificado_id) absence.certificado_id = certificado_id;
  absence.modificado_por = modificado_por;

  await absence.save();
  return absence;
}

export async function getStudentsAtRisk(thresholdPercent = 20) {
  const students = await Estudiante.findAll({
    include: [{ model: Curso, attributes: ['nombre', 'anio', 'division'] }],
  });

  const estimatedTotalClasses = 180;
  const result = [];

  for (const student of students) {
    const count = await Inasistencia.count({
      where: { estudiante_id: student.id },
    });
    const percentage = Number(((count / estimatedTotalClasses) * 100).toFixed(1));
    if (percentage > thresholdPercent) {
      result.push({
        id: student.id,
        nombre: student.nombre,
        apellido: student.apellido,
        dni: student.dni,
        curso: student.Curso ? `${student.Curso.nombre} ${student.Curso.anio}${student.Curso.division}` : null,
        total_ausencias: count,
        percentage,
      });
    }
  }

  return result.sort((a, b) => b.percentage - a.percentage);
}

export async function getMonthlyReport(studentId, year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const absences = await Inasistencia.findAll({
    where: {
      estudiante_id: studentId,
      fecha: { [Op.between]: [startDate, endDate] },
    },
    order: [['fecha', 'ASC']],
  });

  return {
    month,
    year,
    total: absences.length,
    justified: absences.filter(a => a.justificada).length,
    unjustified: absences.filter(a => !a.justificada).length,
    absences,
  };
}
