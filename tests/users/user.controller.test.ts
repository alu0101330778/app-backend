import request from 'supertest';
import mongoose, { ObjectId } from 'mongoose';
import app from '../../src/index';
import User from '../../src/models/user.model';
import Sentence from '../../src/models/sentence.model';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

const API_KEY = (process.env.API_KEYS?.split(',')[0] || 'test_api_key').trim();
const SECRET = process.env.JWT_SECRET || 'testsecret';

function getAuthHeader(userId: string) {
  const token = jwt.sign({ userId }, SECRET, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}` };
}

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

      const userIdStr = (user._id as mongoose.Types.ObjectId).toString();
      const res = await request(app)
        .get('/users/info')
        .set(getAuthHeader(userIdStr))
        .query({ id: userIdStr });
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('infoUser');
      expect(res.body.emotions).toBeDefined();
    });

    it('debe devolver 404 si el usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get('/users/info')
        .set(getAuthHeader(fakeId))
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

      const userIdStr = (user._id as mongoose.Types.ObjectId).toString();
      const res = await request(app)
        .post('/users/emotions')
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, emotions: ['alegria', 'ira'] });
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

      const userIdStr = (user._id as mongoose.Types.ObjectId).toString();
      const res = await request(app)
        .post('/users/emotions')
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, emotions: ['noexiste'] });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('debe devolver 404 si el usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post('/users/emotions')
        .set(getAuthHeader(fakeId))
        .send({ userId: fakeId, emotions: ['alegria'] });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /users/last', () => {
    it('debe devolver 400 si falta el id', async () => {
      // No se puede autenticar sin id, pero el middleware permite pasar si no hay id
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get('/users/last')
        .set(getAuthHeader(fakeId));
      expect(res.statusCode).toBe(400);
    });

    it('debe devolver 400 si el id es inválido', async () => {
      const invalidId = '123';
      const res = await request(app)
        .get('/users/last')
        .set(getAuthHeader(invalidId))
        .query({ id: invalidId });
      expect(res.statusCode).toBe(400);
    });

    it('debe devolver 404 si el usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get('/users/last')
        .set(getAuthHeader(fakeId))
        .query({ id: fakeId });
      expect(res.statusCode).toBe(404);
    });

     it('debe devolver 404 si el usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const fakeId2 = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post('/users/last')
        .set(getAuthHeader(fakeId))
        .query({ userId: fakeId, sentenceId: fakeId2 });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('User Controller - cobertura avanzada', () => {
    let userId: string;
    let sentenceId: string;

    beforeEach(async () => {
      await User.deleteMany({});
      await Sentence.deleteMany({});
      // Crea una frase de ejemplo
      const sentence = await Sentence.create({ title: 'Frase', body: 'Cuerpo', end: 'Fin' });
      sentenceId = (sentence._id as mongoose.Types.ObjectId).toString();

      // Crea el usuario de ejemplo con emociones como objeto plano y logs variados
      const user = new User({
        _id: new mongoose.Types.ObjectId("684b253d59ba8aa2fbbeda3b"),
        username: "admin",
        email: "admin@admin.com",
        password: "$2b$10$r0qUSuiGH.b8BDRO.VSdBei1YnF53ulBUZR4KAGTdyc62U4Z27RDK",
        favoriteSentences: [],
        emotions: {
          alegria: 3,
          amor: 2,
          tristeza: 1,
          vergüenza: 1,
          ansiedad: 2,
          felicidad: 2
        },
        emotionsCount: 11,
        emotionLogs: [
          { emotions: ["Alegria"], timestamp: new Date("2025-06-12T19:06:55.212Z") },
          { emotions: ["Amor"], timestamp: new Date("2025-06-12T19:10:05.915Z") },
          { emotions: ["Amor", "Tristeza"], timestamp: new Date("2025-06-12T19:21:19.507Z") },
          { emotions: ["Vergüenza"], timestamp: new Date("2025-06-12T19:23:06.767Z") },
          { emotions: ["Alegria"], timestamp: new Date("2025-06-12T19:29:40.534Z") },
          { emotions: ["Ansiedad", "Felicidad"], timestamp: new Date("2025-06-12T19:33:33.987Z") },
          { emotions: ["Felicidad", "Ansiedad"], timestamp: new Date("2025-06-12T20:02:54.463Z") },
          { emotions: ["Alegria"], timestamp: new Date("2025-06-12T20:07:56.585Z") }
        ],
        lastSentence: sentence._id
      });
      await user.save();
      userId = (user._id as mongoose.Types.ObjectId).toString();
    });

    it('GET /users/info cubre emociones como objeto plano y logs agrupados', async () => {
      const res = await request(app)
        .get('/users/info')
        .set(getAuthHeader(userId))
        .query({ id: userId });
      expect(res.statusCode).toBe(200);
      expect(res.body.emotions).toBeDefined();
      expect(res.body.emotionsByDay).toBeInstanceOf(Array);
      // Debe haber emociones normalizadas y agrupadas por día
      expect(Object.keys(res.body.emotions).length).toBeGreaterThan(0);
      expect(res.body.emotionsByDay.length).toBeGreaterThan(0);
    });

    it('GET /users/last cubre usuario con lastSentence', async () => {
      const res = await request(app)
        .get('/users/last')
        .set(getAuthHeader(userId))
        .query({ id: userId });
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe("admin");
      expect(res.body.lastSentence).toBeDefined();
      expect(res.body.lastSentence.title).toBe("Frase");
    });

    it('POST /users/favorite añade y elimina favoritos correctamente', async () => {
      // Añadir favorito
      let res = await request(app)
        .post('/users/favorite')
        .set(getAuthHeader(userId))
        .send({ userId, sentenceId });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/añadida/);

      // Intentar añadir de nuevo (debe dar 400)
      res = await request(app)
        .post('/users/favorite')
        .set(getAuthHeader(userId))
        .send({ userId, sentenceId });
      expect(res.statusCode).toBe(400);

      // Eliminar favorito
      res = await request(app)
        .put('/users/favorite')
        .set(getAuthHeader(userId))
        .send({ userId, sentenceId });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/eliminada/);

      // Intentar eliminar de nuevo (debe dar 400)
      res = await request(app)
        .put('/users/favorite')
        .set(getAuthHeader(userId))
        .send({ userId, sentenceId });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('User Controller - coverage extra', () => {

    it('POST /users/emotions debe manejar errores internos', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('fail'));
      process.env.EMOTIONS = JSON.stringify(['alegria']);
      const res = await request(app)
        .post('/users/emotions')
        .set(getAuthHeader(fakeId))
        .send({ userId: fakeId, emotions: ['alegria'] });
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error actualizando emociones');
      (User.findById as any).mockRestore();
    });

    it('GET /users/info debe manejar errores internos', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(User, 'findById').mockImplementationOnce(() => { throw new Error('fail'); });
      const res = await request(app)
        .get('/users/info')
        .set(getAuthHeader(fakeId))
        .query({ id: fakeId });
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error del servidor');
      (User.findById as any).mockRestore();
    });


    it('GET /users/last debe manejar errores internos', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(User, 'findById').mockImplementationOnce(() => { throw new Error('fail'); });
      const res = await request(app)
        .get('/users/last')
        .set(getAuthHeader(fakeId))
        .query({ id: fakeId });
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error al obtener la frase del usuario');
      (User.findById as any).mockRestore();
    });
  });

  describe('NoSQL Injection protection', () => {
    let userIdStr: string;
    beforeEach(async () => {
      const user = new User({
        username: 'nosqliUser',
        email: 'nosqli@test.com',
        password: '123456',
        emotions: new Map(),
        emotionsCount: 0,
        emotionLogs: [],
        favoriteSentences: []
      });
      await user.save();
      userIdStr = (user._id as mongoose.Types.ObjectId).toString();
    });

    it('debe rechazar userId como objeto en /users/emotions', async () => {
      const res = await request(app)
        .post('/users/emotions')
        .set(getAuthHeader(userIdStr))
        .send({ userId: { $gt: '' }, emotions: ['alegria'] });
      expect(res.statusCode).toBe(400);
    });

    it('debe rechazar emotions como objeto en /users/emotions', async () => {
      const res = await request(app)
        .post('/users/emotions')
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, emotions: { $ne: [] } });
      expect(res.statusCode).toBe(400);
    });

    it('debe rechazar userId como objeto en /users/favorite', async () => {
      const res = await request(app)
        .post('/users/favorite')
        .set(getAuthHeader(userIdStr))
        .send({ userId: { $gt: '' }, sentenceId: userIdStr });
      expect(res.statusCode).toBe(400);
    });

    it('debe rechazar sentenceId como objeto en /users/favorite', async () => {
      const res = await request(app)
        .post('/users/favorite')
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, sentenceId: { $gt: '' } });
      expect(res.statusCode).toBe(400);
    });

    it('debe rechazar userId como objeto en /users/favorite (remove)', async () => {
      const res = await request(app)
        .put('/users/favorite')
        .set(getAuthHeader(userIdStr))
        .send({ userId: { $gt: '' }, sentenceId: userIdStr });
      expect(res.statusCode).toBe(400);
    });

    it('debe rechazar sentenceId como objeto en /users/favorite (remove)', async () => {
      const res = await request(app)
        .put('/users/favorite')
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, sentenceId: { $gt: '' } });
      expect(res.statusCode).toBe(400);
    });

    it('debe rechazar id como objeto en /users/info', async () => {
      const res = await request(app)
        .get('/users/info')
        .set(getAuthHeader(userIdStr))
        .query({ id: { $gt: '' } });
      expect(res.statusCode).toBe(400);
    });

    it('debe rechazar id como objeto en /users/last', async () => {
      const res = await request(app)
        .get('/users/last')
        .set(getAuthHeader(userIdStr))
        .query({ id: { $gt: '' } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /users/settings', () => {
    let user: any;
    let userIdStr: string;

    beforeEach(async () => {
      user = new User({
        username: 'settingsUser',
        email: 'settings@test.com',
        password: '123456',
        emotions: new Map(),
        emotionsCount: 0,
        emotionLogs: [],
        favoriteSentences: [],
        enableEmotions: true,
        randomReflexion: false
      });
      await user.save();
      userIdStr = (user._id as mongoose.Types.ObjectId).toString();
    });

    it('debe actualizar enableEmotions', async () => {
      const res = await request(app)
        .patch('/users/settings')
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, enableEmotions: false });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Configuración actualizada");
      const updated = await User.findById(userIdStr);
      expect(updated?.enableEmotions).toBe(false);
    });

    it('debe actualizar randomReflexion', async () => {
      const res = await request(app)
        .patch('/users/settings')
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, randomReflexion: true });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Configuración actualizada");
      const updated = await User.findById(userIdStr);
      expect(updated?.randomReflexion).toBe(true);
    });

    it('debe actualizar ambos campos a la vez', async () => {
      const res = await request(app)
        .patch('/users/settings')
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, enableEmotions: false, randomReflexion: true });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Configuración actualizada");
      const updated = await User.findById(userIdStr);
      expect(updated?.enableEmotions).toBe(false);
      expect(updated?.randomReflexion).toBe(true);
    });

    it('debe devolver 400 si enableEmotions no es booleano', async () => {
      const res = await request(app)
        .patch('/users/settings')
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, enableEmotions: 'no' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("enableEmotions debe ser booleano");
    });

    it('debe devolver 400 si randomReflexion no es booleano', async () => {
      const res = await request(app)
        .patch('/users/settings')
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, randomReflexion: 'no' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("randomReflexion debe ser booleano");
    });

    it('debe devolver 404 si el usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch('/users/settings')
        .set(getAuthHeader(fakeId))
        .send({ userId: fakeId, enableEmotions: false });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Usuario no encontrado");
    });

    it('debe manejar errores internos', async () => {
      const spy = jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .patch('/users/settings')
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, enableEmotions: false });
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("Error actualizando configuración");
      spy.mockRestore();
    });
  });

});