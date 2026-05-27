const attendancesService = require('./attendances.service');

const attendancesController = {
  async create(req, res, next) {
    try {
      const attendance = await attendancesService.register(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Asistencia registrada exitosamente',
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  },

  async batchCreate(req, res, next) {
    try {
      const records = await attendancesService.batchRegister(req.body.records, req.user.id);
      res.status(201).json({
        status: 'success',
        message: `${records.length} asistencias registradas exitosamente`,
        data: records,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const attendance = await attendancesService.update(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Asistencia actualizada exitosamente',
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  },

  async justify(req, res, next) {
    try {
      const { id } = req.params;
      const attendance = await attendancesService.justify(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Inasistencia justificada exitosamente',
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req, res, next) {
    try {
      const { studentId } = req.params;
      const { from, to, status } = req.query;
      const filters = {};
      if (from) filters.from = from;
      if (to) filters.to = to;
      if (status) filters.status = status;

      const result = await attendancesService.getStudentHistory(studentId, filters);
      res.status(200).json({
        status: 'success',
        data: result.records,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadCertificate(req, res, next) {
    try {
      const { attendance_id } = req.body;
      const file = req.file;

      if (!attendance_id) {
        return res.status(400).json({
          status: 'error',
          message: 'El campo attendance_id es obligatorio',
        });
      }

      const certificateUrl = await attendancesService.uploadCertificate(attendance_id, file, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Certificado subido exitosamente',
        data: { certificate_url: certificateUrl },
      });
    } catch (error) {
      if (req.file) {
        const fs = require('fs');
        try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore */ }
      }
      next(error);
    }
  },
};

module.exports = attendancesController;
