const express = require("express");
const router = express.Router();
const memberController = require("../controllers/member.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

// --- 1. RUTAS COMPLETAMENTE PÚBLICAS (Sin Token) ---
// Ponemos /trainers al inicio para que Express la encuentre primero
router.get("/trainers", memberController.getTrainers); 
router.post("/register", memberController.register); 
router.post("/login", memberController.login); 

// --- 2. RUTAS DE ADMINISTRACIÓN (Requieren Token y Admin) ---

// Obtener todos los socios para el panel
router.get("/", verifyToken, isAdmin, memberController.getAll); 

// Registro administrativo
router.post("/", verifyToken, isAdmin, memberController.register); 

// Suscripción, Estado y Eliminación
router.post("/subscribe", verifyToken, isAdmin, memberController.subscribe);
router.patch("/:id/status", verifyToken, isAdmin, memberController.updateStatus);
router.delete("/:id", verifyToken, isAdmin, memberController.deleteMember); 

// --- 3. RUTAS DE USO / QR ---

// Descontar clase
router.patch("/:id/use-class", verifyToken, isAdmin, memberController.useClass);

// Generar QR (Cualquier usuario logueado)
router.get("/:id/qr", verifyToken, memberController.generateAccessQR);
router.post('/validar-qr', memberController.validarQR);
// Activar/Desactivar acceso (Llamado por billing-service)
router.post('/activar-acceso', memberController.activarAcceso);

// --- 4. PERFIL DEL USUARIO LOGUEADO ---
router.get("/me", verifyToken, memberController.getMe); // 👈 agregado
// Reset de contraseña
router.post("/:id/reset-password", verifyToken, isAdmin, memberController.resetPassword);
module.exports = router;