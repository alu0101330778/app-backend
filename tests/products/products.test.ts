import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/index";
import { Product } from "../../src/models/products.model";
import jwt from "jsonwebtoken";

const API_KEY = (process.env.API_KEYS?.split(',')[0] || 'test_api_key').trim();
const SECRET = process.env.JWT_SECRET || 'testsecret';

function getAuthHeader(userId: string) {
  const token = jwt.sign({ userId }, SECRET, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}` };
}

describe("Product Controller", () => {
  let userId: string;

  beforeEach(async () => {
    await Product.deleteMany({});
    // Crea un usuario ficticio solo para pasar el middleware
    userId = new mongoose.Types.ObjectId().toString();
    // Inserta productos de ejemplo
    await Product.create([
      {
        _id: new mongoose.Types.ObjectId("68504453462213d890f457ad"),
        name: "The Power of Now",
        description: "A book about the importance of living in the present.",
        price: 18.99,
        image: "https://raw.githubusercontent.com/alu0101330778/app-backend/main/images/the_power_of_now.jpg",
        category: "book",
        brand: "Gaia Editions",
        stock: 10,
        tags: ["self-help", "spirituality"],
        isbn: "9788499089252",
        author: "Eckhart Tolle",
        publisher: "Gaia",
        pages: 256,
        language: "English"
      },
      {
        _id: new mongoose.Types.ObjectId("68504453462213d890f457b0"),
        name: "Lavender Essential Oil",
        description: "Natural relaxant for aromatherapy.",
        price: 9.99,
        image: "https://raw.githubusercontent.com/alu0101330778/app-backend/main/images/lavender_oil.jpg",
        category: "aromatherapy",
        brand: "Pranarom",
        stock: 20,
        tags: ["relaxing", "essential"],
        scent: "Lavender",
        volume: 10,
        ingredients: ["Lavandula angustifolia"]
      },
      {
        _id: new mongoose.Types.ObjectId("68504453462213d890f457b3"),
        name: "Vitamin C 1000mg",
        description: "Antioxidant supplement for the immune system.",
        price: 12.99,
        image: "https://raw.githubusercontent.com/alu0101330778/app-backend/main/images/vitamin_c.jpg",
        category: "supplement",
        brand: "Solgar",
        stock: 30,
        tags: ["vitamin", "immunity"],
        weight: 120,
        quantity: 60,
        ingredients: ["Vitamin C", "Cellulose", "Magnesium stearate"]
      },
      {
        _id: new mongoose.Types.ObjectId("68504453462213d890f457b7"),
        name: "Assam Black Tea",
        description: "Strong and aromatic black tea.",
        price: 5.8,
        image: "https://raw.githubusercontent.com/alu0101330778/app-backend/main/images/assam_black_tea.jpg",
        category: "tea",
        brand: "Twinings",
        stock: 18,
        tags: ["black", "india"],
        weight: 100,
        flavor: "Black",
        origin: "India",
        ingredients: ["Black tea"]
      }
    ]);
  });

  afterEach(async () => {
    await Product.deleteMany({});
  });

  // GET /
  it("GET /shop debe devolver todos los productos", async () => {
    const res = await request(app)
      .get("/shop")
      .set(getAuthHeader(userId))
      .set("x-api-key", API_KEY);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(4);
  });

  // GET /books
  it("GET /shop/books debe devolver solo libros", async () => {
    const res = await request(app)
      .get("/shop/books")
      .set(getAuthHeader(userId))
      .set("x-api-key", API_KEY);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toBe("book");
  });

  // GET /teas
  it("GET /shop/teas debe devolver solo tés", async () => {
    const res = await request(app)
      .get("/shop/teas")
      .set(getAuthHeader(userId))
      .set("x-api-key", API_KEY);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toBe("tea");
  });

  // GET /aromatherapies
  it("GET /shop/aromatherapies debe devolver solo aromaterapia", async () => {
    const res = await request(app)
      .get("/shop/aromatherapies")
      .set(getAuthHeader(userId))
      .set("x-api-key", API_KEY);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toBe("aromatherapy");
  });

  // GET /supplements
  it("GET /shop/supplements debe devolver solo suplementos", async () => {
    const res = await request(app)
      .get("/shop/supplements")
      .set(getAuthHeader(userId))
      .set("x-api-key", API_KEY);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toBe("supplement");
  });

  // GET /:id válido
  it("GET /shop/:id debe devolver el producto correcto", async () => {
    const id = "68504453462213d890f457ad";
    const res = await request(app)
      .get(`/shop/${id}`)
      .set(getAuthHeader(userId))
      .set("x-api-key", API_KEY);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("The Power of Now");
  });

  // GET /:id inválido
  it("GET /shop/:id debe devolver 400 si el id es inválido", async () => {
    const res = await request(app)
      .get("/shop/123")
      .set(getAuthHeader(userId))
      .set("x-api-key", API_KEY);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/ID de producto inválido/);
  });

  // GET /:id no encontrado
  it("GET /shop/:id debe devolver 404 si el producto no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/shop/${fakeId}`)
      .set(getAuthHeader(userId))
      .set("x-api-key", API_KEY);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Producto no encontrado/);
  });

  // GET /:id NoSQLi protection
  it("GET /shop/:id debe rechazar NoSQLi (id como objeto)", async () => {
    const res = await request(app)
      .get("/shop/" + encodeURIComponent(JSON.stringify({ $gt: "" })))
      .set(getAuthHeader(userId))
      .set("x-api-key", API_KEY);
    expect(res.statusCode).toBe(400);
  });

  // GET / debe manejar errores internos
  it("GET /shop debe manejar errores internos", async () => {
    const orig = Product.find;
    // @ts-ignore
    Product.find = () => { throw new Error("fail"); };
    const res = await request(app)
      .get("/shop")
      .set(getAuthHeader(userId))
      .set("x-api-key", API_KEY);
    expect(res.statusCode).toBe(500);
    Product.find = orig;
  });
});