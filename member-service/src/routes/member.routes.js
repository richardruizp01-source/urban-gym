const express = require("express");
const router = express.Router();
const memberController = require("../controllers/member.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

// --- 1. RUTAS COMPLETAMENTE PÚBLICAS (Sin Token) ---
router.get("/trainers", memberController.getTrainers); 
router.post("/register", memberController.register); 
router.post("/login", memberController.login); 

// 🔥 NUEVA: El cliente necesita ver sedes para registrarse
router.get("/active-branches", memberController.getActiveBranches); 

// --- 2. RUTAS DE ADMINISTRACIÓN (Requieren Token y Admin) ---
router.patch("/assign-workload", verifyToken, isAdmin, memberController.assignStaffAndBranch);

// --- 2.5 RUTAS PARA EL COACH ---
router.get("/my-students", verifyToken, memberController.getMyStudents);
router.post("/:id/rutinas", verifyToken, memberController.enviarRutina);
router.get("/:id/rutinas", verifyToken, memberController.getRutinas);
router.delete("/:id/rutinas/:rutina_id", verifyToken, memberController.eliminarRutina);

// Obtener todos los socios para el panel
router.get("/", verifyToken, isAdmin, memberController.getAll); 
router.post("/", verifyToken, isAdmin, memberController.register); 

// Suscripción, Estado y Eliminación
router.post("/subscribe", verifyToken, isAdmin, memberController.subscribe);
router.patch("/:id/status", verifyToken, isAdmin, memberController.updateStatus);
router.put("/:id/ficha-tecnica", verifyToken, memberController.updateFichaTecnica);
router.delete("/:id", verifyToken, isAdmin, memberController.deleteMember); 

// --- 3. RUTAS DE USO / QR ---
router.patch("/:id/use-class", verifyToken, isAdmin, memberController.useClass);
router.get("/:id/qr", verifyToken, memberController.generateAccessQR);
router.post('/validar-qr', memberController.validarQR);
router.post('/activar-acceso', memberController.activarAcceso);

// --- 4. PERFIL DEL USUARIO LOGUEADO ---
router.get("/me", verifyToken, memberController.getMe); 
router.post("/:id/reset-password", verifyToken, isAdmin, memberController.resetPassword);

// Sincronización de sedes desde admin-api
router.post("/sedes", verifyToken, isAdmin, memberController.createSede);

module.exports = router;