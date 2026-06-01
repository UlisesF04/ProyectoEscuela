const studentRepository = require('../../repositories/studentRepository');
const parentStudentRepository = require('../../repositories/parentStudentRepository');
const userRepository = require('../../repositories/userRepository');
const { Student, Course, Subject, User, ParentStudent, TeacherSubject, Grade } = require('../../models');
const AppError = require('../../utils/AppError');
const { Op } = require('sequelize');

const studentsService = {
  async createStudent(data) {
    const { first_name, last_name, dni, birth_date, course_id } = data;

    if (dni) {
      const existingStudent = await studentRepository.findByDni(dni);
      if (existingStudent) {
        throw new AppError('El DNI ya está registrado', 409);
      }
    }

    const student = await studentRepository.create({
      first_name,
      last_name,
      dni: dni || null,
      birth_date: birth_date || null,
      course_id,
      is_active: true,
    });

    return student;
  },

  async getAllStudents(filters = {}) {
    const where = {};
    if (filters.course_id) {
      where.course_id = filters.course_id;
    }

    const students = await Student.findAll({
      where,
      include: [{ model: Course, as: 'Course' }],
    });

    return students;
  },

  async getStudentById(id) {
    const student = await Student.findByPk(id, {
      include: [{ model: Course, as: 'Course' }],
    });

    if (!student) {
      throw new AppError('Estudiante no encontrado', 404);
    }

    return student;
  },

  async updateStudent(id, data) {
    const student = await studentRepository.findById(id);

    if (!student) {
      throw new AppError('Estudiante no encontrado', 404);
    }

    if (data.dni && data.dni !== student.dni) {
      const existingStudent = await studentRepository.findByDni(data.dni);
      if (existingStudent) {
        throw new AppError('El DNI ya está registrado', 409);
      }
    }

    const updatedStudent = await studentRepository.update(id, data);
    return updatedStudent;
  },

  async deactivateStudent(id) {
    const student = await studentRepository.findById(id);

    if (!student) {
      throw new AppError('Estudiante no encontrado', 404);
    }

    if (!student.is_active) {
      throw new AppError('El estudiante ya está desactivado', 409);
    }

    await studentRepository.deactivate(id);
  },

  async reactivateStudent(id) {
    const student = await studentRepository.findById(id);

    if (!student) {
      throw new AppError('Estudiante no encontrado', 404);
    }

    if (student.is_active) {
      throw new AppError('El estudiante ya está activo', 409);
    }

    await studentRepository.reactivate(id);
  },

  async permanentDeleteStudent(id) {
    const student = await studentRepository.findById(id);

    if (!student) {
      throw new AppError('Estudiante no encontrado', 404);
    }

    // Require soft-delete first (safety measure)
    if (student.is_active) {
      throw new AppError('Debe desactivar el estudiante antes de eliminarlo definitivamente', 400);
    }

    // Cleanup FK references
    await ParentStudent.destroy({ where: { student_id: id }, force: true });

    await studentRepository.destroy(id);
  },

  async linkParent(studentId, data) {
    const { user_id, relationship } = data;

    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new AppError('Estudiante no encontrado', 404);
    }

    const user = await userRepository.findById(user_id);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (user.role !== 'padre') {
      throw new AppError('El usuario no tiene el rol de padre', 400);
    }

    const existingLinks = await parentStudentRepository.findByStudent(studentId);
    const alreadyLinked = existingLinks.find(link => link.user_id === user_id);
    if (alreadyLinked) {
      throw new AppError('El padre ya está vinculado a este estudiante', 409);
    }

    const link = await parentStudentRepository.create({
      user_id,
      student_id: studentId,
      relationship: relationship || null,
    });

    return link;
  },

  async getParents(studentId) {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new AppError('Estudiante no encontrado', 404);
    }

    const links = await ParentStudent.findAll({
      where: { student_id: studentId },
      include: [{ model: User, as: 'User' }],
    });

    const parents = links.map(link => ({
      id: link.id,
      user_id: link.user_id,
      relationship: link.relationship,
      user: {
        id: link.User.id,
        email: link.User.email,
        first_name: link.User.first_name,
        last_name: link.User.last_name,
        phone_whatsapp: link.User.phone_whatsapp,
        role: link.User.role,
      },
    }));

    return parents;
  },

  async getMyChildren(userId) {
    const links = await ParentStudent.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{ model: Course, as: 'Course' }],
        },
      ],
    });

    return links.map(link => ({
      id: link.Student.id,
      first_name: link.Student.first_name,
      last_name: link.Student.last_name,
      dni: link.Student.dni,
      birth_date: link.Student.birth_date,
      is_active: link.Student.is_active,
      course: link.Student.Course
        ? { id: link.Student.Course.id, name: link.Student.Course.name, year: link.Student.Course.year, division: link.Student.Course.division }
        : null,
      relationship: link.relationship,
    }));
  },

  // ─── C-07: Evolución de calificaciones ───────────────────────
  // Reglas aplicadas:
  //   RN-03 → padre solo si está vinculado (parent_student)
  //   RN-04 → docente solo de las materias que tiene asignadas (teacher_subject)
  //   admin  → sin restricciones
  async getEvolutionForStudent(studentId, requester) {
    // 1. Verificar que el estudiante existe
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new AppError('Estudiante no encontrado', 404);
    }

    // 2. Chequeo de permisos
    //    allowedSubjectIds === null significa "sin filtro" (admin)
    //    allowedSubjectIds === [] significa "sin materias asignadas" → 403
    let allowedSubjectIds = null;

    if (requester.role === 'padre') {
      const link = await ParentStudent.findOne({
        where: { user_id: requester.id, student_id: studentId },
      });
      if (!link) {
        throw new AppError(
          'No tienes permiso para ver la evolución de este estudiante',
          403
        );
      }
    } else if (requester.role === 'docente') {
      const assignments = await TeacherSubject.findAll({
        where: { user_id: requester.id },
        attributes: ['subject_id'],
      });
      allowedSubjectIds = assignments.map((a) => a.subject_id);
      if (allowedSubjectIds.length === 0) {
        throw new AppError(
          'No tenés materias asignadas. No podés ver la evolución de calificaciones.',
          403
        );
      }
    }
    // Si es admin, allowedSubjectIds queda en null → no se filtra

    // 3. Query de calificaciones con include de materia
    const where = { student_id: studentId };
    if (allowedSubjectIds !== null) {
      where.subject_id = { [Op.in]: allowedSubjectIds };
    }

    const grades = await Grade.findAll({
      where,
      include: [{ model: Subject, as: 'Subject' }],
      order: [['date', 'ASC']],
    });

    // 4. Agrupar por materia
    const subjectMap = new Map();
    for (const g of grades) {
      const sid = g.subject_id;
      if (!subjectMap.has(sid)) {
        subjectMap.set(sid, {
          id: sid,
          name: g.Subject ? g.Subject.name : 'Sin nombre',
          grades: [],
        });
      }
      const numericGrade = parseFloat(g.grade);
      subjectMap.get(sid).grades.push({
        id: g.id,
        value: numericGrade,
        type: g.type,
        date: g.date,
        description: g.description,
      });
    }

    // 5. Calcular promedio por materia y ordenar
    const subjects = Array.from(subjectMap.values())
      .map((s) => {
        const total = s.grades.reduce((acc, g) => acc + g.value, 0);
        const average =
          s.grades.length > 0
            ? Math.round((total / s.grades.length) * 100) / 100
            : null;
        return { ...s, average };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
      },
      subjects,
    };
  },
};

module.exports = studentsService;
