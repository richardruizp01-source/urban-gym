    const express = require('express');
    const { createProxyMiddleware } = require('http-proxy-middleware');
    const jwt = require('jsonwebtoken'); // 👈 Necesario para que no de error

    const app = express();
    const PORT = 8080;
    const JWT_SECRET = "supersecreto"; // 👈 Asegúrate que sea la misma de Members

    // 🛡️ Filtro de seguridad para el Token
    const validarToken = (req, res, next) => {
        if (req.path.includes('/login') || req.path.includes('/register')) return next();
        
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "No hay token" });

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return res.status(401).json({ error: "Token inválido" });
            req.user = decoded;
            next();
        });
    };

    // 👤 TU PUENTE A MIEMBROS (Puerto 3000 - Como tú lo tienes)
    app.use('/api/members', validarToken, createProxyMiddleware({
        target: 'http://localhost:3000', 
        changeOrigin: true,
        pathRewrite: (path, req) => {
            console.log(`🔍 [DEBUG] Path original: ${path}`);
            return '/api/members' + path; 
        },
        onProxyReq: (proxyReq, req) => {
            console.log(`📢 [GATEWAY] 👤 Enviando a MIEMBROS: ${req.method} ${req.url}`);
        }
    }));

    // 🏢 TU PUENTE A FACILITY (Puerto 3002)
    app.use('/api/facilities', validarToken, createProxyMiddleware({
        target: 'http://localhost:3002',
        changeOrigin: true,
        pathRewrite: { '^/api/facilities': '/api/facilities' }
    }));

    // 📡 PUENTE A IOT (Puerto 3004)
    app.use('/api/iot', createProxyMiddleware({
        target: 'http://localhost:3004',
        changeOrigin: true,
        pathRewrite: (path, req) => '/api/iot' + path,
        onProxyReq: (proxyReq, req) => {
            console.log(`📡 [GATEWAY] IoT: ${req.method} ${req.originalUrl}`);
        }
    }));

    app.listen(PORT, () => {
        console.log(`🚀 GATEWAY URBAN-GYM: http://localhost:${PORT}`);
        console.log(`🔗 Conectado a Miembros (3000) y Facility (3002)`);
    });

    // 👑 PUENTE A ADMIN API (Puerto 3005)
    app.use('/api/admin', createProxyMiddleware({
        target: 'http://localhost:3005',
        changeOrigin: true,
        pathRewrite: (path, req) => '/api/admin' + path,
        onProxyReq: (proxyReq, req) => {
            console.log(`👑 [GATEWAY] Admin: ${req.method} ${req.originalUrl}`);
        }
    }));