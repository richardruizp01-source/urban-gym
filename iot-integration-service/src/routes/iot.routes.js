const express = require("express");
const router = express.Router();
const iotController = require("../controllers/iot.controller");
const { verifyMachine } = require("../middlewares/auth.middleware");

// Autenticar máquina
router.post("/machines/auth", iotController.authenticateMachine);

// Validar acceso por QR (requiere token de máquina)
router.post("/access/validate", verifyMachine, iotController.validateQRAccess);

// Recibir datos de entrenamiento (requiere token de máquina)
router.post("/training-data", verifyMachine, iotController.receiveTrainingData);

// Ver todas las máquinas autenticadas
router.get("/machines", iotController.getAllMachines);

// Ver eventos de una máquina
router.get("/machines/:machine_id/events", iotController.getMachineEvents);

// Ver historial de accesos de un miembro
router.get("/members/:miembro_id/access", iotController.getMemberAccessHistory);

module.exports = router;