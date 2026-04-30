const prisma = require('../config/db');

// 1. CREAR RESERVA ✅ CORREGIDO
const createBooking = async (req, res) => {
  const { socio_id, clase_instancia_id } = req.body;
  
  try {
    const clase = await prisma.clases_instancia.findUnique({
      where: { id: clase_instancia_id }
    });
    if (!clase) return res.status(404).json({ error: 'Clase no encontrada' });
    if (clase.cupos_disponibles <= 0) return res.status(400).json({ error: 'SIN_CUPOS' });

    const existing = await prisma.reserva.findFirst({
      where: { socio_id, clase_instancia_id, estado: 'CONFIRMED' }
    });
    if (existing) return res.status(400).json({ error: 'RESERVA_DUPLICADA' });

    const result = await prisma.$transaction(async (tx) => {
      const nuevaReserva = await tx.reserva.create({
        data: { socio_id, clase_instancia_id, estado: 'CONFIRMED' }
      });

      const actualizado = await tx.clases_instancia.updateMany({
        where: { 
          id: clase_instancia_id,
          version: clase.version,
          cupos_disponibles: { gt: 0 }
        },
        data: { 
          cupos_disponibles: { decrement: 1 },
          version: { increment: 1 }
        }
      });

      if (actualizado.count === 0) throw new Error('SIN_CUPOS');
      return nuevaReserva;
    });

    res.status(201).json({ message: 'Reserva confirmada con éxito ✅', bookingId: result.id });

  } catch (error) {
    console.error("❌ Error en createBooking:", error.message);
    if (error.message === 'SIN_CUPOS') return res.status(400).json({ error: 'Sin cupos disponibles' });
    res.status(500).json({ error: 'Error al procesar la reserva: ' + error.message });
  }
};

// 2. OBTENER TODO
const getAllBookings = async (req, res) => {
    try {
        const hace24Horas = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        const result = await prisma.reserva.findMany({
            where: { fecha_creacion: { gte: hace24Horas } },
            include: { clases_instancia: true },
            orderBy: { fecha_creacion: 'desc' }
        });
        res.json(result);
    } catch (error) {
        console.error("❌ Error en getAllBookings:", error.message);
        res.status(500).json({ error: error.message });
    } 
};

// 3. OBTENER TODAS LAS INSTANCIAS
const getAllInstancias = async (req, res) => {
  try {
    const result = await prisma.clases_instancia.findMany({
      orderBy: { fecha_inicio: 'desc' }
    });
    res.json(result);
  } catch (error) {
    console.error("❌ Error en getAllInstancias:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 4. ACTUALIZAR RESERVA
const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const reserva = await prisma.reserva.findFirst({ where: { id } });
    if (!reserva) return res.status(404).json({ error: "Reserva no encontrada" });

    const updated = await prisma.reserva.update({
      where: { id, fecha_creacion: reserva.fecha_creacion },
      data: { estado }
    });
    res.json({ message: "Reserva actualizada 🔄", updated });
  } catch (error) {
    res.status(404).json({ error: "No se pudo actualizar la reserva." });
  }
};

// 5. CANCELAR RESERVA
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const reserva = await prisma.reserva.findFirst({ where: { id } });
    if (!reserva) return res.status(404).json({ error: 'La reserva no existe.' });
    if (reserva.estado === 'CANCELLED') return res.status(400).json({ error: 'Ya estaba cancelada.' });

    await prisma.$transaction(async (tx) => {
      await tx.reserva.update({
        where: { id, fecha_creacion: reserva.fecha_creacion },
        data: { estado: 'CANCELLED' }
      });
      await tx.clases_instancia.update({
        where: { id: reserva.clase_instancia_id },
        data: { cupos_disponibles: { increment: 1 } }
      });
    });

    res.status(200).json({ message: 'Reserva cancelada correctamente.' });
  } catch (error) {
    res.status(404).json({ error: 'Error al cancelar: ' + error.message });
  }
};

const deleteInstancia = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.reserva.deleteMany({ where: { clase_instancia_id: id } });
      await tx.clases_instancia.delete({ where: { id } });
    });
    res.status(200).json({ message: 'Instancia eliminada correctamente.' });
  } catch (error) {
    console.error("❌ Error en deleteInstancia:", error.message);
    if (error.code === 'P2025') return res.status(404).json({ error: 'La instancia no existe.' });
    res.status(500).json({ error: error.message });
  }
};

// 7. CREAR INSTANCIA
const createClaseInstancia = async (req, res) => {
  console.log("📦 BODY RECIBIDO:", JSON.stringify(req.body));
  console.log("🕐 fecha_inicio recibida:", req.body.fecha_inicio);
  console.log("🕑 fecha_fin recibida:", req.body.fecha_fin);
  try {
    const { 
      clase_id, nombre_clase, trainer_id, trainer_nombre, 
      sede_id, sede_nombre, capacidad_total, fecha_inicio, fecha_fin,
      descripcion
    } = req.body;

    const nuevaInstancia = await prisma.clases_instancia.create({
      data: {
        clase_id: clase_id || "77f72671-654a-4f9e-8c85-6932470768f5",
        nombre_clase, trainer_id, trainer_nombre,
        sede_id: sede_id || "77f72671-654a-4f9e-8c85-6932470768f5",
        sede_nombre,
        descripcion: descripcion || null,
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: new Date(fecha_fin),
        capacidad_total: parseInt(capacidad_total) || 20,
        cupos_disponibles: parseInt(capacidad_total) || 20,
      }
    });

    res.status(201).json({ message: "✅ Clase programada con éxito", data: nuevaInstancia });
  } catch (error) {
    console.error("❌ Error en createClaseInstancia:", error.message);
    res.status(500).json({ error: "Fallo al crear instancia: " + error.message });
  }
};

// 8. OBTENER RESERVAS POR SOCIO
const getReservasBySocio = async (req, res) => {
  const { socio_id } = req.params;
  try {
    const reservas = await prisma.reserva.findMany({
      where: { socio_id, estado: 'CONFIRMED' },
      include: { clases_instancia: true }
    });
    res.json({ success: true, data: reservas });
  } catch (error) {
    console.error("❌ Error en getReservasBySocio:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 9. OBTENER INSTANCIAS POR ENTRENADOR
const getInstanciasByEntrenador = async (req, res) => {
  const { trainer_id } = req.params;
  try {
    const result = await prisma.clases_instancia.findMany({
      where: { trainer_id },
      orderBy: { fecha_inicio: 'desc' }
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Error en getInstanciasByEntrenador:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// EXPORTACIÓN COMPLETA
module.exports = { 
  createBooking, 
  cancelBooking,
  getAllBookings,
  getAllInstancias,
  deleteInstancia,
  updateBooking,
  createClaseInstancia,
  getReservasBySocio,
  getInstanciasByEntrenador
};