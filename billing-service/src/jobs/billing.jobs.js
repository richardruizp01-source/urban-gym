const cron = require('node-cron');
const prisma = require('../config/db');
const axios = require('axios');

const iniciarJobs = () => {
  // Corre todos los días a medianoche
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Revisando membresías vencidas...');
    try {
      const vencidos = await prisma.pago.findMany({
        where: {
          estado: 'PAGADO',
          fecha_vence: { lt: new Date() }
        }
      });

      for (const pago of vencidos) {
        await prisma.pago.update({
          where: { id: pago.id },
          data: { estado: 'VENCIDO' }
        });

        // Notificar al members-service para desactivar acceso
        try {
          await axios.post('http://localhost:3001/api/v1/members/activar-acceso', {
            socio_id: pago.socio_id,
            estado: 'INACTIVO',
          }, {
            headers: { 'x-internal-token': process.env.INTERNAL_SERVICE_TOKEN }
          });
        } catch (e) {
          console.warn(`⚠️ No se pudo desactivar socio ${pago.socio_id}:`, e.message);
        }

        console.log(`❌ Membresía vencida: socio ${pago.socio_id}`);
      }

      console.log(`✅ Job completado: ${vencidos.length} membresías procesadas`);
    } catch (error) {
      console.error('❌ Error en job de vencimientos:', error.message);
    }
  });

  console.log('⏰ Jobs de billing iniciados');
};

module.exports = { iniciarJobs };