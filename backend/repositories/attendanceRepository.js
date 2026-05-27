const { Attendance, sequelize } = require('../models');
const { Op } = require('sequelize');

const attendanceRepository = {
  async findById(id) {
    return Attendance.findByPk(id);
  },

  async findByStudentAndDate(studentId, date) {
    return Attendance.findOne({
      where: { student_id: studentId, date },
    });
  },

  async findAll(filter = {}) {
    return Attendance.findAll({ where: filter });
  },

  async create(data) {
    return Attendance.create(data);
  },

  async update(id, data) {
    const attendance = await Attendance.findByPk(id);
    if (!attendance) return null;
    return attendance.update(data);
  },

  async findByStudentId(studentId, options = {}) {
    const where = { student_id: studentId };

    if (options.from) {
      where.date = { ...where.date, [Op.gte]: options.from };
    }
    if (options.to) {
      where.date = { ...where.date, [Op.lte]: options.to };
    }
    if (options.status) {
      where.status = options.status;
    }

    return Attendance.findAll({
      where,
      order: [['date', 'DESC']],
    });
  },

  async getSummaryByStudentId(studentId) {
    const result = await Attendance.findAll({
      where: { student_id: studentId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_days'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'ausente' THEN 1 ELSE 0 END")), 'total_absences'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN is_justified = true THEN 1 ELSE 0 END")), 'justified_absences'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'ausente' AND is_justified = false THEN 1 ELSE 0 END")), 'unjustified_absences'],
      ],
      raw: true,
    });

    const row = result[0] || {};
    return {
      total_days: parseInt(row.total_days, 10) || 0,
      total_absences: parseInt(row.total_absences, 10) || 0,
      justified_absences: parseInt(row.justified_absences, 10) || 0,
      unjustified_absences: parseInt(row.unjustified_absences, 10) || 0,
    };
  },

  async destroy(id) {
    const attendance = await Attendance.findByPk(id);
    if (!attendance) return null;
    return attendance.destroy({ force: true });
  },
};

module.exports = attendanceRepository;
