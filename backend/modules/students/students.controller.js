const studentsService = require('./students.service');

const studentsController = {
  async createStudent(req, res, next) {
    try {
      const student = await studentsService.createStudent(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Estudiante creado exitosamente',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllStudents(req, res, next) {
    try {
      const students = await studentsService.getAllStudents();
      res.status(200).json({
        status: 'success',
        data: students,
      });
    } catch (error) {
      next(error);
    }
  },

  async getStudentById(req, res, next) {
    try {
      const { id } = req.params;
      const student = await studentsService.getStudentById(id);
      res.status(200).json({
        status: 'success',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStudent(req, res, next) {
    try {
      const { id } = req.params;
      const student = await studentsService.updateStudent(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Estudiante actualizado exitosamente',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  },

  async deactivateStudent(req, res, next) {
    try {
      const { id } = req.params;
      await studentsService.deactivateStudent(id);
      res.status(200).json({
        status: 'success',
        message: 'Estudiante desactivado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async permanentDeleteStudent(req, res, next) {
    try {
      const { id } = req.params;
      await studentsService.permanentDeleteStudent(id);
      res.status(200).json({
        status: 'success',
        message: 'Estudiante eliminado definitivamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async linkParent(req, res, next) {
    try {
      const { id } = req.params;
      const link = await studentsService.linkParent(id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Padre vinculado exitosamente',
        data: link,
      });
    } catch (error) {
      next(error);
    }
  },

  async getParents(req, res, next) {
    try {
      const { id } = req.params;
      const parents = await studentsService.getParents(id);
      res.status(200).json({
        status: 'success',
        data: parents,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = studentsController;
