    const jwt = require('jsonwebtoken');

    // 1. Primero verificamos que el Token sea válido
    const verifyToken = (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        // Si es la llave maestra del BFF, saltamos la validación de JWT
        if (token === process.env.INTERNAL_SERVICE_TOKEN) {
            req.user = { rol: 'ADMIN', internal: true };
            return next();
        }

        // Si es un token de usuario, lo verificamos
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Aquí inyectamos el ID, email y ROL
            next();
        } catch (error) {
            return res.status(401).json({ message: "Token inválido o expirado" });
        }
    };

    // 2. Ahora el que tú me pasaste (corregido para usar el INTERNAL_SERVICE_TOKEN)
    const isAdmin = (req, res, next) => {
        // Revisamos el rol que inyectó verifyToken
        const userRole = req.user?.rol || req.user?.role; 

        // Si el rol es ADMIN (ya sea por JWT o por llave maestra), pasa.
        if (userRole === 'ADMIN') {
            return next();
        }
        
        return res.status(403).json({ 
            success: false, 
            message: "Acceso denegado: Se requieren permisos de administrador." 
        });
    };

    module.exports = { verifyToken, isAdmin };