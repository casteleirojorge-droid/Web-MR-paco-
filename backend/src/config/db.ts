import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargamos las variables del archivo .env
dotenv.config();

export const conectarDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error de conexion a MongoDB: ${error}`);
    process.exit(1); // Detiene la app si no puede conectar
  }
};