import { defineConfig } from '@prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL, 
    // Ponlo EXACTAMENTE así para que se quite lo rojo:
    adapter: new PrismaPg(pool) as any, 
  },
});