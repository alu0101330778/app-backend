// Hacer un controlador que devuelva un objeto aleatorio de la base de datos de la coleccion random, en la coleccion solo hay objetos con una url en json. No se va a usar un modelo debido a la poca complijidad del objeto
import { Request, Response } from "express";
import mongoose from "mongoose";

// Acceso directo a la colección "random" sin modelo
const randomCollection = () => mongoose.connection.collection("random");

export const getRandomImage = async (req: Request, res: Response) => {
  try {
    // Usamos aggregate con $sample para obtener un documento aleatorio
    const [doc] = await randomCollection()
      .aggregate([{ $sample: { size: 1 } }])
      .toArray();

    if (!doc) {
      res.status(404).json({ message: "No hay imágenes disponibles" });
      return;
    }

    // Solo devolvemos el campo url
    res.json({ url: doc.url });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener imagen aleatoria", error });
  }
};

