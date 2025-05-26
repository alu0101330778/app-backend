import express from "express";
import { getSentence, getSentences, createSentence, getSentenceByEmotions, getSentenceByUser } from "../controllers/sentence.controller";

const router = express.Router();

router.get("/", getSentence);
router.get("/all", getSentences);
router.post("/", createSentence);
router.post("/get", getSentenceByEmotions);
router.post("/getByUser", getSentenceByUser);

export default router;