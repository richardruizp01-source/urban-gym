const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ 
            success: false, 
            error: "Formato de token inválido" 
        });
    }

    const token = authHeader.split(" ")[1];

    // 1. Llave maestra
    if (token === process.env.INTERNAL_SERVICE_TOKEN || token === 'urbangym_internal_2024') {
        req.user = { id: "internal", rol: "ADMIN" };
        return next();
    }

    // 2. Verificación con el secreto compartido (supersecreto)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("❌ JWT Error:", err.message); // Esto te dirá si el secreto no coincide
            return res.status(401).json({ error: "Token inválido o expirado" });
        }

        // 🔍 LOG DE DEPURACIÓN: Mira esto en la terminal
        console.log("📦 Contenido del Token decodificado:", decoded);

        // Mapeamos los datos asegurándonos de capturar el rol
        req.user = {
            id: decoded.id,
            rol: decoded.rol || decoded.role, // Acepta ambos por si acaso
            email: decoded.email
        };

        next();
    });
};

const isAdmin = (req, res, next) => {
    // 🔍 LOG DE ROL:
    console.log("🛡️ Verificando Rol:", req.user?.rol);

    const esAdmin = req.user && (
        req.user.rol === 'ADMIN' || 
        req.user.rol === 'RECEPCION' || 
        req.user.id === 'internal'
    );

    if (esAdmin) {
        return next();
    } else {
        return res.status(403).json({ 
            success: false, 
            error: `Prohibido: Tu rol actual es ${req.user?.rol || 'Nulo'}` 
        });
    }
};

module.exports = { verifyToken, isAdmin };