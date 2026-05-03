const express = require('express');
const router = express.Router();

const {
  crearEdificio,
  obtenerEdificios,
  crearPisoLocal,
  obtenerUnidadesPorEdificio,
  obtenerUnidadPorId
} = require('../controllers/edificio.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

router.post('/', verificarToken, crearEdificio);
router.get('/', verificarToken, obtenerEdificios);

/*
  HU04 - Registrar Piso/Local
  Registra una unidad asociada obligatoriamente a un edificio.
  En BD se inserta en catalog.Inmueble con:
  tipo_inmueble = 'PISO' o 'LOCAL'
  edificio_id = ID del edificio padre
*/
router.post('/unidades', verificarToken, crearPisoLocal);
router.get('/unidades/:unidad_id', verificarToken, obtenerUnidadPorId);
router.get('/:edificio_id/unidades', verificarToken, obtenerUnidadesPorEdificio);

module.exports = router;