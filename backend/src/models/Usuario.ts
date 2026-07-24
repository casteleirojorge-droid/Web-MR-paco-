import mongoose, { Schema, Document } from 'mongoose';

export interface IUsuario extends Document {
  nombre: string;
  email: string;
  passwordHash: string;
  rol: 'sala' | 'produccion' | 'logistica' | 'admin';
  activo: boolean;
}

const UsuarioSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  rol: { 
    type: String, 
    enum: ['sala', 'produccion', 'logistica', 'admin'], 
    required: true,
    default: 'sala' // Front of House por defecto
  },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);