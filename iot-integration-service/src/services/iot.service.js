const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const redis = require("../config/redis");
require("dotenv").config();

// ─────────────────────────────────────────
// 1. AUTENTICAR MÁQUINA
// ─────────────────────────────────────────
exports.authenticateMachine = async ({ machine_id, machine_type, secret_key }) => {
    if (secret_key !== process.env.MACHINE_SECRET) {
        throw { status: 401, message: "Clave de máquina incorrecta" };
    }

    const token = jwt.sign(
        { machine_id, machine_type },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    await redis.set(`machine:${machine_id}`, JSON.stringify({
        machine_id,
        machine_type,
        status: "active",
        authenticated_at: new Date().toISOString()
    }), { EX: 86400 });

    return { message: `Máquina ${machine_id} autenticada 🔥`, token };
};

// ─────────────────────────────────────────
// 2. VALIDAR ACCESO POR QR
// ─────────────────────────────────────────
exports.validateQRAccess = async ({ miembro_id, machine_id }) => {
    const machine = await redis.get(`machine:${machine_id}`);
    if (!machine) {
        throw { status: 403, message: "Máquina no autenticada" };
    }

    const evento = {
        event_id: uuidv4(),
        type: "ACCESS_GRANTED",
        miembro_id,
        machine_id,
        timestamp: new Date().toISOString()
    };

    await redis.publish("gym.access.granted", JSON.stringify(evento));
    await redis.lPush(`access:${miembro_id}`, JSON.stringify(evento));

    return {
        access: true,
        message: "Acceso concedido 🔥",
        event_id: evento.event_id
    };
};

// ─────────────────────────────────────────
// 3. RECIBIR Y NORMALIZAR DATOS DE ENTRENAMIENTO
// ─────────────────────────────────────────
exports.receiveTrainingData = async ({ machine_id, miembro_id, raw_data }) => {
    const machine = await redis.get(`machine:${machine_id}`);
    if (!machine) {
        throw { status: 403, message: "Máquina no autenticada" };
    }

    const normalized = {
        event_id: uuidv4(),
        type: "TRAINING_COMPLETED",
        machine_id,
        miembro_id,
        timestamp: new Date().toISOString(),
        data: {
            duration_seconds: raw_data.duration || 0,
            calories_burned: raw_data.calories || 0,
            heart_rate_avg: raw_data.heart_rate || null,
            distance_km: raw_data.distance || null,
            resistance_level: raw_data.resistance || null,
            speed_avg: raw_data.speed || null,
        },
        source: "iot-integration-service",
        version: "1.0"
    };

    await redis.publish("gym.training.completed", JSON.stringify(normalized));
    await redis.lPush(`training:${miembro_id}`, JSON.stringify(normalized));
    await redis.lPush(`events:${machine_id}`, JSON.stringify(normalized));

    return {
        message: "Datos normalizados y publicados 🔥",
        event_id: normalized.event_id,
        normalized
    };
};

// ─────────────────────────────────────────
// 4. VER EVENTOS DE UNA MÁQUINA
// ─────────────────────────────────────────
exports.getMachineEvents = async (machine_id) => {
    const machine = await redis.get(`machine:${machine_id}`);
    if (!machine) throw { status: 404, message: "Máquina no encontrada" };

    const events = await redis.lRange(`events:${machine_id}`, 0, 19);
    return {
        machine: JSON.parse(machine),
        events: events.map(e => JSON.parse(e))
    };
};

// ─────────────────────────────────────────
// 5. VER TODAS LAS MÁQUINAS AUTENTICADAS
// ─────────────────────────────────────────
exports.getAllMachines = async () => {
    const keys = await redis.keys("machine:*");
    if (keys.length === 0) return [];
    const machines = await Promise.all(keys.map(k => redis.get(k)));
    return machines.map(m => JSON.parse(m));
};

// ─────────────────────────────────────────
// 6. HISTORIAL DE ACCESOS DE UN MIEMBRO
// ─────────────────────────────────────────
exports.getMemberAccessHistory = async (miembro_id) => {
    const events = await redis.lRange(`access:${miembro_id}`, 0, 19);
    return {
        miembro_id,
        accesos: events.map(e => JSON.parse(e))
    };
};