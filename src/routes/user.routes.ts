import express from "express";
import { getLastSentence, getUserInfo, updateUserEmotions, addFavoriteSentence, removeFavoriteSentence } from "../controllers/user.controller";

const router = express.Router();

router.get("/last", getLastSentence); //Obtener la ultima frase del usuario
router.get("/info", getUserInfo); //Info completa del usuario
router.post("/emotions", updateUserEmotions);
router.post("/favorite", addFavoriteSentence); //Añadir una frase a favoritos
router.put("/favorite", removeFavoriteSentence); //Eliminar una frase de favoritos

export default router;