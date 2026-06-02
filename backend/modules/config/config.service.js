const { Setting } = require('../../models');

const DEFAULTS = {
  absence_threshold: 10,
  notification_time: '18:00',
  alerts_enabled: { absence: true, low_grade: true, overdue_task: true },
};

class ConfigService {
  async getAll() {
    const rows = await Setting.findAll();
    const dbConfig = {};
    rows.forEach((row) => {
      dbConfig[row.key] = row.value;
    });
    return { ...DEFAULTS, ...dbConfig };
  }

  async updateAll(data) {
    const keys = ['absence_threshold', 'notification_time', 'alerts_enabled'];
    for (const key of keys) {
      if (data[key] !== undefined) {
        await Setting.upsert({ key, value: data[key] });
      }
    }
    return this.getAll();
  }
}

module.exports = new ConfigService();
