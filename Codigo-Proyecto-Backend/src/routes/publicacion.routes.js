const express = require('express');
const router = express.Router();

const {
  listarPublicacionesPublicas,
  obtenerDetallePublicacion
} = require('../controllers/publicacion.controller');

/*
  HU07 - Búsqueda y Navegación
  Rutas públicas para mostrar publicaciones en el Home.
  No requieren token porque cualquier visitante puede explorar inmuebles.
*/
router.get('/', listarPublicacionesPublicas);

router.get('/:publicacion_id', obtenerDetallePublicacion);

module.exports = router;