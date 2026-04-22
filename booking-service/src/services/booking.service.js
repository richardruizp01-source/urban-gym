const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- FUNCIÓN PARA RESERVAR (Ahora con Prisma) ---
const reserveClass = async (socioId, sedeId, claseNombre, fechaReserva, entrenadorId, cuposMax) => {
  // Prisma usa $transaction para asegurar que si algo falla, no se guarde nada (como tu BEGIN/COMMIT)
  return await prisma.$transaction(async (tx) => {
    
    const fecha = new Date(fechaReserva);

    // 1. Regla: No duplicados (Socio no puede reservar la misma clase el mismo día)
    const existing = await tx.reserva.findFirst({
      where: {
        socio_id: socioId,
        clase_nombre: claseNombre,
        fecha_reserva: fecha,
      }
    });
    if (existing) throw new Error('RESERVA_DUPLICADA');

    // 2. Regla: Validar cupos disponibles
    const conteoActual = await tx.reserva.count({
      where: {
        clase_nombre: claseNombre,
        sede_id: sedeId,
        fecha_reserva: fecha
      }
    });

    const limite = cuposMax || 15;
    if (conteoActual >= limite) throw new Error('SIN_CUPOS');

    // 3. Proceso: Crear la reserva (Prisma genera el UUID solo)
    const nuevaReserva = await tx.reserva.create({
      data: {
        socio_id: socioId,
        sede_id: sedeId,
        clase_nombre: claseNombre,
        entrenador_id: entrenadorId,
        fecha_reserva: fecha,
        cupos_maximos: limite
      }
    });

    return { success: true, bookingId: nuevaReserva.id };
  });
};

// --- FUNCIÓN PARA CANCELAR ---
const cancelReservation = async (bookingId) => {
  try {
    // Simplemente eliminamos o cambiamos estado. 
    // Como Prisma es reactivo, el "cupo" se libera automáticamente al no contar más esta fila
    await prisma.reserva.delete({
      where: { id: bookingId }
    });
    return { success: true };
  } catch (error) {
    throw new Error('RESERVA_NO_EXISTE');
  }
};

module.exports = { reserveClass, cancelReservation };