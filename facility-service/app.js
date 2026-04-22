const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Importamos el archivo de rutas
const facilityRoutes = require('./src/routes/facility.routes');

const app = express();

// --- MIDDLEWARES (El orden importa) ---
app.use(cors());
// ✅ Esta línea traduce el JSON que envías desde Thunder Client
app.use(express.json()); 

// 2. Conectamos las rutas
app.use('/api/facilities', facilityRoutes);

// Ruta de prueba
app.get('/test', (req, res) => {
    res.json({ message: "🏢 Facility-Service está vivo y conectado" });
});

// Usamos el puerto del .env o el 3002 por defecto
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`🚀 Facility-Service corriendo en el puerto ${PORT}`);
    console.log(`🔗 Prueba las sedes en: http://localhost:${PORT}/api/facilities/sedes`);
});