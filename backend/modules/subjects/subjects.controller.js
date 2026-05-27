const subjectsService = require('./subjects.service');

const subjectsController = {
  async getSubjectById(req, res, next) {
    try {
      const { id } = req.params;
      const subject = await subjectsService.getSubjectById(id);
      res.status(200).json({
        status: 'success',
        data: subject,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTeachers(req, res, next) {
    try {
      const { id } = req.params;
      const teachers = await subjectsService.getTeachers(id);
      res.status(200).json({
        status: 'success',
        data: teachers,
      });
    } catch (error) {
      next(error);
    }
  },

  async assignTeacher(req, res, next) {
    try {
      const { id } = req.params;
      const { user_id } = req.body;
      const assignment = await subjectsService.assignTeacher(id, user_id);
      res.status(201).json({
        status: 'success',
        message: 'Docente asignado exitosamente',
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = subjectsController;
