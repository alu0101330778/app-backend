import { Request, Response } from "express";
import Sentence from "../models/sentence.model";
import User from "../models/user.model";
import { Types } from 'mongoose'; 

export const getSentence = async (req: Request, res: Response) => {
  try {
    const Sentences = await Sentence.find();
    res.json(Sentences);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las frases", error: error });
  }
};

export const getSentences = async (req: Request, res: Response) => {
  try {
    const Sentences = await Sentence.find();
    res.json(Sentences);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las frases", error: error });
  }
};

export const createSentence = async (req: Request, res: Response) => {
  try {
    const { title, body, end } = req.body;
    const newSentence = new Sentence({ title, body, end });
    await newSentence.save();
    res.status(201).json({ message: "Sentence created succesfully" });
  } catch (error) {
    res.status(500).json({ message: req.body, error: error });
  }
};

export const getSentenceByEmotions = async (req: Request, res: Response) => {
  try {
    const Sentences = await Sentence.findOne();
    res.json(Sentences);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las frases", error: error });
  }
};


// --- Controlador modificado ---
export const getSentenceByUser = async (req: Request, res: Response) => {
  try {
    const { userId, emotions } = req.body;

    // 1. Validar entrada
    if (!userId || !Array.isArray(emotions) || emotions.length === 0) {
      res.status(400).json({ error: 'Datos inválidos: Se requiere userId y un array de emotions no vacío.' });
      return;
    }

    // 2. Buscar al usuario
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    // 3. Preparar datos para la semilla
    // Asegúrate de que user.emotions exista y sea un Map antes de convertir
    const emotionsObject: Record<string, number> = user.emotions instanceof Map
        ? Object.fromEntries(user.emotions.entries())
        : {}; // O maneja el caso donde no sea un Map como consideres apropiado

    const seed = calculateSeed(emotionsObject, emotions.map((e: string) => e.toLowerCase()));

    // 4. Obtener frase basada en la semilla
    const totalFrases = await Sentence.countDocuments();
    if (totalFrases === 0) {
        res.status(404).json({ error: 'No hay frases disponibles en la base de datos.' });
        return;
    }

    // Usar el módulo para obtener un índice válido
    const index = seed % totalFrases;

    // Buscar la frase usando skip y limit (asegúrate que sea eficiente para colecciones grandes)
    const frase = await Sentence.findOne().skip(index).limit(1);

    if (!frase) {
      // Esto podría ocurrir si hay algún problema con countDocuments vs findOne/skip
      res.status(404).json({ error: 'No se encontró una frase con el índice calculado.' });
      return;
    }
    // 5. *** NUEVO: Actualizar el usuario con la última frase ***
    try {
         // Asigna el ObjectId de la frase encontrada
        user.lastSentence = frase._id as Types.ObjectId;
        await user.save(); // Guarda los cambios en la base de datos
    } catch (error) {
        // Decide si quieres fallar toda la solicitud o solo loggear el error de actualización
        // Podrías continuar y devolver la frase igualmente, pero loguear el fallo.
        res.status(500).json({ message: 'Error al actualizar el usuario con la última frase.', error: error });
        return;
    }

    // 6. Devolver la frase encontrada
    res.json(frase);

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor.', error: error });
  } 
};
function calculateSeed(userProfile: Record<string, number>, emocionesSeleccionadas: string[]) {
  let base = 0;

  emocionesSeleccionadas.forEach(em => {
    const count = userProfile[em] || 0;
    base += count * em.length; // Considera si multiplicar por la longitud es la mejor métrica
  });

  // Añadir un componente aleatorio para variar un poco incluso con las mismas emociones
  base += Math.floor(Math.random() * 1000); // O usa una fuente de aleatoriedad más robusta si es necesario
  return base;
}