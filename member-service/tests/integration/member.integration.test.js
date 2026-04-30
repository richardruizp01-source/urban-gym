// tests/integration/member.integration.test.js

const request = require('supertest');
const app     = require('../../src/app');

// ─── Mock de Prisma ────────────────────────────────────────────────────────────
jest.mock('../../src/config/db', () => ({
  socio: {
    create:     jest.fn(),
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    update:     jest.fn(),
    updateMany: jest.fn(),
    delete:     jest.fn(),
  },
  $connect: jest.fn(),
}));

// ─── Mock de bcryptjs ──────────────────────────────────────────────────────────
jest.mock('bcryptjs', () => ({
  hash:    jest.fn().mockResolvedValue('hashed_password_123'),
  compare: jest.fn(),
}));

// ─── Mock de jsonwebtoken ──────────────────────────────────────────────────────
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake_token_abc'),
}));

const prisma = require('../../src/config/db');
const bcrypt = require('bcryptjs');

// Llave maestra del middleware — no necesita jwt.verify
const TOKEN = 'urbangym_internal_2024';

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════════
// PRUEBA INT-1 — POST /api/v1/members/register → 201
// ══════════════════════════════════════════════════════════════════════════════
test('INT-1: POST /register devuelve 201 al crear un usuario válido', async () => {
  prisma.socio.create.mockResolvedValue({
    id: 'uuid-int-1', nombre: 'Carlos', rol: 'SOCIO'
  });

  const res = await request(app)
    .post('/api/v1/members/register')
    .send({
      nombre:   'Carlos',
      email:    'carlos@gym.com',
      password: 'pass1234',
      rol:      'SOCIO',
    });

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');
});

// ══════════════════════════════════════════════════════════════════════════════
// PRUEBA INT-2 — POST /api/v1/members/login → 200 con token
// ══════════════════════════════════════════════════════════════════════════════
test('INT-2: POST /login devuelve 200 y token cuando credenciales son correctas', async () => {
  prisma.socio.findUnique.mockResolvedValue({
    id: 'uuid-int-2', nombre: 'Carlos', email: 'carlos@gym.com',
    password: 'hashed_password_123', rol: 'SOCIO',
    sede_id: null, sede: null
  });
  bcrypt.compare.mockResolvedValue(true);

  const res = await request(app)
    .post('/api/v1/members/login')
    .send({ email: 'carlos@gym.com', password: 'pass1234' });

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('token');
  expect(res.body.token).toBe('fake_token_abc');
});

// ══════════════════════════════════════════════════════════════════════════════
// PRUEBA INT-3 — POST /api/v1/members/login → 404 email inexistente
// ══════════════════════════════════════════════════════════════════════════════
test('INT-3: POST /login devuelve 404 si el email no existe', async () => {
  prisma.socio.findUnique.mockResolvedValue(null);

  const res = await request(app)
    .post('/api/v1/members/login')
    .send({ email: 'fantasma@gym.com', password: '1234' });

  expect(res.status).toBe(404);
});

// ══════════════════════════════════════════════════════════════════════════════
// PRUEBA INT-4 — GET /api/v1/members → lista de usuarios (llave maestra)
// ══════════════════════════════════════════════════════════════════════════════
test('INT-4: GET / devuelve 200 con lista de miembros (admin autenticado)', async () => {
  prisma.socio.findMany.mockResolvedValue([
    { id: 'uuid-a', nombre: 'Ana',   rol: 'SOCIO' },
    { id: 'uuid-b', nombre: 'Pedro', rol: 'TRAINER' },
  ]);

  const res = await request(app)
    .get('/api/v1/members')
    .set('Authorization', `Bearer ${TOKEN}`);

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(2);
});

// ══════════════════════════════════════════════════════════════════════════════
// PRUEBA INT-5 — GET /api/v1/members/trainers → lista de entrenadores (pública)
// ══════════════════════════════════════════════════════════════════════════════
test('INT-5: GET /trainers devuelve 200 con lista de entrenadores', async () => {
  prisma.socio.findMany.mockResolvedValue([
    { id: 'uuid-t1', nombre: 'Coach Mario' },
    { id: 'uuid-t2', nombre: 'Coach Sara' },
  ]);

  const res = await request(app).get('/api/v1/members/trainers');

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(2);
});

// ══════════════════════════════════════════════════════════════════════════════
// PRUEBA INT-6 — DELETE /api/v1/members/:id → eliminar usuario (llave maestra)
// ══════════════════════════════════════════════════════════════════════════════
test('INT-6: DELETE /:id devuelve 200 al eliminar un usuario existente', async () => {
  prisma.socio.findUnique.mockResolvedValue({
    id: 'uuid-int-6', nombre: 'Miguel', email: 'miguel@gym.com'
  });
  prisma.socio.delete.mockResolvedValue({
    id: 'uuid-int-6', nombre: 'Miguel', email: 'miguel@gym.com'
  });

  const res = await request(app)
    .delete('/api/v1/members/uuid-int-6')
    .set('Authorization', `Bearer ${TOKEN}`);

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('message');
});