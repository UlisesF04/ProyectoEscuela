const { Licence, User } = require('../../models');

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

  async getFileData(id) {
    const licence = await Licence.findByPk(id, {
      attributes: ['id', 'file_data', 'file_name', 'file_mime', 'file_size'],
    });
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
