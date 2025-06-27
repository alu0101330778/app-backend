import { Request, Response } from "express";
import User from "../models/user.model";
import { Types, isValidObjectId } from "mongoose";

export const updateUserEmotions = async (req: Request, res: Response) => {
  try {
    const { userId, emotions } = req.body;

    // Validación estricta de userId y emociones
    if (
      typeof userId !== "string" ||
      !isValidObjectId(userId) ||
      !Array.isArray(emotions) ||
      !emotions.every((emotion) => typeof emotion === 'string')
    ) {
      res.status(400).json({
        error: 'El campo "userId" debe ser un ObjectId válido y "emotions" debe ser un array de strings',
      });
      return;
    }

    const EMOTIONS: string[] = JSON.parse(process.env.EMOTIONS || '[]');
    const validEmotions = EMOTIONS.map((e) => e.toLowerCase());
    if (
      !emotions.every(
        (emotion) => validEmotions.includes(emotion.toLowerCase())
      )
    ) {
      res.status(400).json({
        error: 'El campo "emotions" debe contener solo emociones válidas',
        validEmotions: EMOTIONS,
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const emotionsMap = user.emotions;

    emotions.forEach((emotion: string) => {
      const key = emotion.toLowerCase();
      const currentCount = emotionsMap.get(key) ?? 0;
      emotionsMap.set(key, currentCount + 1);
      user.emotionsCount += 1;
    });

    user.markModified('emotions');

    user.emotionLogs.push({
      emotions,
      timestamp: new Date(),
    });

    await user.save();

    res.json({ message: 'Emociones actualizadas'});
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando emociones', error: error });
  }
};

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    // Validación estricta de id
    if (typeof id !== "string" || !isValidObjectId(id)) {
      res.status(400).json({ error: 'ID de usuario inválido' });
      return;
    }

    const user = await User.findById(id)
      .populate('favoriteSentences')
      .lean();

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const total = user.emotionsCount ?? 0;
    let rawEmotions: Record<string, number> = {};

    if (user.emotions instanceof Map) {
      rawEmotions = Object.fromEntries(
        Array.from(user.emotions.entries()).map(([key, value]) => [
          key,
          typeof value === 'number' ? value : 0,
        ])
      );
    } else {
      rawEmotions = Object.entries(user.emotions || {}).reduce((acc, [k, v]) => {
        acc[k] = typeof v === 'number' ? v : 0;
        return acc;
      }, {} as Record<string, number>);
    }

    const normalizedEmotions =
      total > 0
        ? Object.fromEntries(
            Object.entries(rawEmotions)
              .filter(([, value]) => value > 0)
              .map(([key, value]) => [key, parseFloat((value / total).toFixed(2))])
          )
        : {};

    // Agrupa y normaliza los logs por día
    const logs: Array<{ emotions: string[]; timestamp: Date }> = user.emotionLogs ?? [];
    const logsByDay: Record<string, Record<string, number>> = {};

    logs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().slice(0, 10); // YYYY-MM-DD
      if (!logsByDay[date]) logsByDay[date] = {};
      log.emotions.forEach((emotion: string) => {
        logsByDay[date][emotion] = (logsByDay[date][emotion] || 0) + 1;
      });
    });

    const emotionsByDay = Object.entries(logsByDay).map(([date, counts]) => {
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      // Normaliza los valores
      const normalizedCounts = Object.fromEntries(
        Object.entries(counts).map(([emotion, count]) => [
          emotion,
          total > 0 ? parseFloat((count / total).toFixed(2)) : 0,
        ])
      );
      return {
        date,
        counts: normalizedCounts,
        total,
      };
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      emotions: normalizedEmotions,
      lastSentence: user.lastSentence,
      emotionsCount: total,
      emotionsByDay, // <-- Nuevo formato agrupado y normalizado
      favoriteSentences: user.favoriteSentences ?? [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error });
  }
};

export const getLastSentence = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    if (typeof id !== "string" || !isValidObjectId(id)) {
      res.status(400).json({ message: "ID de usuario inválido" });
      return;
    }
    //Verifica que el usuario exista y que tiene una frase, si esto ocurre, se crea un objeto con el nombre del usuario y la ultima frase teniendo en cuenta que la frase es un objectId que se tiene que popular
    const user = await User.findById(id).populate("lastSentence");
    
    if (!user || !user.lastSentence) {
      res.status(404).json({ message: "No se encontró una frase para este usuario" });
      return;
    }
    const response = {
      username: user.username,
      lastSentence: user.lastSentence,
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la frase del usuario", error: error });
  }
};

export const addFavoriteSentence = async (req: Request, res: Response) => {
  try {
    const { userId, sentenceId } = req.body;

    // Validación estricta de userId y sentenceId
    if (
      typeof userId !== "string" ||
      !isValidObjectId(userId) ||
      typeof sentenceId !== "string" ||
      !isValidObjectId(sentenceId)
    ) {
      res.status(400).json({ message: "userId y sentenceId deben ser ObjectId válidos" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    // Convertir a ObjectId antes de comparar y agregar
    const sentenceObjId = new Types.ObjectId(sentenceId);

    if (user.favoriteSentences.some((s: any) => s.equals(sentenceObjId))) {
      res.status(400).json({ message: "La frase ya está en favoritos" });
      return;
    }

    user.favoriteSentences.push(sentenceObjId);
    await user.save();

    res.status(200).json({ message: "Frase añadida a favoritos" });
  } catch (error) {
    res.status(500).json({ message: "Error al añadir la frase a favoritos", error: error });
  }
};

export const removeFavoriteSentence = async (req: Request, res: Response) => {
  try {
    const { userId, sentenceId } = req.body;

    // Validación estricta de userId y sentenceId
    if (
      typeof userId !== "string" ||
      !isValidObjectId(userId) ||
      typeof sentenceId !== "string" ||
      !isValidObjectId(sentenceId)
    ) {
      res.status(400).json({ message: "userId y sentenceId deben ser ObjectId válidos" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    const sentenceObjId = new Types.ObjectId(sentenceId);
    const index = user.favoriteSentences.findIndex((s: any) => s.equals(sentenceObjId));
    if (index === -1) {
      res.status(400).json({ message: "La frase no está en favoritos" });
      return;
    }

    user.favoriteSentences.splice(index, 1);
    await user.save();
    res.status(200).json({ message: "Frase eliminada de favoritos" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la frase de favoritos", error: error });
  }
};