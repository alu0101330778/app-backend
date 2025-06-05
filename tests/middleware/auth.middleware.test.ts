process.env.JWT_SECRET = 'testsecret';
process.env.API_KEYS = 'test_api_key';
import express, { Request, Response } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../src/middleware/auth';

const SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEYS;

const app = express();
app.use(express.json());

// Ruta protegida con el middleware
app.get('/protected', authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Acceso concedido' });
});

let validToken: string;

beforeAll(() => {
  // Genera un token válido con datos ficticios
  validToken = jwt.sign({ id: 'fakeid', email: 'fake@test.com' }, SECRET, { expiresIn: '1h' });
});

describe('authMiddleware', () => {
  it('permite acceso con JWT válido', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Acceso concedido');
  });

  it('permite acceso con api_key válida', async () => {
    const res = await request(app)
      .get('/protected')
      .set('x-api-key', API_KEY);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Acceso concedido');
  });

  it('deniega acceso con JWT inválido y sin api_key', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer token_invalido');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('No autorizado');
  });

  it('deniega acceso sin credenciales', async () => {
    const res = await request(app)
      .get('/protected');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('No autorizado');
  });

  it('deniega acceso con api_key inválida', async () => {
    const res = await request(app)
      .get('/protected')
      .set('x-api-key', 'clave_invalida');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('No autorizado');
  });
});