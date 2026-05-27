const studentRepository = require('../../repositories/studentRepository');
const parentStudentRepository = require('../../repositories/parentStudentRepository');
const userRepository = require('../../repositories/userRepository');
const { Student, Course, User, ParentStudent } = require('../../models');
const AppError = require('../../utils/AppError');

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

  async getAllStudents() {
    const students = await Student.findAll({
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
};

module.exports = studentsService;
