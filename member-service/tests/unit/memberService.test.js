// tests/unit/memberService.test.js

jest.mock('../../src/config/db', () => ({
  socio: {
    create:     jest.fn(),
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    update:     jest.fn(),
    updateMany: jest.fn(),
    delete:     jest.fn(),
  }
}));

jest.mock('bcryptjs', () => ({
  hash:    jest.fn().mockResolvedValue('hashed_password_123'),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake_token_abc'),
}));

const prisma  = require('../../src/config/db');
const bcrypt  = require('bcryptjs');
const service = require('../../src/services/member.service');

beforeEach(() => jest.clearAllMocks());

// PRUEBA 1 — register convierte ENTRENADOR → TRAINER
test('register convierte rol ENTRENADOR a TRAINER antes de guardar', async () => {
  prisma.socio.create.mockResolvedValue({
    id: 'uuid-1', nombre: 'David', rol: 'TRAINER'
  });

  const result = await service.register({
    nombre: 'David', email: 'd@test.com',
    password: '1234', rol: 'ENTRENADOR'
  });

  expect(result.status).toBe(201);
  const llamada = prisma.socio.create.mock.calls[0][0].data;
  expect(llamada.rol).toEqual('TRAINER');
});

// PRUEBA 2 — register convierte RECEPCIONISTA → RECEPCION
test('register convierte rol RECEPCIONISTA a RECEPCION', async () => {
  prisma.socio.create.mockResolvedValue({
    id: 'uuid-2', nombre: 'Ana', rol: 'RECEPCION'
  });

  await service.register({
    nombre: 'Ana', email: 'a@test.com',
    password: '1234', rol: 'RECEPCIONISTA'
  });

  const llamada = prisma.socio.create.mock.calls[0][0].data;
  expect(llamada.rol).toEqual('RECEPCION');
  expect(llamada.rol).not.toEqual('RECEPCIONISTA');
});

// PRUEBA 3 — login lanza 404 si email no existe
test('login lanza error 404 si el email no está registrado', async () => {
  prisma.socio.findUnique.mockResolvedValue(null);

  await expect(
    service.login({ email: 'noexiste@test.com', password: '1234' })
  ).rejects.toMatchObject({ status: 404 });
});

// PRUEBA 4 — login lanza 401 si contraseña incorrecta
test('login lanza error 401 si la contraseña es incorrecta', async () => {
  prisma.socio.findUnique.mockResolvedValue({
    id: 'uuid-3', email: 'x@test.com',
    password: 'hashed', rol: 'SOCIO', nombre: 'X', sede: null
  });
  bcrypt.compare.mockResolvedValue(false);

  await expect(
    service.login({ email: 'x@test.com', password: 'wrongpass' })
  ).rejects.toMatchObject({ status: 401 });
});

// PRUEBA 5 — cambiarEstado lanza 400 con estado inválido
test('cambiarEstado lanza error 400 con estado inválido', async () => {
  prisma.socio.findUnique.mockResolvedValue({ id: 'uuid-4', nombre: 'Z' });

  await expect(
    service.cambiarEstado('uuid-4', 'SUSPENDIDO')
  ).rejects.toMatchObject({ status: 400, message: 'Estado inválido' });
});

// PRUEBA 6 — getPlanes retorna los 3 planes correctos
test('getPlanes retorna BASICO, PREMIUM y VIP con precios correctos', async () => {
  const planes = await service.getPlanes();

  expect(planes).toHaveProperty('BASICO');
  expect(planes).toHaveProperty('PREMIUM');
  expect(planes).toHaveProperty('VIP');
  expect(planes.BASICO.precio).toBe(30000);
  expect(planes.VIP.precio).toBe(350000);
});
// PRUEBA 7 — getAll retorna lista de usuarios
test('getAll retorna lista de socios correctamente', async () => {
  prisma.socio.findMany.mockResolvedValue([
    { id: 'uuid-1', nombre: 'Ana', rol: 'SOCIO' },
    { id: 'uuid-2', nombre: 'Luis', rol: 'TRAINER' },
  ]);

  const result = await service.getAll();
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBe(2);
});

// PRUEBA 8 — getById lanza 404 si no existe
test('getById lanza error 404 si el usuario no existe', async () => {
  prisma.socio.findUnique.mockResolvedValue(null);

  await expect(service.getById('id-falso'))
    .rejects.toMatchObject({ status: 404 });
});

// PRUEBA 9 — renovarMembresia actualiza correctamente
test('renovarMembresia retorna status 200 y plan actualizado', async () => {
  prisma.socio.findUnique.mockResolvedValue({ id: 'uuid-9', tipo_plan: 'BASICO' });
  prisma.socio.update.mockResolvedValue({ id: 'uuid-9', tipo_plan: 'PREMIUM', estado_membresia: 'ACTIVE' });

  const result = await service.renovarMembresia('uuid-9', 'PREMIUM');
  expect(result.status).toBe(200);
  expect(result.plan).toBe('PREMIUM');
});

// PRUEBA 10 — deleteMember retorna 200 al eliminar
test('deleteMember retorna status 200 con datos del eliminado', async () => {
  prisma.socio.findUnique.mockResolvedValue({ id: 'uuid-10', nombre: 'Pedro', email: 'p@gym.com' });
  prisma.socio.delete.mockResolvedValue({ id: 'uuid-10', nombre: 'Pedro', email: 'p@gym.com' });

  const result = await service.deleteMember('uuid-10');
  expect(result.status).toBe(200);
  expect(result.usuarioEliminado).toHaveProperty('nombre', 'Pedro');
});

// PRUEBA 11 — cambiarEstado ACTIVE funciona correctamente
test('cambiarEstado actualiza a ACTIVE correctamente', async () => {
  prisma.socio.findUnique.mockResolvedValue({ id: 'uuid-11', nombre: 'Maria' });
  prisma.socio.update.mockResolvedValue({ id: 'uuid-11', estado_membresia: 'ACTIVE' });

  const result = await service.cambiarEstado('uuid-11', 'ACTIVE');
  expect(result.status).toBe(200);
  expect(result.estado).toBe('ACTIVE');
});

// PRUEBA 12 — verificarMembresias ejecuta updateMany
test('verificarMembresias ejecuta updateMany y retorna resultado', async () => {
  prisma.socio.updateMany.mockResolvedValue({ count: 3 });

  const result = await service.verificarMembresias();
  expect(result).toHaveProperty('count');
  expect(prisma.socio.updateMany).toHaveBeenCalled();
});

// PRUEBA 13 — activarSuscripcion retorna 200
test('activarSuscripcion retorna status 200 con datos del usuario', async () => {
  prisma.socio.findUnique.mockResolvedValue({ id: 'uuid-13', tipo_plan: 'BASICO' });
  prisma.socio.update.mockResolvedValue({
    id: 'uuid-13', nombre: 'Rosa', tipo_plan: 'PREMIUM', estado_membresia: 'ACTIVE'
  });

  const result = await service.activarSuscripcion('uuid-13', 'PREMIUM');
  expect(result.status).toBe(200);
  expect(result.usuario).toHaveProperty('plan', 'PREMIUM');
});

// PRUEBA 14 — getById retorna usuario existente
test('getById retorna el usuario cuando existe', async () => {
  prisma.socio.findUnique.mockResolvedValue({
    id: 'uuid-14', nombre: 'Jorge', email: 'jorge@gym.com', rol: 'SOCIO'
  });

  const result = await service.getById('uuid-14');
  expect(result).toHaveProperty('nombre', 'Jorge');
  expect(result).toHaveProperty('email', 'jorge@gym.com');
});