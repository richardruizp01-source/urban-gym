require('dotenv').config();
const prisma = require('./config/db');

const seed = async () => {
  await prisma.membresia.createMany({
    data: [
      { tipo: 'BASICO', precio: 150000, descripcion: 'Acceso básico al gimnasio' },
      { tipo: 'ESTANDAR', precio: 250000, descripcion: 'Acceso a máquinas y clases grupales' },
      { tipo: 'PREMIUM', precio: 350000, descripcion: 'Acceso completo + clases premium' },
      { tipo: 'VIP', precio: 500000, descripcion: 'Acceso total + entrenador personal' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Membresías insertadas correctamente');
  process.exit(0);
};

seed();