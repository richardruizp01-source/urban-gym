const axios = require("axios");
require("dotenv").config();

const MEMBER_URL = process.env.MEMBER_SERVICE_URL;
const BOOKING_URL = process.env.BOOKING_SERVICE_URL;
const FACILITY_URL = process.env.FACILITY_SERVICE_URL;
const IOT_URL = process.env.IOT_SERVICE_URL;

/**
 * Helper para asegurar que siempre devolvemos un Array 
 */
const toArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.equipos && Array.isArray(data.equipos)) return data.equipos;
    return [];
};

/**
 * Helper para los headers de seguridad interna
 */
const getHeaders = () => ({
    headers: { Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}` }
}); // ✅ Corregido el error de llave que tenías aquí

// --- DASHBOARD PRINCIPAL ---
exports.getDashboard = async () => {
    const [miembros, instancias, sedes, maquinas] = await Promise.allSettled([
        axios.get(`${MEMBER_URL}/api/v1/members`, getHeaders()),
        axios.get(`${BOOKING_URL}/api/v1/bookings/instancias`), // 👈 CORREGIDO
        axios.get(`${FACILITY_URL}/api/facilities/sedes`),
        axios.get(`${FACILITY_URL}/api/facilities/equipos`), 
    ]);

    const miembrosVal = miembros.status === "fulfilled" ? miembros.value.data : [];
    const instanciasVal = instancias.status === "fulfilled" ? instancias.value.data : []; // 👈 CORREGIDO
    const sedesVal = sedes.status === "fulfilled" ? sedes.value.data : [];
    const maquinasVal = maquinas.status === "fulfilled" ? maquinas.value.data : [];

    const allUsers = toArray(miembrosVal);
    const instanciasData = toArray(instanciasVal); // 👈 CORREGIDO
    const sedesData = toArray(sedesVal);
    const maquinasData = toArray(maquinasVal);

    const hoy = new Date().toISOString().split("T")[0];

    const soloSocios = allUsers.filter(u => {
        const r = (u.role || u.rol || "").toString().trim().toUpperCase();
        return r === "SOCIO";
    });

    const soloStaff = allUsers.filter(u => {
        const r = (u.role || u.rol || "").toString().trim().toUpperCase();
        return r === "TRAINER" || r === "RECEPCION";
    });

    const maquinasMapeadas = (maquinasData || []).map(m => ({
        id: m.id,
        nombre: m.nombre || m.nombre_maquina,
        area: m.area || m.categoria,
        estado: m.estado,
        sede_id: m.sede_id || m.id_sede
    }));

    return {
        resumen: {
            total_miembros: soloSocios.length,
            miembros_activos: soloSocios.filter(m => m.estado_membresia === "ACTIVE").length,
            miembros_inactivos: soloSocios.filter(m => m.estado_membresia !== "ACTIVE").length,
            total_reservas: instanciasData.length,
            reservas_hoy: instanciasData.filter(r => r.fecha_inicio?.startsWith(hoy)).length, // 👈 CORREGIDO: fecha_inicio
            total_sedes: sedesData.length,
            sedes_activas: sedesData.filter(s => s.esta_activa).length,
            maquinas_activas: maquinasMapeadas.length,
            total_staff: soloStaff.length,
        },
        miembros_recientes: soloSocios.slice(-5).reverse(),
        reservas_recientes: instanciasData.slice(-5).reverse(), // 👈 CORREGIDO
        sedes: sedesData,
        maquinas: maquinasMapeadas
    };
};

// --- GESTIÓN DE MIEMBROS ---
exports.getMiembros = async () => {
    const response = await axios.get(`${MEMBER_URL}/api/v1/members`, getHeaders());
    const data = toArray(response.data);
    return data.filter(u => {
        const r = (u.role || u.rol || "").toString().trim().toUpperCase();
        return r === "SOCIO";
    });
};

exports.getStaff = async () => {
    const response = await axios.get(`${MEMBER_URL}/api/v1/members`, getHeaders());
    const data = toArray(response.data);
    return data.filter(u => {
        const r = (u.role || u.rol || "").toString().trim().toUpperCase();
        return r === 'TRAINER' || r === 'RECEPCION';
    });
};

exports.createMiembro = async (memberData) => {
    const response = await axios.post(`${MEMBER_URL}/api/v1/members`, memberData, getHeaders());
    return response.data;
};

exports.deleteMiembro = async (id) => {
    const response = await axios.delete(`${MEMBER_URL}/api/v1/members/${id}`, getHeaders());
    return response.data;
};

// --- OTROS SERVICIOS ---
exports.getReservas = async () => {
    const response = await axios.get(`${BOOKING_URL}/api/v1/bookings/instancias`); // 👈 CORREGIDO
    return toArray(response.data);
};

exports.getSedes = async () => {
    const response = await axios.get(`${FACILITY_URL}/api/facilities/sedes`);
    return toArray(response.data);
};

// 🛠️ FUNCIÓN ARSENAL
exports.getMaquinas = async () => {
    try {
        const response = await axios.get(`${FACILITY_URL}/api/facilities/equipos`);
        const data = toArray(response.data.data || response.data);
        return data.map(m => ({
            id: m.id,
            nombre: m.nombre || m.nombre_maquina || "Equipo Urbano",
            marca: m.marca || "Matrix/LifeFitness",
            estado: m.estado || "OPERATIVO",
            area: (m.area || "MUSCULACION").toUpperCase(),
            serial_number: m.serial_number || "S/N",
            sede_id: m.sede_id || m.id_sede || (m.sede && m.sede.id)
        }));
    } catch (error) {
        return []; 
    }
};

// --- GESTIÓN AVANZADA DE MÁQUINAS (CON SEGURIDAD) ---
exports.createMaquina = async (maquinaData) => {
    const response = await axios.post(`${FACILITY_URL}/api/facilities/equipos`, maquinaData, getHeaders());
    return response.data;
};

exports.updateMaquina = async (id, updateData) => {
    // 🚀 Cambiado para usar getHeaders() y coincidir con tu seguridad interna
    const response = await axios.patch(`${FACILITY_URL}/api/facilities/equipos/${id}`, updateData, getHeaders());
    return response.data;
};

exports.deleteMaquina = async (id) => {
    const response = await axios.delete(`${FACILITY_URL}/api/facilities/equipos/${id}`, getHeaders());
    return response.data;
};

exports.createSede = async (sedeData) => {
    const response = await axios.post(`${FACILITY_URL}/api/facilities/sedes`, sedeData, getHeaders());
    return response.data;
};

exports.updateSedeStatus = async (id, updateData) => {
    const response = await axios.patch(`${FACILITY_URL}/api/facilities/sedes/${id}/status`, updateData, getHeaders());
    return response.data;
};