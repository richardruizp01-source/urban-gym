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

// 3. Obtener todos (MANTENIENDO TU LÓGICA - SOLO AGREGADO SEDE_ID)
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
            teléfono: u.teléfono || u.telefono,
            sede_id: u.sede_id // 👈 Agregado para que Ismael y los demás muestren su sede
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
        const member = await prisma.socio.findUnique({ where: { id } }); 
        if (!member || member.clases_restantes <= 0) {
            return res.status(400).json({ message: "No quedan clases disponibles." });
        }

        const updated = await prisma.socio.update({ 
            where: { id: id },
            data: { clases_restantes: { decrement: 1 } }
        });
        res.json({ message: "Clase descontada", restantes: updated.clases_restantes });
    } catch (error) {
        res.status(400).json({ error: "Error al descontar clase" });
    }
};

// 6. ACTUALIZAR ESTATUS
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

// 7. ELIMINAR SOCIO
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
        const member = await prisma.socio.findUnique({ 
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

        const member = await prisma.socio.findUnique({ 
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

// Obtener los alumnos (socios) de la MISMA SEDE que el staff logueado
exports.getMyStudents = async (req, res) => {
  try {
    const coachId = req.user.id;
    const modeloSocio = prisma.socio || prisma.socios;

    console.log("-----------------------------------------");
    console.log("🆔 COACH ID:", coachId);

    // 1. Identificar la sede del Staff/Coach actual
    const coachProfile = await modeloSocio.findUnique({
      where: { id: coachId },
      select: { sede_id: true }
    });

    if (!coachProfile || !coachProfile.sede_id) {
      console.log("⚠️ Alerta: Staff sin sede asignada.");
      return res.json({ 
        status: "success", 
        data: [], 
        message: "No tienes una sede vinculada en el sistema." 
      });
    }

    console.log("🏢 SEDE DETECTADA:", coachProfile.sede_id);

    // 2. Obtener alumnos de la misma sede incluyendo su FICHA TÉCNICA
    const students = await modeloSocio.findMany({
      where: {
        rol: 'SOCIO',
        sede_id: coachProfile.sede_id
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        estado_membresia: true,
        tipo_plan: true,
        fecha_vencimiento: true,
        // 🔥 Campo clave que acabamos de crear en Prisma:
        ficha_tecnica: true, 
        fecha_registro: true
      },
      orderBy: {
        nombre: 'asc' // Organizados alfabéticamente
      }
    });

    console.log(`✅ ${students.length} Titanes enviados al panel de gestión.`);
    console.log("-----------------------------------------");

    res.json({ 
      status: "success", 
      data: students 
    });

  } catch (error) {
    console.error("❌ ERROR EN GETMYSTUDENTS:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Error al obtener la lista de alumnos: " + error.message 
    });
  }
};

// 15. OBTENER SEDES ACTIVAS 
exports.getActiveBranches = async (req, res) => {
    try {
        const modeloSede = prisma.sede || prisma.sedes;

        if (!modeloSede) {
            return res.status(500).json({ 
                success: false, 
                error: "El modelo de Sedes no está definido en el cliente de Prisma." 
            });
        }

        const branches = await modeloSede.findMany({
            where: { 
                estado: 'ACTIVO' 
            },
            select: { 
                id: true, 
                nombre: true, 
                direccion: true 
            }
        });

        console.log(`✅ Sedes operativas encontradas: ${branches.length}`);
        res.json({ success: true, data: branches });

    } catch (error) {
        console.error("❌ ERROR EN GETACTIVEBRANCHES:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 16. ASIGNAR SEDE Y COACH
exports.assignStaffAndBranch = async (req, res) => {
    try {
        const { socio_id, sede_id, coach_id } = req.body;
        const modeloSocio = prisma.socio || prisma.socios;

        if (!socio_id || !sede_id || !coach_id) {
            return res.status(400).json({ 
                success: false, 
                message: "Faltan datos: socio_id, sede_id y coach_id son obligatorios." 
            });
        }

        const updated = await modeloSocio.update({
            where: { id: socio_id },
            data: { 
                sede_id: sede_id,
                coach_id: coach_id 
            }
        });

        console.log(`⚖️ Carga balanceada: ${updated.nombre} reasignado.`);
        
        res.json({ 
            success: true, 
            message: `Socio ${updated.nombre} asignado correctamente.` 
        });

    } catch (error) {
        console.error("❌ ERROR EN ASSIGNSTAFFANDBRANCH:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
// 17. ACTUALIZAR FICHA TÉCNICA (Socio o Coach)
exports.updateFichaTecnica = async (req, res) => {
    try {
        const { id } = req.params;
        const fichaData = req.body; // Aquí llega: peso, altura, lesiones, objetivo, etc.

        console.log(`📝 Actualizando ficha técnica del Titán: ${id}`);

        // Usamos el modelo socio (o socios según tu configuración)
        const modeloSocio = prisma.socio || prisma.socios;

        // Actualizamos al socio. 
        // Nota: Asegúrate de que en tu schema.prisma el modelo Socio tenga 
        // un campo llamado 'ficha_tecnica' de tipo Json o campos individuales.
        const updated = await modeloSocio.update({
            where: { id: id },
            data: {
                // Si guardas todo el objeto como JSON:
                ficha_tecnica: fichaData, 
                
                // Si prefieres campos individuales, tendrías que mapearlos así:
                // peso: fichaData.peso,
                // altura: fichaData.altura,
            }
        });

        res.json({ 
            success: true, 
            message: "✅ Ficha técnica sincronizada con éxito", 
            data: updated.ficha_tecnica 
        });

    } catch (error) {
        console.error("❌ ERROR EN UPDATEFICHATECNICA:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "No se pudo actualizar la ficha: " + error.message 
        });
    }
};

// 18. ENVIAR RUTINA AL ALUMNO
exports.enviarRutina = async (req, res) => {
  try {
    const { id } = req.params; // id del alumno
    const coach_id = req.user.id;
    const { contenido, objetivo } = req.body;

    const rutina = await prisma.rutina.create({
      data: {
        contenido,
        objetivo,
        alumno_id: id,
        coach_id
      }
    });

    res.json({ success: true, message: "✅ Rutina enviada", data: rutina });
  } catch (error) {
    console.error("❌ ERROR EN ENVIARRUTINA:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 19. OBTENER RUTINAS DE UN ALUMNO
exports.getRutinas = async (req, res) => {
  try {
    const { id } = req.params;

    const rutinas = await prisma.rutina.findMany({
      where: { alumno_id: id },
      orderBy: { fecha: 'desc' },
      include: {
        coach: { select: { nombre: true } }
      }
    });

    res.json({ success: true, data: rutinas });
  } catch (error) {
    console.error("❌ ERROR EN GETRUTINAS:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 20. ELIMINAR RUTINA
exports.eliminarRutina = async (req, res) => {
  try {
    const { rutina_id } = req.params;

    await prisma.rutina.delete({
      where: { id: rutina_id }
    });

    res.json({ success: true, message: "🗑️ Rutina eliminada" });
  } catch (error) {
    console.error("❌ ERROR EN ELIMINARRUTINA:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createSede = async (req, res) => {
    try {
        const { id, nombre, direccion } = req.body;
        const modeloSede = prisma.sede || prisma.sedes;
        
        const sede = await modeloSede.create({
            data: { id, nombre, direccion, estado: 'ACTIVO' }
        });
        
        res.status(201).json({ success: true, data: sede });
    } catch (error) {
        console.error("❌ ERROR CREANDO SEDE:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};