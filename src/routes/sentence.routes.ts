import express from "express";
import { getSentenceByUser, getSentenceByIA } from "../controllers/sentence.controller";

const router = express.Router();

router.post("/getByUser", getSentenceByUser);
router.post("/getByIA", getSentenceByIA);

export default router;