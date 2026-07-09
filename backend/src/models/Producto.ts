import mongoose, { Schema, Document } from 'mongoose';

export interface IProducto extends Document {
  nombre: string;
  precio: number;
  moneda: 'CUP' | 'USD'; // NUEVO: Moneda en la que se vende el plato al cliente
  receta: {
    ingrediente: mongoose.Schema.Types.ObjectId;
    cantidad: number;
  }[];
}

const ProductoSchema: Schema = new Schema({
  nombre: { 
    type: String, 
    required: true,
    unique: true // Evita que registres dos veces el mismo plato
  },
  precio: { 
    type: Number, 
    required: true 
  },
  moneda: {
    type: String,
    enum: ['CUP', 'USD'],
    default: 'CUP', // Por defecto lo ponemos en CUP
    required: true
  },
  receta: [
    {
      ingrediente: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingrediente', required: true },
      cantidad: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

export default mongoose.model<IProducto>('Producto', ProductoSchema);