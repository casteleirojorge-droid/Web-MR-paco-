import mongoose, { Schema, Document } from 'mongoose';

export interface IIngrediente extends Document {
  nombre: string;
  unidadMedida: 'g' | 'ml' | 'ud'; // Gramos para sólidos, Mililitros para líquidos, Unidades para huevos/panes
  costoPorUnidad: number;
  stock: number; // Opcional: para llevar un control de inventario 
}

const IngredienteSchema: Schema = new Schema({
  nombre: { 
    type: String, 
    required: true, 
    unique: true // No queremos tener "Tomate" registrado dos veces
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
  stock: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

export default mongoose.model<IIngrediente>('Ingrediente', IngredienteSchema);