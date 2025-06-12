import express from "express";
import { getProducts, getProductById, getBooks, getTeas, getAromatherapies, getSuplements } from "../controllers/product.controller";

const router = express.Router();

router.get("/", getProducts); // Listado de productos
router.get("/books", getBooks); // Listado de libros
router.get("/teas", getTeas); // Listado de tés
router.get("/aromatherapies", getAromatherapies); // Listado de aromaterapia
router.get("/suplements", getSuplements); // Listado de suplementos
router.get("/:id", getProductById); // Obtener un producto por ID

export default router;