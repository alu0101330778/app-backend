import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    await mongoose.connect(uri as string);
    console.log("🔥 Conectado a MongoDB");

  } catch (error) {
    console.error("❌ Error conectando a MongoDB", error);
    process.exit(1);
  }
};

export default connectDB;