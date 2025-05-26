import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import userRoutes from "./routes/user.routes";
import sentenceRoutes from "./routes/sentence.routes"
import authRouter from "./routes/auth.routes"


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/users", userRoutes);
app.use("/sentences", sentenceRoutes);
app.use("/auth", authRouter)
// Conectar a MongoDB y arrancar el servidor

const env = process.env.NODE_ENV?.replace(/['" ]/g, "");

if (env !== "test") {
  console.log("Si, esta entrando aqui")
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
}

export default app;