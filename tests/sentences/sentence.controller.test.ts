import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/index';
import Sentence from '../../src/models/sentence.model';
import User from '../../src/models/user.model';
import jwt from 'jsonwebtoken';

const API_KEY = (process.env.API_KEYS?.split(',')[0] || 'test_api_key').trim();
const SECRET = process.env.JWT_SECRET || 'testsecret';

function getAuthHeader(userId: string) {
  const token = jwt.sign({ userId }, SECRET, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}` };
}

describe('Sentence Controller', () => {
  beforeEach(async () => {
    await Sentence.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /sentences', () => {
    it('debe devolver un array de frases', async () => {
      await Sentence.create({ title: 't1', body: 'b1', end: 'e1' });
      const res = await request(app)
        .get('/sentences')
        .set('x-api-key', API_KEY); 
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /sentences/all', () => {
    it('debe devolver todas las frases', async () => {
      await Sentence.create({ title: 't2', body: 'b2', end: 'e2' });
      const res = await request(app)
        .get('/sentences/all')
        .set('x-api-key', API_KEY);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /sentences', () => {
    it('debe crear una frase', async () => {
      const res = await request(app)
        .post('/sentences')
        .set('x-api-key', API_KEY)
        .send({ title: 't3', body: 'b3', end: 'e3' });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Sentence created succesfully');
      const sentence = await Sentence.findOne({ title: 't3' });
      expect(sentence).not.toBeNull();
    });

    it('debe fallar si faltan campos', async () => {
      const res = await request(app)
        .post('/sentences')
        .set('x-api-key', API_KEY)
        .send({ title: 't4' });
      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /sentences/get', () => {
    it('debe devolver una frase (mock básico)', async () => {
      await Sentence.create({ title: 't5', body: 'b5', end: 'e5' });
      const res = await request(app)
        .post('/sentences/get')
        .set('x-api-key', API_KEY)
        .send({ emotions: ['alegria'] });
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /sentences/getByUser', () => {
    it('debe devolver 400 si faltan datos', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post('/sentences/getByUser')
        .set('x-api-key', API_KEY)
        .set(getAuthHeader(fakeId))
        .send({});
      expect(res.statusCode).toBe(400);
    });

    it('debe devolver 404 si el usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post('/sentences/getByUser')
        .set('x-api-key', API_KEY)
        .set(getAuthHeader(fakeId))
        .send({ userId: fakeId, emotions: ['alegria'] });
      expect(res.statusCode).toBe(404);
    });

    it('debe devolver 404 si no hay frases', async () => {
      const user = new User({
        username: 'userSent',
        email: 'userSent@test.com',
        password: '123456',
        emotions: new Map(),
        emotionsCount: 0,
        emotionLogs: [],
        favoriteSentences: []
      });
      await user.save();
      const userIdStr = (user._id as mongoose.Types.ObjectId).toString();
      const res = await request(app)
        .post('/sentences/getByUser')
        .set('x-api-key', API_KEY)
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, emotions: ['alegria'] });
      expect(res.statusCode).toBe(404);
    });

    it('debe devolver una frase si todo es correcto', async () => {
      const user = new User({
        username: 'userSent2',
        email: 'userSent2@test.com',
        password: '123456',
        emotions: new Map([['alegria', 2]]),
        emotionsCount: 2,
        emotionLogs: [],
        favoriteSentences: []
      });
      await user.save();
      await Sentence.create({ title: 't6', body: 'b6', end: 'e6' });
      const userIdStr = (user._id as mongoose.Types.ObjectId).toString();
      const res = await request(app)
        .post('/sentences/getByUser')
        .set('x-api-key', API_KEY)
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, emotions: ['alegria'] });
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.title).toBe('t6');
    });
  });

  describe('Sentence Controller - coverage extra', () => {
    afterEach(async () => {
      await Sentence.deleteMany({});
      await User.deleteMany({});
    });

    it('GET /sentences debe manejar errores internos', async () => {
      jest.spyOn(Sentence, 'find').mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .get('/sentences')
        .set('x-api-key', API_KEY); 
      expect(res.statusCode).toBe(500);
      (Sentence.find as any).mockRestore();
    });

    it('POST /sentences debe manejar errores internos', async () => {
      jest.spyOn(Sentence.prototype, 'save').mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .post('/sentences')
        .set('x-api-key', API_KEY) 
        .send({ title: 'fail', body: 'fail', end: 'fail' });
      expect(res.statusCode).toBe(500);
      (Sentence.prototype.save as any).mockRestore();
    });

    it('POST /sentences/get debe manejar errores internos', async () => {
      jest.spyOn(Sentence, 'findOne').mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .post('/sentences/get')
        .set('x-api-key', API_KEY) 
        .send({});
      expect(res.statusCode).toBe(500);
      (Sentence.findOne as any).mockRestore();
    });

    it('POST /sentences/getByUser debe devolver 400 si faltan datos', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post('/sentences/getByUser')
        .set('x-api-key', API_KEY)
        .set(getAuthHeader(fakeId))
        .send({});
      expect(res.statusCode).toBe(400);
    });

    it('POST /sentences/getByUser debe devolver 404 si el usuario no existe', async () => {
      const fakeId = '000000000000000000000000';
      const res = await request(app)
        .post('/sentences/getByUser')
        .set('x-api-key', API_KEY)
        .set(getAuthHeader(fakeId))
        .send({ userId: fakeId, emotions: ['alegria'] });
      expect(res.statusCode).toBe(404);
    });

    it('POST /sentences/getByUser debe manejar errores internos', async () => {
      const fakeId = '000000000000000000000000';
      jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .post('/sentences/getByUser')
        .set('x-api-key', API_KEY)
        .set(getAuthHeader(fakeId))
        .send({ userId: fakeId, emotions: ['alegria'] });
      expect(res.statusCode).toBe(500);
      (User.findById as any).mockRestore();
    });
  });
});