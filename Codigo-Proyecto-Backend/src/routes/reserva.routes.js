const express = require('express');
const router = express.Router();

const {
  solicitarReserva,
  obtenerMisSolicitudesReserva,
  obtenerSolicitudesGestion,
  aprobarSolicitudReserva,
  rechazarSolicitudReserva,
  obtenerEventosReservaGestion,
  obtenerDetalleMiSolicitudReserva,
  obtenerVettingInquilinoGestion,
  registrarEvaluacionInquilinoGestion,
  obtenerEvaluacionesInquilinoGestion,
  obtenerResumenVettingGestion
} = require('../controllers/reserva.controller');

const {
  verificarToken,
} = require('../middlewares/auth.middleware');

/*
  HU09 - Solicitud de Reserva
  El inquilino autenticado envía una solicitud para ocupar un inmueble publicado.
*/
router.get('/mis-solicitudes',verificarToken,obtenerMisSolicitudesReserva);
router.post('/solicitudes',verificarToken,solicitarReserva);
router.get('/gestion/solicitudes',verificarToken,obtenerSolicitudesGestion);
router.get('/gestion/vetting/resumen',verificarToken,obtenerResumenVettingGestion);
router.get('/gestion/solicitudes/:reserva_id/vetting', verificarToken, obtenerVettingInquilinoGestion); //HU11
router.get('/gestion/solicitudes/:reserva_id/evaluaciones', verificarToken, obtenerEvaluacionesInquilinoGestion); //HU11
router.post('/gestion/solicitudes/:reserva_id/evaluacion', verificarToken, registrarEvaluacionInquilinoGestion); //HU11
router.get('/gestion/solicitudes/:reserva_id/eventos',verificarToken,obtenerEventosReservaGestion);
router.patch('/gestion/solicitudes/:reserva_id/aprobar',verificarToken,aprobarSolicitudReserva);
router.patch('/gestion/solicitudes/:reserva_id/rechazar',verificarToken,rechazarSolicitudReserva);
router.get('/mis-solicitudes/:reserva_id',verificarToken,obtenerDetalleMiSolicitudReserva);

module.exports = router;