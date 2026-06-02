const configService = require('./config.service');

class ConfigController {
  async getConfig(req, res, next) {
    try {
      const config = await configService.getAll();
      res.json({ data: config });
    } catch (err) {
      next(err);
    }
  }

  async updateConfig(req, res, next) {
    try {
      const config = await configService.updateAll(req.body);
      res.json({ data: config });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ConfigController();
