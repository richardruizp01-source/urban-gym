const express = require("express");
const cors = require("cors");
require("dotenv").config();

const iotRoutes = require("./src/routes/iot.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/iot", iotRoutes);

app.get("/", (req, res) => {
    res.json({ 
        message: "IoT Integration Service activo 🔥",
        version: "1.0",
        endpoints: [
            "POST /api/iot/machines/auth",
            "POST /api/iot/access/validate",
            "POST /api/iot/training-data",
            "GET  /api/iot/machines",
            "GET  /api/iot/machines/:machine_id/events",
            "GET  /api/iot/members/:miembro_id/access"
        ]
    });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`✅ IoT Integration Service corriendo en http://localhost:${PORT}`);
    console.log(`📡 Redis broker activo para eventos gym.*`);
});