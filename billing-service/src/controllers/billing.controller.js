const prisma = require('../config/db');
const axios = require('axios');

// 1. OBTENER TODAS LAS MEMBRESÍAS
const getMembresias = async (req, res) => {
  try {
    const membresias = await prisma.membresia.findMany();
    res.json(membresias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. CREAR PAGO (Simula el cobro)
const crearPago = async (req, res) => {
  const { socio_id, membresia_id } = req.body;
  try {
    const membresia = await prisma.membresia.findUnique({ where: { id: membresia_id } });
    if (!membresia) return res.status(404).json({ error: 'Membresía no encontrada' });

    const fecha_vence = new Date();
    fecha_vence.setMonth(fecha_vence.getMonth() + 1);

    const pago = await prisma.pago.create({
      data: {
        socio_id,
        membresia_id,
        monto: membresia.precio,
        estado: 'PAGADO',
        fecha_pago: new Date(),
        fecha_vence,
      }
    });

    // Notificar al members-service
    try {
      await axios.post('https://urban-gym-production.up.railway.app/api/v1/members/activar-acceso', {
        socio_id,
        estado: 'ACTIVE',
        membresia: membresia.tipo,
        fecha_vence,
      }, {
        headers: { 'x-internal-token': process.env.INTERNAL_SERVICE_TOKEN }
      });
    } catch (e) {
      console.warn("⚠️ No se pudo notificar al members-service:", e.message);
    }

    res.status(201).json({ message: '✅ Pago registrado con éxito', pago });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. OBTENER PAGOS DE UN SOCIO
const getPagosBySocio = async (req, res) => {
  const { socio_id } = req.params;
  try {
    const pagos = await prisma.pago.findMany({
      where: { socio_id },
      include: { membresia: true },
      orderBy: { creado_en: 'desc' }
    });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. OBTENER TODOS LOS PAGOS (Admin)
const getAllPagos = async (req, res) => {
  try {
    const pagos = await prisma.pago.findMany({
      include: { membresia: true },
      orderBy: { creado_en: 'desc' }
    });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. VERIFICAR ESTADO DE ACCESO
const verificarAcceso = async (req, res) => {
  const { socio_id } = req.params;
  try {
    const pagoActivo = await prisma.pago.findFirst({
      where: {
        socio_id,
        estado: 'PAGADO',
        fecha_vence: { gte: new Date() }
      },
      include: { membresia: true },
      orderBy: { fecha_vence: 'desc' }
    });

    if (pagoActivo) {
      res.json({ acceso: true, membresia: pagoActivo.membresia.tipo, vence: pagoActivo.fecha_vence });
    } else {
      res.json({ acceso: false, mensaje: 'Sin membresía activa' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMembresias, crearPago, getPagosBySocio, getAllPagos, verificarAcceso };