import express from "express";
import { getUsers, createUser, getLastSentence, getUserInfo, updateUserEmotions } from "../controllers/user.controller";

const router = express.Router();

router.get("/", getUsers); //Listado de usuarios
router.post("/", createUser); //Crear un usuario
router.get("/last", getLastSentence); //Obtener la ultima frase del usuario
router.get("/info", getUserInfo); //Info completa del usuario
router.post("/emotions", updateUserEmotions);

export default router;