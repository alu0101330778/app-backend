import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import userRoutes from "./routes/user.routes";
import sentenceRoutes from "./routes/sentence.routes"
import authRouter from "./routes/auth.routes"
import randomRoutes from "./routes/random.routes";
import productRoutes from "./routes/product.routes";
import { authMiddleware } from "./middleware/auth";
import { verifyUserId } from "./middleware/verifyUserId";


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


// Rutas protegidas
app.use("/users", [authMiddleware, verifyUserId], userRoutes);
app.use("/sentences", [authMiddleware, verifyUserId], sentenceRoutes);
app.use("/shop", [authMiddleware, verifyUserId],productRoutes);
app.use("/random", [authMiddleware, verifyUserId], randomRoutes);

// Rutas públicas
app.use("/auth", authRouter)
// Conectar a MongoDB y arrancar el servidor

const env = process.env.NODE_ENV?.replace(/['" ]/g, "");

if (env !== "test") {
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
}

export default app;