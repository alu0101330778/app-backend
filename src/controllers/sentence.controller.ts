import { Request, Response } from "express";
import Sentence from "../models/sentence.model";
import User from "../models/user.model";
import { Types } from 'mongoose';
import { isValidObjectId } from 'mongoose';
import crypto from "crypto";


export const getSentenceByUser = async (req: Request, res: Response) => {
  try {
    const { userId, emotions } = req.body;
    // Validación estricta de entrada
    if (
      typeof userId !== "string" ||
      !isValidObjectId(userId) ||
      !Array.isArray(emotions) ||
      emotions.some(e => typeof e !== "string")
    ) {
      res.status(400).json({ error: 'Datos inválidos: Se requiere userId válido y un array de emociones (strings).' });
      return;
    }

    // Buscar al usuario
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    // Preparar datos para la semilla
    const emotionsObject: Record<string, number> = user.emotions instanceof Map
      ? Object.fromEntries(user.emotions.entries())
      : {};

    // Si el array de emociones está vacío, simplemente usa un número aleatorio como semilla
    let seed: number;
    if (emotions.length === 0) {
      seed = crypto.randomBytes(4).readUInt32BE(0);
    } else {
      seed = calculateSeed(emotionsObject, emotions.map((e: string) => e.toLowerCase()));
    }

    // Obtener frase basada en la semilla
    const totalFrases = await Sentence.countDocuments();
    if (totalFrases === 0) {
      res.status(404).json({ error: 'No hay frases disponibles en la base de datos.' });
      return;
    }

    const index = seed % totalFrases;
    const frase = await Sentence.findOne().skip(index).limit(1);

    if (!frase) {
      res.status(404).json({ error: 'No se encontró una frase con el índice calculado.' });
      return;
    }

    // Actualizar el usuario con la última frase
    try {
      user.lastSentence = frase._id as Types.ObjectId;
      await user.save();
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el usuario con la última frase.', error: error });
      return;
    }
    res.json(frase);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor.', error: error });
  }
};

function calculateSeed(userProfile: Record<string, number>, emocionesSeleccionadas: string[]) {
  let base = 0;
  emocionesSeleccionadas.forEach(em => {
    const count = userProfile[em] || 0;
    base += count * em.length;
  });
  // Usa un byte aleatorio seguro (0-255)
  const randomByte = crypto.randomBytes(1)[0];
  base += randomByte;
  return base;
}