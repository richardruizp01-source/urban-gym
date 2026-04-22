const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Prisma 7: el adapter recibe directamente la connection string
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

const prisma = new PrismaClient({ adapter });

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('📦 Prisma 7: Conexión establecida con éxito');
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  }
}

testConnection();

module.exports = prisma;