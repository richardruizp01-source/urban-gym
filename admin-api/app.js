const express = require("express");
const cors = require("cors");
require("dotenv").config();

const dashboardRoutes = require("./src/routes/dashboard.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", dashboardRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Admin API BFF activo 🔥",
        version: "1.0",
        endpoints: [
            "GET /api/admin/dashboard",
            "GET /api/admin/miembros",
            "GET /api/admin/reservas",
            "GET /api/admin/sedes",
            "GET /api/admin/maquinas",
            "GET /api/admin/staff",
        ]
    });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`✅ Admin API BFF corriendo en http://localhost:${PORT}`);
});