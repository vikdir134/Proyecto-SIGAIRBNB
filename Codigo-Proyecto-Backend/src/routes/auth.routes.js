const express = require('express');
const router = express.Router();

const {
  registrar,
  login,
  obtenerMiPerfil,
  verificarEmail
} = require('../controllers/auth.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

router.post('/register', registrar);
router.post('/login', login);
router.post('/verify-email', verificarEmail);
router.get('/me', verificarToken, obtenerMiPerfil);

module.exports = router;