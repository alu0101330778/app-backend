import { Request, Response } from "express";
import { Product } from "../models/products.model";
import { isValidObjectId } from "mongoose";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los productos", error: error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Validación estricta de tipo y formato para evitar NoSQLi
    if (typeof id !== "string" || !isValidObjectId(id)) {
      res.status(400).json({ message: "ID de producto inválido" });
      return;
    }
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el producto", error: error });
  }
};

export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await Product.find({ category: 'book' });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los libros", error: error });
  }
};

export const getTeas = async (req: Request, res: Response) => {
  try {
    const teas = await Product.find({ category: 'tea' });
    res.json(teas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los tés", error: error });
  }
};

export const getAromatherapies = async (req: Request, res: Response) => {
  try {
    const aromatherapies = await Product.find({ category: 'aromatherapy' });
    res.json(aromatherapies);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los productos de aromaterapia", error: error });
  }
};

export const getSuplements = async (req: Request, res: Response) => {
  try {
    const suplements = await Product.find({ category: 'suplement' });
    res.json(suplements);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los suplementos", error: error });
  }
};
