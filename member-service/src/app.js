require("dotenv").config(); 
const express = require("express");
const cors = require("cors"); // 👈 ¡Fundamental para conectar con el Frontend!
const morgan = require("morgan"); // Para ver los logs de quién entra al sistema

const memberRoutes = require("./routes/member.routes");

const app = express();

// --- MIDDLEWARES DE SEGURIDAD Y CONTROL ---
app.use(cors()); // Permite que tu web en Vercel te haga peticiones
app.use(morgan("dev")); // Verás en consola: POST /api/v1/members/login 200
app.use(express.json()); // Entender los JSON que vienen del body

// --- RUTAS ---
// Usamos v1 para indicar que es la versión 1 de tu API
app.use("/api/v1/members", memberRoutes); 

// Ruta base para verificar que el microservicio está vivo
app.get("/", (req, res) => {
    res.json({
        service: "Urbangym Member Service",
        status: "Online",
        version: "1.0.0 (Prisma Edition)"
    });
});

// --- LEVANTAR SERVIDOR ---
// Usamos el 3001 para que el Admin BFF lo encuentre sin problemas
const PORT = process.env.PORT || 3001; 

app.listen(PORT, () => {
    console.log(`✅ Member Service (Prisma) listo en: http://localhost:${PORT}`);
    console.log(`🚀 Rutas activas en: http://localhost:${PORT}/api/v1/members`);
});
module.exports = app;