import express from "express";
import { getSentenceByUser } from "../controllers/sentence.controller";

const router = express.Router();

router.post("/getByUser", getSentenceByUser);

export default router;