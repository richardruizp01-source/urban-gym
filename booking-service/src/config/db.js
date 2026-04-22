require('dotenv').config();
const { PrismaClient } = require('../generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL no está definida en el .env");
  process.exit(1);
}

// ✅ Prisma 7: ya no recibe Pool, recibe connectionString directo
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

const prisma = new PrismaClient({ adapter });

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('📦 Prisma 7: Conexión establecida con éxito vía Adaptador PG');
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  }
}

testConnection();

module.exports = prisma;