const jwt = require("jsonwebtoken");

// Verificar token de miembro
const verifyMember = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token === process.env.INTERNAL_SERVICE_TOKEN) {
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET || "supersecreto", (err, user) => {
        if (err) return res.status(401).json({ error: "Token inválido" });
        req.user = user;
        next();
    });
};

// Verificar token de máquina
const verifyMachine = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // 🔍 ESTO ES LO QUE TIENES QUE PEGAR AQUÍ:
    console.log("--- DEBUG IOT ---");
    console.log("Token recibido:", token);
    console.log("Token esperado:", process.env.INTERNAL_SERVICE_TOKEN);
    console.log("¿Son iguales?:", token === process.env.INTERNAL_SERVICE_TOKEN);

    if (!authHeader) return res.status(403).json({ error: "Token de máquina requerido" });

    // 🔑 VALIDACIÓN DE LLAVE MAESTRA
    if (token === process.env.INTERNAL_SERVICE_TOKEN) {
        console.log("🔓 Acceso de máquina concedido vía llave maestra");
        return next();
    }

    // Validación normal vía JWT
    jwt.verify(token, process.env.JWT_SECRET || "supersecreto", (err, machine) => {
        if (err) return res.status(401).json({ error: "Máquina no autorizada" });
        req.machine = machine;
        next();
    });
};

module.exports = { verifyMember, verifyMachine };