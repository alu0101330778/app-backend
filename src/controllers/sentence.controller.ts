import { Request, Response } from "express";
import Sentence from "../models/sentence.model";
import User from "../models/user.model";
import { Types } from "mongoose";
import { isValidObjectId } from "mongoose";
import crypto from "crypto";
import axios from "axios";

// Obtener frase aleatoria basada en perfil emocional y semilla
export const getSentenceByUser = async (req: Request, res: Response) => {
  try {
    const { userId, emotions } = req.body;

    if (
      typeof userId !== "string" ||
      !isValidObjectId(userId) ||
      !Array.isArray(emotions) ||
      emotions.some((e) => typeof e !== "string")
    ) {
      res.status(400).json({
        error:
          "Datos inválidos: Se requiere userId válido y un array de emociones (strings).",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }

    // Crear semilla basada en emociones del usuario
    const emotionsObject: Record<string, number> =
      user.emotions instanceof Map
        ? Object.fromEntries(user.emotions.entries())
        : {};

    let seed: number;
    if (emotions.length === 0) {
      seed = crypto.randomBytes(4).readUInt32BE(0);
    } else {
      seed = calculateSeed(
        emotionsObject,
        emotions.map((e: string) => e.toLowerCase())
      );
    }

    const totalFrases = await Sentence.countDocuments();
    if (totalFrases === 0) {
      res
        .status(404)
        .json({ error: "No hay frases disponibles en la base de datos." });
      return;
    }

    const index = seed % totalFrases;
    const frase = await Sentence.findOne().skip(index).limit(1);

    if (!frase) {
      res
        .status(404)
        .json({ error: "No se encontró una frase con el índice calculado." });
      return;
    }

    try {
      user.lastSentence = frase._id as Types.ObjectId;
      await user.save();
    } catch (error) {
      res.status(500).json({
        message: "Error al actualizar el usuario con la última frase.",
        error,
      });
      return;
    }

    res.json(frase);
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor.", error });
  }
};

function calculateSeed(
  userProfile: Record<string, number>,
  emocionesSeleccionadas: string[]
): number {
  let base = 0;
  emocionesSeleccionadas.forEach((em) => {
    const count = userProfile[em] || 0;
    base += count * em.length;
  });
  const randomByte = crypto.randomBytes(1)[0];
  base += randomByte;
  return base;
}

// Obtener reflexión desde IA externa (Flask)
export const getSentenceByIA = async (req: Request, res: Response) => {
  const { emotions, userId } = req.body;

  const validEmotions = process.env.EMOTIONS
    ? JSON.parse(process.env.EMOTIONS)
    : [];

  if (
    !Array.isArray(emotions) ||
    emotions.some(
      (e) => typeof e !== "string" || !validEmotions.includes(e)
    )
  ) {
    res.status(400).json({
      error:
        "Datos inválidos: Se requiere un array de emociones válidas (strings).",
    });
    return;
  }

  const secret = process.env.API_SECRET_KEY!;
  const payload = {
    emotions,
    timestamp: Date.now(),
  };

  const body = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  try {
    const response = await axios.post(
      process.env.IA_API_ENDPOINT!,
      payload,
      {
        headers: {
          "X-Signature": signature,
        },
      }
    );

    if (response.status !== 200) {
      res
        .status(response.status)
        .json({ error: "Error al obtener la frase de la IA." });
      return;
    }

    const reflection = response.data.reflection;

    // 🔽 Agregamos esta parte: buscar frase por título y asignar como lastSentence
    if (userId && isValidObjectId(userId) && reflection?.title) {
      try {
        const user = await User.findById(userId);
        if (user) {
          const existingSentence = await Sentence.findOne({
            title: reflection.title,
          });

          if (existingSentence) {
            user.lastSentence = existingSentence._id as Types.ObjectId;
            await user.save();
          }
        }
      } catch (err) {
        console.error("Error al asignar lastSentence:", err);
        // No cortamos la respuesta al usuario por este error
      }
    }

    res.json({
      title: reflection.title,
      body: reflection.body,
      end: reflection.end
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Error al conectar con la API de IA.", details: error.message });
  }
};
