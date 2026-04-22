const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facility.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// 🚀 VALIDADOR HÍBRIDO: El "Portero" que deja pasar al BFF o al Admin
const verifyAccess = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  
  // Limpiamos espacios en blanco para evitar errores de comparación
  const secret = (process.env.INTERNAL_SERVICE_TOKEN || "").trim();
  const cleanToken = (token || "").trim();

  // 🔍 DEBUG en la terminal del 3002
  console.log("\n🔍 [DEBUG 3002] Intento de actualización...");
  
  // 1. Validar si es la llave maestra del BFF
  if (cleanToken !== "" && cleanToken === secret) {
    console.log("✅ ACCESO MAESTRO CONCEDIDO: Guardando en DB...");
    req.user = { rol: 'ADMIN', source: 'internal' }; 
    return next();
  }
  
  console.log("⚠️ Token no coincide con INTERNAL_SERVICE_TOKEN. Intentando JWT...");
  
  // 2. Si no es la llave, verificar si es el Richard logueado
  return verifyToken(req, res, () => isAdmin(req, res, next));
};

// --- 🔓 RUTAS PÚBLICAS ---
router.get('/sedes/abiertas', facilityController.getSedesAbiertas);
router.get('/sedes', facilityController.getSedes);
router.get('/sedes/:id/equipos', facilityController.getEquiposPorSede);
router.get('/sedes/:id/disponibles', facilityController.getEquiposDisponibles);
router.get('/equipos', facilityController.getAllEquipos);

// --- 🛡️ RUTAS PROTEGIDAS (AQUÍ ES DONDE SE GUARDA) ---
router.post('/sedes', verifyAccess, facilityController.createSede);
router.patch('/sedes/:id/status', verifyToken, isAdmin, facilityController.updateStatus);
router.post('/equipos', verifyAccess, facilityController.createEquipo);

// 🎯 ESTA ES LA RUTA DEL BOTÓN DE MANTENIMIENTO:
router.patch('/equipos/:id', verifyAccess, facilityController.updateEquipo); 

router.delete('/equipos/:id', verifyAccess, facilityController.deleteEquipo);

module.exports = router;