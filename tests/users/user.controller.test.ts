import request from 'supertest';
import mongoose, { ObjectId } from 'mongoose';
import app from '../../src/index';
import User from '../../src/models/user.model';
import { jest } from '@jest/globals';

const API_KEY = (process.env.API_KEYS?.split(',')[0] || 'test_api_key').trim();

describe('User Controller', () => {
  let userId: string;
  let originalEmotionsEnv: string | undefined;


  beforeEach(async () => {
    await User.deleteMany({});
    originalEmotionsEnv = process.env.EMOTIONS;
  });

  afterEach(() => {
    process.env.EMOTIONS = originalEmotionsEnv;
  });

  describe('GET /users', () => {
    it('debe devolver un array de usuarios', async () => {
      const res = await request(app)
        .get('/users')
        .set('x-api-key', API_KEY);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /users', () => {
    it('debe crear un usuario', async () => {
      const res = await request(app)
        .post('/users')
        .set('x-api-key', API_KEY)
        .send({ username: 'testuser', email: 'test@test.com', password: '123456' });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User created succesfully');
      const user = await User.findOne({ email: 'test@test.com' });
      expect(user).not.toBeNull();
      userId = (user?._id as mongoose.Types.ObjectId).toString() || '';
    });

    it('debe fallar si faltan campos', async () => {
      const res = await request(app)
        .post('/users')
        .set('x-api-key', API_KEY)
        .send({ username: 'testuser' });
      expect([400, 500]).toContain(res.statusCode);
    });
  });

  describe('GET /users/info', () => {
    it('debe devolver info del usuario', async () => {
      const user = new User({
        username: 'infoUser',
        email: 'info@test.com',
        password: '123456',
        emotions: new Map(),
        emotionsCount: 0,
        emotionLogs: [],
        favoriteSentences: []
      });
      await user.save();

      const res = await request(app)
        .get('/users/info')
        .set('x-api-key', API_KEY)
        .query({ id: (user._id as any).toString() });
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('infoUser');
      expect(res.body.emotions).toBeDefined();
    });

    it('debe devolver 404 si el usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get('/users/info')
        .set('x-api-key', API_KEY)
        .query({ id: fakeId });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /users/emotions', () => {
    beforeEach(async () => {
      process.env.EMOTIONS = JSON.stringify(['alegria', 'tristeza', 'miedo', 'ira']);
    });

    it('debe actualizar emociones del usuario', async () => {
      const user = new User({
        username: 'emotionUser',
        email: 'emotion@test.com',
        password: '123456',
        emotions: new Map(),
        emotionsCount: 0,
        emotionLogs: [],
        favoriteSentences: []
      });
      await user.save();

      const res = await request(app)
        .post('/users/emotions')
        .set('x-api-key', API_KEY)
        .send({ userId: (user._id as mongoose.Types.ObjectId).toString(), emotions: ['alegria', 'ira'] });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Emociones actualizadas');
    });

    it('debe devolver error si emociones no es un array válido', async () => {
      const user = new User({
        username: 'emotionUser2',
        email: 'emotion2@test.com',
        password: '123456',
        emotions: new Map(),
        emotionsCount: 0,
        emotionLogs: [],
        favoriteSentences: []
      });
      await user.save();

      const res = await request(app)
        .post('/users/emotions')
        .set('x-api-key', API_KEY)
        .send({ userId: (user._id as mongoose.Types.ObjectId).toString(), emotions: ['noexiste'] });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('debe devolver 404 si el usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/users/emotions')
        .set('x-api-key', API_KEY)
        .send({ userId: fakeId, emotions: ['alegria'] });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /users/last', () => {
    it('debe devolver 400 si falta el id', async () => {
      const res = await request(app)
        .get('/users/last')
        .set('x-api-key', API_KEY);
      expect(res.statusCode).toBe(400);
    });

    it('debe devolver 400 si el id es inválido', async () => {
      const res = await request(app)
        .get('/users/last')
        .set('x-api-key', API_KEY)
        .query({ id: '123' });
      expect(res.statusCode).toBe(400);
    });

    it('debe devolver 404 si el usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId()._id.toString();
      const res = await request(app)
        .get('/users/last')
        .set('x-api-key', API_KEY)
        .query({ id: fakeId });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('User Controller - coverage extra', () => {
    it('GET /users debe manejar errores internos', async () => {
      jest.spyOn(User, 'find').mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .get('/users')
        .set('x-api-key', API_KEY);
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error al obtener usuarios');
      (User.find as any).mockRestore();
    });

    it('POST /users/emotions debe manejar errores internos', async () => {
      jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('fail'));
      process.env.EMOTIONS = JSON.stringify(['alegria']);
      const res = await request(app)
        .post('/users/emotions')
        .set('x-api-key', API_KEY)
        .send({ userId: new mongoose.Types.ObjectId(), emotions: ['alegria'] });
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error actualizando emociones');
      (User.findById as any).mockRestore();
    });

    it('GET /users/info debe manejar errores internos', async () => {
      jest.spyOn(User, 'findById').mockImplementationOnce(() => { throw new Error('fail'); });
      const res = await request(app)
        .get('/users/info')
        .set('x-api-key', API_KEY)
        .query({ id: new mongoose.Types.ObjectId()._id });
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error del servidor');
      (User.findById as any).mockRestore();
    });

    it('POST /users debe manejar errores internos', async () => {
      jest.spyOn(User.prototype, 'save').mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .post('/users')
        .set('x-api-key', API_KEY)
        .send({ username: 'fail', email: 'fail@test.com', password: 'fail' });
      expect(res.statusCode).toBe(500);
      (User.prototype.save as any).mockRestore();
    });

    it('GET /users/last debe manejar errores internos', async () => {
      jest.spyOn(User, 'findById').mockImplementationOnce(() => { throw new Error('fail'); });
      const res = await request(app)
        .get('/users/last')
        .set('x-api-key', API_KEY)
        .query({ id: new mongoose.Types.ObjectId()._id.toString() });
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error al obtener la frase del usuario');
      (User.findById as any).mockRestore();
    });
  });

});