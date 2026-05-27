const courseRepository = require('../../repositories/courseRepository');
const subjectRepository = require('../../repositories/subjectRepository');
const { Course, Subject, TeacherSubject, Student } = require('../../models');
const AppError = require('../../utils/AppError');

const coursesService = {
  async createCourse(data) {
    const { name, year, division, level } = data;

    const course = await courseRepository.create({
      name,
      year,
      division: division || null,
      level: level || null,
    });

    return course;
  },

  async getAllCourses() {
    const courses = await Course.findAll({
      order: [
        ['year', 'DESC'],
        ['name', 'ASC'],
      ],
    });

    return courses;
  },

  async getCourseById(id) {
    const course = await Course.findByPk(id, {
      include: [{ model: Subject, as: 'Subjects' }],
    });

    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }

    return course;
  },

  async updateCourse(id, data) {
    const course = await courseRepository.findById(id);

    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }

    const updatedCourse = await courseRepository.update(id, data);
    return updatedCourse;
  },

  async deleteCourse(id) {
    const course = await courseRepository.findById(id);

    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }

    // Check if there are students enrolled in this course
    const studentCount = await Student.count({ where: { course_id: id } });
    if (studentCount > 0) {
      throw new AppError('No se puede eliminar un curso que tiene alumnos inscriptos', 400);
    }

    // Cascade delete: TeacherSubject entries → Subjects → Course
    const subjects = await subjectRepository.findByCourseId(id);
    const subjectIds = subjects.map(s => s.id);

    if (subjectIds.length > 0) {
      await TeacherSubject.destroy({ where: { subject_id: subjectIds } });
      await Subject.destroy({ where: { id: subjectIds } });
    }

    await courseRepository.destroy(id);
  },

  async createSubject(courseId, name) {
    const course = await courseRepository.findById(courseId);

    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }

    const subject = await subjectRepository.create({
      name,
      course_id: courseId,
    });

    return subject;
  },

  async getSubjects(courseId) {
    const course = await courseRepository.findById(courseId);

    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }

    const subjects = await subjectRepository.findByCourseId(courseId);
    return subjects;
  },
};

module.exports = coursesService;
