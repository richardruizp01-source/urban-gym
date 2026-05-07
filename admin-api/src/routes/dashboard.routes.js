const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken'); // 👈 AGREGADO
const dashboardController = require("../controllers/dashboard.controller");

// 🔐 LOGIN - Genera JWT real
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    
    if (email === 'richard@urbangym.com' && password === 'richard123') {
        const token = jwt.sign(
            { id: 1, email, role: 'ADMIN' },
            'supersecreto',
            { expiresIn: '24h' }
        );
        return res.json({ success: true, token });
    }
    
    return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
});

// Dashboard principal
router.get("/dashboard", dashboardController.getDashboard);

// --- MIEMBROS ---
router.get("/miembros", dashboardController.getMiembros);
router.post("/miembros", dashboardController.createMiembro);
router.delete("/miembros/:id", dashboardController.deleteMiembro);

// --- STAFF (EMPLEADOS) ---
router.get("/staff", dashboardController.getStaff);
router.get("/staff/trainers", dashboardController.getTrainers);

// Reservas
router.get("/reservas", dashboardController.getReservas);
router.post("/reservas", dashboardController.createReserva);
router.delete("/reservas/:id", dashboardController.deleteReserva);

// Sedes
router.get("/sedes", dashboardController.getSedes);
router.post("/sedes", dashboardController.createSede);
router.patch("/sedes/:id/status", dashboardController.updateSedeStatus);

// --- MÁQUINAS ---
router.get("/maquinas", dashboardController.getMaquinas);
router.post("/maquinas", dashboardController.createMaquina);
router.patch("/maquinas/:id", dashboardController.updateMaquina);
router.delete("/maquinas/:id", dashboardController.deleteMaquina);

// EL EXPORTS SIEMPRE VA AL FINAL
module.exports = router;