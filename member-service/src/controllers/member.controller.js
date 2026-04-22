const memberService = require("../services/member.service"); 
const prisma = require("../config/db"); 
const QRCode = require('qrcode');

console.log("💎 Estado de Prisma:", prisma ? "CONECTADO" : "ES UNDEFINED");

// 1. Registro
exports.register = async (req, res) => {
    try {
        const result = await memberService.register(req.body); 
        res.status(201).json(result); 
    } catch (error) {
        console.error("❌ ERROR EN REGISTRO:", error);
        res.status(error.status || 500).json({ error: error.message });
    }
};

// 2. Login
exports.login = async (req, res) => {
    try {
        const result = await memberService.login(req.body);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

// 3. Obtener todos (ARREGLADO)
exports.getAll = async (req, res) => {
    try {
        const modeloSocios = prisma.socios || prisma.socio;

        if (!modeloSocios) {
            console.error("❌ No se encontró el modelo en Prisma. Revisa tu schema.prisma");
            return res.status(500).json({ error: "Modelo no configurado" });
        }

        const users = await modeloSocios.findMany(); 

        const formattedUsers = users.map(u => ({
            id: u.id,
            nombre: u.nombre,
            email: u["Correo electrónico"] || u.email,
            rol: u.rol,
            estado_membresia: u.estado_membresia,
            tipo_plan: u.tipo_plan,
            fecha_vencimiento: u.fecha_vencimiento,
            ultimo_pago: u.ultimo_pago,
            teléfono: u.teléfono || u.telefono
        }));

        console.log(`✅ Titanes cargados: ${formattedUsers.length}`);
        res.json(formattedUsers); 

    } catch (error) {
        console.error("❌ ERROR EN GETALL:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// 4. Obtener por ID
exports.getMemberById = async (req, res) => {
    try {
        const member = await memberService.getById(req.params.id);
        res.json(member);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

// 5. Descontar una clase
exports.useClass = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await prisma.socio.findUnique({ where: { id } }); // 👈 fix
        if (!member || member.clases_restantes <= 0) {
            return res.status(400).json({ message: "No quedan clases disponibles." });
        }

        const updated = await prisma.socio.update({ // 👈 fix
            where: { id: id },
            data: { clases_restantes: { decrement: 1 } }
        });
        res.json({ message: "Clase descontada", restantes: updated.clases_restantes });
    } catch (error) {
        res.status(400).json({ error: "Error al descontar clase" });
    }
};

// 6. ACTUALIZAR ESTATUS (Conectado a tu función 'cambiarEstado')
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const result = await memberService.cambiarEstado(id, estado);
        res.status(result.status).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

// 7. ELIMINAR SOCIO (Conectado a tu función 'deleteMember' del servicio)
exports.deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await memberService.deleteMember(id);
        res.status(result.status).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

// 8. GENERAR QR
exports.generateAccessQR = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await prisma.socio.findUnique({ // 👈 fix
            where: { id: id },
            select: { id: true, estado_membresia: true, nombre: true }
        });

        if (!member || member.estado_membresia !== 'ACTIVE') {
            return res.status(403).json({ 
                message: "Acceso denegado: Suscripción inactiva o vencida." 
            });
        }

        const qrData = JSON.stringify({
            id: member.id,
            nombre: member.nombre,
            expira: new Date(Date.now() + 30000)
        });

        const qrImage = await QRCode.toDataURL(qrData);
        res.json({ qr: qrImage, expira: new Date(Date.now() + 30000) });
    } catch (error) {
        res.status(500).json({ error: "Error al generar el QR" });
    }
};

// 9. ACTIVAR SUSCRIPCIÓN
exports.subscribe = async (req, res) => {
    try {
        const { miembro_id, tipo_plan } = req.body;
        const result = await memberService.activarSuscripcion(miembro_id, tipo_plan);
        res.status(result.status).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

// 10. OBTENER ENTRENADORES
exports.getTrainers = async (req, res) => {
  try {
    const db = prisma || require("../config/db");
    const modeloSocio = db.socios || db.socio;

    if (!modeloSocio) {
      console.error("❌ Ni 'socios' ni 'socio' existen en el modelo de Prisma.");
      return res.status(500).json({ error: "El modelo de usuarios no está definido en Prisma." });
    }

    const trainers = await modeloSocio.findMany({
      where: { rol: 'TRAINER' },
      select: { id: true, nombre: true }
    });

    console.log(`✅ ${trainers.length} estrategas encontrados.`);
    res.json(trainers);

  } catch (error) {
    console.error("❌ Error en getTrainers:", error.message);
    res.status(500).json({ error: "Error de servidor: " + error.message });
  }
};

// 11. VALIDAR QR
exports.validarQR = async (req, res) => {
    try {
        const { qrData } = req.body;
        const datos = JSON.parse(qrData);

        const expira = new Date(datos.expira);
        if (new Date() > expira) {
            return res.status(400).json({ message: "❌ QR expirado." });
        }

        const member = await prisma.socio.findUnique({ // 👈 fix
            where: { id: datos.id },
            select: { id: true, nombre: true, estado_membresia: true }
        });

        if (!member || member.estado_membresia !== 'ACTIVE') {
            return res.status(403).json({ message: "❌ Acceso denegado." });
        }

        res.json({ 
            message: "✅ Acceso permitido", 
            nombre: member.nombre,
            id: member.id
        });
    } catch (error) {
        res.status(500).json({ error: "Error al validar QR" });
    }
};

// 12. ACTIVAR/DESACTIVAR ACCESO
exports.activarAcceso = async (req, res) => {
    try {
        const { socio_id, estado, membresia, fecha_vence } = req.body;

        const estadoNormalizado = estado === 'ACTIVO' ? 'ACTIVE' : 
                                   estado === 'INACTIVO' ? 'INACTIVE' : estado;

        const data = { estado_membresia: estadoNormalizado };
        if (membresia) data.tipo_plan = membresia.toUpperCase();
        if (fecha_vence) data.fecha_vencimiento = new Date(fecha_vence);

        await prisma.socio.update({
            where: { id: socio_id },
            data
        });

        res.json({ message: `✅ Acceso actualizado a ${estadoNormalizado}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// 13. PERFIL DEL USUARIO LOGUEADO
exports.getMe = async (req, res) => {
  try {
    const member = await prisma.socio.findUnique({
      where: { id: req.user.id }
    });
    if (!member) return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// 14. RESETEAR CONTRASEÑA (Admin)
exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const bcrypt = require('bcryptjs');
        
        // Generar contraseña temporal
        const temporal = 'GYM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const hashed = await bcrypt.hash(temporal, 10);

        await prisma.socio.update({
            where: { id },
            data: { password: hashed }
        });

        res.json({ success: true, password_temporal: temporal });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};