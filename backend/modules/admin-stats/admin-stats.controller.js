const { Setting } = require('../../models');
const adminStatsService = require('./admin-stats.service');

class AdminStatsController {
  async getStats(req, res, next) {
    try {
      const stats = await adminStatsService.getStats(req.user.id);
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  }

  async recordPageVisit(req, res, next) {
    try {
      const { page } = req.body;
      const key = `last_visit_leaves_${req.user.id}`;
      const value = new Date().toISOString();

      await Setting.upsert({ key, value });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminStatsController();
