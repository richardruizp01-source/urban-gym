const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');

router.get('/', (req, res) => res.json({ ok: true })); // 👈 prueba
router.get('/membresias', billingController.getMembresias);
router.get('/pagos', billingController.getAllPagos);
router.get('/pagos/:socio_id', billingController.getPagosBySocio);
router.get('/acceso/:socio_id', billingController.verificarAcceso);
router.post('/pagos', billingController.crearPago);

module.exports = router;