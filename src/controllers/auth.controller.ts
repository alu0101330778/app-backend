import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

const SECRET = process.env.JWT_SECRET || ''; 

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    // Validación estricta de tipos
    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username ||
      !email ||
      !password
    ) {
      res.status(400).json({ message: "Faltan campos obligatorios o formato inválido" });
      return;
    }

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      res.status(409).json({ message: "Email ya registrado" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email: email.trim().toLowerCase(), password: hashedPassword });

    res.status(200).json({ message: "Usuario registrado" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // Validación estricta de tipos
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email ||
      !password
    ) {
      res.status(400).json({ message: "Faltan campos obligatorios o formato inválido" });
      return;
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }
    
    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '7d' });

    res.json({ token, userId: user._id, username: user.username, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};


export const verifyToken = (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;

  }

  try {
    const decoded = jwt.verify(token, SECRET) as { userId: string };
    res.status(200).json({ userId: decoded.userId });
    return;
  } catch (error) {
    res.status(401).json({ message: error });
    return;
  }
}