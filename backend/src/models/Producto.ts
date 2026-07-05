import mongoose, { Schema, Document } from 'mongoose';

export interface IProducto extends Document {
  nombre: string;
  precio: number;
  receta?: {
    ingrediente: mongoose.Schema.Types.ObjectId;
    cantidad: number;
  }[];
}

const ProductoSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  receta: [
    {
      ingrediente: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingrediente' },
      cantidad: { type: Number, required: true }
    }
  ]
});

export default mongoose.model<IProducto>('Producto', ProductoSchema);