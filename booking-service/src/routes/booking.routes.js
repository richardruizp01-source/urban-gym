const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

// --- RUTAS DEL MICROSERVICIO DE RESERVAS ---

router.get('/', bookingController.getAllBookings);
router.get('/instancias', bookingController.getAllInstancias);
router.get('/socio/:socio_id', bookingController.getReservasBySocio);

router.post('/', bookingController.createBooking);
router.post('/instancias', bookingController.createClaseInstancia);

router.put('/:id', bookingController.updateBooking);

// ✅ INSTANCIAS PRIMERO, LUEGO LA GENÉRICA
router.delete('/instancias/:id', bookingController.deleteInstancia);
router.delete('/:id', bookingController.cancelBooking);

module.exports = router;