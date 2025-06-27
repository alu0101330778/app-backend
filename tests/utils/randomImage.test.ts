import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/index";

describe("GET /random", () => {
  const collection = () => mongoose.connection.collection("random");
  const API_KEY = (process.env.API_KEYS?.split(',')[0] || 'test_api_key').trim();
  beforeAll(async () => {
    // Si usas un runner con MONGO_URI_TEST, la conexión ya está hecha en setup.ts
    // Si no, puedes conectar aquí, pero normalmente no es necesario
  });

  afterEach(async () => {
    // Limpia la colección después de cada test para evitar interferencias
    await collection().deleteMany({});
  });

  it("debe devolver una imagen aleatoria con campo url", async () => {
    await collection().insertMany([
      { url: "https://test.com/img1.jpg" },
      { url: "https://test.com/img2.jpg" }
    ]);
    const res = await request(app).get("/random")
        .set('x-api-key', API_KEY);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("url");
    expect(typeof res.body.url).toBe("string");
    expect(res.body.url.startsWith("https://test.com/img")).toBe(true);
  });

  it("debe devolver 404 si no hay imágenes", async () => {
    const res = await request(app).get("/random")
        .set('x-api-key', API_KEY);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/No hay imágenes disponibles/);
  });

  it("debe manejar errores internos", async () => {
    // Simula un error en aggregate usando un mock temporal
    const orig = collection().aggregate;
    // @ts-ignore
    collection().aggregate = () => { throw new Error("fail"); };
    const res = await request(app).get("/random")
        .set('x-api-key', API_KEY);
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Error al obtener imagen aleatoria/);
    // Restaura el método original
    collection().aggregate = orig;
  });
});