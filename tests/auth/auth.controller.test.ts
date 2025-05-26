import request from 'supertest';
import app from '../../src/index';
import User from '../../src/models/user.model';

describe('Auth Controller', () => {
  
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /auth/register', () => {
    it('debe registrar un usuario', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ username: 'authuser', email: 'auth@test.com', password: '123456' });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBeDefined();
      const user = await User.findOne({ email: 'auth@test.com' });
      expect(user).not.toBeNull();
    });

    it('debe fallar si faltan campos', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ username: 'authuser' });
      expect(res.statusCode).toBe(400);
    });

    it('debe fallar si el email ya existe', async () => {
      // Crea el usuario primero usando el endpoint para asegurar el hash correcto
      await request(app)
        .post('/auth/register')
        .send({ username: 'authuser', email: 'auth@test.com', password: '123456' });
      // Intenta registrar el mismo email de nuevo
      const res = await request(app)
        .post('/auth/register')
        .send({ username: 'authuser', email: 'auth@test.com', password: '123456' });
      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Usa el endpoint para crear el usuario con el hash correcto
      await request(app)
        .post('/auth/register')
        .send({ username: 'authuser', email: 'auth@test.com', password: '123456' });
    });

    it('debe loguear un usuario con credenciales correctas', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'auth@test.com', password: '123456' });
      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('debe fallar con credenciales incorrectas', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'auth@test.com', password: 'wrongpass' });
      expect(res.statusCode).toBe(401);
    });

    it('debe fallar si faltan campos', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'auth@test.com' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Auth Controller - coverage extra', () => {
    afterEach(async () => {
      await User.deleteMany({});
    });

    it('POST /auth/register debe manejar errores internos', async () => {
      jest.spyOn(User, 'create').mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .post('/auth/register')
        .send({ username: 'fail', email: 'fail@test.com', password: 'fail'});
      expect([400, 500]).toContain(res.statusCode);
      (User.create as any).mockRestore();
    });

    it('POST /auth/login debe devolver error si usuario no existe', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nouser@test.com', password: '123456' });
      expect([400, 401]).toContain(res.statusCode);
    });

    it('POST /auth/login debe manejar errores internos', async () => {
      jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'fail@test.com', password: 'fail' });
      expect([400, 500]).toContain(res.statusCode);
      (User.findOne as any).mockRestore();
    });
  });
});