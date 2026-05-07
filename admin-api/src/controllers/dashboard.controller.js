const dashboardService = require("../services/dashboard.service");

exports.getDashboard = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const result = await dashboardService.getDashboard(token);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMiembros = async (req, res) => {
    try {
        const result = await dashboardService.getMiembros();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getReservas = async (req, res) => {
    try {
        const result = await dashboardService.getReservas();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getSedes = async (req, res) => {
    try {
        const result = await dashboardService.getSedes();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- GESTIÓN DE MÁQUINAS (ARSENAL) ---

exports.getMaquinas = async (req, res) => {
    console.log("📞 [BFF 3005] Petición recibida: GET /api/admin/maquinas");
    try {
        const result = await dashboardService.getMaquinas();
        console.log("✅ [BFF 3005] Datos obtenidos:", result.length, "máquinas.");
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("❌ [BFF 3005] Error en getMaquinas:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// NUEVO: Crear máquina
exports.createMaquina = async (req, res) => {
    try {
        const result = await dashboardService.createMaquina(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// NUEVO: Actualizar estado (Mantenimiento / Operativo)
exports.updateMaquina = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Prioridad: Usar el token que viene del Frontend (el del login de Richard)
        // 2. Si no, usar la llave maestra del .env
        const tokenParaEnviar = req.headers.authorization 
            ? req.headers.authorization.split(" ")[1] 
            : process.env.INTERNAL_SERVICE_TOKEN;

        console.log(`📡 [BFF 3005] Intentando actualizar máquina ${id} con token: ${tokenParaEnviar?.substring(0, 10)}...`);

        const result = await dashboardService.updateMaquina(id, req.body, tokenParaEnviar);
        
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("❌ [BFF 3005] Error en updateMaquina:", error.message);
        
        // Si el microservicio respondió con error, lo mostramos claro
        const status = error.response?.status || 500;
        const mensaje = error.response?.data?.error || error.message;
        
        res.status(status).json({ success: false, error: mensaje });
    }
};

//  NUEVO: Eliminar máquina
exports.deleteMaquina = async (req, res) => {
    try {
        const { id } = req.params;
        await dashboardService.deleteMaquina(id);
        res.status(200).json({ success: true, message: "Máquina eliminada del arsenal" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- GESTIÓN DE MIEMBROS Y STAFF ---

exports.createMiembro = async (req, res) => {
    try {
        console.log("📌 Datos recibidos:", req.body);
        const memberData = req.body;
        const result = await dashboardService.createMiembro(memberData);
        console.log("✅ Miembro creado:", result);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        console.error("❌ Error creando miembro:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteMiembro = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await dashboardService.deleteMiembro(id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getStaff = async (req, res) => {
    try {
        const result = await dashboardService.getStaff();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createSede = async (req, res) => {
    try {
        const result = await dashboardService.createSede(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateSedeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await dashboardService.updateSedeStatus(id, req.body);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createReserva = async (req, res) => {
    try {
        const result = await dashboardService.createReserva(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteReserva = async (req, res) => {
    try {
        const { id } = req.params;
        await dashboardService.deleteReserva(id);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTrainers = async (req, res) => {
    try {
        const result = await dashboardService.getTrainers();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};