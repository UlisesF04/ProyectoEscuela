const coursesService = require('./courses.service');

const coursesController = {
  async createCourse(req, res, next) {
    try {
      const course = await coursesService.createCourse(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Curso creado exitosamente',
        data: course,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllCourses(req, res, next) {
    try {
      const courses = await coursesService.getAllCourses();
      res.status(200).json({
        status: 'success',
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      const course = await coursesService.getCourseById(id);
      res.status(200).json({
        status: 'success',
        data: course,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCourse(req, res, next) {
    try {
      const { id } = req.params;
      const course = await coursesService.updateCourse(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Curso actualizado exitosamente',
        data: course,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteCourse(req, res, next) {
    try {
      const { id } = req.params;
      await coursesService.deleteCourse(id);
      res.status(200).json({
        status: 'success',
        message: 'Curso eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async createSubject(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const subject = await coursesService.createSubject(id, name);
      res.status(201).json({
        status: 'success',
        message: 'Materia creada exitosamente',
        data: subject,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSubjects(req, res, next) {
    try {
      const { id } = req.params;
      const subjects = await coursesService.getSubjects(id);
      res.status(200).json({
        status: 'success',
        data: subjects,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = coursesController;
