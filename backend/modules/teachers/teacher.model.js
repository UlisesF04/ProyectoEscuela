import models from '../../models/index.js';
import { Op } from 'sequelize';

const { Docente, DocenteMateria, Materia, Curso, Estudiante, Inasistencia } = models;

// RN-07: Get teacher's license status — alert when <=3 days remaining
export async function getLicenseInfo(userId) {
  const docente = await Docente.findOne({ where: { usuario_id: userId } });
  if (!docente) throw new Error('Docente no encontrado');

  const disponibles = docente.dias_licencia_total;
  const usados = docente.dias_usados;
  const restantes = disponibles - usados;
  const alerta = restantes <= 3; // RN-07

  return {
    docente_id: docente.id,
    nombre: docente.nombre,
    apellido: docente.apellido,
    dias_licencia_total: disponibles,
    dias_usados: usados,
    dias_restantes: restantes,
    alerta_por_vencimiento: alerta,
    mensaje: alerta
      ? `⚠️ Quedan ${restantes} días de licencia. Solicite renovación.`
      : `Licencias disponibles: ${restantes} día(s)`,
  };
}

// Get students from all courses the teacher teaches, with absence summary
export async function getTeacherStudentAbsences(userId, filters = {}) {
  const docente = await Docente.findOne({ where: { usuario_id: userId } });
  if (!docente) throw new Error('Docente no encontrado');

  // Find all subjects this teacher teaches
  const assignments = await DocenteMateria.findAll({
    where: { docente_id: docente.id },
    include: [
      {
        model: Materia,
        as: 'Materium',
        include: [{ model: Curso, attributes: ['id', 'nombre', 'anio', 'division'] }],
      },
    ],
  });

  if (assignments.length === 0) {
    return { docente: `${docente.nombre} ${docente.apellido}`, cursos: [] };
  }

  // Group courses uniquely
  const courseMap = new Map();
  for (const a of assignments) {
    const curso = a.Materium?.Curso;
    if (curso && !courseMap.has(curso.id)) {
      courseMap.set(curso.id, {
        id: curso.id,
        nombre: `${curso.nombre} ${curso.anio}${curso.division}`,
        materia_ids: [],
      });
    }
    if (curso) {
      courseMap.get(curso.id).materia_ids.push(a.materia_id);
    }
  }

  // For each course, find students and their absences
  const cursos = [];
  for (const [, curso] of courseMap) {
    const students = await Estudiante.findAll({
      where: { curso_id: curso.id },
      order: [['apellido', 'ASC']],
    });

    const estudiantes = [];
    for (const s of students) {
      const whereAbsence = { estudiante_id: s.id };
      if (filters.desde) whereAbsence.fecha = { [Op.gte]: filters.desde };
      if (filters.hasta) whereAbsence.fecha = { ...whereAbsence.fecha, [Op.lte]: filters.hasta };

      const absences = filters.desde || filters.hasta
        ? await Inasistencia.findAll({ where: whereAbsence, order: [['fecha', 'DESC']] })
        : await Inasistencia.findAll({ where: { estudiante_id: s.id }, order: [['fecha', 'DESC']] });

      estudiantes.push({
        id: s.id,
        nombre: s.nombre,
        apellido: s.apellido,
        total_ausencias: absences.length,
        justificadas: absences.filter(a => a.justificada).length,
        no_justificadas: absences.filter(a => !a.justificada).length,
        ultimas_ausencias: absences.slice(0, 5).map(a => ({
          fecha: a.fecha,
          justificada: a.justificada,
        })),
      });
    }

    cursos.push({
      curso: curso.nombre,
      total_estudiantes: estudiantes.length,
      estudiantes,
    });
  }

  return {
    docente: `${docente.nombre} ${docente.apellido}`,
    total_cursos: cursos.length,
    cursos,
  };
}
