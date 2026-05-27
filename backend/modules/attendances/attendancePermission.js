const { Student, TeacherSubject, ParentStudent, Subject } = require('../../models');
const { Op } = require('sequelize');
const AppError = require('../../utils/AppError');

const attendancePermission = (action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const studentId = parseInt(req.params.studentId, 10);

      if (!studentId) {
        return next(new AppError('ID de estudiante inválido', 400));
      }

      if (user.role === 'preceptor' || user.role === 'admin') {
        return next();
      }

      if (user.role === 'docente') {
        const teacherSubjects = await TeacherSubject.findAll({
          where: { user_id: user.id },
          include: [{ model: Subject, attributes: ['course_id'] }],
        });

        if (teacherSubjects.length === 0) {
          return next(new AppError('No tienes permiso para ver las asistencias de este alumno', 403));
        }

        const courseIds = [...new Set(teacherSubjects.map(ts => ts.Subject.course_id))];

        const student = await Student.findOne({
          where: { id: studentId, course_id: { [Op.in]: courseIds } },
        });

        if (student) {
          return next();
        }

        return next(new AppError('No tienes permiso para ver las asistencias de este alumno', 403));
      }

      if (user.role === 'padre') {
        const link = await ParentStudent.findOne({
          where: { user_id: user.id, student_id: studentId },
        });

        if (link) {
          return next();
        }

        return next(new AppError('No tienes permiso para ver las asistencias de este alumno', 403));
      }

      return next(new AppError('No tienes permisos para acceder a este recurso', 403));
    } catch (error) {
      next(error);
    }
  };
};

module.exports = attendancePermission;
