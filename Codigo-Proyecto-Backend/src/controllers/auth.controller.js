const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const {
  buscarUsuarioPorCorreo,
  registrarUsuario,
  obtenerRolesUsuario,
  actualizarUltimoAcceso
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
// Funcion de login
const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: 'Correo y contraseña son obligatorios'
      });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const usuario = await buscarUsuarioPorCorreo(correoNormalizado);

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Credenciales incorrectas'
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        mensaje: 'El usuario se encuentra inactivo'
      });
    }

    if (usuario.estado === 'BLOQUEADO') {
      return res.status(403).json({
        mensaje: 'El usuario se encuentra bloqueado'
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      return res.status(401).json({
        mensaje: 'Credenciales incorrectas'
      });
    }

    const roles = await obtenerRolesUsuario(usuario.usuario_id);

    const token = jwt.sign(
      {
        usuario_id: usuario.usuario_id,
        correo: usuario.correo,
        roles
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '2h'
      }
    );

    await actualizarUltimoAcceso(usuario.usuario_id);

    return res.json({
      mensaje: 'Login correcto',
      token,
      usuario: {
        usuario_id: usuario.usuario_id,
        correo: usuario.correo,
        estado: usuario.estado,
        email_verificado: usuario.email_verificado,
        roles
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);

    return res.status(500).json({
      mensaje: 'Error interno al iniciar sesión',
      error: error.message
    });
  }
};

const obtenerMiPerfil = async (req, res) => {
  try {
    return res.json({
      mensaje: 'Usuario autenticado correctamente',
      usuario: req.usuario
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al obtener el perfil del usuario',
      error: error.message
    });
  }
};


module.exports = {
  registrar,
  login,
  obtenerMiPerfil
};