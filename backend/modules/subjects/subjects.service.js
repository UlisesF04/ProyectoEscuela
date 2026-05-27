const subjectRepository = require('../../repositories/subjectRepository');
const teacherSubjectRepository = require('../../repositories/teacherSubjectRepository');
const userRepository = require('../../repositories/userRepository');
const { Subject, Course, User, TeacherSubject } = require('../../models');
const AppError = require('../../utils/AppError');

const subjectsService = {
  async getMySubjects(userId) {
    const assignments = await TeacherSubject.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Subject,
          as: 'Subject',
          include: [{ model: Course, as: 'Course' }],
        },
      ],
    });

    return assignments.map(a => ({
      id: a.Subject.id,
      name: a.Subject.name,
      course_id: a.Subject.course_id,
      course: a.Subject.Course
        ? { id: a.Subject.Course.id, name: a.Subject.Course.name, year: a.Subject.Course.year, division: a.Subject.Course.division }
        : null,
    }));
  },

  async getSubjectById(id) {
    const subject = await Subject.findByPk(id, {
      include: [{ model: Course, as: 'Course' }],
    });

    if (!subject) {
      throw new AppError('Materia no encontrada', 404);
    }

    return subject;
  },

  async getTeachers(subjectId) {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new AppError('Materia no encontrada', 404);
    }

    const assignments = await TeacherSubject.findAll({
      where: { subject_id: subjectId },
      include: [{ model: User, as: 'User' }],
    });

    const teachers = assignments.map(assignment => ({
      id: assignment.id,
      user_id: assignment.user_id,
      user: {
        id: assignment.User.id,
        email: assignment.User.email,
        first_name: assignment.User.first_name,
        last_name: assignment.User.last_name,
        phone_whatsapp: assignment.User.phone_whatsapp,
        role: assignment.User.role,
      },
    }));

    return teachers;
  },

  async assignTeacher(subjectId, userId) {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new AppError('Materia no encontrada', 404);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (user.role !== 'docente') {
      throw new AppError('El usuario no tiene el rol de docente', 400);
    }

    const existingAssignments = await teacherSubjectRepository.findBySubject(subjectId);
    const alreadyAssigned = existingAssignments.find(a => a.user_id === userId);
    if (alreadyAssigned) {
      throw new AppError('El docente ya está asignado a esta materia', 409);
    }

    const assignment = await teacherSubjectRepository.create({
      user_id: userId,
      subject_id: subjectId,
    });

    return assignment;
  },
};

module.exports = subjectsService;
