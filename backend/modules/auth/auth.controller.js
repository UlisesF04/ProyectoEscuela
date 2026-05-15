import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import models from '../../models/index.js';

const { Usuario } = models;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contrasena son requeridos' });
  }

  const user = await Usuario.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Credenciales invalidas' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Credenciales invalidas' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    JWT_SECRET,
    { expiresIn: '8h' },
  );

  return res.status(200).json({
    token,
    user: { id: user.id, email: user.email, rol: user.rol },
  });
};

export const logout = (req, res) => {
  return res.status(200).json({ message: 'Sesion cerrada exitosamente' });
};
