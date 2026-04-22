const { defineConfig } = require('prisma/config');
const pg = require('pg');
require('dotenv').config();

module.exports = defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrate: {
    async adapter() {
      const client = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const { PrismaPg } = require('@prisma/adapter-pg');
      return new PrismaPg(client);
    },
  },
});