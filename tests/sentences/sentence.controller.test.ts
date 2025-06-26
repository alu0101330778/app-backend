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

    it('debe rechazar userId como objeto en /sentences/getByUser', async () => {
      const res = await request(app)
        .post('/sentences/getByUser')
        .set('x-api-key', API_KEY)
        .set(getAuthHeader(userIdStr))
        .send({ userId: { $gt: '' }, emotions: ['alegria'] });
      expect(res.statusCode).toBe(400);
    });

    it('debe rechazar emotions como objeto en /sentences/getByUser', async () => {
      const res = await request(app)
        .post('/sentences/getByUser')
        .set('x-api-key', API_KEY)
        .set(getAuthHeader(userIdStr))
        .send({ userId: userIdStr, emotions: { $ne: [] } });
      expect(res.statusCode).toBe(400);
    });
  });
});