const prisma = require('../config/db');

// --- 🏢 SECCIÓN DE SEDES ---

// 1. Obtener todas las sedes (con capacidad y horarios)
exports.getSedes = async (req, res) => {
    try {
        const sedes = await prisma.sede.findMany({
            include: { 
                _count: { select: { equipos: true } }
            }
        });
        res.json({ success: true, data: sedes });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 2. Consultar Sedes ABIERTAS actualmente 🕒
exports.getSedesAbiertas = async (req, res) => {
    try {
        const ahora = new Date().toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const sedes = await prisma.sede.findMany({
            where: {
                AND: [
                    { hora_apertura: { lte: ahora } },
                    { hora_cierre: { gte: ahora } },
                    { esta_activa: true }
                ]
            }
        });

        res.json({ 
            success: true, 
            hora_consulta: ahora, 
            total_abiertas: sedes.length, 
            data: sedes 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 3. Crear una nueva Sede
exports.createSede = async (req, res) => {
    const { nombre, direccion, ciudad, hora_apertura, hora_cierre, capacidad_max } = req.body;
    try {
        const nuevaSede = await prisma.sede.create({
            data: { 
                nombre, 
                direccion, 
                ciudad: ciudad || "Montería",
                hora_apertura: hora_apertura || "06:00",
                hora_cierre: hora_cierre || "22:00",
                capacidad_max: capacidad_max || 50
            }
        });
        res.status(201).json({ success: true, data: nuevaSede });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- 🏋️‍♂️ SECCIÓN DE EQUIPOS ---

// 4. Obtener solo máquinas DISPONIBLES (OPERATIVO) en una sede ✅ CORREGIDO
exports.getEquiposDisponibles = async (req, res) => {
    const { id } = req.params;
    try {
        const equipos = await prisma.equipo.findMany({
            where: { 
                sede_id: id,
                estado: 'OPERATIVO'
            },
            include: { sede: true }
        });
        res.json({ 
            success: true, 
            count: equipos.length, 
            data: equipos 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 5. Registrar equipo con fecha de revisión AUTOMÁTICA (+3 meses)
exports.createEquipo = async (req, res) => {
    const { nombre, marca, area, serial_number, sede_id, proxima_revision } = req.body;
    
    try {
        let fechaSugerida = new Date();
        fechaSugerida.setDate(fechaSugerida.getDate() + 90);

        const nuevoEquipo = await prisma.equipo.create({
            data: { 
                nombre, 
                marca, 
                area: area || 'CARDIO',
                serial_number,
                sede_id,
                proxima_revision: proxima_revision ? new Date(proxima_revision) : fechaSugerida,
                ultima_revision: new Date()
            }
        });

        res.status(201).json({ success: true, data: nuevoEquipo });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 6. Actualizar estado y registrar última revisión
exports.updateEquipo = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    
    try {
        const equipoActualizado = await prisma.equipo.update({
            where: { id },
            data: { 
                estado,
                ultima_revision: new Date(),
            }
        });

        console.log(`🔧 [DB UPDATE] Equipo ${equipoActualizado.serial_number} -> ${estado}`);

        res.json({ success: true, data: equipoActualizado });
    } catch (err) {
        console.error("❌ Error al actualizar equipo en DB:", err.message);
        res.status(500).json({ 
            success: false, 
            error: "No se pudo sincronizar el estado con la base de datos" 
        });
    }
};

// 7. Obtener TODOS los equipos de una sede ✅ CORREGIDO
exports.getEquiposPorSede = async (req, res) => {
    const { id } = req.params;
    try {
        const equipos = await prisma.equipo.findMany({
            where: { sede_id: id },
            include: { sede: true }
        });
        res.json({ success: true, data: equipos });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 8. Eliminar un equipo
exports.deleteEquipo = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.equipo.delete({ where: { id } });
        res.json({ success: true, message: "🗑️ Equipo eliminado" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 9. Obtener TODOS los equipos ✅ CORREGIDO
exports.getAllEquipos = async (req, res) => {
    try {
        const equipos = await prisma.equipo.findMany({
            include: { sede: true }
        });
        console.log("🏢 [Facility-Service] Enviando datos con sede al cliente");
        res.json({ success: true, data: equipos });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 10. Cambiar estado de activación de la sede
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { esta_activa } = req.body;

    try {
        const sedeActualizada = await prisma.sede.update({
            where: { id },
            data: { esta_activa }
        });

        console.log(`✅ Sede ${id} actualizada a: ${esta_activa}`);
        
        res.json({ 
            success: true, 
            message: "Estado de la sede actualizado",
            data: sedeActualizada 
        });
    } catch (err) {
        console.error("❌ Error en updateStatus:", err.message);
        res.status(500).json({ 
            success: false, 
            error: "No se pudo actualizar la sede en la base de datos" 
        });
    }
};