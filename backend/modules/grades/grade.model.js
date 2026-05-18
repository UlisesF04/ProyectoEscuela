import models from '../../models/index.js';
import { Op } from 'sequelize';

const { Calificacion, Estudiante, Materia, Curso, Docente, DocenteMateria } = models;

export async function createGrade({ estudiante_id, materia_id, docente_id, nota, periodo, fecha }) {
  if (nota < 1 || nota > 10) {
    throw new Error('La nota debe estar entre 1 y 10');
  }

  // Verify teacher is assigned to this subject
  const assignment = await DocenteMateria.findOne({
    where: { docente_id, materia_id },
  });
  if (!assignment) {
    throw new Error('El docente no está asignado a esta materia');
  }

  const grade = await Calificacion.create({
    estudiante_id, materia_id, docente_id, nota, periodo, fecha,
  });

  const isCritical = nota <= 4; // RN-04

  return { grade, isCritical };
}

export async function getStudentGrades(studentId) {
  const student = await Estudiante.findByPk(studentId, {
    include: [{ model: Curso, attributes: ['nombre', 'anio', 'division'] }],
  });
  if (!student) throw new Error('Estudiante no encontrado');

  const grades = await Calificacion.findAll({
    where: { estudiante_id: studentId },
    include: [{ model: Materia, as: 'Materium', attributes: ['nombre'] }],
    order: [['fecha', 'DESC']],
  });

  return { student, grades };
}

export async function getStudentAverage(studentId) {
  const student = await Estudiante.findByPk(studentId, {
    include: [{ model: Curso, attributes: ['nombre', 'anio', 'division'] }],
  });
  if (!student) throw new Error('Estudiante no encontrado');

  const grades = await Calificacion.findAll({
    where: { estudiante_id: studentId },
    include: [{ model: Materia, as: 'Materium', attributes: ['id', 'nombre'] }],
    order: [['materia_id', 'ASC'], ['fecha', 'ASC']],
  });

  // Group by subject
  const bySubject = {};
  for (const g of grades) {
    const subj = g.Materium?.nombre || 'N/A';
    if (!bySubject[subj]) bySubject[subj] = [];
    bySubject[subj].push(g.nota);
  }

  const subjectAverages = Object.entries(bySubject).map(([nombre, notas]) => ({
    materia: nombre,
    promedio: Number((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1)),
    cantidad_notas: notas.length,
    criticas: notas.filter(n => n <= 4).length,
  }));

  const allGrades = grades.map(g => g.nota);
  const generalAverage = allGrades.length > 0
    ? Number((allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(1))
    : null;

  return {
    student: {
      id: student.id,
      nombre: student.nombre,
      apellido: student.apellido,
      curso: student.Curso ? `${student.Curso.nombre} ${student.Curso.anio}${student.Curso.division}` : null,
    },
    generalAverage,
    atRisk: generalAverage !== null && generalAverage < 6, // RN-05
    subjects: subjectAverages,
  };
}

export async function getCourseGrades(courseId) {
  const students = await Estudiante.findAll({
    where: { curso_id: courseId },
    include: [
      { model: Curso, attributes: ['nombre', 'anio', 'division'] },
      {
        model: Calificacion,
        include: [{ model: Materia, as: 'Materium', attributes: ['nombre'] }],
      },
    ],
    order: [['apellido', 'ASC']],
  });

  return students.map(s => ({
    id: s.id,
    nombre: s.nombre,
    apellido: s.apellido,
    curso: s.Curso ? `${s.Curso.nombre} ${s.Curso.anio}${s.Curso.division}` : null,
    calificaciones: s.Calificacions.map(c => ({
      id: c.id,
      materia: c.Materium?.nombre || 'N/A',
      nota: c.nota,
      periodo: c.periodo,
      fecha: c.fecha,
      critica: c.nota <= 4,
    })),
  }));
}

export async function getCriticalGrades() {
  const grades = await Calificacion.findAll({
    where: { nota: { [Op.lte]: 4 } },
    include: [
      { model: Estudiante, attributes: ['nombre', 'apellido', 'dni'] },
      { model: Materia, as: 'Materium', attributes: ['nombre'] },
      { model: Docente, attributes: ['nombre', 'apellido'] },
    ],
    order: [['fecha', 'DESC']],
  });

  return grades.map(g => ({
    id: g.id,
    estudiante: g.Estudiante ? `${g.Estudiante.nombre} ${g.Estudiante.apellido}` : 'N/A',
    dni: g.Estudiante?.dni || 'N/A',
    materia: g.Materium?.nombre || 'N/A',
    nota: g.nota,
    periodo: g.periodo,
    fecha: g.fecha,
    docente: g.Docente ? `${g.Docente.nombre} ${g.Docente.apellido}` : 'N/A',
  }));
}

export async function getLowAverageStudents(threshold = 6) {
  const students = await Estudiante.findAll({
    include: [{ model: Curso, attributes: ['nombre', 'anio', 'division'] }],
  });

  const result = [];

  for (const student of students) {
    const grades = await Calificacion.findAll({
      where: { estudiante_id: student.id },
    });
    if (grades.length === 0) continue;

    const avg = grades.reduce((a, g) => a + g.nota, 0) / grades.length;
    if (avg < threshold) {
      result.push({
        id: student.id,
        nombre: student.nombre,
        apellido: student.apellido,
        dni: student.dni,
        curso: student.Curso ? `${student.Curso.nombre} ${student.Curso.anio}${student.Curso.division}` : null,
        promedio: Number(avg.toFixed(1)),
        cantidad_notas: grades.length,
      });
    }
  }

  return result.sort((a, b) => a.promedio - b.promedio);
}

export async function getTeacherSubjects(userId) {
  const docente = await Docente.findOne({ where: { usuario_id: userId } });
  if (!docente) throw new Error('Docente no encontrado');

  const assignments = await DocenteMateria.findAll({
    where: { docente_id: docente.id },
    include: [{ model: Materia, as: 'Materium', include: [{ model: Curso, attributes: ['nombre', 'anio', 'division'] }] }],
  });

  return assignments.map(a => ({
    docente_id: a.docente_id,
    materia_id: a.materia_id,
    materia: a.Materium?.nombre || 'N/A',
    curso: a.Materium?.Curso
      ? `${a.Materium.Curso.nombre} ${a.Materium.Curso.anio}${a.Materium.Curso.division}`
      : null,
  }));
}
