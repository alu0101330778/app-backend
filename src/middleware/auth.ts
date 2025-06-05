import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "";
const VALID_API_KEYS = (process.env.API_KEYS || "").split(","); // Puedes definir varias api_keys separadas por coma

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. Verifica JWT en Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, SECRET);
      (req as any).user = decoded;
      return next();
    } catch (err) {
      // Si el token es inválido, sigue para intentar api_key
    }
  }

  // 2. Verifica api_key en header x-api-key
  const apiKey = req.headers["x-api-key"];
  if (typeof apiKey === "string" && VALID_API_KEYS.includes(apiKey)) {
    (req as any).apiKey = apiKey;
    return next();
  }

  // 3. Si no hay autenticación válida
  res.status(401).json({ message: "No autorizado" });
  return;
  
}