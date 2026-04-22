const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

prisma.$connect()
  .then(() => console.log('✅ Conexión exitosa a Facility DB'))
  .catch(err => console.error('❌ Error de conexión:', err.message));

module.exports = prisma;