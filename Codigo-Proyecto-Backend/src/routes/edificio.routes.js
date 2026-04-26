const express = require('express');
const router = express.Router();

const {
  crearEdificio,
  obtenerEdificios
} = require('../controllers/edificio.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

router.post('/', verificarToken, crearEdificio);
router.get('/', verificarToken, obtenerEdificios);

module.exports = router;