const notificationService = require('./notifications.service');

class NotificationController {
  async triggerNotifications(req, res, next) {
    try {
      const result = await notificationService.runAgent();
      res.json({ status: 'ok', ...result });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const { type, alert_type, status, from, to } = req.query;
      const notifications = await notificationService.getNotifications({ type, alert_type, status, from, to });
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  }

  async getTypes(req, res, next) {
    try {
      const types = await notificationService.getTypes();
      res.json(types);
    } catch (err) {
      next(err);
    }
  }

  async getAlertTypes(req, res, next) {
    try {
      const types = await notificationService.getAlertTypes();
      res.json(types);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
