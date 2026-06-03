const { Licence, User } = require('../../models');
const AppError = require('../../utils/AppError');

class LicenceService {
  async create(data, userId, file) {
    const licence = await Licence.create({
      user_id: userId,
      title: data.title,
      file_data: file ? file.buffer : null,
      file_name: file ? file.originalname : null,
      file_mime: file ? file.mimetype : null,
      file_size: file ? file.size : null,
    });

    return licence;
  }

  async getFromParents() {
    const licences = await Licence.findAll({
      include: [
        {
          model: User,
          as: 'user',
          where: { role: 'padre' },
          attributes: ['id', 'first_name', 'last_name', 'role'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return this._stripFileData(licences);
  }

  async getAllForAdmin() {
    const licences = await Licence.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'role'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return this._stripFileData(licences);
  }

  async getMyLicences(userId) {
    const licences = await Licence.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'role'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return this._stripFileData(licences);
  }

  async getFileData(id, requesterId, requesterRole) {
    const licence = await Licence.findByPk(id, {
      attributes: ['id', 'user_id', 'file_data', 'file_name', 'file_mime', 'file_size'],
    });
    if (!licence) throw new AppError('Licencia no encontrada', 404);
    // Solo el dueño de la licencia o admin pueden descargar
    if (requesterRole !== 'admin' && licence.user_id !== requesterId) {
      throw new AppError('No tienes permiso para descargar esta licencia', 403);
    }
    return licence;
  }

  _stripFileData(licences) {
    return licences.map((l) => {
      const json = l.toJSON();
      delete json.file_data;
      return { ...json, has_file: !!(l.file_data || l.file_url) };
    });
  }
}

module.exports = new LicenceService();
