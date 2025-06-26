import express from "express";
import {getRandomImage} from "../utils/randomImage";

const router = express.Router();

router.get("/", getRandomImage);


export default router;