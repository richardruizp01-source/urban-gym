const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. REGISTRO (CON RASTREO DE DATOS PARA SEDE)
exports.register = async ({ nombre, email, telefono, password, rol, salario, especialidad, tipo_plan, sede_id }) => {
  try {
    // 🔍 PRUEBA DE ORO: Esto saldrá en tu terminal de VS Code
    console.log("-----------------------------------------");
    console.log("🚀 INTENTANDO REGISTRAR TITÁN:");
    console.log(`   👤 Nombre: ${nombre}`);
    console.log(`   🏢 ID de Sede recibida: ${sede_id || '⚠️ VIENE VACÍO'}`);
    console.log("-----------------------------------------");

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let rolFinal = (rol || 'SOCIO').toUpperCase();
    if (rolFinal === 'ENTRENADOR') rolFinal = 'TRAINER';
    if (rolFinal === 'RECEPCIONISTA') rolFinal = 'RECEPCION';

    const esSocio = rolFinal === 'SOCIO';
    const hoy = new Date();
    const planFinal = esSocio ? (tipo_plan?.toUpperCase() || 'BASICO') : null;
    
    const usuario = await prisma.socio.create({
      data: {
        nombre: nombre,
        email: email, 
        password: hashedPassword,
        telefono: telefono || null,
        rol: rolFinal,
        salario: salario ? parseFloat(salario) : null,
        especialidad: especialidad || null,
        estado_membresia: esSocio ? 'INACTIVE' : 'ACTIVE',
        tipo_plan: planFinal,
        ultimo_pago: null,
        fecha_vencimiento: null,
        sede_id: sede_id || null, // 👈 Se guarda en la columna que vimos en tu schema.prisma
      }
    });

    return { status: 201, message: "Usuario registrado ✅", id: usuario.id, rol: usuario.rol };
  } catch (error) {
    console.error("❌ Error en registro:", error);
    throw error;
  }
};

// 2. LOGIN (ARREGLADO)
exports.login = async ({ email, password }) => {
  try {
    const user = await prisma.socio.findUnique({
      where: { email: email },
      include: { sede: true }
    });

    if (!user) throw { status: 404, message: "Email no registrado" };

    const valido = await bcrypt.compare(password, user.password);
    if (!valido) throw { status: 401, message: "Contraseña incorrecta" };

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol }, 
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return { 
      status: 200, 
      message: "Bienvenido 🔥", 
      token, 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        rol: user.rol, 
        email: user.email, 
        sede_id: user.sede_id,
        sede: user.sede?.nombre || null
      }
    };
  } catch (error) {
    console.error("❌ Error en login:", error);
    throw error;
  }
};

// 3. OBTENER TODOS (ARREGLADO)
exports.getAll = async () => {
  try {
    return await prisma.socio.findMany();
  } catch (error) {
    console.error("❌ Error en getAll:", error);
    throw error;
  }
};

// 4. OBTENER POR ID (ARREGLADO)
exports.getById = async (id) => {
  try {
    const usuario = await prisma.socio.findUnique({
      where: { id: id }
    });
    if (!usuario) throw { status: 404, message: "Usuario no encontrado" };
    return usuario;
  } catch (error) {
    console.error("❌ Error en getById:", error);
    throw error;
  }
};

// 5. RENOVAR MEMBRESÍA (ARREGLADO)
exports.renovarMembresia = async (id, tipo_plan) => {
  try {
    const usuario = await prisma.socio.findUnique({ where: { id } });
    if (!usuario) throw { status: 404, message: "Usuario no encontrado" };

    const hoy = new Date();
    const planRenovar = tipo_plan?.toUpperCase() || usuario.tipo_plan;
    const nuevaFecha = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);

    const renovado = await prisma.socio.update({
      where: { id },
      data: {
        estado_membresia: 'ACTIVE',
        tipo_plan: planRenovar,
        ultimo_pago: hoy,
        fecha_vencimiento: nuevaFecha,
      }
    });

    return { status: 200, message: "Renovado ✅", plan: renovado.tipo_plan, vencimiento: nuevaFecha };
  } catch (error) {
    console.error("❌ Error renovar:", error);
    throw error;
  }
};

// 6. ACTIVAR SUSCRIPCIÓN (ARREGLADO)
exports.activarSuscripcion = async (id, tipo_plan) => {
  try {
    const usuario = await prisma.socio.findUnique({ where: { id } });
    if (!usuario) throw { status: 404, message: "Usuario no encontrado" };

    const hoy = new Date();
    const planActivar = (tipo_plan?.toUpperCase() || usuario.tipo_plan || 'BASICO');
    const nuevaFecha = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);

    const activado = await prisma.socio.update({
      where: { id },
      data: {
        estado_membresia: 'ACTIVE',
        tipo_plan: planActivar,
        ultimo_pago: hoy,
        fecha_vencimiento: nuevaFecha,
      }
    });

    return { 
      status: 200, 
      message: "Suscripción activada ✅", 
      usuario: {
        nombre: activado.nombre,
        plan: activado.tipo_plan,
        vencimiento: nuevaFecha,
        estado: activado.estado_membresia
      }
    };
  } catch (error) {
    console.error("❌ Error al activar suscripción:", error);
    throw error;
  }
};

// 7. BORRAR USUARIO (ARREGLADO)
exports.deleteMember = async (id) => {
  try {
    const usuario = await prisma.socio.findUnique({ where: { id } });
    if (!usuario) throw { status: 404, message: "Usuario no encontrado" };

    const eliminado = await prisma.socio.delete({
      where: { id }
    });

    return { 
      status: 200, 
      message: "Usuario eliminado ✅", 
      usuarioEliminado: {
        nombre: eliminado.nombre,
        email: eliminado.email,
        id: eliminado.id
      }
    };
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    throw error;
  }
};

// 8. CAMBIAR ESTADO (PAUSA/PLAY) - ¡ARREGLADO SIN REINICIAR TIEMPO!
exports.cambiarEstado = async (id, nuevoEstado) => {
  try {
    const usuario = await prisma.socio.findUnique({ where: { id } });
    if (!usuario) throw { status: 404, message: "Usuario no encontrado" };

    const estadoValido = ['ACTIVE', 'INACTIVE'].includes(nuevoEstado?.toUpperCase());
    if (!estadoValido) throw { status: 400, message: "Estado inválido" };

    const actualizado = await prisma.socio.update({
      where: { id },
      data: { 
        estado_membresia: nuevoEstado.toUpperCase() 
      }
    });

    return { 
      status: 200, 
      message: `Usuario ${actualizado.estado_membresia} ✅`, 
      estado: actualizado.estado_membresia
    };
  } catch (error) {
    console.error("❌ Error al cambiar estado:", error);
    throw error;
  }
};

// 9. VERIFICAR VENCIMIENTOS (CORREGIDO)
exports.verificarMembresias = async () => {
  try {
    const hoy = new Date();
    // Buscamos socios activos cuya fecha de vencimiento ya pasó
    const resultado = await prisma.socio.updateMany({
      where: {
        rol: 'SOCIO',
        estado_membresia: 'ACTIVE', // Solo verificamos los que están activos
        fecha_vencimiento: { lt: hoy }
      },
      data: { estado_membresia: 'INACTIVE' }
    });
    return resultado;
  } catch (error) {
    console.error("❌ Error verificar:", error);
    throw error;
  }
};

// 10. PLANES
exports.getPlanes = async () => {
  return {
    BASICO: { precio: 30000, duracion: "30 días" },
    PREMIUM: { precio: 60000, duracion: "30 días" },
    VIP: { precio: 350000, duracion: "30 días" }
  };
};