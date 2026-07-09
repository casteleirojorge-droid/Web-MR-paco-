import mongoose, { Schema, Document } from 'mongoose';

export interface IIngrediente extends Document {
  nombre: string;
  categoria: 'materia_prima' | 'pre_elaborado'; // NUEVO: Diferencia lo comprado de lo fabricado
  unidadMedida: 'g' | 'ml' | 'ud';
  costoPorUnidad: number;
  moneda: 'CUP' | 'USD'; // NUEVO: Control de divisas
  stock: number;
}

const IngredienteSchema: Schema = new Schema({
  nombre: { 
    type: String, 
    required: true, 
    unique: true 
  },
  categoria: {
    type: String,
    enum: ['materia_prima', 'pre_elaborado'],
    required: true
  },
  unidadMedida: { 
    type: String, 
    enum: ['g', 'ml', 'ud'], 
    required: true 
  },
  costoPorUnidad: { 
    type: Number, 
    required: true 
  },
  moneda: {
    type: String,
    enum: ['CUP', 'USD'],
    required: true
  },
  stock: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

export default mongoose.model<IIngrediente>('Ingrediente', IngredienteSchema);