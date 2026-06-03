const { Op, fn, col } = require('sequelize');
const {
  User,
  Course,
  Student,
  Licence,
  NotificationLog,
  Setting,
  sequelize,
} = require('../../models');

class AdminStatsService {
  async getStats(userId) {
    const [users, courses, students, pendingLeaves, studentsAtRisk, newLeaves] =
      await Promise.all([
        User.count({ where: { is_active: true } }),
        Course.count(),
        Student.count(),
        Licence.count(),
        this._countStudentsAtRisk(),
        this._getNewLeavesCount(userId),
      ]);

    const recentNotifications = await NotificationLog.findAll({
      include: [
        {
          model: Student,
          attributes: ['first_name', 'last_name'],
        },
      ],
      attributes: ['id', 'alert_type', 'status', 'sent_at'],
      order: [['sent_at', 'DESC']],
      limit: 5,
    });

    const formattedNotifications = recentNotifications.map((n) => {
      const json = n.toJSON();
      return {
        id: json.id,
        student_name: json.Student
          ? `${json.Student.first_name} ${json.Student.last_name}`.trim()
          : null,
        alert_type: json.alert_type,
        status: json.status,
        sent_at: json.sent_at,
      };
    });

    return {
      users,
      courses,
      students,
      pendingLeaves,
      newLeaves,
      recentNotifications: formattedNotifications,
      studentsAtRisk,
    };
  }

  async _getNewLeavesCount(userId) {
    const setting = await Setting.findByPk(`last_visit_leaves_${userId}`);
    if (!setting) {
      return await Licence.count();
    }
    const lastVisit = new Date(setting.value);
    return await Licence.count({
      where: { createdAt: { [Op.gt]: lastVisit } },
    });
  }

  async _countStudentsAtRisk() {
    const setting = await Setting.findByPk('absence_threshold');
    const threshold = setting ? parseInt(setting.value, 10) : 20;

    const result = await sequelize.query(
      `SELECT COUNT(*) as count FROM (
        SELECT s.id
        FROM students s
        INNER JOIN attendances a ON a.student_id = s.id
        GROUP BY s.id
        HAVING
          COUNT(CASE WHEN a.status = 'ausente' THEN 1 END) * 100.0 / COUNT(*) >= :threshold
      ) at_risk`,
      {
        replacements: { threshold },
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return Number(result[0]?.count) || 0;
  }
}

module.exports = new AdminStatsService();
