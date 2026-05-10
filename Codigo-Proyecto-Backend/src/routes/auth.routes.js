const express = require('express');
const router = express.Router();

const {
  registrar,
  login,
  obtenerMiPerfil,
  verificarEmail,
    solicitarRecuperacionPassword,
  restablecerPassword
} = require('../controllers/auth.controller');

const {
  verificarToken,
  autorizarRoles
} = require('../middlewares/auth.middleware');

router.post('/register', registrar);
router.post('/login', login);
router.post('/verify-email', verificarEmail);
router.get('/me', verificarToken, obtenerMiPerfil);
router.post('/forgot-password', solicitarRecuperacionPassword);
router.post('/reset-password', restablecerPassword);
/*Ruta de prueba */
router.get('/admin-test', verificarToken, autorizarRoles('ADMIN'), (req, res) => {
  res.json({
    mensaje: 'Acceso ADMIN permitido',
    usuario: req.usuario
  });
});

module.exports = router;