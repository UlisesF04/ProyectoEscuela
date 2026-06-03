const licenceService = require('./licences.service');

class LicenceController {
  async create(req, res, next) {
    try {
      const licence = await licenceService.create(req.body, req.user.id, req.file || null);
      res.status(201).json(licence);
    } catch (error) {
      next(error);
    }
  }

  async getAllForAdmin(req, res, next) {
    try {
      const licences = await licenceService.getAllForAdmin();
      res.json(licences);
    } catch (error) {
      next(error);
    }
  }

  async getFromParents(req, res, next) {
    try {
      const licences = await licenceService.getFromParents();
      res.json(licences);
    } catch (error) {
      next(error);
    }
  }

  async getMyLicences(req, res, next) {
    try {
      const licences = await licenceService.getMyLicences(req.user.id);
      res.json(licences);
    } catch (error) {
      next(error);
    }
  }

  async download(req, res, next) {
    try {
      const licence = await licenceService.getFileData(req.params.id, req.user.id, req.user.role);
      if (!licence || !licence.file_data) {
        return res.status(404).json({
          status: 'error',
          message: 'Archivo no encontrado',
        });
      }
      res.setHeader('Content-Type', licence.file_mime || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${licence.file_name}"`);
      res.setHeader('Content-Length', licence.file_size);
      res.end(licence.file_data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LicenceController();
