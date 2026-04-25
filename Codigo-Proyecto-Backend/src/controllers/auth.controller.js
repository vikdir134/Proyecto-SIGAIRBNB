const bcrypt = require('bcryptjs');

const {
  buscarUsuarioPorCorreo,
  registrarUsuario
} = require('../models/auth.model');

const registrar = async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      correo,
      password,
      acepta_terminos
    } = req.body;

    if (!nombres || !apellidos || !correo || !password) {
      return res.status(400).json({
        mensaje: 'Nombres, apellidos, correo y contraseña son obligatorios'
      });
    }

    if (!acepta_terminos) {
      return res.status(400).json({
        mensaje: 'Debe aceptar los términos y condiciones'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        mensaje: 'La contraseña debe tener como mínimo 6 caracteres'
      });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const usuarioExistente = await buscarUsuarioPorCorreo(correoNormalizado);

    if (usuarioExistente) {
      return res.status(409).json({
        mensaje: 'El correo ya está registrado'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuarioCreado = await registrarUsuario({
      empresa_id: 1,
      correo: correoNormalizado,
      password_hash: passwordHash,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      acepta_terminos
    });

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: {
        usuario_id: usuarioCreado.usuario_id,
        correo: usuarioCreado.correo,
        estado: usuarioCreado.estado,
        email_verificado: usuarioCreado.email_verificado
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);

    return res.status(500).json({
      mensaje: 'Error interno al registrar usuario',
      error: error.message
    });
  }
};

module.exports = {
  registrar
};