import mongoose, { Schema, Document } from 'mongoose';

export interface IUsuario extends Document {
  nombre: string;
  email: string;
  passwordHash: string;
  rol: 'cliente' | 'trabajador' | 'admin';
  // Nuevos campos para el Delivery (son opcionales con el "?")
  telefono?: string;
  direccion?: string;
  identificacion?: string;
}

const UsuarioSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  rol: { 
    type: String, 
    enum: ['cliente', 'trabajador', 'admin'], 
    default: 'cliente' // Ahora, cualquiera que se registre en la web por defecto es cliente
  },
  telefono: { type: String },
  direccion: { type: String },
  identificacion: { type: String }
}, { timestamps: true });

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);