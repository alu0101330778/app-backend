import { Request, Response, NextFunction } from "express";

/**
 * Middleware para asegurar que el usuario autenticado solo pueda acceder/modificar
 * recursos cuyo id o userId coincida con el del token.
 */
export function verifyUserId(req: Request, res: Response, next: NextFunction) {
  const userIdFromToken = (req as any).userId;
  const idFromQuery = req.query?.id || req.query?.userId;
  const idFromBody = req.body?.id || req.body?.userId;
  const idFromParams = req.params?.id || req.params?.userId;

  // Si no hay ningún id en la request, permite continuar (para rutas que no lo requieren)
  if (!idFromQuery && !idFromBody && !idFromParams) {
    return next();
  }

  // Permite si alguno de los campos coincide con el userId del token
  if (
    userIdFromToken &&
    (
      idFromQuery === userIdFromToken ||
      idFromBody === userIdFromToken ||
      idFromParams === userIdFromToken
    )
  ) {
    return next();
  }

  // Si no hay coincidencia, deniega el acceso
  return res.status(403).json({ message: "No autorizado para esta acción" });
}