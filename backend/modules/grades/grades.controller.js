const gradesService = require('./grades.service');

const gradesController = {
  async createGrade(req, res, next) {
    try {
      const grade = await gradesService.createGrade(req.body, req.user.id);
      res.status(201).json({ status: 'success', message: 'Nota registrada exitosamente', data: grade });
    } catch (error) {
      next(error);
    }
  },

  async getStudentGrades(req, res, next) {
    try {
      const { studentId } = req.params;
      const { subjectId } = req.query;
      const grades = await gradesService.getStudentGrades(studentId, subjectId || null);
      res.status(200).json({ status: 'success', data: grades });
    } catch (error) {
      next(error);
    }
  },

  async updateGrade(req, res, next) {
    try {
      const { id } = req.params;
      const grade = await gradesService.updateGrade(id, req.body);
      res.status(200).json({ status: 'success', message: 'Nota actualizada', data: grade });
    } catch (error) {
      next(error);
    }
  },

  async deleteGrade(req, res, next) {
    try {
      const { id } = req.params;
      await gradesService.deleteGrade(id);
      res.status(200).json({ status: 'success', message: 'Nota eliminada' });
    } catch (error) {
      next(error);
    }
  },

  async getSubjectGrades(req, res, next) {
    try {
      const { subjectId } = req.params;
      const grades = await gradesService.getSubjectGrades(subjectId);
      res.status(200).json({ status: 'success', data: grades });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = gradesController;
